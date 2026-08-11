import "server-only";

import { cache } from "react";
import { Octokit } from "@octokit/rest";
import { remark } from "remark";
import html from "remark-html";
import { Project } from "../types";

export const DEFAULT_GITHUB_OWNER = "coolguy1771";

const REPO_SLUG = /^[A-Za-z0-9._-]+$/;

export type GithubProjectDetail = {
  name: string;
  full_name: string;
  description: string;
  topics: string[];
  language: string | null;
  htmlUrl: string;
  homepage: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  license: string | null;
  lastUpdated: string;
  isFork: boolean;
  isArchived: boolean;
  readmeHtml: string;
};

type RepoPayload = {
  name: string;
  full_name: string;
  description: string | null;
  topics?: string[];
  language: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  license: { spdx_id?: string | null; name?: string | null } | null;
  updated_at: string | null;
  fork: boolean;
  archived: boolean;
  private?: boolean;
};

function createOctokit() {
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

export function isValidRepoSlug(slug: string): boolean {
  return REPO_SLUG.test(slug);
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function safeHomepage(url: string | null): string | null {
  if (!url) return null;
  return isHttpUrl(url) ? url : null;
}

function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status: unknown }).status === 404
  );
}

const ABSOLUTE_OR_HASH = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

function rewriteRelativeUrls(
  markup: string,
  owner: string,
  repo: string,
): string {
  const blob = `https://github.com/${owner}/${repo}/blob/HEAD/`;
  const raw = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/`;
  return markup.replace(/\b(href|src)="([^"]*)"/gi, (match, attr, url) => {
    if (!url || ABSOLUTE_OR_HASH.test(url)) return match;
    if (url.startsWith("/")) {
      return `${attr}="https://github.com${url}"`;
    }
    const cleaned = url.replace(/^\.\//, "");
    const base = String(attr).toLowerCase() === "src" ? raw : blob;
    return `${attr}="${base}${cleaned}"`;
  });
}

function mapRepoToDetail(
  repo: RepoPayload,
  readmeHtml: string,
): GithubProjectDetail {
  return {
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description || "No description available",
    topics: repo.topics ?? [],
    language: repo.language,
    htmlUrl: repo.html_url,
    homepage: safeHomepage(repo.homepage),
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    openIssues: repo.open_issues_count ?? 0,
    license: repo.license?.spdx_id || repo.license?.name || null,
    lastUpdated: repo.updated_at ?? "",
    isFork: repo.fork,
    isArchived: repo.archived,
    readmeHtml,
  };
}

async function fetchSanitizedReadme(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<string> {
  try {
    const { data } = await octokit.repos.getReadme({ owner, repo });
    if (!("content" in data) || !data.content) return "";
    const markdown = Buffer.from(data.content, "base64").toString("utf8");
    const result = await remark().use(html).process(markdown);
    return rewriteRelativeUrls(String(result), owner, repo);
  } catch {
    return "";
  }
}

/**
 * Fetches public GitHub repositories for display. Server-only — use via /api/github/projects.
 */
export async function fetchGithubProjects(
  username: string,
  limit: number = 6
): Promise<Project[]> {
  try {
    const octokit = createOctokit();
    const response = await octokit.repos.listForUser({
      username,
      sort: "updated",
      per_page: limit,
      type: "owner",
    });

    return response.data
      .filter((repo) => !repo.fork && !repo.private && !repo.archived)
      .map((repo) => ({
        title: repo.name,
        description: repo.description || "No description available",
        tech: [repo.language, ...(repo.topics || [])].filter((item): item is string =>
          Boolean(item)
        ),
        link: repo.homepage || repo.html_url,
        githubUrl: repo.html_url,
        stars: repo.stargazers_count ?? 0,
        updatedAt: repo.updated_at ?? "",
      }));
  } catch (error) {
    console.error("Error fetching GitHub projects:", error);
    return [];
  }
}

export const fetchGithubProjectBySlug = cache(
  async (
    slug: string,
    owner: string = DEFAULT_GITHUB_OWNER,
  ): Promise<GithubProjectDetail | null> => {
    if (!isValidRepoSlug(slug)) return null;
    try {
      const octokit = createOctokit();
      const { data } = await octokit.repos.get({ owner, repo: slug });
      if (data.private) return null;
      const readmeHtml = await fetchSanitizedReadme(octokit, owner, slug);
      return mapRepoToDetail(data, readmeHtml);
    } catch (error) {
      if (isNotFoundError(error)) return null;
      console.error("Error fetching GitHub project:", error);
      throw error;
    }
  },
);

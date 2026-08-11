import "server-only";

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
    homepage: repo.homepage,
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
    return String(result);
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

export async function fetchGithubProjectBySlug(
  slug: string,
  owner: string = DEFAULT_GITHUB_OWNER,
): Promise<GithubProjectDetail | null> {
  if (!isValidRepoSlug(slug)) return null;
  try {
    const octokit = createOctokit();
    const { data } = await octokit.repos.get({ owner, repo: slug });
    if (data.private) return null;
    const readmeHtml = await fetchSanitizedReadme(octokit, owner, slug);
    return mapRepoToDetail(data, readmeHtml);
  } catch (error) {
    console.error("Error fetching GitHub project:", error);
    return null;
  }
}

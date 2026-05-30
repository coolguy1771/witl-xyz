import "server-only";

import { Octokit } from "@octokit/rest";
import { Project } from "../types";

/**
 * Fetches public GitHub repositories for display. Server-only — use via /api/github/projects.
 */
export async function fetchGithubProjects(
  username: string,
  limit: number = 6
): Promise<Project[]> {
  try {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

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
        stars: repo.stargazers_count,
        updatedAt: repo.updated_at ?? "",
      }));
  } catch (error) {
    console.error("Error fetching GitHub projects:", error);
    return [];
  }
}

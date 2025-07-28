/**
 * GitHub API utilities using Octokit
 *
 */

import { Octokit } from "octokit";

// Types for GitHub API responses
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name?: string;
  bio?: string;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage?: string;
  visibility?: string;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string | null;
  download_url: string | null;
  git_url?: string | null;
  type: string;
  content?: string;
  encoding?: string;
  _links?: Record<string, unknown>;
}

// Create an instance of Octokit with default options
// If token is provided, it will be used for authentication
export function createOctokit(token?: string) {
  return new Octokit({
    auth: token,
    timeZone: "UTC",
    baseUrl: "https://api.github.com",
    log: {
      debug: () => {},
      info: console.info,
      warn: console.warn,
      error: console.error,
    },
  });
}

// Create a default non-authenticated instance
const defaultOctokit = createOctokit();

/**
 * Get user information from GitHub
 */
export async function getGitHubUser(username: string, token?: string): Promise<GitHubUser> {
  const octokit = token ? createOctokit(token) : defaultOctokit;

  try {
    const response = await octokit.request("GET /users/{username}", {
      username,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return response.data as GitHubUser;
  } catch (error) {
    console.error(`Error fetching user ${username}:`, error);
    throw new Error(`Failed to fetch GitHub user: ${username}`);
  }
}

/**
 * Get repositories for a user
 * @param username GitHub username
 * @param options Additional options like sort, per_page, etc.
 * @param token Optional GitHub token for authenticated requests
 */
export async function getUserRepos(
  username: string,
  options: {
    sort?: "created" | "updated" | "pushed" | "full_name";
    direction?: "asc" | "desc";
    type?: "all" | "owner" | "member";
    per_page?: number;
    page?: number;
  } = {},
  token?: string
): Promise<GitHubRepo[]> {
  const octokit = token ? createOctokit(token) : defaultOctokit;

  const {
    sort = "updated",
    direction = "desc",
    type = "owner",
    per_page = 100,
    page = 1,
  } = options;

  try {
    const response = await octokit.request("GET /users/{username}/repos", {
      username,
      sort,
      direction,
      type,
      per_page,
      page,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return response.data as GitHubRepo[];
  } catch (error) {
    console.error(`Error fetching repos for ${username}:`, error);
    throw new Error(`Failed to fetch repositories for: ${username}`);
  }
}

/**
 * Get repository information
 */
export async function getRepo(owner: string, repo: string, token?: string): Promise<GitHubRepo> {
  const octokit = token ? createOctokit(token) : defaultOctokit;

  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}", {
      owner,
      repo,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return response.data as GitHubRepo;
  } catch (error) {
    console.error(`Error fetching repo ${owner}/${repo}:`, error);
    throw new Error(`Failed to fetch repository: ${owner}/${repo}`);
  }
}

/**
 * Get file content from a repository
 */
export async function getFileContent(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<string> {
  const octokit = token ? createOctokit(token) : defaultOctokit;

  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        Accept: "application/vnd.github.raw",
      },
    });

    // When using Accept: application/vnd.github.raw, the response is the raw file content
    if (typeof response.data === "string") {
      return response.data;
    }

    // Fallback if raw content wasn't returned
    const data = response.data as GitHubContent;

    if (data.encoding === "base64" && data.content) {
      // Decode base64 content
      if (typeof window !== "undefined") {
        // Browser
        return atob(data.content.replace(/\n/g, ""));
      } else {
        // Node.js/Cloudflare Workers
        return Buffer.from(data.content, "base64").toString("utf-8");
      }
    }

    return "";
  } catch (error) {
    console.error(`Error fetching file ${path} from ${owner}/${repo}:`, error);
    throw new Error(`Failed to fetch file: ${path} from ${owner}/${repo}`);
  }
}

/**
 * Get repository contents (files and directories)
 */
export async function getRepoContents(
  owner: string,
  repo: string,
  path: string = "",
  token?: string
): Promise<GitHubContent[]> {
  const octokit = token ? createOctokit(token) : defaultOctokit;

  try {
    const response = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner,
      repo,
      path,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return Array.isArray(response.data) ? response.data : [response.data];
  } catch (error) {
    console.error(`Error fetching contents from ${owner}/${repo}/${path}:`, error);
    throw new Error(`Failed to fetch repository contents: ${owner}/${repo}/${path}`);
  }
}

/**
 * Alias for getRepoContents for backward compatibility
 */
export const listRepoContents = getRepoContents;

/**
 * Check if the GitHub token is valid
 */
export async function validateGitHubToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const octokit = createOctokit(token);
    const response = await octokit.request("GET /user");
    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * Search GitHub repositories
 */
export async function searchRepos(
  query: string,
  options: {
    sort?: "stars" | "forks" | "help-wanted-issues" | "updated";
    order?: "desc" | "asc";
    per_page?: number;
    page?: number;
  } = {},
  token?: string
): Promise<{ total_count: number; items: GitHubRepo[] }> {
  const octokit = token ? createOctokit(token) : defaultOctokit;
  const { sort = "stars", order = "desc", per_page = 30, page = 1 } = options;

  try {
    const response = await octokit.request("GET /search/repositories", {
      q: query,
      sort,
      order,
      per_page,
      page,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return {
      total_count: response.data.total_count,
      items: response.data.items as GitHubRepo[],
    };
  } catch (error) {
    console.error(`Error searching for repos with query: ${query}`, error);
    throw new Error(`Failed to search repositories with query: ${query}`);
  }
}

/**
 * Get user's starred repositories
 */
export async function getUserStarredRepos(
  username: string,
  options: {
    sort?: "created" | "updated";
    direction?: "asc" | "desc";
    per_page?: number;
    page?: number;
  } = {},
  token?: string
): Promise<GitHubRepo[]> {
  const octokit = token ? createOctokit(token) : defaultOctokit;
  const { sort = "created", direction = "desc", per_page = 30, page = 1 } = options;

  try {
    const response = await octokit.request("GET /users/{username}/starred", {
      username,
      sort,
      direction,
      per_page,
      page,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return response.data as GitHubRepo[];
  } catch (error) {
    console.error(`Error fetching starred repos for ${username}:`, error);
    throw new Error(`Failed to fetch starred repositories for: ${username}`);
  }
}

import { Octokit } from "@octokit/rest";
import { Project } from "../types";

/**
 * Fetches and formats GitHub projects for display
 *
 * This function connects to the GitHub API to retrieve repositories for a specified user,
 * then transforms them into a consistent Project format for display in the UI.
 *
 * Features:
 * - Authenticates with GitHub using provided token
 * - Filters out forks, private, and archived repositories
 * - Sorts by most recently updated
 * - Formats repository data into Project objects
 * - Handles errors gracefully, returning an empty array on failure
 *
 * @param {string} username - GitHub username to fetch repositories for
 * @param {number} limit - Maximum number of repositories to fetch (default: 6)
 * @returns {Promise<Project[]>} Promise resolving to array of formatted Project objects
 *
 * @example
 * // Get 3 most recent projects for a user
 * const projects = await fetchGithubProjects('username', 3);
 */
export async function fetchGithubProjects(
  username: string,
  limit: number = 6
): Promise<Project[]> {
  try {
    // Initialize GitHub API client with authentication
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN, // Use environment variable for security
    });

    // Fetch repositories with specified parameters
    const response = await octokit.repos.listForUser({
      username,
      sort: "updated", // Sort by most recently updated
      per_page: limit, // Limit number of results
      type: "owner", // Only include repos owned by the user
    });

    // Process and transform the response data
    return (
      response.data
        // Filter out repositories we don't want to display
        .filter(repo => !repo.fork && !repo.private && !repo.archived)
        // Transform each repository into our Project format
        .map(repo => ({
          title: repo.name,
          description: repo.description || "No description available",
          tech: [repo.language, ...(repo.topics || [])].filter(
            (item): item is string => Boolean(item)
          ), // Remove null/undefined values
          link: repo.homepage || repo.html_url, // Use homepage if available, otherwise repo URL
          githubUrl: repo.html_url,
          stars: repo.stargazers_count,
          updatedAt: repo.updated_at,
        }))
    );
  } catch (error) {
    // Log error but don't crash the application
    console.error("Error fetching GitHub projects:", error);
    return []; // Return empty array to allow UI to handle gracefully
  }
}

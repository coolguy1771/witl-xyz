import { Octokit } from '@octokit/rest';
import { Project } from '../types';

export async function fetchGithubProjects(username: string): Promise<Project[]> {
  const octokit = new Octokit({
    auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN
  });

  const response = await octokit.repos.listForUser({
    username,
    sort: 'updated',
    per_page: 6,
    type: 'owner'
  });

  return response.data
    .filter(repo => !repo.fork && !repo.private)
    .map(repo => ({
      title: repo.name,
      description: repo.description || 'No description available',
      tech: [
        repo.language,
        ...(repo.topics || [])
      ].filter((item): item is string => Boolean(item)),
      link: repo.homepage || repo.html_url,
      githubUrl: repo.html_url
    }));
}

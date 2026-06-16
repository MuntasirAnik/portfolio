import type { NextApiRequest, NextApiResponse } from "next";

interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
}

export interface GitHubData {
  repos: {
    name: string;
    description: string;
    url: string;
    stars: number;
    forks: number;
    language: string;
  }[];
  totalStars: number;
  totalRepos: number;
}

// Cache for 1 hour
let cache: { data: GitHubData; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const username = (req.query.username as string) || "MuntasirAnik";

  // Return cached data if fresh
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return res.status(200).json(cache.data);
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=30&type=owner`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "portfolio-site",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const repos: GitHubRepo[] = await response.json();

    // Sort by stars, take top 6
    const sorted = repos
      .filter((r) => !r.name.includes(".github"))
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6);

    const data: GitHubData = {
      repos: sorted.map((r) => ({
        name: r.name,
        description: r.description || "No description",
        url: r.html_url,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language || "—",
      })),
      totalStars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
      totalRepos: repos.length,
    };

    cache = { data, timestamp: Date.now() };
    return res.status(200).json(data);
  } catch (err) {
    // Return stale cache on error
    if (cache) {
      return res.status(200).json(cache.data);
    }
    return res.status(500).json({ error: "Failed to fetch GitHub data" });
  }
}

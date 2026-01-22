import { z } from "zod";

// GitHub URL parsing
const GITHUB_URL_REGEX = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/;

export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
}

export function parseGitHubUrl(url: string): ParsedGitHubUrl | null {
  const match = url.trim().match(GITHUB_URL_REGEX);
  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
}

// Repository info from GitHub API
export interface RepoInfo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

export interface CommitInfo {
  firstCommitAt: string | null;
  lastCommitAt: string | null;
  commitCount: number;
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
  repo?: RepoInfo;
}

// Get the GitHub token from environment
function getGitHubToken(): string | undefined {
  return process.env.GITHUB_APP_TOKEN;
}

// Headers for GitHub API requests
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  const token = getGitHubToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Verify that a GitHub repository exists and is public
 */
export async function verifyRepository(
  owner: string,
  repo: string
): Promise<VerificationResult> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: getHeaders(),
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (response.status === 404) {
      return {
        valid: false,
        error: "Repository not found. Make sure it exists and is public.",
      };
    }

    if (response.status === 403) {
      return {
        valid: false,
        error: "Rate limited. Please try again later.",
      };
    }

    if (!response.ok) {
      return {
        valid: false,
        error: `Failed to verify repository: ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (data.private) {
      return {
        valid: false,
        error: "Repository must be public.",
      };
    }

    return {
      valid: true,
      repo: {
        name: data.name,
        full_name: data.full_name,
        description: data.description,
        html_url: data.html_url,
        private: data.private,
        created_at: data.created_at,
        updated_at: data.updated_at,
        pushed_at: data.pushed_at,
        default_branch: data.default_branch,
        language: data.language,
        stargazers_count: data.stargazers_count,
        forks_count: data.forks_count,
      },
    };
  } catch (error) {
    console.error("Error verifying repository:", error);
    return {
      valid: false,
      error: "Failed to verify repository. Please try again.",
    };
  }
}

/**
 * Get commit information for a repository
 */
export async function getCommitInfo(
  owner: string,
  repo: string
): Promise<CommitInfo> {
  try {
    // Get the first page of commits (most recent)
    const recentResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      {
        headers: getHeaders(),
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!recentResponse.ok) {
      return { firstCommitAt: null, lastCommitAt: null, commitCount: 0 };
    }

    const recentCommits = await recentResponse.json();
    const lastCommitAt =
      recentCommits.length > 0
        ? recentCommits[0].commit.author.date
        : null;

    // Get total commit count from Link header
    const linkHeader = recentResponse.headers.get("Link");
    let commitCount = recentCommits.length;

    if (linkHeader) {
      const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (lastPageMatch) {
        commitCount = parseInt(lastPageMatch[1], 10);
      }
    }

    // Get the first commit (oldest)
    let firstCommitAt = null;
    if (commitCount > 1) {
      const firstResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1&page=${commitCount}`,
        {
          headers: getHeaders(),
          next: { revalidate: 3600 }, // Cache for 1 hour
        }
      );

      if (firstResponse.ok) {
        const firstCommits = await firstResponse.json();
        if (firstCommits.length > 0) {
          firstCommitAt = firstCommits[0].commit.author.date;
        }
      }
    } else if (recentCommits.length > 0) {
      firstCommitAt = recentCommits[0].commit.author.date;
    }

    return {
      firstCommitAt,
      lastCommitAt,
      commitCount,
    };
  } catch (error) {
    console.error("Error getting commit info:", error);
    return { firstCommitAt: null, lastCommitAt: null, commitCount: 0 };
  }
}

/**
 * Full validation of a repository URL
 */
export async function validateRepositoryUrl(url: string): Promise<{
  valid: boolean;
  error?: string;
  repo?: RepoInfo;
  commits?: CommitInfo;
}> {
  // Parse the URL
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return {
      valid: false,
      error: "Invalid GitHub URL. Please use format: https://github.com/owner/repo",
    };
  }

  // Verify the repository
  const verification = await verifyRepository(parsed.owner, parsed.repo);
  if (!verification.valid) {
    return verification;
  }

  // Get commit info
  const commits = await getCommitInfo(parsed.owner, parsed.repo);

  return {
    valid: true,
    repo: verification.repo,
    commits,
  };
}

// Zod schema for GitHub URL validation
export const gitHubUrlSchema = z
  .string()
  .url("Please enter a valid URL")
  .refine(
    (url) => parseGitHubUrl(url) !== null,
    "Must be a valid GitHub repository URL (https://github.com/owner/repo)"
  );

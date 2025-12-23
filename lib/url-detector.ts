/**
 * Detects if the input is a GitHub repository URL or a project description
 */
export type InputType = 'github' | 'description' | 'empty';

export function detectInputType(input: string): InputType {
  const trimmed = input.trim();
  if (!trimmed) return 'empty';

  // Patterns to detect GitHub URLs (ordered by specificity):
  // 1. Full HTTPS URL: https://github.com/owner/repo
  // 2. URL without protocol: github.com/owner/repo
  // 3. Shorthand: owner/repo (must have exactly one /, alphanumeric + dashes)
  const githubPatterns = [
    /^https?:\/\/github\.com\/[^\/]+\/[^\/\s]+/i,  // Full URL
    /^github\.com\/[^\/]+\/[^\/\s]+/i,              // Without protocol
    /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/             // Shorthand owner/repo
  ];

  for (const pattern of githubPatterns) {
    if (pattern.test(trimmed)) {
      return 'github';
    }
  }

  return 'description';
}

/**
 * Normalizes a GitHub URL to the standard format
 */
export function normalizeGitHubUrl(input: string): string {
  const trimmed = input.trim();

  // Already a full URL
  if (trimmed.startsWith('https://github.com/') || trimmed.startsWith('http://github.com/')) {
    return trimmed;
  }

  // URL without protocol
  if (trimmed.toLowerCase().startsWith('github.com/')) {
    return `https://${trimmed}`;
  }

  // Shorthand owner/repo
  if (/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(trimmed)) {
    return `https://github.com/${trimmed}`;
  }

  return trimmed;
}

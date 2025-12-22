import { Octokit } from '@octokit/rest';
import {
  ParsedRepoUrl,
  GitHubRepoInfo,
  GitHubLanguages,
  GitHubContent,
  GitHubContributor,
  GitHubRelease,
  RepoAnalysisData,
  DirectoryNode,
  KeyFileContent,
  AnalyzeErrorCode,
} from '@/types/analyzer';

// Key files to fetch for analysis
const KEY_FILES = [
  // Dependency files
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'requirements.txt',
  'Pipfile',
  'pyproject.toml',
  'Cargo.toml',
  'go.mod',
  'Gemfile',
  'composer.json',
  'pom.xml',
  'build.gradle',
  // Config files
  'tsconfig.json',
  'next.config.js',
  'next.config.mjs',
  'next.config.ts',
  'vite.config.ts',
  'vite.config.js',
  'webpack.config.js',
  '.env.example',
  '.env.sample',
  'config.yaml',
  'config.json',
  // Docker/Infrastructure
  'Dockerfile',
  'docker-compose.yml',
  'docker-compose.yaml',
  'kubernetes.yaml',
  'k8s.yaml',
  'serverless.yml',
  'vercel.json',
  'netlify.toml',
  // Database
  'schema.prisma',
  'drizzle.config.ts',
  // API
  'openapi.yaml',
  'openapi.json',
  'swagger.yaml',
  'swagger.json',
];

// Directories to explore for structure
const EXPLORE_DIRS = ['src', 'lib', 'app', 'pages', 'api', 'components', 'services', 'models', 'controllers'];

export class GitHubAnalyzer {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(owner: string, repo: string, token?: string) {
    this.owner = owner;
    this.repo = repo;

    const authToken = token || process.env.GITHUB_TOKEN;

    if (!authToken) {
      console.warn('⚠️ No GITHUB_TOKEN found. Using unauthenticated requests (60/hour limit).');
      console.warn('Add GITHUB_TOKEN to your .env file for 5000 requests/hour.');
    } else {
      console.log('✓ Using authenticated GitHub API requests');
    }

    // Custom logger to suppress expected 404s (missing releases, optional directories)
    const customLog = {
      debug: () => {},
      info: () => {},
      warn: console.warn,
      error: console.error,
    };

    this.octokit = new Octokit({
      auth: authToken,
      log: customLog,
    });
  }

  /**
   * Parse a GitHub URL into owner and repo
   */
  static parseRepoUrl(url: string): ParsedRepoUrl {
    // Remove trailing slashes and .git
    let cleanUrl = url.trim().replace(/\/+$/, '').replace(/\.git$/, '');

    // Handle different URL formats
    let match: RegExpMatchArray | null = null;

    // Full HTTPS URL: https://github.com/owner/repo
    match = cleanUrl.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        fullUrl: `https://github.com/${match[1]}/${match[2]}`,
      };
    }

    // URL without protocol: github.com/owner/repo
    match = cleanUrl.match(/^github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        fullUrl: `https://github.com/${match[1]}/${match[2]}`,
      };
    }

    // Shorthand: owner/repo
    match = cleanUrl.match(/^([^\/]+)\/([^\/]+)$/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        fullUrl: `https://github.com/${match[1]}/${match[2]}`,
      };
    }

    throw new Error('Invalid GitHub repository URL');
  }

  /**
   * Validate that the repository exists and is accessible
   */
  async validateRepo(): Promise<{ valid: boolean; error?: AnalyzeErrorCode; message?: string }> {
    try {
      const { data } = await this.octokit.repos.get({
        owner: this.owner,
        repo: this.repo,
      });

      if (data.size === 0) {
        return { valid: false, error: 'REPO_EMPTY', message: 'Repository is empty' };
      }

      // Warn if repo is very large (> 100MB)
      if (data.size > 100000) {
        console.warn(`Repository ${this.owner}/${this.repo} is large: ${data.size}KB`);
      }

      return { valid: true };
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status === 404) {
        return { valid: false, error: 'REPO_NOT_FOUND', message: 'Repository not found' };
      }
      if (err.status === 403) {
        return { valid: false, error: 'RATE_LIMITED', message: 'Rate limited by GitHub API' };
      }
      return { valid: false, error: 'GITHUB_API_ERROR', message: 'GitHub API error' };
    }
  }

  /**
   * Fetch repository metadata
   */
  async getRepoInfo(): Promise<GitHubRepoInfo> {
    const { data } = await this.octokit.repos.get({
      owner: this.owner,
      repo: this.repo,
    });
    return data as GitHubRepoInfo;
  }

  /**
   * Fetch language breakdown
   */
  async getLanguages(): Promise<GitHubLanguages> {
    const { data } = await this.octokit.repos.listLanguages({
      owner: this.owner,
      repo: this.repo,
    });
    return data;
  }

  /**
   * Fetch README content
   */
  async getReadme(): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.getReadme({
        owner: this.owner,
        repo: this.repo,
      });

      if (data.content && data.encoding === 'base64') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch directory contents
   */
  async getContents(path: string = ''): Promise<GitHubContent[]> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      if (Array.isArray(data)) {
        return data as GitHubContent[];
      }
      return [data as GitHubContent];
    } catch {
      return [];
    }
  }

  /**
   * Fetch a specific file's content
   */
  async getFileContent(path: string): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      if ('content' in data && data.encoding === 'base64') {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Build directory tree (limited depth)
   */
  async buildDirectoryTree(maxDepth: number = 3): Promise<DirectoryNode[]> {
    const buildTree = async (path: string, depth: number): Promise<DirectoryNode[]> => {
      if (depth > maxDepth) return [];

      const contents = await this.getContents(path);
      const nodes: DirectoryNode[] = [];

      for (const item of contents) {
        const node: DirectoryNode = {
          name: item.name,
          path: item.path,
          type: item.type as 'file' | 'dir',
        };

        // Only expand directories that are commonly important
        if (item.type === 'dir' && (depth < 2 || EXPLORE_DIRS.includes(item.name))) {
          node.children = await buildTree(item.path, depth + 1);
        }

        nodes.push(node);
      }

      return nodes;
    };

    return buildTree('', 0);
  }

  /**
   * Fetch key configuration files
   */
  async getKeyFiles(): Promise<KeyFileContent[]> {
    const keyFiles: KeyFileContent[] = [];
    const rootContents = await this.getContents();

    for (const item of rootContents) {
      if (item.type === 'file' && KEY_FILES.includes(item.name)) {
        const content = await this.getFileContent(item.path);
        if (content) {
          keyFiles.push({
            path: item.path,
            name: item.name,
            content: content.substring(0, 10000), // Limit content size
            type: this.categorizeFile(item.name),
          });
        }
      }
    }

    // Also check common subdirectories
    for (const dir of ['prisma', 'database', 'db', 'config']) {
      const dirContents = await this.getContents(dir);
      for (const item of dirContents) {
        if (item.type === 'file' && (item.name.endsWith('.prisma') || item.name.includes('schema'))) {
          const content = await this.getFileContent(item.path);
          if (content) {
            keyFiles.push({
              path: item.path,
              name: item.name,
              content: content.substring(0, 10000),
              type: 'config',
            });
          }
        }
      }
    }

    return keyFiles;
  }

  /**
   * Categorize a file by its name
   */
  private categorizeFile(name: string): KeyFileContent['type'] {
    if (['package.json', 'requirements.txt', 'Cargo.toml', 'go.mod', 'Gemfile', 'pom.xml'].includes(name)) {
      return 'dependency';
    }
    if (name.includes('docker') || name.includes('Dockerfile')) {
      return 'docker';
    }
    if (name.toLowerCase().includes('readme')) {
      return 'readme';
    }
    return 'config';
  }

  /**
   * Fetch top contributors
   */
  async getContributors(limit: number = 5): Promise<GitHubContributor[]> {
    try {
      const { data } = await this.octokit.repos.listContributors({
        owner: this.owner,
        repo: this.repo,
        per_page: limit,
      });
      return data as GitHubContributor[];
    } catch {
      return [];
    }
  }

  /**
   * Fetch latest release (silently returns null if none exists)
   */
  async getLatestRelease(): Promise<GitHubRelease | null> {
    try {
      const { data } = await this.octokit.repos.getLatestRelease({
        owner: this.owner,
        repo: this.repo,
      });
      return data as GitHubRelease;
    } catch (error: unknown) {
      // 404 is expected when no releases exist - don't log it
      const err = error as { status?: number };
      if (err.status !== 404) {
        console.warn('Failed to fetch latest release:', err);
      }
      return null;
    }
  }

  /**
   * Detect frameworks from dependencies
   */
  detectFrameworks(keyFiles: KeyFileContent[]): string[] {
    const frameworks: string[] = [];

    for (const file of keyFiles) {
      if (file.name === 'package.json') {
        try {
          const pkg = JSON.parse(file.content);
          const deps = { ...pkg.dependencies, ...pkg.devDependencies };

          if (deps.next) frameworks.push('Next.js');
          if (deps.react) frameworks.push('React');
          if (deps.vue) frameworks.push('Vue.js');
          if (deps.angular || deps['@angular/core']) frameworks.push('Angular');
          if (deps.express) frameworks.push('Express');
          if (deps.fastify) frameworks.push('Fastify');
          if (deps.nestjs || deps['@nestjs/core']) frameworks.push('NestJS');
          if (deps.nuxt) frameworks.push('Nuxt');
          if (deps.svelte) frameworks.push('Svelte');
          if (deps.tailwindcss) frameworks.push('Tailwind CSS');
          if (deps.prisma || deps['@prisma/client']) frameworks.push('Prisma');
          if (deps.drizzle || deps['drizzle-orm']) frameworks.push('Drizzle');
          if (deps.supabase || deps['@supabase/supabase-js']) frameworks.push('Supabase');
        } catch {
          // Ignore parse errors
        }
      }

      if (file.name === 'requirements.txt' || file.name === 'pyproject.toml') {
        const content = file.content.toLowerCase();
        if (content.includes('django')) frameworks.push('Django');
        if (content.includes('flask')) frameworks.push('Flask');
        if (content.includes('fastapi')) frameworks.push('FastAPI');
        if (content.includes('pytorch') || content.includes('torch')) frameworks.push('PyTorch');
        if (content.includes('tensorflow')) frameworks.push('TensorFlow');
      }

      if (file.name === 'Cargo.toml') {
        const content = file.content.toLowerCase();
        if (content.includes('actix')) frameworks.push('Actix');
        if (content.includes('rocket')) frameworks.push('Rocket');
        if (content.includes('tokio')) frameworks.push('Tokio');
      }

      if (file.name === 'go.mod') {
        const content = file.content.toLowerCase();
        if (content.includes('gin-gonic')) frameworks.push('Gin');
        if (content.includes('fiber')) frameworks.push('Fiber');
        if (content.includes('echo')) frameworks.push('Echo');
      }
    }

    return [...new Set(frameworks)];
  }

  /**
   * Detect databases from configuration
   */
  detectDatabases(keyFiles: KeyFileContent[]): string[] {
    const databases: string[] = [];

    for (const file of keyFiles) {
      const content = file.content.toLowerCase();

      if (content.includes('postgres') || content.includes('postgresql')) databases.push('PostgreSQL');
      if (content.includes('mysql')) databases.push('MySQL');
      if (content.includes('mongodb') || content.includes('mongoose')) databases.push('MongoDB');
      if (content.includes('redis')) databases.push('Redis');
      if (content.includes('sqlite')) databases.push('SQLite');
      if (content.includes('dynamodb')) databases.push('DynamoDB');
      if (content.includes('supabase')) databases.push('Supabase');
      if (content.includes('firebase')) databases.push('Firebase');
    }

    return [...new Set(databases)];
  }

  /**
   * Detect infrastructure tools
   */
  detectInfrastructure(keyFiles: KeyFileContent[]): string[] {
    const infra: string[] = [];

    for (const file of keyFiles) {
      if (file.name.includes('docker') || file.name === 'Dockerfile') infra.push('Docker');
      if (file.name.includes('kubernetes') || file.name.includes('k8s')) infra.push('Kubernetes');
      if (file.name === 'vercel.json') infra.push('Vercel');
      if (file.name === 'netlify.toml') infra.push('Netlify');
      if (file.name === 'serverless.yml') infra.push('Serverless Framework');
      if (file.name.includes('terraform')) infra.push('Terraform');
      if (file.name.includes('ansible')) infra.push('Ansible');
    }

    return [...new Set(infra)];
  }

  /**
   * Perform full repository analysis
   */
  async analyze(): Promise<RepoAnalysisData> {
    // Validate first
    const validation = await this.validateRepo();
    if (!validation.valid) {
      throw new Error(validation.message || 'Invalid repository');
    }

    // Fetch all data in parallel where possible
    const [info, languages, readme, directoryTree, keyFiles, contributors, latestRelease] = await Promise.all([
      this.getRepoInfo(),
      this.getLanguages(),
      this.getReadme(),
      this.buildDirectoryTree(),
      this.getKeyFiles(),
      this.getContributors(),
      this.getLatestRelease(),
    ]);

    // Detect technologies
    const detectedFrameworks = this.detectFrameworks(keyFiles);
    const detectedDatabases = this.detectDatabases(keyFiles);
    const detectedInfrastructure = this.detectInfrastructure(keyFiles);

    return {
      info,
      languages,
      readme,
      directoryTree,
      keyFiles,
      contributors,
      latestRelease,
      detectedFrameworks,
      detectedDatabases,
      detectedInfrastructure,
    };
  }
}

/**
 * Helper function to create analyzer and run analysis
 */
export async function analyzeGitHubRepo(repoUrl: string, token?: string): Promise<RepoAnalysisData> {
  const parsed = GitHubAnalyzer.parseRepoUrl(repoUrl);
  const analyzer = new GitHubAnalyzer(parsed.owner, parsed.repo, token);
  return analyzer.analyze();
}

/**
 * Format directory tree as string
 */
export function formatDirectoryTree(nodes: DirectoryNode[], prefix: string = ''): string {
  let result = '';

  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const icon = node.type === 'dir' ? '📁 ' : '📄 ';

    result += `${prefix}${connector}${icon}${node.name}\n`;

    if (node.children && node.children.length > 0) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      result += formatDirectoryTree(node.children, newPrefix);
    }
  });

  return result;
}

/**
 * Calculate language percentages
 */
export function calculateLanguagePercentages(languages: GitHubLanguages): { language: string; percentage: number }[] {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  if (total === 0) return [];

  return Object.entries(languages)
    .map(([language, bytes]) => ({
      language,
      percentage: Math.round((bytes / total) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

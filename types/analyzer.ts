// GitHub Repo Analyzer Types

export interface RepoUrlInput {
  url: string;
}

export interface ParsedRepoUrl {
  owner: string;
  repo: string;
  fullUrl: string;
}

export interface AnalyzeOptions {
  includeApiDocs?: boolean;
  includeArchitectureDiagram?: boolean;
  analysisDepth?: 'standard' | 'deep';
}

export interface AnalyzeRequest {
  repoUrl: string;
  options?: AnalyzeOptions;
}

// GitHub API Response Types
export interface GitHubRepoInfo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  homepage: string | null;
  language: string | null;
  languages_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  topics: string[];
  license: {
    key: string;
    name: string;
    spdx_id: string;
  } | null;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  owner: {
    login: string;
    avatar_url: string;
    type: string;
  };
}

export interface GitHubLanguages {
  [language: string]: number;
}

export interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  content?: string;
  encoding?: string;
}

export interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
}

export interface GitHubReadme {
  content: string;
  encoding: string;
  name: string;
  path: string;
}

// Analyzed Repository Data
export interface RepoAnalysisData {
  info: GitHubRepoInfo;
  languages: GitHubLanguages;
  readme: string | null;
  directoryTree: DirectoryNode[];
  keyFiles: KeyFileContent[];
  contributors: GitHubContributor[];
  latestRelease: GitHubRelease | null;
  detectedFrameworks: string[];
  detectedDatabases: string[];
  detectedInfrastructure: string[];
}

export interface DirectoryNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: DirectoryNode[];
}

export interface KeyFileContent {
  path: string;
  name: string;
  content: string;
  type: 'dependency' | 'config' | 'docker' | 'readme' | 'other';
}

// Generated Spec Types
export interface GeneratedSpec {
  id?: string;
  shareId?: string;
  markdown: string;
  sections: SpecSections;
  metadata: SpecMetadata;
}

export interface SpecSections {
  overview: ProjectOverview;
  techStack: TechStackItem[];
  architecture: ArchitectureSection;
  features: string[];
  apiReference?: ApiEndpoint[];
  dataModels?: DataModel[];
  gettingStarted: GettingStartedSection;
  documentationGaps: string[];
  metrics: ProjectMetrics;
}

export interface ProjectOverview {
  purpose: string;
  type: string;
  status: 'Active' | 'Maintained' | 'Archived' | 'Unknown';
  license: string | null;
}

export interface TechStackItem {
  layer: string;
  technology: string;
  version?: string;
}

export interface ArchitectureSection {
  mermaidDiagram: string;
  components: ComponentDescription[];
  directoryStructure: string;
}

export interface ComponentDescription {
  name: string;
  description: string;
  path?: string;
}

export interface ApiEndpoint {
  endpoint: string;
  method: string;
  description: string;
}

export interface DataModel {
  name: string;
  fields: { name: string; type: string }[];
  description?: string;
}

export interface GettingStartedSection {
  prerequisites: string[];
  installation: string;
  configuration: string;
}

export interface ProjectMetrics {
  stars: number;
  forks: number;
  lastUpdated: string;
  contributorsCount: number;
  openIssues: number;
}

export interface SpecMetadata {
  generatedAt: string;
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  commitSha?: string;
  analysisVersion: string;
}

// API Response Types
export interface AnalyzeResponse {
  success: boolean;
  specId?: string;
  spec?: GeneratedSpec;
  shareUrl?: string;
  error?: string;
  errorCode?: AnalyzeErrorCode;
}

export type AnalyzeErrorCode =
  | 'REPO_NOT_FOUND'
  | 'REPO_EMPTY'
  | 'RATE_LIMITED'
  | 'REPO_TOO_LARGE'
  | 'ANALYSIS_FAILED'
  | 'PRIVATE_REPO'
  | 'INVALID_URL'
  | 'GITHUB_API_ERROR';

export const ERROR_MESSAGES: Record<AnalyzeErrorCode, string> = {
  REPO_NOT_FOUND: 'Repository not found. Make sure it exists and is public.',
  REPO_EMPTY: 'This repository appears to be empty.',
  RATE_LIMITED: 'GitHub API rate limit reached. Try again in a few minutes or sign in for higher limits.',
  REPO_TOO_LARGE: 'This repository is too large for free analysis. Sign up for Pro to analyze large repos.',
  ANALYSIS_FAILED: 'Analysis failed. This might be an unusual project structure.',
  PRIVATE_REPO: 'This appears to be a private repository. Sign in to analyze private repos.',
  INVALID_URL: 'Invalid GitHub repository URL. Please enter a valid URL.',
  GITHUB_API_ERROR: 'Error communicating with GitHub API. Please try again.',
};

// Analysis Progress Types
export type AnalysisStep =
  | 'fetching_metadata'
  | 'analyzing_structure'
  | 'reading_files'
  | 'analyzing_architecture'
  | 'generating_spec';

export interface AnalysisProgress {
  step: AnalysisStep;
  label: string;
  percent: number;
  completed: boolean;
}

export const ANALYSIS_STEPS: AnalysisProgress[] = [
  { step: 'fetching_metadata', label: 'Fetching repository metadata', percent: 20, completed: false },
  { step: 'analyzing_structure', label: 'Analyzing directory structure', percent: 40, completed: false },
  { step: 'reading_files', label: 'Reading key configuration files', percent: 60, completed: false },
  { step: 'analyzing_architecture', label: 'Analyzing architecture patterns', percent: 80, completed: false },
  { step: 'generating_spec', label: 'Generating specification', percent: 100, completed: false },
];

// Database Types
export interface StoredSpec {
  id: string;
  share_id: string;
  repo_owner: string;
  repo_name: string;
  repo_url: string;
  commit_sha: string | null;
  spec_markdown: string;
  spec_json: GeneratedSpec | null;
  metadata: SpecMetadata;
  created_at: string;
  view_count: number;
}

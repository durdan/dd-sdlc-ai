import { ClaudeService } from './claude-service';
import { supabase } from './supabase/server';

export interface RepositoryAnalysis {
  id: string;
  repositoryUrl: string;
  structure: RepoStructure;
  patterns: CodePatterns;
  dependencies: DependencyMap;
  architecture: ArchitectureInfo;
  searchIndex: SearchIndex;
  framework: string;
  primaryLanguage: string;
  analyzedAt: Date;
  cached: boolean;
}

export interface RepoStructure {
  files: RepoFile[];
  directories: string[];
  totalFiles: number;
  totalLines: number;
  languages: LanguageDistribution;
}

export interface RepoFile {
  path: string;
  type: 'file' | 'directory';
  size: number;
  language?: string;
  content?: string;
  lastModified?: Date;
}

export interface CodePatterns {
  naming: NamingConventions;
  fileOrganization: FileOrganizationPattern;
  imports: ImportPattern[];
  exports: ExportPattern[];
  functions: FunctionPattern[];
  classes: ClassPattern[];
  components: ComponentPattern[];
  errorHandling: ErrorHandlingPattern[];
  testing: TestingPattern[];
  configuration: ConfigurationPattern[];
}

export interface NamingConventions {
  files: string; // camelCase, kebab-case, snake_case
  functions: string;
  variables: string;
  classes: string;
  components: string;
  constants: string;
}

export interface DependencyMap {
  imports: Map<string, string[]>;
  exports: Map<string, string[]>;
  functions: Map<string, FunctionCall[]>;
  components: Map<string, ComponentUsage[]>;
  externalDependencies: ExternalDependency[];
}

export interface ArchitectureInfo {
  framework: string;
  language: string;
  buildTool: string;
  packageManager: string;
  testFramework?: string;
  styling?: string;
  stateManagement?: string;
  routing?: string;
  conventions: ArchitectureConventions;
}

export interface ArchitectureConventions {
  directoryStructure: string;
  componentStructure: string;
  stateManagement: string;
  styling: string;
  testing: string;
}

export interface SearchIndex {
  fileIndex: Map<string, FileIndexEntry>;
  functionIndex: Map<string, FunctionIndexEntry[]>;
  classIndex: Map<string, ClassIndexEntry[]>;
  componentIndex: Map<string, ComponentIndexEntry[]>;
  contentIndex: Map<string, string[]>; // keyword -> file paths
}

export interface RelevantFile {
  path: string;
  score: number;
  reasons: string[];
  confidence: number;
  content?: string;
}

export interface FileCandidate {
  path: string;
  score: number;
  reason: string;
  content?: string;
}

export interface FileIndexEntry {
  path: string;
  language: string;
  functions: string[];
  classes: string[];
  components: string[];
  imports: string[];
  exports: string[];
  keywords: string[];
}

export interface FunctionIndexEntry {
  name: string;
  file: string;
  line: number;
  parameters: string[];
  returnType?: string;
  description?: string;
}

export interface ClassIndexEntry {
  name: string;
  file: string;
  line: number;
  methods: string[];
  properties: string[];
  extends?: string;
  implements?: string[];
}

export interface ComponentIndexEntry {
  name: string;
  file: string;
  line: number;
  props: string[];
  hooks: string[];
  type: 'functional' | 'class';
}

export interface FileOrganizationPattern {
  type: 'feature-based' | 'type-based' | 'domain-based' | 'mixed';
  directories: DirectoryPattern[];
  depth: number;
  consistency: number; // 0-1 score
}

export interface DirectoryPattern {
  name: string;
  purpose: string;
  fileTypes: string[];
  namingPattern: string;
}

export interface ImportPattern {
  type: 'relative' | 'absolute' | 'alias';
  pattern: string;
  usage: number;
  files: string[];
}

export interface ExportPattern {
  type: 'default' | 'named' | 'namespace';
  pattern: string;
  usage: number;
  files: string[];
}

export interface FunctionPattern {
  type: 'arrow' | 'declaration' | 'expression';
  naming: string;
  parameters: ParameterPattern[];
  returnType: string;
  usage: number;
}

export interface ParameterPattern {
  destructuring: boolean;
  typing: 'typed' | 'untyped';
  defaultValues: boolean;
}

export interface ClassPattern {
  type: 'class' | 'interface' | 'type';
  naming: string;
  inheritance: boolean;
  methods: MethodPattern[];
  properties: PropertyPattern[];
  usage: number;
}

export interface ComponentPattern {
  type: 'functional' | 'class' | 'hook';
  naming: string;
  propsPattern: string;
  statePattern: string;
  stylingPattern: string;
  usage: number;
}

export interface ErrorHandlingPattern {
  type: 'try-catch' | 'promise-catch' | 'error-boundary' | 'custom';
  pattern: string;
  usage: number;
  files: string[];
}

export interface TestingPattern {
  framework: string;
  namingConvention: string;
  structure: string;
  mocking: string;
  assertions: string;
  coverage: string;
}

export interface ConfigurationPattern {
  type: 'env' | 'config-file' | 'constants';
  files: string[];
  pattern: string;
  usage: number;
}

export interface LanguageDistribution {
  [language: string]: {
    files: number;
    lines: number;
    percentage: number;
  };
}

export interface FunctionCall {
  name: string;
  file: string;
  line: number;
  arguments: string[];
}

export interface ComponentUsage {
  name: string;
  file: string;
  line: number;
  props: string[];
}

export interface ExternalDependency {
  name: string;
  version: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
  usage: string[];
}

export interface MethodPattern {
  name: string;
  visibility: 'public' | 'private' | 'protected';
  static: boolean;
  parameters: number;
}

export interface PropertyPattern {
  name: string;
  visibility: 'public' | 'private' | 'protected';
  static: boolean;
  type: string;
}

export class EnhancedRepositoryAnalyzer {
  private claude: ClaudeService;
  private cache: Map<string, RepositoryAnalysis> = new Map();

  constructor(claude: ClaudeService) {
    this.claude = claude;
  }

  async analyzeRepositoryDeep(
    repositoryUrl: string,
    forceRefresh: boolean = false
  ): Promise<RepositoryAnalysis> {
    const cacheKey = this.getCacheKey(repositoryUrl);
    
    // Check cache first
    if (!forceRefresh) {
      const cached = await this.getCachedAnalysis(cacheKey);
      if (cached) {
        return { ...cached, cached: true };
      }
    }

    console.log(`Starting deep analysis of repository: ${repositoryUrl}`);
    
    // 1. Get repository structure
    const structure = await this.getRepositoryStructure(repositoryUrl);
    
    // 2. Analyze code patterns with Claude
    const patterns = await this.analyzeCodePatterns(structure);
    
    // 3. Build dependency map
    const dependencies = await this.buildDependencyMap(structure);
    
    // 4. Detect architecture
    const architecture = await this.detectArchitecture(structure, patterns);
    
    // 5. Create searchable index
    const searchIndex = await this.buildSearchIndex(structure, patterns);
    
    const analysis: RepositoryAnalysis = {
      id: this.generateAnalysisId(),
      repositoryUrl,
      structure,
      patterns,
      dependencies,
      architecture,
      searchIndex,
      framework: architecture.framework,
      primaryLanguage: architecture.language,
      analyzedAt: new Date(),
      cached: false
    };

    // Cache the analysis
    await this.cacheAnalysis(cacheKey, analysis);
    
    console.log(`Repository analysis completed for: ${repositoryUrl}`);
    return analysis;
  }

  private async getRepositoryStructure(repositoryUrl: string): Promise<RepoStructure> {
    // This would integrate with your existing GitHub service
    // For now, returning a mock structure
    return {
      files: [],
      directories: [],
      totalFiles: 0,
      totalLines: 0,
      languages: {}
    };
  }

  private async analyzeCodePatterns(structure: RepoStructure): Promise<CodePatterns> {
    if (structure.files.length === 0) {
      return this.getDefaultCodePatterns();
    }

    // Get sample files from each directory type
    const sampleFiles = this.getSampleFiles(structure, 10);
    
    const prompt = `
      Analyze these code samples and identify patterns:
      
      ${sampleFiles.map(f => `
        File: ${f.path}
        Language: ${f.language}
        Content (first 100 lines):
        \`\`\`${f.language}
        ${f.content?.split('\n').slice(0, 100).join('\n') || ''}
        \`\`\`
      `).join('\n\n')}
      
      Analyze and identify:
      1. Naming conventions for files, functions, variables, classes, components, constants
      2. File organization patterns (feature-based, type-based, domain-based)
      3. Import/export patterns and preferences
      4. Function definition patterns (arrow vs declaration)
      5. Class/component structure patterns
      6. Error handling patterns
      7. Testing patterns if test files exist
      8. Configuration patterns
      
      Return detailed JSON analysis with specific patterns, usage counts, and consistency scores.
    `;
    
    try {
      const response = await this.claude.analyzeCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing code patterns:', error);
      return this.getDefaultCodePatterns();
    }
  }

  private async buildDependencyMap(structure: RepoStructure): Promise<DependencyMap> {
    const dependencies: DependencyMap = {
      imports: new Map(),
      exports: new Map(),
      functions: new Map(),
      components: new Map(),
      externalDependencies: []
    };

    // Parse package.json for external dependencies
    const packageJsonFile = structure.files.find(f => f.path.endsWith('package.json'));
    if (packageJsonFile?.content) {
      try {
        const packageJson = JSON.parse(packageJsonFile.content);
        dependencies.externalDependencies = this.parseExternalDependencies(packageJson);
      } catch (error) {
        console.error('Error parsing package.json:', error);
      }
    }

    // Analyze each code file for internal dependencies
    for (const file of structure.files) {
      if (this.isCodeFile(file.path) && file.content) {
        const analysis = await this.analyzeFileRelationships(file);
        
        // Map imports/exports
        dependencies.imports.set(file.path, analysis.imports);
        dependencies.exports.set(file.path, analysis.exports);
        
        // Map function calls
        dependencies.functions.set(file.path, analysis.functionCalls);
        
        // Map component usage
        if (this.isComponentFile(file.path)) {
          dependencies.components.set(file.path, analysis.componentUsage);
        }
      }
    }

    return dependencies;
  }

  private async detectArchitecture(
    structure: RepoStructure, 
    patterns: CodePatterns
  ): Promise<ArchitectureInfo> {
    // Detect framework
    const framework = this.detectFramework(structure);
    
    // Detect primary language
    const primaryLanguage = this.detectPrimaryLanguage(structure.languages);
    
    // Detect build tool
    const buildTool = this.detectBuildTool(structure);
    
    // Detect package manager
    const packageManager = this.detectPackageManager(structure);
    
    // Detect testing framework
    const testFramework = this.detectTestFramework(structure);
    
    // Detect styling approach
    const styling = this.detectStyling(structure);
    
    // Detect state management
    const stateManagement = this.detectStateManagement(structure);
    
    // Detect routing
    const routing = this.detectRouting(structure);
    
    // Build conventions based on detected patterns
    const conventions = this.buildArchitectureConventions(patterns, framework);
    
    return {
      framework,
      language: primaryLanguage,
      buildTool,
      packageManager,
      testFramework,
      styling,
      stateManagement,
      routing,
      conventions
    };
  }

  private async buildSearchIndex(
    structure: RepoStructure, 
    patterns: CodePatterns
  ): Promise<SearchIndex> {
    const searchIndex: SearchIndex = {
      fileIndex: new Map(),
      functionIndex: new Map(),
      classIndex: new Map(),
      componentIndex: new Map(),
      contentIndex: new Map()
    };

    // Build file index
    for (const file of structure.files) {
      if (this.isCodeFile(file.path) && file.content) {
        const indexEntry = await this.buildFileIndexEntry(file);
        searchIndex.fileIndex.set(file.path, indexEntry);
        
        // Add to content index
        for (const keyword of indexEntry.keywords) {
          if (!searchIndex.contentIndex.has(keyword)) {
            searchIndex.contentIndex.set(keyword, []);
          }
          searchIndex.contentIndex.get(keyword)!.push(file.path);
        }
        
        // Add functions to function index
        for (const funcName of indexEntry.functions) {
          if (!searchIndex.functionIndex.has(funcName)) {
            searchIndex.functionIndex.set(funcName, []);
          }
          searchIndex.functionIndex.get(funcName)!.push({
            name: funcName,
            file: file.path,
            line: 1, // Would need AST parsing for exact line
            parameters: [],
            description: `Function ${funcName} in ${file.path}`
          });
        }
        
        // Add classes to class index
        for (const className of indexEntry.classes) {
          if (!searchIndex.classIndex.has(className)) {
            searchIndex.classIndex.set(className, []);
          }
          searchIndex.classIndex.get(className)!.push({
            name: className,
            file: file.path,
            line: 1,
            methods: [],
            properties: []
          });
        }
        
        // Add components to component index
        for (const componentName of indexEntry.components) {
          if (!searchIndex.componentIndex.has(componentName)) {
            searchIndex.componentIndex.set(componentName, []);
          }
          searchIndex.componentIndex.get(componentName)!.push({
            name: componentName,
            file: file.path,
            line: 1,
            props: [],
            hooks: [],
            type: 'functional'
          });
        }
      }
    }

    return searchIndex;
  }

  async findRelevantFiles(
    query: string, 
    repoAnalysis: RepositoryAnalysis,
    limit: number = 10
  ): Promise<RelevantFile[]> {
    const candidates: FileCandidate[] = [];
    
    // 1. Keyword matching in file paths
    const pathMatches = this.searchByPath(query, repoAnalysis.structure);
    candidates.push(...pathMatches.map(f => ({ 
      path: f.path, 
      score: 40, 
      reason: 'path_match',
      content: f.content 
    })));
    
    // 2. Function/class name matching
    const functionMatches = this.searchByFunctions(query, repoAnalysis.searchIndex);
    candidates.push(...functionMatches.map(f => ({ 
      path: f.path, 
      score: 60, 
      reason: 'function_match',
      content: f.content 
    })));
    
    // 3. Content search with Claude
    const contentMatches = await this.searchByContent(query, repoAnalysis);
    candidates.push(...contentMatches.map(f => ({ 
      path: f.path, 
      score: 80, 
      reason: 'content_match',
      content: f.content 
    })));
    
    // 4. Dependency chain analysis
    const dependencyMatches = this.searchByDependencies(candidates, repoAnalysis.dependencies);
    candidates.push(...dependencyMatches.map(f => ({ 
      path: f.path, 
      score: 50, 
      reason: 'dependency_match',
      content: f.content 
    })));
    
    // Score and rank
    return this.rankFilesByRelevance(candidates, query, limit);
  }

  private searchByPath(query: string, structure: RepoStructure): RepoFile[] {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/);
    
    return structure.files.filter(file => {
      const pathLower = file.path.toLowerCase();
      return keywords.some(keyword => 
        pathLower.includes(keyword) || 
        pathLower.includes(keyword.replace(/s$/, '')) // handle plurals
      );
    });
  }

  private searchByFunctions(query: string, searchIndex: SearchIndex): Array<{path: string, content?: string}> {
    const queryLower = query.toLowerCase();
    const results: Array<{path: string, content?: string}> = [];
    
    // Search function names
    for (const [funcName, entries] of searchIndex.functionIndex) {
      if (funcName.toLowerCase().includes(queryLower)) {
        results.push(...entries.map(entry => ({ path: entry.file })));
      }
    }
    
    // Search class names
    for (const [className, entries] of searchIndex.classIndex) {
      if (className.toLowerCase().includes(queryLower)) {
        results.push(...entries.map(entry => ({ path: entry.file })));
      }
    }
    
    // Search component names
    for (const [componentName, entries] of searchIndex.componentIndex) {
      if (componentName.toLowerCase().includes(queryLower)) {
        results.push(...entries.map(entry => ({ path: entry.file })));
      }
    }
    
    return results;
  }

  private async searchByContent(
    query: string, 
    repoAnalysis: RepositoryAnalysis
  ): Promise<Array<{path: string, content?: string}>> {
    const prompt = `
      Query: "${query}"
      
      Repository files and their purposes:
      ${Array.from(repoAnalysis.searchIndex.fileIndex.entries()).map(([path, entry]) => `
        File: ${path}
        Functions: ${entry.functions.join(', ')}
        Classes: ${entry.classes.join(', ')}
        Components: ${entry.components.join(', ')}
        Keywords: ${entry.keywords.join(', ')}
      `).join('\n')}
      
      Find the top 5 files most likely related to this query. Consider:
      - File purpose and functionality
      - Function/class names and their likely behavior
      - Business logic connections
      - Data flow relationships
      
      Return JSON array with format:
      [{"path": "file/path", "relevance": 0.8, "reason": "explanation"}]
    `;
    
    try {
      const response = await this.claude.analyzeCode(prompt);
      const matches = JSON.parse(response);
      return matches.map((match: any) => ({
        path: match.path,
        content: undefined // Content will be loaded when needed
      }));
    } catch (error) {
      console.error('Error in content search:', error);
      return [];
    }
  }

  private searchByDependencies(
    candidates: FileCandidate[], 
    dependencies: DependencyMap
  ): Array<{path: string, content?: string}> {
    const results: Array<{path: string, content?: string}> = [];
    const candidatePaths = new Set(candidates.map(c => c.path));
    
    // Find files that import/export from candidate files
    for (const [filePath, imports] of dependencies.imports) {
      if (imports.some(imp => candidatePaths.has(imp))) {
        results.push({ path: filePath });
      }
    }
    
    // Find files that are imported by candidate files
    for (const candidatePath of candidatePaths) {
      const imports = dependencies.imports.get(candidatePath) || [];
      for (const importPath of imports) {
        results.push({ path: importPath });
      }
    }
    
    return results;
  }

  private rankFilesByRelevance(
    candidates: FileCandidate[], 
    query: string, 
    limit: number
  ): RelevantFile[] {
    // Combine scores and remove duplicates
    const fileScores = new Map<string, number>();
    const fileReasons = new Map<string, string[]>();
    
    candidates.forEach(candidate => {
      const currentScore = fileScores.get(candidate.path) || 0;
      fileScores.set(candidate.path, currentScore + candidate.score);
      
      const reasons = fileReasons.get(candidate.path) || [];
      reasons.push(candidate.reason);
      fileReasons.set(candidate.path, reasons);
    });
    
    // Sort by score and return top results
    return Array.from(fileScores.entries())
      .map(([path, score]) => ({
        path,
        score,
        reasons: fileReasons.get(path) || [],
        confidence: Math.min(score / 100, 1.0)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Helper methods
  private getCacheKey(repositoryUrl: string): string {
    return `repo_analysis:${repositoryUrl.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  private async getCachedAnalysis(cacheKey: string): Promise<RepositoryAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('repository_analysis_cache')
        .select('*')
        .eq('cache_key', cacheKey)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - new Date(data.created_at).getTime();
      if (cacheAge > 24 * 60 * 60 * 1000) {
        return null;
      }
      
      return data.analysis_data;
    } catch (error) {
      console.error('Error retrieving cached analysis:', error);
      return null;
    }
  }

  private async cacheAnalysis(cacheKey: string, analysis: RepositoryAnalysis): Promise<void> {
    try {
      await supabase
        .from('repository_analysis_cache')
        .upsert({
          cache_key: cacheKey,
          repository_url: analysis.repositoryUrl,
          analysis_data: analysis,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error caching analysis:', error);
    }
  }

  private getSampleFiles(structure: RepoStructure, maxFiles: number): RepoFile[] {
    const codeFiles = structure.files.filter(f => this.isCodeFile(f.path));
    
    // Try to get representative samples from different directories
    const samples: RepoFile[] = [];
    const seenDirs = new Set<string>();
    
    for (const file of codeFiles) {
      const dir = file.path.split('/').slice(0, -1).join('/');
      if (!seenDirs.has(dir) && samples.length < maxFiles) {
        samples.push(file);
        seenDirs.add(dir);
      }
    }
    
    // Fill remaining slots with any code files
    for (const file of codeFiles) {
      if (samples.length >= maxFiles) break;
      if (!samples.includes(file)) {
        samples.push(file);
      }
    }
    
    return samples;
  }

  private isCodeFile(path: string): boolean {
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rb', '.php', '.swift', '.kt'];
    return codeExtensions.some(ext => path.endsWith(ext));
  }

  private isComponentFile(path: string): boolean {
    return path.includes('component') || path.includes('Component') || 
           path.endsWith('.jsx') || path.endsWith('.tsx') || 
           path.endsWith('.vue') || path.endsWith('.svelte');
  }

  private async analyzeFileRelationships(file: RepoFile): Promise<{
    imports: string[];
    exports: string[];
    functionCalls: FunctionCall[];
    componentUsage: ComponentUsage[];
  }> {
    // This would use AST parsing or regex to extract relationships
    // For now, returning empty arrays
    return {
      imports: [],
      exports: [],
      functionCalls: [],
      componentUsage: []
    };
  }

  private parseExternalDependencies(packageJson: any): ExternalDependency[] {
    const deps: ExternalDependency[] = [];
    
    if (packageJson.dependencies) {
      for (const [name, version] of Object.entries(packageJson.dependencies)) {
        deps.push({
          name,
          version: version as string,
          type: 'dependency',
          usage: []
        });
      }
    }
    
    if (packageJson.devDependencies) {
      for (const [name, version] of Object.entries(packageJson.devDependencies)) {
        deps.push({
          name,
          version: version as string,
          type: 'devDependency',
          usage: []
        });
      }
    }
    
    return deps;
  }

  private detectFramework(structure: RepoStructure): string {
    const packageJson = structure.files.find(f => f.path.endsWith('package.json'));
    if (packageJson?.content) {
      const pkg = JSON.parse(packageJson.content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps['react']) return 'React';
      if (deps['vue']) return 'Vue.js';
      if (deps['angular']) return 'Angular';
      if (deps['svelte']) return 'Svelte';
      if (deps['next']) return 'Next.js';
      if (deps['nuxt']) return 'Nuxt.js';
      if (deps['express']) return 'Express.js';
      if (deps['fastify']) return 'Fastify';
    }
    
    return 'Unknown';
  }

  private detectPrimaryLanguage(languages: LanguageDistribution): string {
    let maxPercentage = 0;
    let primaryLanguage = 'Unknown';
    
    for (const [lang, info] of Object.entries(languages)) {
      if (info.percentage > maxPercentage) {
        maxPercentage = info.percentage;
        primaryLanguage = lang;
      }
    }
    
    return primaryLanguage;
  }

  private detectBuildTool(structure: RepoStructure): string {
    const filenames = structure.files.map(f => f.path.split('/').pop());
    
    if (filenames.includes('webpack.config.js')) return 'Webpack';
    if (filenames.includes('vite.config.js') || filenames.includes('vite.config.ts')) return 'Vite';
    if (filenames.includes('rollup.config.js')) return 'Rollup';
    if (filenames.includes('gulpfile.js')) return 'Gulp';
    if (filenames.includes('Gruntfile.js')) return 'Grunt';
    if (filenames.includes('tsconfig.json')) return 'TypeScript';
    
    return 'Unknown';
  }

  private detectPackageManager(structure: RepoStructure): string {
    const filenames = structure.files.map(f => f.path.split('/').pop());
    
    if (filenames.includes('pnpm-lock.yaml')) return 'pnpm';
    if (filenames.includes('yarn.lock')) return 'yarn';
    if (filenames.includes('package-lock.json')) return 'npm';
    
    return 'npm';
  }

  private detectTestFramework(structure: RepoStructure): string | undefined {
    const packageJson = structure.files.find(f => f.path.endsWith('package.json'));
    if (packageJson?.content) {
      const pkg = JSON.parse(packageJson.content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps['jest']) return 'Jest';
      if (deps['mocha']) return 'Mocha';
      if (deps['jasmine']) return 'Jasmine';
      if (deps['vitest']) return 'Vitest';
      if (deps['cypress']) return 'Cypress';
      if (deps['playwright']) return 'Playwright';
    }
    
    return undefined;
  }

  private detectStyling(structure: RepoStructure): string | undefined {
    const packageJson = structure.files.find(f => f.path.endsWith('package.json'));
    if (packageJson?.content) {
      const pkg = JSON.parse(packageJson.content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps['styled-components']) return 'Styled Components';
      if (deps['emotion']) return 'Emotion';
      if (deps['tailwindcss']) return 'Tailwind CSS';
      if (deps['sass']) return 'Sass';
      if (deps['less']) return 'Less';
    }
    
    const hasCSS = structure.files.some(f => f.path.endsWith('.css'));
    const hasSCSS = structure.files.some(f => f.path.endsWith('.scss'));
    const hasLess = structure.files.some(f => f.path.endsWith('.less'));
    
    if (hasSCSS) return 'Sass';
    if (hasLess) return 'Less';
    if (hasCSS) return 'CSS';
    
    return undefined;
  }

  private detectStateManagement(structure: RepoStructure): string | undefined {
    const packageJson = structure.files.find(f => f.path.endsWith('package.json'));
    if (packageJson?.content) {
      const pkg = JSON.parse(packageJson.content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps['redux']) return 'Redux';
      if (deps['mobx']) return 'MobX';
      if (deps['zustand']) return 'Zustand';
      if (deps['recoil']) return 'Recoil';
      if (deps['jotai']) return 'Jotai';
      if (deps['valtio']) return 'Valtio';
    }
    
    return undefined;
  }

  private detectRouting(structure: RepoStructure): string | undefined {
    const packageJson = structure.files.find(f => f.path.endsWith('package.json'));
    if (packageJson?.content) {
      const pkg = JSON.parse(packageJson.content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps['react-router-dom']) return 'React Router';
      if (deps['vue-router']) return 'Vue Router';
      if (deps['@angular/router']) return 'Angular Router';
      if (deps['next']) return 'Next.js Router';
    }
    
    return undefined;
  }

  private buildArchitectureConventions(patterns: CodePatterns, framework: string): ArchitectureConventions {
    return {
      directoryStructure: patterns.fileOrganization.type,
      componentStructure: framework === 'React' ? 'Functional Components' : 'Unknown',
      stateManagement: 'Hooks',
      styling: 'CSS Modules',
      testing: 'Jest'
    };
  }

  private async buildFileIndexEntry(file: RepoFile): Promise<FileIndexEntry> {
    // This would use proper AST parsing to extract accurate information
    // For now, returning basic structure
    return {
      path: file.path,
      language: file.language || 'unknown',
      functions: [],
      classes: [],
      components: [],
      imports: [],
      exports: [],
      keywords: []
    };
  }

  private getDefaultCodePatterns(): CodePatterns {
    return {
      naming: {
        files: 'kebab-case',
        functions: 'camelCase',
        variables: 'camelCase',
        classes: 'PascalCase',
        components: 'PascalCase',
        constants: 'UPPER_CASE'
      },
      fileOrganization: {
        type: 'mixed',
        directories: [],
        depth: 3,
        consistency: 0.5
      },
      imports: [],
      exports: [],
      functions: [],
      classes: [],
      components: [],
      errorHandling: [],
      testing: [],
      configuration: []
    };
  }

  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 
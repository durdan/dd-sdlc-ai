import { ClaudeCodeService } from './claude-service'

export interface FileStructure {
  path: string
  type: 'file' | 'directory'
  size?: number
  content?: string
  language?: string
  children?: FileStructure[]
}

export interface CodePattern {
  framework: string
  architecture: string[]
  patterns: string[]
  conventions: {
    naming: string
    structure: string
    imports: string
  }
  technologies: string[]
}

export interface DependencyMap {
  imports: Record<string, string[]>
  exports: Record<string, string[]>
  functions: Record<string, string[]>
  classes: Record<string, string[]>
  relationships: Array<{
    from: string
    to: string
    type: 'import' | 'call' | 'extend' | 'implement'
  }>
}

export interface RepositoryAnalysis {
  repoUrl: string
  structure: FileStructure
  patterns: CodePattern
  dependencies: DependencyMap
  framework: string
  primaryLanguage: string
  summary: string
  recommendations: string[]
  analyzedAt: string
  fileCount: number
  codeFiles: string[]
  testFiles: string[]
  configFiles: string[]
}

export class RepositoryAnalyzer {
  private claudeService: ClaudeCodeService
  private githubToken: string

  constructor(claudeService: ClaudeCodeService, githubToken: string) {
    this.claudeService = claudeService
    this.githubToken = githubToken
  }

  /**
   * Main method to analyze a complete repository
   */
  async analyzeRepository(repoUrl: string): Promise<RepositoryAnalysis> {
    console.log(`🔍 Starting repository analysis for: ${repoUrl}`)
    
    try {
      // Parse repository URL
      const { owner, name } = this.parseRepoUrl(repoUrl)
      
      // 1. Get repository structure from GitHub API
      console.log(`📂 Fetching repository structure...`)
      const structure = await this.getRepoStructure(owner, name)
      
      // 2. Analyze key files for patterns
      console.log(`🧠 Analyzing code patterns...`)
      const patterns = await this.analyzeCodePatterns(structure)
      
      // 3. Build dependency map
      console.log(`🔗 Building dependency map...`)
      const dependencies = await this.buildDependencyMap(structure)
      
      // 4. Get file categorization
      const { codeFiles, testFiles, configFiles } = this.categorizeFiles(structure)
      
      // 5. Generate summary with Claude
      console.log(`📝 Generating analysis summary...`)
      const summary = await this.generateSummary(structure, patterns, dependencies)
      
      const analysis: RepositoryAnalysis = {
        repoUrl,
        structure,
        patterns,
        dependencies,
        framework: patterns.framework,
        primaryLanguage: this.detectPrimaryLanguage(structure),
        summary,
        recommendations: await this.generateRecommendations(patterns, dependencies),
        analyzedAt: new Date().toISOString(),
        fileCount: this.countFiles(structure),
        codeFiles,
        testFiles,
        configFiles
      }
      
      console.log(`✅ Repository analysis completed for ${repoUrl}`)
      return analysis
      
    } catch (error) {
      console.error(`❌ Repository analysis failed for ${repoUrl}:`, error)
      throw new Error(`Repository analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get repository file structure from GitHub API
   */
  private async getRepoStructure(owner: string, name: string): Promise<FileStructure> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${name}/git/trees/main?recursive=1`,
      {
        headers: {
          'Authorization': `token ${this.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch repository structure: ${response.statusText}`)
    }

    const data = await response.json()
    return this.buildFileTree(data.tree, owner, name)
  }

  /**
   * Build hierarchical file tree structure
   */
  private buildFileTree(tree: any[], owner: string, name: string): FileStructure {
    const root: FileStructure = {
      path: '',
      type: 'directory',
      children: []
    }

    // Sort files by path for proper tree building
    tree.sort((a, b) => a.path.localeCompare(b.path))

    for (const item of tree) {
      if (item.type === 'blob') { // It's a file
        const pathParts = item.path.split('/')
        let current = root

        // Navigate/create directory structure
        for (let i = 0; i < pathParts.length - 1; i++) {
          const dirName = pathParts[i]
          let dir = current.children?.find(c => c.path === dirName && c.type === 'directory')
          
          if (!dir) {
            dir = {
              path: dirName,
              type: 'directory',
              children: []
            }
            current.children?.push(dir)
          }
          current = dir
        }

        // Add the file
        const fileName = pathParts[pathParts.length - 1]
        current.children?.push({
          path: fileName,
          type: 'file',
          size: item.size,
          language: this.detectLanguage(fileName)
        })
      }
    }

    return root
  }

  /**
   * Analyze code patterns using Claude AI
   */
  private async analyzeCodePatterns(structure: FileStructure): Promise<CodePattern> {
    // Get key files for pattern analysis
    const keyFiles = this.getKeyFiles(structure)
    const fileContents = await this.getFileContents(keyFiles)
    
    const analysisPrompt = `
Analyze this repository structure and code samples to identify patterns:

REPOSITORY STRUCTURE:
${this.structureToString(structure)}

KEY FILE CONTENTS:
${Object.entries(fileContents).map(([path, content]) => 
  `=== ${path} ===\n${content.slice(0, 1000)}...`
).join('\n\n')}

Please analyze and return a JSON object with:
{
  "framework": "primary framework (React, Vue, Angular, Express, etc.)",
  "architecture": ["architectural patterns used"],
  "patterns": ["design patterns found"],
  "conventions": {
    "naming": "naming convention style",
    "structure": "project structure pattern",
    "imports": "import/require style"
  },
  "technologies": ["list of technologies and libraries used"]
}
`

    try {
      const result = await this.claudeService.analyzeCode({
        codeContent: analysisPrompt,
        analysisType: 'code_review',
        context: 'Repository pattern analysis'
      })

      // Parse Claude's response to extract pattern information
      return this.parsePatternAnalysis(result.analysis)
    } catch (error) {
      console.warn('Claude pattern analysis failed, using fallback detection')
      return this.fallbackPatternDetection(structure)
    }
  }

  /**
   * Build dependency map from code files
   */
  private async buildDependencyMap(structure: FileStructure): Promise<DependencyMap> {
    const codeFiles = this.getCodeFiles(structure)
    const dependencyMap: DependencyMap = {
      imports: {},
      exports: {},
      functions: {},
      classes: {},
      relationships: []
    }

    // Analyze each code file for dependencies
    for (const file of codeFiles.slice(0, 20)) { // Limit to avoid API rate limits
      try {
        const content = await this.getFileContent(file)
        if (content) {
          this.extractDependencies(file, content, dependencyMap)
        }
      } catch (error) {
        console.warn(`Failed to analyze dependencies for ${file}:`, error)
      }
    }

    return dependencyMap
  }

  /**
   * Extract dependencies from file content
   */
  private extractDependencies(filePath: string, content: string, dependencyMap: DependencyMap): void {
    // Extract imports (JavaScript/TypeScript)
    const importMatches = content.match(/import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g) || []
    const requireMatches = content.match(/require\(['"`]([^'"`]+)['"`]\)/g) || []
    
    const imports = [
      ...importMatches.map(m => m.match(/from\s+['"`]([^'"`]+)['"`]/)?.[1]).filter(Boolean),
      ...requireMatches.map(m => m.match(/require\(['"`]([^'"`]+)['"`]\)/)?.[1]).filter(Boolean)
    ].filter(Boolean) as string[]

    if (imports.length > 0) {
      dependencyMap.imports[filePath] = imports
      
      // Add relationships
      imports.forEach(imp => {
        dependencyMap.relationships.push({
          from: filePath,
          to: imp,
          type: 'import'
        })
      })
    }

    // Extract exports
    const exportMatches = content.match(/export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g) || []
    const exports = exportMatches.map(m => m.match(/(\w+)$/)?.[1]).filter(Boolean) as string[]
    
    if (exports.length > 0) {
      dependencyMap.exports[filePath] = exports
    }

    // Extract function definitions
    const functionMatches = content.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*{))/g) || []
    const functions = functionMatches.map(m => {
      const match = m.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=)/)
      return match?.[1] || match?.[2]
    }).filter(Boolean) as string[]
    
    if (functions.length > 0) {
      dependencyMap.functions[filePath] = functions
    }

    // Extract class definitions
    const classMatches = content.match(/class\s+(\w+)/g) || []
    const classes = classMatches.map(m => m.match(/class\s+(\w+)/)?.[1]).filter(Boolean) as string[]
    
    if (classes.length > 0) {
      dependencyMap.classes[filePath] = classes
    }
  }

  /**
   * Generate analysis summary using Claude
   */
  private async generateSummary(structure: FileStructure, patterns: CodePattern, dependencies: DependencyMap): Promise<string> {
    const summaryPrompt = `
Please provide a concise summary of this repository based on the analysis:

FRAMEWORK: ${patterns.framework}
ARCHITECTURE: ${patterns.architecture.join(', ')}
PATTERNS: ${patterns.patterns.join(', ')}
TECHNOLOGIES: ${patterns.technologies.join(', ')}
FILE COUNT: ${this.countFiles(structure)}
DEPENDENCIES: ${Object.keys(dependencies.imports).length} files with imports

Provide a 2-3 sentence summary of what this repository does and its structure.
`

    try {
      const result = await this.claudeService.analyzeCode({
        codeContent: summaryPrompt,
        analysisType: 'code_review',
        context: 'Repository summary generation'
      })
      return result.analysis
    } catch (error) {
      return `Repository using ${patterns.framework} framework with ${patterns.architecture.join(', ')} architecture. Contains ${this.countFiles(structure)} files with ${patterns.technologies.join(', ')} technologies.`
    }
  }

  /**
   * Generate recommendations using Claude
   */
  private async generateRecommendations(patterns: CodePattern, dependencies: DependencyMap): Promise<string[]> {
    const recommendationPrompt = `
Based on this code analysis, provide 3-5 specific recommendations for improvement:

FRAMEWORK: ${patterns.framework}
PATTERNS: ${patterns.patterns.join(', ')}
CONVENTIONS: ${JSON.stringify(patterns.conventions)}
DEPENDENCY COUNT: ${Object.keys(dependencies.imports).length}

Focus on: code organization, best practices, performance, and maintainability.
Return as a simple list of actionable recommendations.
`

    try {
      const result = await this.claudeService.analyzeCode({
        codeContent: recommendationPrompt,
        analysisType: 'code_review',
        context: 'Repository improvement recommendations'
      })
      
      // Extract recommendations from Claude's response
      const lines = result.analysis.split('\n').filter(line => 
        line.trim().startsWith('-') || 
        line.trim().startsWith('•') || 
        line.trim().match(/^\d+\./)
      )
      
      return lines.slice(0, 5).map(line => line.replace(/^[\-•\d\.\s]+/, '').trim())
    } catch (error) {
      return [
        'Consider implementing consistent code formatting',
        'Add comprehensive test coverage',
        'Optimize dependency management',
        'Improve documentation and comments',
        'Consider code splitting for better performance'
      ]
    }
  }

  // Helper methods
  private parseRepoUrl(repoUrl: string): { owner: string; name: string } {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
    if (!match) {
      throw new Error('Invalid GitHub repository URL')
    }
    return { owner: match[1], name: match[2].replace('.git', '') }
  }

  private detectLanguage(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'vue': 'vue',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown',
      'yml': 'yaml',
      'yaml': 'yaml'
    }
    return languageMap[ext || ''] || 'text'
  }

  private detectPrimaryLanguage(structure: FileStructure): string {
    const languageCounts: Record<string, number> = {}
    this.countLanguages(structure, languageCounts)
    
    return Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'unknown'
  }

  private countLanguages(structure: FileStructure, counts: Record<string, number>): void {
    if (structure.type === 'file' && structure.language) {
      counts[structure.language] = (counts[structure.language] || 0) + 1
    }
    
    if (structure.children) {
      structure.children.forEach(child => this.countLanguages(child, counts))
    }
  }

  private countFiles(structure: FileStructure): number {
    if (structure.type === 'file') return 1
    return (structure.children || []).reduce((sum, child) => sum + this.countFiles(child), 0)
  }

  private getKeyFiles(structure: FileStructure): string[] {
    const keyFiles: string[] = []
    this.collectKeyFiles(structure, '', keyFiles)
    return keyFiles.slice(0, 10) // Limit to avoid API rate limits
  }

  private collectKeyFiles(structure: FileStructure, basePath: string, keyFiles: string[]): void {
    const currentPath = basePath ? `${basePath}/${structure.path}` : structure.path
    
    if (structure.type === 'file') {
      const fileName = structure.path.toLowerCase()
      // Prioritize important files
      if (fileName.includes('package.json') || 
          fileName.includes('readme') ||
          fileName.includes('index') ||
          fileName.includes('main') ||
          fileName.includes('app') ||
          fileName.includes('config')) {
        keyFiles.push(currentPath)
      }
    } else if (structure.children) {
      structure.children.forEach(child => 
        this.collectKeyFiles(child, currentPath, keyFiles)
      )
    }
  }

  private getCodeFiles(structure: FileStructure): string[] {
    const codeFiles: string[] = []
    this.collectCodeFiles(structure, '', codeFiles)
    return codeFiles
  }

  private collectCodeFiles(structure: FileStructure, basePath: string, codeFiles: string[]): void {
    const currentPath = basePath ? `${basePath}/${structure.path}` : structure.path
    
    if (structure.type === 'file' && structure.language) {
      const codeLanguages = ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'php', 'ruby']
      if (codeLanguages.includes(structure.language)) {
        codeFiles.push(currentPath)
      }
    } else if (structure.children) {
      structure.children.forEach(child => 
        this.collectCodeFiles(child, currentPath, codeFiles)
      )
    }
  }

  private categorizeFiles(structure: FileStructure): { codeFiles: string[]; testFiles: string[]; configFiles: string[] } {
    const codeFiles: string[] = []
    const testFiles: string[] = []
    const configFiles: string[] = []
    
    this.categorizeFilesRecursive(structure, '', codeFiles, testFiles, configFiles)
    
    return { codeFiles, testFiles, configFiles }
  }

  private categorizeFilesRecursive(
    structure: FileStructure, 
    basePath: string, 
    codeFiles: string[], 
    testFiles: string[], 
    configFiles: string[]
  ): void {
    const currentPath = basePath ? `${basePath}/${structure.path}` : structure.path
    
    if (structure.type === 'file') {
      const fileName = structure.path.toLowerCase()
      const filePath = currentPath.toLowerCase()
      
      if (filePath.includes('test') || filePath.includes('spec') || fileName.includes('.test.') || fileName.includes('.spec.')) {
        testFiles.push(currentPath)
      } else if (fileName.includes('config') || fileName.includes('.json') || fileName.includes('.yml') || fileName.includes('.yaml')) {
        configFiles.push(currentPath)
      } else if (structure.language && ['javascript', 'typescript', 'python', 'java', 'go'].includes(structure.language)) {
        codeFiles.push(currentPath)
      }
    } else if (structure.children) {
      structure.children.forEach(child => 
        this.categorizeFilesRecursive(child, currentPath, codeFiles, testFiles, configFiles)
      )
    }
  }

  private structureToString(structure: FileStructure, indent = 0): string {
    const prefix = '  '.repeat(indent)
    let result = `${prefix}${structure.path || 'root'}/\n`
    
    if (structure.children) {
      for (const child of structure.children.slice(0, 50)) { // Limit for readability
        if (child.type === 'directory') {
          result += this.structureToString(child, indent + 1)
        } else {
          result += `${prefix}  ${child.path}\n`
        }
      }
    }
    
    return result
  }

  private parsePatternAnalysis(analysis: string): CodePattern {
    // Try to extract JSON from Claude's response
    try {
      const jsonMatch = analysis.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.warn('Failed to parse Claude pattern analysis JSON')
    }
    
    // Fallback pattern detection
    return this.fallbackPatternDetection()
  }

  private fallbackPatternDetection(structure?: FileStructure): CodePattern {
    return {
      framework: 'Unknown',
      architecture: ['Standard'],
      patterns: ['Module Pattern'],
      conventions: {
        naming: 'camelCase',
        structure: 'Standard',
        imports: 'ES6'
      },
      technologies: ['JavaScript']
    }
  }

  private async getFileContents(filePaths: string[]): Promise<Record<string, string>> {
    const contents: Record<string, string> = {}
    
    for (const filePath of filePaths) {
      try {
        const content = await this.getFileContent(filePath)
        if (content) {
          contents[filePath] = content
        }
      } catch (error) {
        console.warn(`Failed to get content for ${filePath}:`, error)
      }
    }
    
    return contents
  }

  private async getFileContent(filePath: string): Promise<string | null> {
    // This would need to be implemented with actual GitHub API calls
    // For now, return null to avoid API rate limits during development
    return null
  }
} 
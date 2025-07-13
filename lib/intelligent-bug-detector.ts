import { ClaudeService } from './claude-service';
import { EnhancedRepositoryAnalyzer, RepositoryAnalysis, RelevantFile } from './enhanced-repository-analyzer';
import { supabase } from './supabase/server';

export interface BugAnalysis {
  id: string;
  description: string;
  reproductionSteps?: string[];
  repositoryUrl: string;
  relevantFiles: BugRelevantFile[];
  rootCause: RootCauseAnalysis;
  suggestedFixes: FixSuggestion[];
  impactAnalysis: ImpactAnalysis;
  priority: BugPriority;
  estimatedFixTime: string;
  category: BugCategory;
  createdAt: Date;
  status: BugAnalysisStatus;
}

export interface BugRelevantFile {
  path: string;
  confidence: number;
  reasons: string[];
  content?: string;
  lineNumbers?: number[];
}

export interface RootCauseAnalysis {
  executionTrace: ExecutionStep[];
  rootCause: string;
  affectedCode: AffectedCodeLocation[];
  explanation: string;
  complexity: number; // 1-10 scale
  category: BugCategory;
  dataFlow?: DataFlowAnalysis;
}

export interface ExecutionStep {
  step: number;
  description: string;
  file: string;
  line?: number;
  function?: string;
  variables?: Record<string, any>;
  issue?: string;
}

export interface AffectedCodeLocation {
  file: string;
  startLine: number;
  endLine: number;
  code: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface DataFlowAnalysis {
  inputSources: string[];
  transformations: DataTransformation[];
  outputTargets: string[];
  problemPoint: string;
}

export interface DataTransformation {
  step: string;
  file: string;
  function: string;
  input: string;
  output: string;
  issue?: string;
}

export interface FixSuggestion {
  id: string;
  approach: 'quick' | 'proper' | 'comprehensive';
  description: string;
  changes: CodeChange[];
  pros: string[];
  cons: string[];
  riskLevel: 'low' | 'medium' | 'high';
  testingNotes: string[];
  estimatedTime: string;
  confidence: number; // 0-1 scale
}

export interface CodeChange {
  file: string;
  type: 'modify' | 'create' | 'delete';
  startLine?: number;
  endLine?: number;
  oldCode?: string;
  newCode: string;
  description: string;
}

export interface ImpactAnalysis {
  affectedFiles: string[];
  affectedFunctions: string[];
  affectedComponents: string[];
  breakingChanges: BreakingChange[];
  testingRequired: TestingRequirement[];
  deploymentConsiderations: string[];
  rollbackPlan: string[];
}

export interface BreakingChange {
  type: 'api' | 'interface' | 'behavior' | 'data';
  description: string;
  affectedConsumers: string[];
  mitigationStrategy: string;
}

export interface TestingRequirement {
  type: 'unit' | 'integration' | 'e2e' | 'manual';
  description: string;
  priority: 'high' | 'medium' | 'low';
  files: string[];
}

export interface BugFixResult {
  bugAnalysisId: string;
  fixApplied: FixSuggestion;
  codeChanges: CodeChange[];
  testCases: TestCase[];
  pullRequest: PullRequestResult;
  status: 'fix_created' | 'pr_created' | 'applied' | 'failed';
  validationResults?: ValidationResult[];
}

export interface TestCase {
  path: string;
  content: string;
  type: 'unit' | 'integration' | 'e2e';
  description: string;
  framework: string;
}

export interface PullRequestResult {
  url: string;
  number: number;
  title: string;
  description: string;
  branch: string;
  status: 'created' | 'merged' | 'closed';
}

export interface ValidationResult {
  type: 'syntax' | 'linting' | 'testing' | 'build';
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: any;
}

export interface FileContent {
  path: string;
  content: string;
  language: string;
  lines: number;
}

export type BugPriority = 'critical' | 'high' | 'medium' | 'low';
export type BugCategory = 'logic' | 'data' | 'ui' | 'performance' | 'security' | 'integration' | 'configuration' | 'dependency';
export type BugAnalysisStatus = 'analyzing' | 'analyzed' | 'fix_suggested' | 'fix_applied' | 'resolved' | 'failed';

export class IntelligentBugDetector {
  private repositoryAnalyzer: EnhancedRepositoryAnalyzer;
  private claude: ClaudeService;

  constructor(repositoryAnalyzer: EnhancedRepositoryAnalyzer, claude: ClaudeService) {
    this.repositoryAnalyzer = repositoryAnalyzer;
    this.claude = claude;
  }

  async analyzeBugReport(
    bugDescription: string,
    repositoryUrl: string,
    reproductionSteps?: string[],
    priority: BugPriority = 'medium'
  ): Promise<BugAnalysis> {
    console.log(`Starting bug analysis for: ${bugDescription}`);
    
    try {
      // 1. Get repository analysis
      const repoAnalysis = await this.repositoryAnalyzer.analyzeRepositoryDeep(repositoryUrl);
      
      // 2. Find relevant files using enhanced search
      const relevantFiles = await this.repositoryAnalyzer.findRelevantFiles(
        bugDescription,
        repoAnalysis,
        8
      );
      
      // 3. Get file contents for top candidates
      const fileContents = await this.getFileContents(relevantFiles.slice(0, 5));
      
      // 4. Analyze with Claude for root cause
      const rootCauseAnalysis = await this.performRootCauseAnalysis(
        bugDescription,
        reproductionSteps,
        fileContents,
        repoAnalysis
      );
      
      // 5. Generate fix suggestions
      const fixSuggestions = await this.generateFixSuggestions(
        rootCauseAnalysis,
        fileContents,
        repoAnalysis
      );
      
      // 6. Analyze potential side effects
      const impactAnalysis = await this.analyzeImpact(
        fixSuggestions,
        repoAnalysis
      );
      
      // 7. Determine category and priority
      const category = this.determineBugCategory(rootCauseAnalysis);
      const finalPriority = this.calculatePriority(rootCauseAnalysis, priority);
      
      const analysis: BugAnalysis = {
        id: this.generateBugId(),
        description: bugDescription,
        reproductionSteps,
        repositoryUrl,
        relevantFiles: relevantFiles.map(f => ({
          path: f.path,
          confidence: f.confidence,
          reasons: f.reasons
        })),
        rootCause: rootCauseAnalysis,
        suggestedFixes: fixSuggestions,
        impactAnalysis,
        priority: finalPriority,
        estimatedFixTime: this.estimateFixTime(fixSuggestions),
        category,
        createdAt: new Date(),
        status: 'analyzed'
      };
      
      // 8. Store the analysis
      await this.storeBugAnalysis(analysis);
      
      console.log(`Bug analysis completed for: ${bugDescription}`);
      return analysis;
      
    } catch (error) {
      console.error('Error in bug analysis:', error);
      throw new Error(`Failed to analyze bug: ${error.message}`);
    }
  }

  private async performRootCauseAnalysis(
    bugDescription: string,
    reproductionSteps: string[] | undefined,
    fileContents: FileContent[],
    repoAnalysis: RepositoryAnalysis
  ): Promise<RootCauseAnalysis> {
    
    const prompt = `
      You are a senior software engineer analyzing a bug report. Provide a comprehensive root cause analysis.
      
      BUG REPORT: ${bugDescription}
      ${reproductionSteps ? `
      REPRODUCTION STEPS:
      ${reproductionSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
      ` : ''}
      
      REPOSITORY CONTEXT:
      Framework: ${repoAnalysis.architecture.framework}
      Language: ${repoAnalysis.architecture.language}
      Architecture Type: ${repoAnalysis.patterns.fileOrganization.type}
      
      RELEVANT CODE FILES:
      ${fileContents.map(f => `
        File: ${f.path}
        Language: ${f.language}
        Lines: ${f.lines}
        Content:
        \`\`\`${f.language}
        ${f.content}
        \`\`\`
      `).join('\n\n')}
      
      ANALYSIS REQUIREMENTS:
      1. Trace the execution path that leads to this bug
      2. Identify the root cause (not just symptoms)
      3. Explain why this happens in technical detail
      4. Identify specific lines of code causing the issue
      5. Consider edge cases and data flow
      6. Rate the complexity of fixing this (1-10)
      7. Categorize the bug type
      8. Analyze data flow if relevant
      
      Return a comprehensive JSON analysis with the following structure:
      {
        "executionTrace": [
          {
            "step": 1,
            "description": "User action or system event",
            "file": "filename.js",
            "line": 42,
            "function": "functionName",
            "variables": {"key": "value"},
            "issue": "What goes wrong here"
          }
        ],
        "rootCause": "The fundamental underlying cause",
        "affectedCode": [
          {
            "file": "filename.js",
            "startLine": 42,
            "endLine": 45,
            "code": "actual code snippet",
            "issue": "what's wrong with this code",
            "severity": "critical"
          }
        ],
        "explanation": "Detailed technical explanation of why this happens",
        "complexity": 7,
        "category": "logic",
        "dataFlow": {
          "inputSources": ["user input", "API response"],
          "transformations": [
            {
              "step": "Data validation",
              "file": "validator.js",
              "function": "validateInput",
              "input": "raw data",
              "output": "validated data",
              "issue": "validation fails for edge case"
            }
          ],
          "outputTargets": ["database", "UI"],
          "problemPoint": "validation step"
        }
      }
    `;
    
    try {
      const response = await this.claude.analyzeCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error in root cause analysis:', error);
      throw new Error(`Failed to analyze root cause: ${error.message}`);
    }
  }

  private async generateFixSuggestions(
    rootCause: RootCauseAnalysis,
    fileContents: FileContent[],
    repoAnalysis: RepositoryAnalysis
  ): Promise<FixSuggestion[]> {
    
    const prompt = `
      Generate fix suggestions for this bug analysis:
      
      ROOT CAUSE: ${JSON.stringify(rootCause, null, 2)}
      
      REPOSITORY PATTERNS:
      ${JSON.stringify(repoAnalysis.patterns, null, 2)}
      
      AFFECTED FILES:
      ${fileContents.map(f => `
        File: ${f.path}
        Content:
        \`\`\`${f.language}
        ${f.content}
        \`\`\`
      `).join('\n\n')}
      
      Generate 3 fix suggestions with different approaches:
      1. Quick fix (minimal changes, fastest to implement)
      2. Proper fix (follows best practices, balanced approach)
      3. Comprehensive fix (includes prevention, testing, monitoring)
      
      For each fix, provide:
      - Detailed description of the approach
      - Specific code changes needed
      - Pros and cons of this approach
      - Risk level assessment
      - Testing recommendations
      - Time estimation
      - Confidence level (0-1)
      
      Follow the repository's existing patterns and conventions.
      
      Return JSON array with this structure:
      [
        {
          "id": "quick_fix_1",
          "approach": "quick",
          "description": "What this fix does",
          "changes": [
            {
              "file": "filename.js",
              "type": "modify",
              "startLine": 42,
              "endLine": 45,
              "oldCode": "existing code",
              "newCode": "fixed code",
              "description": "What this change does"
            }
          ],
          "pros": ["Fast to implement", "Low risk"],
          "cons": ["Doesn't address root cause"],
          "riskLevel": "low",
          "testingNotes": ["Test case 1", "Test case 2"],
          "estimatedTime": "30 minutes",
          "confidence": 0.8
        }
      ]
    `;
    
    try {
      const response = await this.claude.generateCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating fix suggestions:', error);
      throw new Error(`Failed to generate fix suggestions: ${error.message}`);
    }
  }

  private async analyzeImpact(
    fixSuggestions: FixSuggestion[],
    repoAnalysis: RepositoryAnalysis
  ): Promise<ImpactAnalysis> {
    
    const allChanges = fixSuggestions.flatMap(fix => fix.changes);
    const affectedFiles = [...new Set(allChanges.map(change => change.file))];
    
    const prompt = `
      Analyze the potential impact of these code changes:
      
      PROPOSED CHANGES:
      ${JSON.stringify(allChanges, null, 2)}
      
      REPOSITORY DEPENDENCIES:
      ${JSON.stringify(Array.from(repoAnalysis.dependencies.imports.entries()), null, 2)}
      
      REPOSITORY STRUCTURE:
      ${JSON.stringify(repoAnalysis.structure, null, 2)}
      
      Analyze:
      1. Which files/functions/components might be affected
      2. Potential breaking changes
      3. Testing requirements
      4. Deployment considerations
      5. Rollback plan
      
      Return JSON with this structure:
      {
        "affectedFiles": ["list of files that import/depend on changed files"],
        "affectedFunctions": ["functions that might be impacted"],
        "affectedComponents": ["components that might be impacted"],
        "breakingChanges": [
          {
            "type": "api",
            "description": "Function signature changed",
            "affectedConsumers": ["file1.js", "file2.js"],
            "mitigationStrategy": "Update all callers"
          }
        ],
        "testingRequired": [
          {
            "type": "unit",
            "description": "Test the modified function",
            "priority": "high",
            "files": ["test/function.test.js"]
          }
        ],
        "deploymentConsiderations": ["considerations for deployment"],
        "rollbackPlan": ["steps to rollback if needed"]
      }
    `;
    
    try {
      const response = await this.claude.analyzeCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing impact:', error);
      return {
        affectedFiles: affectedFiles,
        affectedFunctions: [],
        affectedComponents: [],
        breakingChanges: [],
        testingRequired: [],
        deploymentConsiderations: [],
        rollbackPlan: []
      };
    }
  }

  async applyBugFix(
    bugAnalysis: BugAnalysis,
    selectedFix: FixSuggestion,
    repositoryUrl: string,
    createPR: boolean = true
  ): Promise<BugFixResult> {
    
    console.log(`Applying bug fix: ${selectedFix.approach} for ${bugAnalysis.description}`);
    
    try {
      // 1. Generate test cases for the fix
      const testCases = await this.generateTestCases(bugAnalysis, selectedFix);
      
      // 2. Prepare implementation structure
      const implementation = {
        files_to_modify: selectedFix.changes.filter(c => c.type === 'modify').map(c => ({
          path: c.file,
          changes: c.newCode,
          description: c.description,
          startLine: c.startLine,
          endLine: c.endLine
        })),
        files_to_create: [
          ...selectedFix.changes.filter(c => c.type === 'create').map(c => ({
            path: c.file,
            content: c.newCode,
            description: c.description
          })),
          ...testCases
        ],
        description: `Bug fix: ${bugAnalysis.description}`,
        type: 'bugfix' as const,
        validation_steps: selectedFix.testingNotes,
        fix_approach: selectedFix.approach,
        estimated_time: selectedFix.estimatedTime,
        risk_level: selectedFix.riskLevel
      };
      
      let prResult: PullRequestResult | null = null;
      
      if (createPR) {
        // 3. Create PR using existing GitHub service
        // This would integrate with your existing GitHub service
        const branchName = `claude/bugfix/${bugAnalysis.id}`;
        const prTitle = `🐛 Fix: ${bugAnalysis.description}`;
        const prDescription = this.generatePRDescription(bugAnalysis, selectedFix);
        
        prResult = {
          url: `https://github.com/example/repo/pull/123`,
          number: 123,
          title: prTitle,
          description: prDescription,
          branch: branchName,
          status: 'created'
        };
      }
      
      // 4. Update bug analysis status
      await this.updateBugAnalysisStatus(bugAnalysis.id, 'fix_applied');
      
      const result: BugFixResult = {
        bugAnalysisId: bugAnalysis.id,
        fixApplied: selectedFix,
        codeChanges: selectedFix.changes,
        testCases,
        pullRequest: prResult!,
        status: createPR ? 'pr_created' : 'fix_created'
      };
      
      // 5. Store the result
      await this.storeBugFixResult(result);
      
      console.log(`Bug fix applied successfully for: ${bugAnalysis.description}`);
      return result;
      
    } catch (error) {
      console.error('Error applying bug fix:', error);
      throw new Error(`Failed to apply bug fix: ${error.message}`);
    }
  }

  private async generateTestCases(
    bugAnalysis: BugAnalysis,
    selectedFix: FixSuggestion
  ): Promise<TestCase[]> {
    
    const prompt = `
      Generate test cases for this bug fix:
      
      BUG ANALYSIS: ${JSON.stringify(bugAnalysis, null, 2)}
      
      SELECTED FIX: ${JSON.stringify(selectedFix, null, 2)}
      
      Generate comprehensive test cases including:
      1. Test for the original bug scenario (should pass after fix)
      2. Test for edge cases identified in the analysis
      3. Regression tests for existing functionality
      4. Integration tests if needed
      
      Return JSON array with this structure:
      [
        {
          "path": "test/bugfix.test.js",
          "content": "complete test file content",
          "type": "unit",
          "description": "Test description",
          "framework": "Jest"
        }
      ]
    `;
    
    try {
      const response = await this.claude.generateCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating test cases:', error);
      return [];
    }
  }

  private generatePRDescription(bugAnalysis: BugAnalysis, selectedFix: FixSuggestion): string {
    return `
## Bug Fix: ${bugAnalysis.description}

### 🐛 Issue
${bugAnalysis.description}

${bugAnalysis.reproductionSteps ? `
### 📋 Reproduction Steps
${bugAnalysis.reproductionSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
` : ''}

### 🔍 Root Cause
${bugAnalysis.rootCause.explanation}

### 🛠️ Fix Approach
**Approach:** ${selectedFix.approach}
**Description:** ${selectedFix.description}

### 📊 Impact Analysis
- **Risk Level:** ${selectedFix.riskLevel}
- **Estimated Time:** ${selectedFix.estimatedTime}
- **Confidence:** ${Math.round(selectedFix.confidence * 100)}%

### ✅ Changes Made
${selectedFix.changes.map(change => `
- **${change.file}:** ${change.description}
`).join('')}

### 🧪 Testing
${selectedFix.testingNotes.map(note => `- ${note}`).join('\n')}

### 📈 Pros
${selectedFix.pros.map(pro => `- ${pro}`).join('\n')}

### ⚠️ Considerations
${selectedFix.cons.map(con => `- ${con}`).join('\n')}

---
*Generated by Claude AI Bug Detector*
    `;
  }

  // Helper methods
  private async getFileContents(relevantFiles: RelevantFile[]): Promise<FileContent[]> {
    // This would integrate with your GitHub service to fetch file contents
    // For now, returning mock data
    return relevantFiles.map(file => ({
      path: file.path,
      content: file.content || '// File content would be loaded here',
      language: this.detectLanguage(file.path),
      lines: file.content?.split('\n').length || 0
    }));
  }

  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rb': 'ruby',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin'
    };
    
    return languageMap[ext || ''] || 'text';
  }

  private determineBugCategory(rootCause: RootCauseAnalysis): BugCategory {
    if (rootCause.category) {
      return rootCause.category;
    }
    
    // Fallback logic based on root cause analysis
    const cause = rootCause.rootCause.toLowerCase();
    if (cause.includes('security') || cause.includes('authentication') || cause.includes('authorization')) {
      return 'security';
    }
    if (cause.includes('performance') || cause.includes('slow') || cause.includes('timeout')) {
      return 'performance';
    }
    if (cause.includes('ui') || cause.includes('display') || cause.includes('render')) {
      return 'ui';
    }
    if (cause.includes('data') || cause.includes('database') || cause.includes('storage')) {
      return 'data';
    }
    if (cause.includes('api') || cause.includes('integration') || cause.includes('service')) {
      return 'integration';
    }
    
    return 'logic';
  }

  private calculatePriority(rootCause: RootCauseAnalysis, initialPriority: BugPriority): BugPriority {
    let priority = initialPriority;
    
    // Adjust based on complexity and severity
    if (rootCause.complexity >= 8) {
      priority = 'high';
    }
    
    const criticalIndicators = ['security', 'data loss', 'crash', 'critical'];
    if (criticalIndicators.some(indicator => 
      rootCause.rootCause.toLowerCase().includes(indicator)
    )) {
      priority = 'critical';
    }
    
    return priority;
  }

  private estimateFixTime(fixSuggestions: FixSuggestion[]): string {
    if (fixSuggestions.length === 0) return 'Unknown';
    
    const quickFix = fixSuggestions.find(fix => fix.approach === 'quick');
    const properFix = fixSuggestions.find(fix => fix.approach === 'proper');
    
    if (quickFix && properFix) {
      return `${quickFix.estimatedTime} (quick) - ${properFix.estimatedTime} (proper)`;
    }
    
    return fixSuggestions[0].estimatedTime;
  }

  private async storeBugAnalysis(analysis: BugAnalysis): Promise<void> {
    try {
      await supabase
        .from('bug_analyses')
        .insert({
          id: analysis.id,
          description: analysis.description,
          repository_url: analysis.repositoryUrl,
          analysis_data: analysis,
          status: analysis.status,
          priority: analysis.priority,
          category: analysis.category,
          created_at: analysis.createdAt.toISOString()
        });
    } catch (error) {
      console.error('Error storing bug analysis:', error);
    }
  }

  private async storeBugFixResult(result: BugFixResult): Promise<void> {
    try {
      await supabase
        .from('bug_fix_results')
        .insert({
          id: this.generateBugId(),
          bug_analysis_id: result.bugAnalysisId,
          fix_data: result,
          status: result.status,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error storing bug fix result:', error);
    }
  }

  private async updateBugAnalysisStatus(bugId: string, status: BugAnalysisStatus): Promise<void> {
    try {
      await supabase
        .from('bug_analyses')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bugId);
    } catch (error) {
      console.error('Error updating bug analysis status:', error);
    }
  }

  private generateBugId(): string {
    return `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for retrieving stored analyses
  async getBugAnalysis(bugId: string): Promise<BugAnalysis | null> {
    try {
      const { data, error } = await supabase
        .from('bug_analyses')
        .select('analysis_data')
        .eq('id', bugId)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      return data.analysis_data;
    } catch (error) {
      console.error('Error retrieving bug analysis:', error);
      return null;
    }
  }

  async getBugFixResult(bugAnalysisId: string): Promise<BugFixResult | null> {
    try {
      const { data, error } = await supabase
        .from('bug_fix_results')
        .select('fix_data')
        .eq('bug_analysis_id', bugAnalysisId)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      return data.fix_data;
    } catch (error) {
      console.error('Error retrieving bug fix result:', error);
      return null;
    }
  }

  async listBugAnalyses(repositoryUrl?: string, limit: number = 20): Promise<BugAnalysis[]> {
    try {
      let query = supabase
        .from('bug_analyses')
        .select('analysis_data')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (repositoryUrl) {
        query = query.eq('repository_url', repositoryUrl);
      }
      
      const { data, error } = await query;
      
      if (error || !data) {
        return [];
      }
      
      return data.map(item => item.analysis_data);
    } catch (error) {
      console.error('Error listing bug analyses:', error);
      return [];
    }
  }
} 
import { ClaudeCodeService, CodeAnalysisRequest, CodeAnalysisResult, AgenticCodeRequest, AgenticCodeResult } from './claude-service';
import { EnhancedRepositoryAnalyzer, RepositoryAnalysis } from './enhanced-repository-analyzer';
import { IntelligentBugDetector, BugAnalysis, BugFixResult, FixSuggestion } from './intelligent-bug-detector';
import { ContextAwareCodeGenerator, EnhancedGenerationRequest, EnhancedGenerationResult } from './context-aware-code-generator';
import { IntelligentTestGenerator, TestGenerationRequest, TestGeneration } from './intelligent-test-generator';
import { supabase } from './supabase/server';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';

export interface EnhancedClaudeTask {
  id: string;
  type: 'repository_analysis' | 'bug_analysis' | 'bug_fix' | 'code_generation' | 'test_generation' | 'comprehensive_development';
  description: string;
  repositoryUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'analyzing' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  context?: any;
  created_at: string;
  completed_at?: string;
  user_id: string;
}

export interface ComprehensiveDevelopmentRequest {
  repositoryUrl: string;
  requirement: string;
  type: 'feature' | 'enhancement' | 'bug_fix' | 'refactor';
  includeTests: boolean;
  includeDocumentation: boolean;
  qualityThreshold: number; // 0-1 scale
  optimizeFor: 'performance' | 'maintainability' | 'scalability' | 'simplicity';
}

export interface ComprehensiveDevelopmentResult {
  taskId: string;
  repositoryAnalysis: RepositoryAnalysis;
  codeGeneration: EnhancedGenerationResult;
  testGeneration?: TestGeneration;
  bugAnalysis?: BugAnalysis;
  qualityScore: number;
  recommendations: string[];
  nextSteps: string[];
  pullRequestReady: boolean;
  estimatedReviewTime: string;
}

export interface IntelligenceMetrics {
  repositoryUnderstanding: number;
  codeQuality: number;
  testCoverage: number;
  patternCompliance: number;
  securityScore: number;
  performanceScore: number;
  maintainabilityScore: number;
  overallScore: number;
}

export class EnhancedClaudeService extends ClaudeCodeService {
  private repositoryAnalyzer: EnhancedRepositoryAnalyzer;
  private bugDetector: IntelligentBugDetector;
  private codeGenerator: ContextAwareCodeGenerator;
  private testGenerator: IntelligentTestGenerator;
  private taskCache: Map<string, EnhancedClaudeTask> = new Map();

  constructor(config?: {
    model?: string;
    apiKey?: string;
    maxTokens?: number;
    temperature?: number;
    userId?: string;
  }) {
    super(config);
    
    // Initialize all intelligence services
    this.repositoryAnalyzer = new EnhancedRepositoryAnalyzer(this);
    this.bugDetector = new IntelligentBugDetector(this.repositoryAnalyzer, this);
    this.codeGenerator = new ContextAwareCodeGenerator(this.repositoryAnalyzer, this);
    this.testGenerator = new IntelligentTestGenerator(this.repositoryAnalyzer, this);
  }

  /**
   * Enhanced factory method with full intelligence stack
   */
  static async createEnhancedForUser(userId: string): Promise<EnhancedClaudeService> {
    console.log('🚀 Creating Enhanced Claude Service for user:', userId);
    
    const baseService = await ClaudeCodeService.createForUser(userId);
    
    return new EnhancedClaudeService({
      model: baseService['model'],
      apiKey: baseService['apiKey'],
      maxTokens: baseService['maxTokens'],
      temperature: baseService['temperature'],
      userId
    });
  }

  /**
   * Comprehensive development workflow - the main entry point
   */
  async processComprehensiveDevelopment(
    request: ComprehensiveDevelopmentRequest
  ): Promise<ComprehensiveDevelopmentResult> {
    
    const taskId = this.generateTaskId();
    console.log(`🔄 Starting comprehensive development workflow: ${taskId}`);
    
    try {
      // 1. Deep repository analysis
      console.log('📊 Phase 1: Analyzing repository...');
      const repositoryAnalysis = await this.repositoryAnalyzer.analyzeRepositoryDeep(
        request.repositoryUrl
      );
      
      // 2. Determine if this is a bug fix request
      const isBugFix = await this.isBugFixRequest(request.requirement);
      let bugAnalysis: BugAnalysis | undefined;
      
      if (isBugFix) {
        console.log('🐛 Phase 2a: Analyzing bug...');
        bugAnalysis = await this.bugDetector.analyzeBugReport(
          request.requirement,
          request.repositoryUrl
        );
      }
      
      // 3. Context-aware code generation
      console.log('⚡ Phase 2b: Generating code...');
      const codeGenerationRequest: EnhancedGenerationRequest = {
        specification: {
          title: request.requirement,
          type: request.type,
          description: request.requirement,
          isBugFix,
          bugAnalysis: bugAnalysis
        },
        repositoryUrl: request.repositoryUrl,
        taskType: request.type,
        generateTests: request.includeTests,
        includeDocumentation: request.includeDocumentation,
        optimizeFor: request.optimizeFor,
        followPatterns: true
      };
      
      const codeGeneration = await this.codeGenerator.generateFromSpecification(
        codeGenerationRequest
      );
      
      // 4. Intelligent test generation (if requested)
      let testGeneration: TestGeneration | undefined;
      if (request.includeTests) {
        console.log('🧪 Phase 3: Generating tests...');
        const testRequest: TestGenerationRequest = {
          generatedCode: codeGeneration.implementation,
          repositoryUrl: request.repositoryUrl,
          testType: request.type === 'feature' ? 'all' : 'unit',
          coverage: 'comprehensive',
          includeEdgeCases: true,
          includeMocks: true,
          followExistingPatterns: true
        };
        
        testGeneration = await this.testGenerator.generateTestsForCode(testRequest);
      }
      
      // 5. Calculate quality metrics
      console.log('📈 Phase 4: Calculating quality metrics...');
      const qualityScore = this.calculateOverallQuality(
        codeGeneration,
        testGeneration,
        repositoryAnalysis
      );
      
      // 6. Generate recommendations
      const recommendations = this.generateRecommendations(
        codeGeneration,
        testGeneration,
        bugAnalysis,
        qualityScore
      );
      
      // 7. Determine next steps
      const nextSteps = this.generateNextSteps(
        codeGeneration,
        testGeneration,
        qualityScore,
        request.qualityThreshold
      );
      
      // 8. Check if ready for PR
      const pullRequestReady = qualityScore >= request.qualityThreshold &&
        (!request.includeTests || (testGeneration && testGeneration.coverage.overall >= 0.8));
      
      const result: ComprehensiveDevelopmentResult = {
        taskId,
        repositoryAnalysis,
        codeGeneration,
        testGeneration,
        bugAnalysis,
        qualityScore,
        recommendations,
        nextSteps,
        pullRequestReady,
        estimatedReviewTime: this.estimateReviewTime(codeGeneration, testGeneration)
      };
      
      // 9. Store the result
      await this.storeComprehensiveResult(result);
      
      console.log(`✅ Comprehensive development completed: ${taskId} (Quality: ${Math.round(qualityScore * 100)}%)`);
      return result;
      
    } catch (error) {
      console.error('❌ Comprehensive development failed:', error);
      throw new Error(`Comprehensive development failed: ${error.message}`);
    }
  }

  /**
   * Enhanced task processing with intelligence
   */
  async processEnhancedTask(task: EnhancedClaudeTask): Promise<any> {
    console.log(`🔄 Processing enhanced task: ${task.type} - ${task.description}`);
    
    try {
      this.updateTaskStatus(task.id, 'analyzing', 10);
      
      let result: any;
      
      switch (task.type) {
        case 'repository_analysis':
          result = await this.repositoryAnalyzer.analyzeRepositoryDeep(task.repositoryUrl!);
          break;
          
        case 'bug_analysis':
          result = await this.bugDetector.analyzeBugReport(
            task.description,
            task.repositoryUrl!,
            task.context?.reproductionSteps
          );
          break;
          
        case 'bug_fix':
          const bugAnalysis = await this.bugDetector.getBugAnalysis(task.context?.bugAnalysisId);
          if (!bugAnalysis) {
            throw new Error('Bug analysis not found');
          }
          result = await this.bugDetector.applyBugFix(
            bugAnalysis,
            task.context?.selectedFix,
            task.repositoryUrl!
          );
          break;
          
        case 'code_generation':
          const genRequest: EnhancedGenerationRequest = {
            specification: task.context?.specification || { description: task.description },
            repositoryUrl: task.repositoryUrl!,
            taskType: task.context?.taskType || 'feature',
            generateTests: task.context?.generateTests || false,
            includeDocumentation: task.context?.includeDocumentation || false,
            optimizeFor: task.context?.optimizeFor || 'maintainability'
          };
          result = await this.codeGenerator.generateFromSpecification(genRequest);
          break;
          
        case 'test_generation':
          const testRequest: TestGenerationRequest = {
            generatedCode: task.context?.generatedCode,
            repositoryUrl: task.repositoryUrl!,
            testType: task.context?.testType || 'unit',
            coverage: task.context?.coverage || 'comprehensive',
            includeEdgeCases: true,
            includeMocks: true
          };
          result = await this.testGenerator.generateTestsForCode(testRequest);
          break;
          
        case 'comprehensive_development':
          result = await this.processComprehensiveDevelopment(task.context);
          break;
          
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
      
      this.updateTaskStatus(task.id, 'completed', 100);
      return result;
      
    } catch (error) {
      console.error(`❌ Enhanced task processing failed: ${error.message}`);
      this.updateTaskStatus(task.id, 'failed', task.progress);
      throw error;
    }
  }

  /**
   * Get intelligence metrics for a repository
   */
  async getIntelligenceMetrics(repositoryUrl: string): Promise<IntelligenceMetrics> {
    const analysis = await this.repositoryAnalyzer.analyzeRepositoryDeep(repositoryUrl);
    
    // Calculate various metrics based on the analysis
    const repositoryUnderstanding = this.calculateRepositoryUnderstanding(analysis);
    const codeQuality = this.calculateCodeQuality(analysis);
    const testCoverage = this.calculateTestCoverage(analysis);
    const patternCompliance = this.calculatePatternCompliance(analysis);
    const securityScore = this.calculateSecurityScore(analysis);
    const performanceScore = this.calculatePerformanceScore(analysis);
    const maintainabilityScore = this.calculateMaintainabilityScore(analysis);
    
    const overallScore = (
      repositoryUnderstanding * 0.15 +
      codeQuality * 0.20 +
      testCoverage * 0.15 +
      patternCompliance * 0.15 +
      securityScore * 0.10 +
      performanceScore * 0.10 +
      maintainabilityScore * 0.15
    );
    
    return {
      repositoryUnderstanding,
      codeQuality,
      testCoverage,
      patternCompliance,
      securityScore,
      performanceScore,
      maintainabilityScore,
      overallScore
    };
  }

  /**
   * Enhanced code analysis with full intelligence stack
   */
  async analyzeCodeWithIntelligence(request: CodeAnalysisRequest): Promise<CodeAnalysisResult & {
    repositoryContext?: RepositoryAnalysis;
    intelligenceMetrics?: IntelligenceMetrics;
    suggestions: string[];
  }> {
    
    // Get base analysis
    const baseResult = await super.analyzeCode(request);
    
    // Add intelligence layer
    let repositoryContext: RepositoryAnalysis | undefined;
    let intelligenceMetrics: IntelligenceMetrics | undefined;
    
    if (request.repositoryUrl) {
      repositoryContext = await this.repositoryAnalyzer.analyzeRepositoryDeep(request.repositoryUrl);
      intelligenceMetrics = await this.getIntelligenceMetrics(request.repositoryUrl);
    }
    
    // Enhanced suggestions based on intelligence
    const enhancedSuggestions = await this.generateIntelligentSuggestions(
      request,
      baseResult,
      repositoryContext
    );
    
    return {
      ...baseResult,
      repositoryContext,
      intelligenceMetrics,
      suggestions: [...baseResult.suggestions, ...enhancedSuggestions]
    };
  }

  /**
   * Generate intelligent suggestions based on repository analysis
   */
  private async generateIntelligentSuggestions(
    request: CodeAnalysisRequest,
    baseResult: CodeAnalysisResult,
    repositoryContext?: RepositoryAnalysis
  ): Promise<string[]> {
    
    if (!repositoryContext) {
      return [];
    }
    
    const suggestions: string[] = [];
    
    // Pattern-based suggestions
    if (repositoryContext.patterns.naming.functions === 'camelCase') {
      suggestions.push('Follow camelCase naming convention for functions as used in this repository');
    }
    
    // Framework-specific suggestions
    if (repositoryContext.architecture.framework === 'React') {
      suggestions.push('Consider using React hooks and functional components as per repository patterns');
    }
    
    // Testing suggestions
    if (repositoryContext.architecture.testFramework) {
      suggestions.push(`Include ${repositoryContext.architecture.testFramework} tests following repository patterns`);
    }
    
    // Error handling suggestions
    if (repositoryContext.patterns.errorHandling.length > 0) {
      suggestions.push('Follow repository error handling patterns for consistency');
    }
    
    return suggestions;
  }

  // Helper methods for calculations
  private calculateRepositoryUnderstanding(analysis: RepositoryAnalysis): number {
    let score = 0;
    
    // File structure understanding
    if (analysis.structure.files.length > 0) score += 0.3;
    
    // Pattern recognition
    if (analysis.patterns.fileOrganization.consistency > 0.7) score += 0.3;
    
    // Architecture detection
    if (analysis.architecture.framework !== 'Unknown') score += 0.4;
    
    return Math.min(score, 1.0);
  }

  private calculateCodeQuality(analysis: RepositoryAnalysis): number {
    let score = 0.5; // Base score
    
    // Pattern consistency
    score += analysis.patterns.fileOrganization.consistency * 0.3;
    
    // Architecture clarity
    if (analysis.architecture.framework !== 'Unknown') score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private calculateTestCoverage(analysis: RepositoryAnalysis): number {
    const totalFiles = analysis.structure.files.length;
    const testFiles = analysis.structure.files.filter(f => 
      f.path.includes('.test.') || f.path.includes('.spec.')
    ).length;
    
    return totalFiles > 0 ? Math.min(testFiles / totalFiles * 2, 1.0) : 0;
  }

  private calculatePatternCompliance(analysis: RepositoryAnalysis): number {
    return analysis.patterns.fileOrganization.consistency;
  }

  private calculateSecurityScore(analysis: RepositoryAnalysis): number {
    // Basic security heuristics
    let score = 0.7; // Default score
    
    // Check for security-related dependencies
    const securityDeps = analysis.dependencies.externalDependencies.filter(dep =>
      dep.name.includes('security') || 
      dep.name.includes('auth') ||
      dep.name.includes('crypto')
    );
    
    if (securityDeps.length > 0) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private calculatePerformanceScore(analysis: RepositoryAnalysis): number {
    // Basic performance heuristics
    let score = 0.6; // Default score
    
    // Check for performance-related patterns
    if (analysis.architecture.framework === 'React') {
      score += 0.2; // Modern framework
    }
    
    if (analysis.architecture.buildTool === 'Vite') {
      score += 0.2; // Fast build tool
    }
    
    return Math.min(score, 1.0);
  }

  private calculateMaintainabilityScore(analysis: RepositoryAnalysis): number {
    let score = 0;
    
    // File organization
    score += analysis.patterns.fileOrganization.consistency * 0.4;
    
    // Type safety
    if (analysis.primaryLanguage === 'TypeScript') score += 0.3;
    
    // Testing
    const hasTests = analysis.structure.files.some(f => 
      f.path.includes('.test.') || f.path.includes('.spec.')
    );
    if (hasTests) score += 0.3;
    
    return Math.min(score, 1.0);
  }

  private calculateOverallQuality(
    codeGeneration: EnhancedGenerationResult,
    testGeneration?: TestGeneration,
    repositoryAnalysis?: RepositoryAnalysis
  ): number {
    let score = codeGeneration.qualityScore * 0.5;
    
    if (testGeneration) {
      score += testGeneration.qualityScore * 0.3;
    }
    
    if (repositoryAnalysis) {
      score += codeGeneration.patternCompliance.overall * 0.2;
    }
    
    return Math.min(score, 1.0);
  }

  private generateRecommendations(
    codeGeneration: EnhancedGenerationResult,
    testGeneration?: TestGeneration,
    bugAnalysis?: BugAnalysis,
    qualityScore?: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (qualityScore && qualityScore < 0.8) {
      recommendations.push('Consider improving code quality based on suggestions');
    }
    
    if (testGeneration && testGeneration.coverage.overall < 0.8) {
      recommendations.push('Increase test coverage for better reliability');
    }
    
    if (codeGeneration.suggestions.length > 0) {
      recommendations.push('Review code improvement suggestions');
    }
    
    if (bugAnalysis && bugAnalysis.priority === 'critical') {
      recommendations.push('Address critical bug with highest priority');
    }
    
    return recommendations;
  }

  private generateNextSteps(
    codeGeneration: EnhancedGenerationResult,
    testGeneration?: TestGeneration,
    qualityScore?: number,
    threshold?: number
  ): string[] {
    const steps: string[] = [];
    
    if (qualityScore && threshold && qualityScore >= threshold) {
      steps.push('Create pull request');
      steps.push('Request code review');
    } else {
      steps.push('Address quality issues');
      if (testGeneration && testGeneration.coverage.overall < 0.8) {
        steps.push('Improve test coverage');
      }
      steps.push('Re-run quality checks');
    }
    
    return steps;
  }

  private estimateReviewTime(
    codeGeneration: EnhancedGenerationResult,
    testGeneration?: TestGeneration
  ): string {
    const files = codeGeneration.implementation.files_to_create.length + 
                 codeGeneration.implementation.files_to_modify.length;
    const tests = testGeneration ? testGeneration.tests.length : 0;
    
    const totalFiles = files + tests;
    const minutesPerFile = 5;
    const totalMinutes = totalFiles * minutesPerFile;
    
    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      const hours = Math.round(totalMinutes / 60 * 10) / 10;
      return `${hours} hours`;
    }
  }

  private async isBugFixRequest(requirement: string): Promise<boolean> {
    const bugKeywords = ['bug', 'fix', 'error', 'issue', 'broken', 'not working', 'fails'];
    return bugKeywords.some(keyword => 
      requirement.toLowerCase().includes(keyword)
    );
  }

  private updateTaskStatus(taskId: string, status: EnhancedClaudeTask['status'], progress: number): void {
    const task = this.taskCache.get(taskId);
    if (task) {
      task.status = status;
      task.progress = progress;
      if (status === 'completed') {
        task.completed_at = new Date().toISOString();
      }
    }
  }

  private async storeComprehensiveResult(result: ComprehensiveDevelopmentResult): Promise<void> {
    try {
      await supabase
        .from('comprehensive_development_results')
        .insert({
          task_id: result.taskId,
          result_data: result,
          quality_score: result.qualityScore,
          pull_request_ready: result.pullRequestReady,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error storing comprehensive result:', error);
    }
  }

  private generateTaskId(): string {
    return `enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for external access to intelligence services
  getRepositoryAnalyzer(): EnhancedRepositoryAnalyzer {
    return this.repositoryAnalyzer;
  }

  getBugDetector(): IntelligentBugDetector {
    return this.bugDetector;
  }

  getCodeGenerator(): ContextAwareCodeGenerator {
    return this.codeGenerator;
  }

  getTestGenerator(): IntelligentTestGenerator {
    return this.testGenerator;
  }

  // Enhanced Claude methods with intelligence
  async generateCode(prompt: string): Promise<string> {
    if (!this.apiKey || !this.anthropicClient) {
      throw new Error('Claude API key not configured. Please configure in Integration Hub.');
    }

    const result = await generateText({
      model: this.anthropicClient(this.model),
      prompt,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
    });

    return result.text;
  }

  async analyzeCode(prompt: string): Promise<string> {
    return this.generateCode(`Analyze this code and provide insights:\n\n${prompt}`);
  }
} 
import { ClaudeService } from './claude-service';
import { EnhancedRepositoryAnalyzer, RepositoryAnalysis } from './enhanced-repository-analyzer';
import { supabase } from './supabase/server';

export interface TestGenerationRequest {
  generatedCode: any;
  repositoryUrl: string;
  testType: 'unit' | 'integration' | 'e2e' | 'all';
  coverage?: 'basic' | 'comprehensive' | 'exhaustive';
  includeEdgeCases?: boolean;
  includeMocks?: boolean;
  includeSnapshots?: boolean;
  followExistingPatterns?: boolean;
}

export interface TestGeneration {
  id: string;
  tests: GeneratedTest[];
  testData: TestData[];
  mocks: MockDefinition[];
  framework: string;
  coverage: TestCoverage;
  patterns: TestPatterns;
  suggestions: TestSuggestion[];
  qualityScore: number;
  createdAt: Date;
}

export interface GeneratedTest {
  path: string;
  content: string;
  type: 'unit' | 'integration' | 'e2e';
  description: string;
  framework: string;
  coverage: TestCoverageItem[];
  dependencies: string[];
  testCases: TestCase[];
  setup?: string;
  teardown?: string;
}

export interface TestData {
  name: string;
  type: 'fixture' | 'mock' | 'factory' | 'builder';
  content: string;
  description: string;
  usage: string[];
}

export interface MockDefinition {
  name: string;
  type: 'module' | 'function' | 'class' | 'api';
  path: string;
  content: string;
  description: string;
  usage: string[];
}

export interface TestCoverage {
  overall: number;
  byFile: TestCoverageByFile[];
  byType: TestCoverageByType;
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  uncovered: UncoveredItem[];
}

export interface TestCoverageItem {
  target: string;
  type: 'function' | 'class' | 'component' | 'module';
  coverage: number;
  testCases: number;
}

export interface TestCoverageByFile {
  file: string;
  coverage: number;
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface TestCoverageByType {
  unit: number;
  integration: number;
  e2e: number;
}

export interface UncoveredItem {
  file: string;
  type: 'function' | 'branch' | 'statement';
  name: string;
  line: number;
  reason: string;
}

export interface TestPatterns {
  framework: string;
  naming: TestNamingPatterns;
  structure: TestStructurePatterns;
  mocking: TestMockingPatterns;
  assertion: TestAssertionPatterns;
  setup: TestSetupPatterns;
  organization: TestOrganizationPatterns;
  dataGeneration: TestDataPatterns;
}

export interface TestNamingPatterns {
  testFiles: string;
  testFunctions: string;
  testData: string;
  mocks: string;
  fixtures: string;
  examples: string[];
}

export interface TestStructurePatterns {
  beforeEach: boolean;
  afterEach: boolean;
  beforeAll: boolean;
  afterAll: boolean;
  nested: boolean;
  grouping: string;
  examples: string[];
}

export interface TestMockingPatterns {
  framework: string;
  moduleLevel: boolean;
  functionLevel: boolean;
  classLevel: boolean;
  apiLevel: boolean;
  examples: string[];
}

export interface TestAssertionPatterns {
  style: 'expect' | 'should' | 'assert';
  matchers: string[];
  custom: boolean;
  examples: string[];
}

export interface TestSetupPatterns {
  globalSetup: boolean;
  perTestSetup: boolean;
  fixtures: boolean;
  factories: boolean;
  builders: boolean;
  examples: string[];
}

export interface TestOrganizationPatterns {
  directory: string;
  coLocation: boolean;
  separation: boolean;
  grouping: string;
  examples: string[];
}

export interface TestDataPatterns {
  fixtures: boolean;
  factories: boolean;
  builders: boolean;
  generators: boolean;
  examples: string[];
}

export interface TestCase {
  name: string;
  type: 'happy_path' | 'edge_case' | 'error_case' | 'integration' | 'performance';
  description: string;
  setup?: string;
  execution: string;
  assertion: string;
  teardown?: string;
  mocks?: string[];
  data?: string;
}

export interface TestSuggestion {
  type: 'coverage' | 'pattern' | 'performance' | 'maintainability' | 'security';
  description: string;
  file: string;
  line?: number;
  before?: string;
  after?: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
}

export interface TestExecutionResult {
  testGenerationId: string;
  passed: number;
  failed: number;
  skipped: number;
  coverage: TestCoverage;
  failures: TestFailure[];
  performance: TestPerformance;
  status: 'passed' | 'failed' | 'partial';
}

export interface TestFailure {
  test: string;
  error: string;
  stack?: string;
  expected?: any;
  actual?: any;
  suggestion?: string;
}

export interface TestPerformance {
  totalTime: number;
  averageTime: number;
  slowestTests: SlowTest[];
  memoryUsage: number;
}

export interface SlowTest {
  name: string;
  duration: number;
  file: string;
  suggestion: string;
}

export class IntelligentTestGenerator {
  private repositoryAnalyzer: EnhancedRepositoryAnalyzer;
  private claude: ClaudeService;

  constructor(repositoryAnalyzer: EnhancedRepositoryAnalyzer, claude: ClaudeService) {
    this.repositoryAnalyzer = repositoryAnalyzer;
    this.claude = claude;
  }

  async generateTestsForCode(
    request: TestGenerationRequest
  ): Promise<TestGeneration> {
    
    console.log(`Starting intelligent test generation for ${request.testType} tests`);
    
    try {
      // 1. Analyze existing test patterns
      const repoAnalysis = await this.repositoryAnalyzer.analyzeRepositoryDeep(request.repositoryUrl);
      const testPatterns = await this.analyzeTestPatterns(repoAnalysis);
      
      // 2. Generate tests following project patterns
      const tests = await this.generateTests(request, testPatterns, repoAnalysis);
      
      // 3. Generate test data/fixtures if needed
      const testData = await this.generateTestData(request, testPatterns);
      
      // 4. Generate mocks if needed
      const mocks = await this.generateMocks(request, testPatterns);
      
      // 5. Calculate coverage
      const coverage = await this.calculateCoverage(tests, request.generatedCode);
      
      // 6. Generate suggestions
      const suggestions = await this.generateSuggestions(tests, testPatterns, coverage);
      
      // 7. Calculate quality score
      const qualityScore = this.calculateQualityScore(tests, coverage, testPatterns);
      
      const generation: TestGeneration = {
        id: this.generateTestId(),
        tests,
        testData,
        mocks,
        framework: testPatterns.framework,
        coverage,
        patterns: testPatterns,
        suggestions,
        qualityScore,
        createdAt: new Date()
      };
      
      // 8. Store the generation
      await this.storeTestGeneration(generation);
      
      console.log(`Test generation completed with quality score: ${qualityScore}`);
      return generation;
      
    } catch (error) {
      console.error('Error in intelligent test generation:', error);
      throw new Error(`Failed to generate tests: ${error.message}`);
    }
  }

  private async analyzeTestPatterns(repoAnalysis: RepositoryAnalysis): Promise<TestPatterns> {
    // Find test files
    const testFiles = repoAnalysis.structure.files.filter(f => 
      f.path.includes('.test.') || 
      f.path.includes('.spec.') || 
      f.path.includes('__tests__') ||
      f.path.includes('test/') ||
      f.path.includes('tests/')
    );
    
    if (testFiles.length === 0) {
      return this.getDefaultTestPatterns();
    }
    
    // Analyze existing test patterns
    const sampleTests = testFiles.slice(0, 5);
    const testContents = await Promise.all(
      sampleTests.map(f => this.getFileContent(f.path))
    );
    
    const prompt = `
      Analyze these test files and identify comprehensive testing patterns:
      
      ${testContents.map((content, i) => `
        File: ${sampleTests[i].path}
        Content:
        \`\`\`
        ${content}
        \`\`\`
      `).join('\n\n')}
      
      Identify detailed patterns for:
      1. Testing framework (Jest, Vitest, Mocha, Cypress, etc.)
      2. Test file naming conventions
      3. Test function naming patterns
      4. Test structure and organization (describe/it, beforeEach, etc.)
      5. Mocking patterns and strategies
      6. Assertion styles and matchers
      7. Test data generation patterns
      8. Setup and teardown patterns
      9. Test organization (co-location vs separate directories)
      10. Coverage expectations
      11. Integration test patterns
      12. E2E test patterns
      
      Return comprehensive JSON analysis:
      {
        "framework": "Jest",
        "naming": {
          "testFiles": "*.test.ts pattern",
          "testFunctions": "should/it pattern",
          "testData": "naming for test data",
          "mocks": "mock naming pattern",
          "fixtures": "fixture naming pattern",
          "examples": ["example patterns"]
        },
        "structure": {
          "beforeEach": true,
          "afterEach": false,
          "beforeAll": true,
          "afterAll": false,
          "nested": true,
          "grouping": "describe blocks",
          "examples": ["example structures"]
        },
        "mocking": {
          "framework": "Jest",
          "moduleLevel": true,
          "functionLevel": true,
          "classLevel": false,
          "apiLevel": true,
          "examples": ["mock examples"]
        },
        "assertion": {
          "style": "expect",
          "matchers": ["toBe", "toEqual", "toHaveBeenCalled"],
          "custom": false,
          "examples": ["assertion examples"]
        },
        "setup": {
          "globalSetup": false,
          "perTestSetup": true,
          "fixtures": true,
          "factories": false,
          "builders": false,
          "examples": ["setup examples"]
        },
        "organization": {
          "directory": "__tests__",
          "coLocation": true,
          "separation": false,
          "grouping": "by feature",
          "examples": ["organization examples"]
        },
        "dataGeneration": {
          "fixtures": true,
          "factories": false,
          "builders": false,
          "generators": false,
          "examples": ["data generation examples"]
        }
      }
    `;
    
    try {
      const response = await this.claude.analyzeCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error analyzing test patterns:', error);
      return this.getDefaultTestPatterns();
    }
  }

  private async generateTests(
    request: TestGenerationRequest,
    testPatterns: TestPatterns,
    repoAnalysis: RepositoryAnalysis
  ): Promise<GeneratedTest[]> {
    
    const tests: GeneratedTest[] = [];
    
    // Generate tests for each file in the generated code
    for (const file of request.generatedCode.files_to_create || []) {
      if (this.shouldGenerateTestFor(file.path, file.content)) {
        const testFile = await this.generateTestFile(file, request, testPatterns, repoAnalysis);
        if (testFile) {
          tests.push(testFile);
        }
      }
    }
    
    // Generate tests for modified files
    for (const file of request.generatedCode.files_to_modify || []) {
      if (this.shouldGenerateTestFor(file.path, file.changes)) {
        const testFile = await this.generateTestFileForModification(file, request, testPatterns, repoAnalysis);
        if (testFile) {
          tests.push(testFile);
        }
      }
    }
    
    return tests;
  }

  private async generateTestFile(
    sourceFile: any,
    request: TestGenerationRequest,
    testPatterns: TestPatterns,
    repoAnalysis: RepositoryAnalysis
  ): Promise<GeneratedTest | null> {
    
    const prompt = `
      Generate comprehensive ${request.testType} tests for this code:
      
      FILE: ${sourceFile.path}
      CONTENT:
      \`\`\`
      ${sourceFile.content}
      \`\`\`
      
      TEST PATTERNS TO FOLLOW:
      Framework: ${testPatterns.framework}
      Naming: ${JSON.stringify(testPatterns.naming, null, 2)}
      Structure: ${JSON.stringify(testPatterns.structure, null, 2)}
      Mocking: ${JSON.stringify(testPatterns.mocking, null, 2)}
      Assertion: ${JSON.stringify(testPatterns.assertion, null, 2)}
      Setup: ${JSON.stringify(testPatterns.setup, null, 2)}
      
      REPOSITORY CONTEXT:
      Framework: ${repoAnalysis.architecture.framework}
      Testing Framework: ${repoAnalysis.architecture.testFramework}
      
      COVERAGE LEVEL: ${request.coverage || 'comprehensive'}
      INCLUDE EDGE CASES: ${request.includeEdgeCases !== false}
      INCLUDE MOCKS: ${request.includeMocks !== false}
      
      Generate tests including:
      1. Happy path scenarios
      2. Edge cases (if requested)
      3. Error scenarios
      4. Input validation tests
      5. Async behavior tests (if applicable)
      6. Component lifecycle tests (if React/Vue component)
      7. API interaction tests (if applicable)
      8. Performance tests (if applicable)
      9. Security tests (if applicable)
      10. Integration tests (if requested)
      
      Follow the EXACT patterns from the existing test files.
      Use the same naming conventions, structure, and assertion styles.
      
      Return JSON:
      {
        "path": "${this.getTestFilePath(sourceFile.path, testPatterns)}",
        "content": "complete test file content following patterns",
        "type": "${request.testType}",
        "description": "Description of what this test file covers",
        "framework": "${testPatterns.framework}",
        "coverage": [
          {
            "target": "functionName",
            "type": "function",
            "coverage": 0.95,
            "testCases": 8
          }
        ],
        "dependencies": ["@testing-library/react", "jest"],
        "testCases": [
          {
            "name": "should render correctly",
            "type": "happy_path",
            "description": "Tests normal rendering",
            "setup": "setup code",
            "execution": "test execution",
            "assertion": "expect(result).toBeDefined()",
            "mocks": ["mockFunction"],
            "data": "test data"
          }
        ],
        "setup": "beforeEach setup code",
        "teardown": "afterEach cleanup code"
      }
    `;
    
    try {
      const response = await this.claude.generateCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating test file:', error);
      return null;
    }
  }

  private async generateTestFileForModification(
    modifiedFile: any,
    request: TestGenerationRequest,
    testPatterns: TestPatterns,
    repoAnalysis: RepositoryAnalysis
  ): Promise<GeneratedTest | null> {
    
    const prompt = `
      Generate additional tests for this modified code:
      
      FILE: ${modifiedFile.path}
      MODIFICATIONS:
      \`\`\`
      ${modifiedFile.changes}
      \`\`\`
      
      AFFECTED FUNCTIONS: ${modifiedFile.affectedFunctions?.join(', ') || 'unknown'}
      
      Generate tests specifically for:
      1. The modified functionality
      2. Regression tests for existing behavior
      3. Integration tests for the changes
      4. Edge cases introduced by the changes
      
      Follow the same patterns as the main test generation.
      
      Return JSON in the same format as generateTestFile.
    `;
    
    try {
      const response = await this.claude.generateCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating test file for modification:', error);
      return null;
    }
  }

  private async generateTestData(
    request: TestGenerationRequest,
    testPatterns: TestPatterns
  ): Promise<TestData[]> {
    
    if (!testPatterns.dataGeneration.fixtures && !testPatterns.dataGeneration.factories) {
      return [];
    }
    
    const prompt = `
      Generate test data for this code:
      
      CODE: ${JSON.stringify(request.generatedCode, null, 2)}
      
      DATA GENERATION PATTERNS: ${JSON.stringify(testPatterns.dataGeneration, null, 2)}
      
      Generate appropriate test data including:
      1. Fixtures for static data
      2. Factories for dynamic data generation
      3. Builders for complex object construction
      4. Mock data for external dependencies
      
      Follow the project's data generation patterns.
      
      Return JSON array:
      [
        {
          "name": "userFixture",
          "type": "fixture",
          "content": "export const userFixture = { id: 1, name: 'Test User' };",
          "description": "Test user data",
          "usage": ["UserComponent.test.tsx", "UserService.test.ts"]
        }
      ]
    `;
    
    try {
      const response = await this.claude.generateCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating test data:', error);
      return [];
    }
  }

  private async generateMocks(
    request: TestGenerationRequest,
    testPatterns: TestPatterns
  ): Promise<MockDefinition[]> {
    
    if (!request.includeMocks || !testPatterns.mocking.moduleLevel) {
      return [];
    }
    
    const prompt = `
      Generate mocks for this code:
      
      CODE: ${JSON.stringify(request.generatedCode, null, 2)}
      
      MOCKING PATTERNS: ${JSON.stringify(testPatterns.mocking, null, 2)}
      
      Generate mocks for:
      1. External modules/libraries
      2. API calls
      3. Database operations
      4. File system operations
      5. Time-dependent operations
      6. Complex dependencies
      
      Follow the project's mocking patterns.
      
      Return JSON array:
      [
        {
          "name": "apiClientMock",
          "type": "module",
          "path": "src/services/apiClient",
          "content": "jest.mock('src/services/apiClient', () => ({ get: jest.fn() }));",
          "description": "Mock for API client",
          "usage": ["UserService.test.ts"]
        }
      ]
    `;
    
    try {
      const response = await this.claude.generateCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating mocks:', error);
      return [];
    }
  }

  private async calculateCoverage(
    tests: GeneratedTest[],
    generatedCode: any
  ): Promise<TestCoverage> {
    
    const prompt = `
      Calculate test coverage for these tests:
      
      GENERATED TESTS: ${JSON.stringify(tests, null, 2)}
      
      TARGET CODE: ${JSON.stringify(generatedCode, null, 2)}
      
      Calculate coverage including:
      1. Overall coverage percentage
      2. Coverage by file
      3. Coverage by type (unit, integration, e2e)
      4. Statement coverage
      5. Branch coverage
      6. Function coverage
      7. Line coverage
      8. Identify uncovered items
      
      Return JSON:
      {
        "overall": 0.85,
        "byFile": [
          {
            "file": "src/component.tsx",
            "coverage": 0.90,
            "statements": 0.85,
            "branches": 0.75,
            "functions": 1.0,
            "lines": 0.88
          }
        ],
        "byType": {
          "unit": 0.90,
          "integration": 0.70,
          "e2e": 0.60
        },
        "statements": 0.85,
        "branches": 0.75,
        "functions": 0.95,
        "lines": 0.88,
        "uncovered": [
          {
            "file": "src/component.tsx",
            "type": "branch",
            "name": "error handling",
            "line": 25,
            "reason": "Error case not tested"
          }
        ]
      }
    `;
    
    try {
      const response = await this.claude.analyzeCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error calculating coverage:', error);
      return {
        overall: 0.5,
        byFile: [],
        byType: { unit: 0.5, integration: 0.3, e2e: 0.2 },
        statements: 0.5,
        branches: 0.4,
        functions: 0.6,
        lines: 0.5,
        uncovered: []
      };
    }
  }

  private async generateSuggestions(
    tests: GeneratedTest[],
    testPatterns: TestPatterns,
    coverage: TestCoverage
  ): Promise<TestSuggestion[]> {
    
    const prompt = `
      Generate suggestions to improve these tests:
      
      TESTS: ${JSON.stringify(tests, null, 2)}
      COVERAGE: ${JSON.stringify(coverage, null, 2)}
      PATTERNS: ${JSON.stringify(testPatterns, null, 2)}
      
      Suggest improvements for:
      1. Coverage gaps
      2. Pattern compliance
      3. Performance optimizations
      4. Maintainability improvements
      5. Security test additions
      6. Edge case coverage
      7. Test organization
      8. Mock improvements
      
      Return JSON array:
      [
        {
          "type": "coverage",
          "description": "Add test for error handling branch",
          "file": "src/component.test.tsx",
          "line": 45,
          "before": "// Missing error case test",
          "after": "it('should handle errors gracefully', () => { ... })",
          "impact": "medium",
          "effort": "low",
          "priority": "high"
        }
      ]
    `;
    
    try {
      const response = await this.claude.analyzeCode(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  // Helper methods
  private shouldGenerateTestFor(filePath: string, content: string): boolean {
    // Skip test files, config files, and documentation
    if (filePath.includes('.test.') || 
        filePath.includes('.spec.') || 
        filePath.includes('__tests__') ||
        filePath.includes('.md') ||
        filePath.includes('.json') ||
        filePath.includes('.yml') ||
        filePath.includes('.yaml')) {
      return false;
    }
    
    // Skip empty files
    if (!content || content.trim().length < 10) {
      return false;
    }
    
    // Generate tests for code files
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cs', '.go'];
    return codeExtensions.some(ext => filePath.endsWith(ext));
  }

  private getTestFilePath(sourceFilePath: string, testPatterns: TestPatterns): string {
    const pathParts = sourceFilePath.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const fileNameWithoutExt = fileName.split('.')[0];
    const ext = fileName.split('.').pop();
    
    // Follow the naming pattern
    const testFileName = testPatterns.naming.testFiles
      .replace('*', fileNameWithoutExt)
      .replace('{{ext}}', ext || 'js');
    
    // Follow the organization pattern
    if (testPatterns.organization.coLocation) {
      // Place test file next to source file
      const directory = pathParts.slice(0, -1).join('/');
      return `${directory}/${testFileName}`;
    } else {
      // Place in separate test directory
      const testDir = testPatterns.organization.directory || '__tests__';
      return `${testDir}/${pathParts.slice(1, -1).join('/')}/${testFileName}`;
    }
  }

  private async getFileContent(filePath: string): Promise<string> {
    // This would integrate with your GitHub service
    // For now, returning mock content
    return `// Mock content for ${filePath}`;
  }

  private getDefaultTestPatterns(): TestPatterns {
    return {
      framework: 'Jest',
      naming: {
        testFiles: '*.test.ts',
        testFunctions: 'should ...',
        testData: 'testData',
        mocks: 'mock*',
        fixtures: '*Fixture',
        examples: ['user.test.ts', 'should render correctly']
      },
      structure: {
        beforeEach: true,
        afterEach: false,
        beforeAll: false,
        afterAll: false,
        nested: true,
        grouping: 'describe',
        examples: ['describe() blocks', 'it() tests']
      },
      mocking: {
        framework: 'Jest',
        moduleLevel: true,
        functionLevel: true,
        classLevel: false,
        apiLevel: true,
        examples: ['jest.mock()', 'jest.fn()']
      },
      assertion: {
        style: 'expect',
        matchers: ['toBe', 'toEqual', 'toHaveBeenCalled'],
        custom: false,
        examples: ['expect(result).toBe(expected)']
      },
      setup: {
        globalSetup: false,
        perTestSetup: true,
        fixtures: false,
        factories: false,
        builders: false,
        examples: ['beforeEach(() => { ... })']
      },
      organization: {
        directory: '__tests__',
        coLocation: true,
        separation: false,
        grouping: 'by feature',
        examples: ['src/__tests__/component.test.ts']
      },
      dataGeneration: {
        fixtures: false,
        factories: false,
        builders: false,
        generators: false,
        examples: []
      }
    };
  }

  private calculateQualityScore(
    tests: GeneratedTest[],
    coverage: TestCoverage,
    testPatterns: TestPatterns
  ): number {
    let score = 0;
    
    // Coverage score (40%)
    score += coverage.overall * 0.4;
    
    // Test completeness (30%)
    const hasUnitTests = tests.some(t => t.type === 'unit');
    const hasIntegrationTests = tests.some(t => t.type === 'integration');
    const hasE2eTests = tests.some(t => t.type === 'e2e');
    
    let completenessScore = 0;
    if (hasUnitTests) completenessScore += 0.6;
    if (hasIntegrationTests) completenessScore += 0.3;
    if (hasE2eTests) completenessScore += 0.1;
    
    score += completenessScore * 0.3;
    
    // Pattern compliance (20%)
    const avgTestCases = tests.reduce((sum, t) => sum + t.testCases.length, 0) / tests.length;
    const patternScore = Math.min(avgTestCases / 5, 1); // 5 test cases per file is good
    score += patternScore * 0.2;
    
    // Test quality (10%)
    const hasSetup = tests.some(t => t.setup);
    const hasTeardown = tests.some(t => t.teardown);
    const hasMocks = tests.some(t => t.testCases.some(tc => tc.mocks && tc.mocks.length > 0));
    
    let qualityScore = 0;
    if (hasSetup) qualityScore += 0.4;
    if (hasTeardown) qualityScore += 0.2;
    if (hasMocks) qualityScore += 0.4;
    
    score += qualityScore * 0.1;
    
    return Math.min(score, 1.0);
  }

  private async storeTestGeneration(generation: TestGeneration): Promise<void> {
    try {
      await supabase
        .from('test_generations')
        .insert({
          id: generation.id,
          test_data: generation,
          framework: generation.framework,
          quality_score: generation.qualityScore,
          coverage_overall: generation.coverage.overall,
          test_count: generation.tests.length,
          created_at: generation.createdAt.toISOString()
        });
    } catch (error) {
      console.error('Error storing test generation:', error);
    }
  }

  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for retrieving stored generations
  async getTestGeneration(testId: string): Promise<TestGeneration | null> {
    try {
      const { data, error } = await supabase
        .from('test_generations')
        .select('test_data')
        .eq('id', testId)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      return data.test_data;
    } catch (error) {
      console.error('Error retrieving test generation:', error);
      return null;
    }
  }

  async listTestGenerations(limit: number = 20): Promise<TestGeneration[]> {
    try {
      const { data, error } = await supabase
        .from('test_generations')
        .select('test_data')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error || !data) {
        return [];
      }
      
      return data.map(item => item.test_data);
    } catch (error) {
      console.error('Error listing test generations:', error);
      return [];
    }
  }

  async executeTests(testGenerationId: string): Promise<TestExecutionResult> {
    // This would integrate with your testing framework
    // For now, returning mock results
    return {
      testGenerationId,
      passed: 15,
      failed: 2,
      skipped: 1,
      coverage: {
        overall: 0.85,
        byFile: [],
        byType: { unit: 0.9, integration: 0.8, e2e: 0.7 },
        statements: 0.85,
        branches: 0.75,
        functions: 0.95,
        lines: 0.88,
        uncovered: []
      },
      failures: [],
      performance: {
        totalTime: 1500,
        averageTime: 83,
        slowestTests: [],
        memoryUsage: 128
      },
      status: 'passed'
    };
  }
} 
export const testSpecSections: Record<string, {
  id: string
  name: string
  icon: string
  description: string
  prompt: string
}> = {
  test_strategy: {
    id: 'test_strategy',
    name: "Test Strategy",
    icon: "🎯",
    description: "Overall testing approach and methodology",
    prompt: `Generate a comprehensive test strategy including:
- Testing objectives and goals
- Testing scope and boundaries
- Testing approaches (unit, integration, system, acceptance)
- Test environment requirements
- Testing tools and frameworks
- Risk-based testing approach
- Entry and exit criteria`
  },
  test_scenarios: {
    id: 'test_scenarios',
    name: "Test Scenarios",
    icon: "📋",
    description: "High-level test scenarios and user flows",
    prompt: `Create detailed test scenarios covering:
- User journey scenarios
- Happy path scenarios
- Edge case scenarios
- Negative test scenarios
- Cross-functional scenarios
- End-to-end workflows
- Integration scenarios`
  },
  test_cases: {
    id: 'test_cases',
    name: "Test Cases",
    icon: "✅",
    description: "Detailed test cases with steps and expected results",
    prompt: `Develop comprehensive test cases with:
- Test case ID and description
- Preconditions
- Test data requirements
- Step-by-step test procedures
- Expected results
- Actual results placeholder
- Pass/fail criteria
- Priority and severity levels`
  },
  acceptance_criteria: {
    id: 'acceptance_criteria',
    name: "Acceptance Criteria",
    icon: "🎯",
    description: "Clear acceptance criteria for each feature",
    prompt: `Define clear acceptance criteria including:
- Functional acceptance criteria
- Performance acceptance criteria
- Security acceptance criteria
- Usability acceptance criteria
- Definition of done
- Sign-off requirements
- Success metrics`
  },
  test_data: {
    id: 'test_data',
    name: "Test Data Requirements",
    icon: "💾",
    description: "Test data setup and requirements",
    prompt: `Specify test data requirements:
- Test data categories
- Data volume requirements
- Data privacy and masking needs
- Test data generation strategies
- Data refresh procedures
- Environment-specific data needs
- Data validation rules`
  },
  automation_strategy: {
    id: 'automation_strategy',
    name: "Automation Strategy",
    icon: "🤖",
    description: "Test automation approach and tools",
    prompt: `Design test automation strategy:
- Automation framework selection
- Tools and technologies
- Automation scope and priorities
- CI/CD integration approach
- Test script standards
- Maintenance strategy
- ROI analysis for automation`
  },
  performance_testing: {
    id: 'performance_testing',
    name: "Performance Testing",
    icon: "⚡",
    description: "Performance test scenarios and benchmarks",
    prompt: `Create performance testing plan:
- Load testing scenarios
- Stress testing approach
- Performance benchmarks and KPIs
- Resource monitoring requirements
- Scalability testing
- Response time requirements
- Throughput requirements`
  },
  security_testing: {
    id: 'security_testing',
    name: "Security Testing",
    icon: "🔒",
    description: "Security test cases and vulnerability checks",
    prompt: `Develop security testing strategy:
- Authentication and authorization tests
- Data encryption validation
- SQL injection testing
- XSS vulnerability testing
- Security compliance checks
- Penetration testing approach
- OWASP top 10 coverage`
  },
  regression_testing: {
    id: 'regression_testing',
    name: "Regression Testing",
    icon: "🔄",
    description: "Regression test suite and coverage",
    prompt: `Plan regression testing approach:
- Regression test suite design
- Test case prioritization
- Smoke test scenarios
- Regression automation strategy
- Version control for test cases
- Impact analysis process
- Regression testing schedule`
  },
  test_environments: {
    id: 'test_environments',
    name: "Test Environments",
    icon: "🌐",
    description: "Test environment setup and configurations",
    prompt: `Define test environment requirements:
- Environment types (dev, QA, staging, prod-like)
- Hardware and software specifications
- Configuration management
- Environment provisioning process
- Data synchronization approach
- Access controls and permissions
- Environment maintenance procedures`
  }
}

const defaultTestSpecPrompt = `Generate a comprehensive test specification document for the following project:

Project Description: {{input}}
${`{{business_analysis}}` ? `\nBusiness Analysis:\n{{business_analysis}}` : ''}
${`{{functional_spec}}` ? `\nFunctional Specification:\n{{functional_spec}}` : ''}
${`{{technical_spec}}` ? `\nTechnical Specification:\n{{technical_spec}}` : ''}

Create a detailed test specification following modern TDD/BDD principles including:

1. **Executive Summary**
   - Testing objectives and scope
   - Key testing milestones
   - Critical success factors

2. **Test Strategy**
   - Overall testing approach
   - Testing levels and types
   - Risk-based testing priorities

3. **Test Scenarios & User Stories**
   - BDD scenarios with Given-When-Then format
   - User acceptance scenarios
   - Edge cases and negative scenarios

4. **Detailed Test Cases**
   - Functional test cases
   - Integration test cases
   - API test cases
   - UI/UX test cases

5. **Test Data Requirements**
   - Data setup requirements
   - Test data management strategy
   - Data privacy considerations

6. **Automation Strategy**
   - Automation framework and tools
   - CI/CD integration
   - Test script standards

7. **Performance Testing**
   - Load and stress testing scenarios
   - Performance benchmarks
   - Monitoring and metrics

8. **Security Testing**
   - Security test cases
   - Vulnerability assessments
   - Compliance requirements

9. **Test Environments**
   - Environment specifications
   - Configuration requirements
   - Deployment procedures

10. **Test Execution Plan**
    - Test cycles and phases
    - Resource allocation
    - Timeline and milestones

Format as a professional test specification document with clear sections, tables for test cases, and actionable testing guidelines.`

export function generateCombinedTestSpec(selectedSections: string[], context: {
  input: string
  business_analysis?: string
  functional_spec?: string
  technical_spec?: string
}): string {
  if (selectedSections.length === 0) {
    return defaultTestSpecPrompt
  }

  const sections = selectedSections.map(id => testSpecSections[id]).filter(Boolean)
  
  const combinedPrompt = `As a Senior QA Engineer and Test Architect, create a comprehensive test specification covering multiple testing areas.

Project Description: {{input}}
${context.business_analysis ? `Business Analysis: {{business_analysis}}` : ''}
${context.functional_spec ? `Functional Specification: {{functional_spec}}` : ''}
${context.technical_spec ? `Technical Specification: {{technical_spec}}` : ''}

Generate a detailed test specification covering the following areas:

${sections.map((section, index) => `
## Part ${index + 1}: ${section.name}
${section.prompt}
`).join('\n\n')}

Ensure all sections follow modern testing best practices, include specific examples, and are aligned with TDD/BDD principles where applicable. Format as a professional test specification document.`

  return combinedPrompt
}
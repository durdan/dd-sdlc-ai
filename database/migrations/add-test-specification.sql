-- Migration: Add Test Specification Document Type
-- Description: Adds support for generating comprehensive test specifications following TDD and BDD practices

-- First, update the check constraints to allow 'test' document type
ALTER TABLE prompt_templates 
DROP CONSTRAINT IF EXISTS prompt_templates_document_type_check;

ALTER TABLE prompt_templates 
ADD CONSTRAINT prompt_templates_document_type_check 
CHECK (document_type IN ('business', 'functional', 'technical', 'ux', 'mermaid', 'wireframe', 'coding', 'test'));

ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS documents_document_type_check;

ALTER TABLE documents 
ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN ('business', 'functional', 'technical', 'ux', 'mermaid', 'wireframe', 'coding', 'test'));

-- Insert the test specification prompt template
INSERT INTO prompt_templates (
  name,
  description,
  document_type,
  prompt_content,
  variables,
  ai_model,
  is_active,
  is_system_default,
  version,
  created_at,
  updated_at
) VALUES (
  'Test Specification - TDD/BDD',
  'Generates comprehensive test specifications following Test-Driven Development (TDD) and Behavior-Driven Development (BDD) practices',
  'test',
  'You are an expert QA engineer and test architect specializing in modern testing methodologies including TDD (Test-Driven Development), BDD (Behavior-Driven Development), and automated testing strategies.

Generate a comprehensive test specification document for the following project:
{{input}}

Create a detailed test specification that includes:

# TEST SPECIFICATION DOCUMENT

## 1. TESTING OVERVIEW
- Testing philosophy and approach
- Test pyramid strategy (Unit, Integration, E2E)
- Coverage goals and metrics
- Testing tools and frameworks recommendation

## 2. TEST-DRIVEN DEVELOPMENT (TDD) SPECIFICATIONS

### 2.1 Unit Test Specifications
For each major component/module:
- Test class/file naming convention
- Test case structure using Arrange-Act-Assert (AAA) pattern
- Mock/stub requirements
- Edge cases and boundary testing
- Example test code snippets in appropriate language

### 2.2 Red-Green-Refactor Cycle
- Initial failing test examples
- Implementation to pass tests
- Refactoring guidelines
- Test maintenance strategy

## 3. BEHAVIOR-DRIVEN DEVELOPMENT (BDD) SPECIFICATIONS

### 3.1 Feature Files
Create Gherkin syntax scenarios:
```gherkin
Feature: [Feature Name]
  As a [user role]
  I want [goal/desire]
  So that [benefit]

  Scenario: [Scenario description]
    Given [initial context]
    When [event occurs]
    Then [expected outcome]
    And [additional outcomes]
```

### 3.2 Acceptance Criteria
- User story acceptance tests
- Business rule validations
- End-to-end user journey tests
- Cross-browser/device testing requirements

## 4. INTEGRATION TESTING

### 4.1 API Testing
- REST API test scenarios
- GraphQL testing (if applicable)
- Request/response validation
- Authentication/authorization tests
- Rate limiting and error handling tests
- Example using tools like Postman/Newman or REST Assured

### 4.2 Database Testing
- Data integrity tests
- Transaction testing
- Performance benchmarks
- Migration testing

## 5. END-TO-END (E2E) TESTING

### 5.1 Critical User Paths
- User registration and onboarding
- Core feature workflows
- Payment/checkout processes (if applicable)
- Error recovery scenarios

### 5.2 E2E Test Implementation
- Page Object Model (POM) structure
- Test data management
- Environment configuration
- Parallel execution strategy
- Example using Cypress/Playwright/Selenium

## 6. PERFORMANCE TESTING

### 6.1 Load Testing Scenarios
- Expected user load patterns
- Stress test thresholds
- Spike testing scenarios
- Endurance testing requirements

### 6.2 Performance Metrics
- Response time requirements
- Throughput expectations
- Resource utilization limits
- Scalability benchmarks

## 7. SECURITY TESTING

### 7.1 Security Test Cases
- Authentication testing
- Authorization and access control
- Input validation and sanitization
- XSS and SQL injection prevention
- CSRF protection validation
- Security headers verification

### 7.2 Compliance Testing
- OWASP Top 10 coverage
- GDPR/privacy compliance (if applicable)
- Industry-specific requirements

## 8. ACCESSIBILITY TESTING

### 8.1 WCAG Compliance
- Level AA compliance tests
- Screen reader compatibility
- Keyboard navigation testing
- Color contrast validation

### 8.2 Accessibility Test Scenarios
- Core user journeys for assistive technologies
- Form validation and error messaging
- Alternative text and ARIA labels

## 9. MOBILE TESTING (if applicable)

### 9.1 Device Coverage
- Priority device matrix
- OS version support
- Screen size variations
- Network condition testing

### 9.2 Mobile-Specific Tests
- Touch gestures and interactions
- App lifecycle testing
- Offline functionality
- Push notification testing

## 10. TEST AUTOMATION STRATEGY

### 10.1 Automation Framework
- Framework selection rationale
- CI/CD pipeline integration
- Test execution scheduling
- Reporting and notifications

### 10.2 Test Maintenance
- Page object patterns
- Test data factories
- Flaky test management
- Version control strategy

## 11. TEST DATA MANAGEMENT

### 11.1 Test Data Strategy
- Test data generation approaches
- Data privacy and masking
- Environment-specific data
- Data cleanup procedures

### 11.2 Test Fixtures
- Seed data requirements
- Mock service definitions
- Stub responses

## 12. CONTINUOUS TESTING

### 12.1 CI/CD Integration
- Pre-commit hooks
- Build pipeline tests
- Deployment validation
- Smoke test suites
- Rollback testing

### 12.2 Test Reporting
- Dashboard requirements
- Failure notifications
- Trend analysis
- Coverage reports

## 13. REGRESSION TESTING

### 13.1 Regression Test Suite
- Critical path coverage
- Feature interaction tests
- Backward compatibility
- Update/upgrade testing

### 13.2 Regression Strategy
- Test selection criteria
- Execution frequency
- Automation priorities

## 14. EXPLORATORY TESTING

### 14.1 Testing Charters
- Time-boxed sessions
- Focus areas
- Bug hunting strategies
- Usability observations

### 14.2 Session Reports
- Findings documentation
- Risk identification
- Improvement suggestions

## 15. TEST METRICS AND KPIs

### 15.1 Quality Metrics
- Test coverage percentage
- Defect density
- Test execution rate
- Automation ROI

### 15.2 Process Metrics
- Test cycle time
- Defect escape rate
- Test effectiveness
- Mean time to detect/resolve

## 16. RISK-BASED TESTING

### 16.1 Risk Assessment
- High-risk areas identification
- Impact vs probability matrix
- Mitigation strategies
- Test prioritization

### 16.2 Contingency Planning
- Rollback procedures
- Disaster recovery testing
- Failover testing

## 17. TEST ENVIRONMENTS

### 17.1 Environment Requirements
- Development environment
- Staging/QA environment
- Production-like environment
- Performance test environment

### 17.2 Environment Management
- Configuration management
- Environment provisioning
- Data synchronization
- Access control

## 18. TOOLS AND TECHNOLOGIES

Recommended testing stack:
- Unit Testing: [Framework based on tech stack]
- BDD Framework: Cucumber/SpecFlow/Behave
- E2E Testing: Cypress/Playwright/Selenium
- API Testing: Postman/REST Assured/Karate
- Performance: JMeter/K6/Gatling
- Security: OWASP ZAP/Burp Suite
- CI/CD: Jenkins/GitHub Actions/GitLab CI

## 19. TEST EXECUTION TIMELINE

### 19.1 Sprint Testing Activities
- Sprint planning test activities
- Daily testing tasks
- Sprint review test demos
- Retrospective improvements

### 19.2 Release Testing
- Release candidate validation
- UAT coordination
- Go/No-go criteria
- Post-release validation

## 20. SUCCESS CRITERIA

- All unit tests passing (>90% coverage)
- All BDD scenarios implemented and passing
- Zero critical/high severity defects
- Performance SLAs met
- Security scan passed
- Accessibility compliance achieved
- All acceptance criteria validated

Remember to:
- Use concrete examples specific to the project
- Include code snippets in the appropriate programming language
- Follow industry best practices
- Consider the specific technology stack mentioned
- Provide actionable test cases that developers can implement
- Balance between thoroughness and practicality
- Include both happy path and error scenarios
- Consider non-functional requirements',
  '{"input": "Project description"}',
  'gpt-4',
  true,
  true,
  1,
  NOW(),
  NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_prompt_templates_test ON prompt_templates(document_type) WHERE document_type = 'test';
/**
 * Business Analysis Sections
 * Provides specialized prompts for different business analysis focus areas
 */

export interface BusinessSection {
  id: string
  name: string
  icon: string
  description: string
  detailedDescription: string
  bestFor: string[]
  outputSections: string[]
  prompt: string
}

export const businessAnalysisSections: Record<string, BusinessSection> = {
  'executive-summary': {
    id: 'executive-summary',
    name: 'Executive Summary',
    icon: '📋',
    description: 'High-level overview for stakeholders',
    detailedDescription: 'Comprehensive executive summary including business case, key objectives, expected outcomes, and strategic alignment.',
    bestFor: [
      'C-level presentations',
      'Board meetings',
      'Investor pitches',
      'Strategic planning sessions'
    ],
    outputSections: [
      'Business Case Overview',
      'Strategic Alignment',
      'Key Objectives',
      'Expected ROI',
      'Executive Recommendations'
    ],
    prompt: `As a Senior Business Analyst, create a comprehensive Executive Summary.

Project Description: {{input}}

Generate a detailed Executive Summary including:

## 1. Executive Overview
- **Project Title**: [Clear, descriptive name]
- **Business Opportunity**: [Problem being solved]
- **Proposed Solution**: [High-level solution approach]
- **Strategic Value**: [Alignment with business goals]

## 2. Business Case
### Problem Statement
- Current state challenges
- Market opportunity
- Competitive landscape
- Cost of inaction

### Solution Overview
- Proposed approach
- Key differentiators
- Innovation aspects
- Competitive advantages

## 3. Strategic Alignment
- Corporate strategy alignment
- Division/department goals
- Digital transformation initiatives
- Market positioning

## 4. Key Benefits
### Quantifiable Benefits
- Revenue impact
- Cost savings
- Efficiency gains
- Market share growth

### Qualitative Benefits
- Customer satisfaction
- Brand enhancement
- Employee productivity
- Innovation capability

## 5. Investment Summary
- Total investment required
- Phased funding approach
- Resource requirements
- Timeline to value

## 6. Risk Summary
- Top 3-5 risks
- Mitigation strategies
- Risk tolerance assessment
- Contingency plans

## 7. Success Metrics
- Key Performance Indicators
- Success criteria
- Measurement approach
- Reporting cadence

## 8. Recommendations
- Go/No-go recommendation
- Implementation approach
- Quick wins
- Long-term vision

## 9. Next Steps
- Immediate actions
- Stakeholder approvals needed
- Resource mobilization
- Timeline milestones

Format as a professional executive briefing document.`
  },

  'requirements': {
    id: 'requirements',
    name: 'Requirements Analysis',
    icon: '📝',
    description: 'Detailed business requirements',
    detailedDescription: 'Comprehensive requirements documentation including functional, non-functional, and business rules.',
    bestFor: [
      'Detailed project planning',
      'Development team handoff',
      'Vendor RFPs',
      'Compliance documentation'
    ],
    outputSections: [
      'Functional Requirements',
      'Non-functional Requirements',
      'Business Rules',
      'Acceptance Criteria',
      'Requirements Traceability'
    ],
    prompt: `As a Senior Business Analyst, create a comprehensive Requirements Analysis document.

Project Description: {{input}}

Generate detailed Requirements Analysis including:

## 1. Requirements Overview
- **Scope Statement**: [Clear boundaries]
- **Requirements Approach**: [Methodology used]
- **Assumptions**: [Key assumptions]
- **Constraints**: [Known limitations]

## 2. Functional Requirements
### Core Functionality
For each requirement:
- **ID**: [REQ-XXX]
- **Category**: [User Management/Data/Process/etc.]
- **Description**: [Detailed requirement]
- **Priority**: [Must Have/Should Have/Nice to Have]
- **Acceptance Criteria**: [Measurable criteria]
- **Dependencies**: [Related requirements]

### User Stories
For each story:
- **As a** [user type]
- **I want to** [action/feature]
- **So that** [business value]
- **Acceptance Criteria**: [Definition of done]

## 3. Non-Functional Requirements
### Performance Requirements
- Response time expectations
- Throughput requirements
- Scalability needs
- Load capacity

### Security Requirements
- Authentication requirements
- Authorization levels
- Data protection needs
- Compliance requirements

### Usability Requirements
- User experience standards
- Accessibility requirements
- Device compatibility
- Localization needs

### Reliability Requirements
- Availability targets
- Recovery objectives
- Data integrity
- Fault tolerance

## 4. Business Rules
### Operational Rules
- Business logic
- Calculation formulas
- Validation rules
- Workflow rules

### Compliance Rules
- Regulatory requirements
- Industry standards
- Internal policies
- Audit requirements

## 5. Data Requirements
- Data entities
- Data relationships
- Data quality rules
- Data retention policies

## 6. Interface Requirements
- System integrations
- API requirements
- File transfers
- Real-time data needs

## 7. Requirements Traceability
- Source of requirement
- Business objective mapping
- Test case linkage
- Implementation tracking

## 8. Acceptance Criteria
- Overall acceptance criteria
- Testing approach
- Sign-off process
- Success metrics

Format as a professional requirements specification document.`
  },

  'stakeholder-analysis': {
    id: 'stakeholder-analysis',
    name: 'Stakeholder Analysis',
    icon: '👥',
    description: 'Stakeholder mapping and concerns',
    detailedDescription: 'Comprehensive stakeholder analysis including identification, influence mapping, engagement strategies, and communication plans.',
    bestFor: [
      'Change management planning',
      'Communication strategy',
      'Risk mitigation',
      'Project governance'
    ],
    outputSections: [
      'Stakeholder Identification',
      'Influence/Interest Matrix',
      'Engagement Strategy',
      'Communication Plan',
      'RACI Matrix'
    ],
    prompt: `As a Senior Business Analyst, create a comprehensive Stakeholder Analysis.

Project Description: {{input}}

Generate detailed Stakeholder Analysis including:

## 1. Stakeholder Identification
### Internal Stakeholders
For each stakeholder group:
- **Name/Role**: [Title and department]
- **Interest**: [What they care about]
- **Influence**: [High/Medium/Low]
- **Impact**: [How project affects them]
- **Current Attitude**: [Champion/Supporter/Neutral/Skeptic/Opponent]

### External Stakeholders
- Customers/Users
- Partners/Vendors
- Regulators
- Industry groups
- Community

## 2. Stakeholder Matrix
### Power/Interest Grid
- **High Power, High Interest**: [Manage Closely]
- **High Power, Low Interest**: [Keep Satisfied]
- **Low Power, High Interest**: [Keep Informed]
- **Low Power, Low Interest**: [Monitor]

## 3. Stakeholder Profiles
For key stakeholders:
### [Stakeholder Name]
- **Role**: [Position/Title]
- **Interests**: [Primary concerns]
- **Influence Level**: [Decision maker/Influencer/User]
- **Success Criteria**: [What success means to them]
- **Concerns/Risks**: [Potential objections]
- **Engagement Approach**: [How to work with them]

## 4. Engagement Strategy
### Engagement Levels
- **Leading**: [Actively driving change]
- **Supporting**: [Actively engaged]
- **Neutral**: [Aware but not engaged]
- **Resistant**: [Against change]
- **Unaware**: [Need to be informed]

### Engagement Actions
For each stakeholder group:
- Current engagement level
- Desired engagement level
- Actions to move engagement
- Timeline for engagement

## 5. Communication Plan
### Communication Matrix
- **Stakeholder**: [Who]
- **Information Needs**: [What]
- **Frequency**: [When]
- **Channel**: [How]
- **Responsible**: [Who delivers]

### Key Messages
- Executive messaging
- Management messaging
- End-user messaging
- External messaging

## 6. RACI Matrix
For major deliverables/decisions:
- **R**esponsible: [Who does the work]
- **A**ccountable: [Who is ultimately accountable]
- **C**onsulted: [Who provides input]
- **I**nformed: [Who needs to know]

## 7. Stakeholder Risks
- Stakeholder-related risks
- Mitigation strategies
- Escalation paths
- Contingency plans

## 8. Success Metrics
- Stakeholder satisfaction metrics
- Engagement measurement
- Communication effectiveness
- Adoption rates

Format as a professional stakeholder management document.`
  },

  'risk-assessment': {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    icon: '⚠️',
    description: 'Risk analysis and mitigation',
    detailedDescription: 'Comprehensive risk assessment including identification, analysis, mitigation strategies, and monitoring plans.',
    bestFor: [
      'Risk management planning',
      'Contingency planning',
      'Budget planning',
      'Executive decision-making'
    ],
    outputSections: [
      'Risk Identification',
      'Risk Analysis Matrix',
      'Mitigation Strategies',
      'Contingency Plans',
      'Risk Monitoring'
    ],
    prompt: `As a Senior Business Analyst, create a comprehensive Risk Assessment.

Project Description: {{input}}

Generate detailed Risk Assessment including:

## 1. Risk Assessment Overview
- **Assessment Scope**: [What's included]
- **Risk Appetite**: [Organization's tolerance]
- **Assessment Methodology**: [Approach used]
- **Risk Categories**: [Types of risks considered]

## 2. Risk Identification
### Business Risks
For each risk:
- **Risk ID**: [RISK-XXX]
- **Risk Name**: [Short descriptive name]
- **Category**: [Strategic/Operational/Financial/Compliance]
- **Description**: [Detailed description]
- **Risk Owner**: [Responsible party]

### Technical Risks
- Technology risks
- Integration risks
- Security risks
- Performance risks

### Project Risks
- Schedule risks
- Resource risks
- Budget risks
- Scope risks

## 3. Risk Analysis
### Risk Matrix
For each identified risk:
- **Probability**: [Very Low/Low/Medium/High/Very High]
- **Impact**: [Negligible/Minor/Moderate/Major/Severe]
- **Risk Score**: [Probability × Impact]
- **Risk Level**: [Low/Medium/High/Critical]

### Impact Analysis
- Financial impact
- Operational impact
- Reputational impact
- Regulatory impact

## 4. Risk Mitigation Strategies
### Mitigation Approaches
For high/critical risks:
- **Avoid**: [Eliminate risk]
- **Reduce**: [Minimize probability/impact]
- **Transfer**: [Insurance/outsourcing]
- **Accept**: [Acknowledge and monitor]

### Mitigation Plans
For each risk:
- Mitigation strategy
- Specific actions
- Resources required
- Timeline
- Success criteria

## 5. Contingency Planning
### Trigger Points
- Early warning indicators
- Escalation thresholds
- Decision points
- Action triggers

### Contingency Actions
- Response procedures
- Recovery plans
- Communication protocols
- Resource allocation

## 6. Risk Monitoring
### Monitoring Framework
- Risk review frequency
- Risk metrics/KPIs
- Reporting structure
- Update procedures

### Risk Dashboard
- Risk heat map
- Trend analysis
- Risk velocity
- Residual risk

## 7. Cost-Benefit Analysis
- Mitigation costs
- Risk exposure value
- ROI of mitigation
- Budget allocation

## 8. Governance
- Risk committee structure
- Approval authorities
- Escalation procedures
- Audit requirements

Format as a professional risk management document.`
  },

  'roi-analysis': {
    id: 'roi-analysis',
    name: 'ROI Analysis',
    icon: '💰',
    description: 'Return on investment calculations',
    detailedDescription: 'Detailed financial analysis including ROI calculations, cost-benefit analysis, payback period, and financial projections.',
    bestFor: [
      'Investment decisions',
      'Budget approval',
      'Business case development',
      'Financial planning'
    ],
    outputSections: [
      'Financial Summary',
      'Cost Analysis',
      'Benefit Quantification',
      'ROI Calculations',
      'Sensitivity Analysis'
    ],
    prompt: `As a Senior Business Analyst, create a comprehensive ROI Analysis.

Project Description: {{input}}

Generate detailed ROI Analysis including:

## 1. Financial Summary
- **Total Investment**: [Sum of all costs]
- **Total Benefits**: [5-year projection]
- **Net Present Value (NPV)**: [Discounted cash flows]
- **ROI Percentage**: [(Benefits - Costs) / Costs × 100]
- **Payback Period**: [Months to break even]

## 2. Cost Analysis
### Initial Costs (Year 0)
- **Capital Expenditure**
  - Hardware/Infrastructure
  - Software licenses
  - Implementation services
  - Training costs

### Operational Costs (Annual)
- **Recurring Costs**
  - Maintenance/Support
  - Licensing fees
  - Personnel costs
  - Operating expenses

### Hidden Costs
- Change management
- Productivity loss during transition
- Risk mitigation costs
- Opportunity costs

## 3. Benefit Quantification
### Direct Benefits
- **Revenue Increase**
  - New revenue streams
  - Market expansion
  - Customer acquisition
  - Pricing optimization

- **Cost Savings**
  - Process efficiency
  - Resource optimization
  - Automation savings
  - Error reduction

### Indirect Benefits
- Customer satisfaction improvement
- Employee productivity gains
- Competitive advantage
- Risk reduction value

## 4. Financial Projections
### 5-Year Cash Flow
Year-by-year breakdown:
- Investment/Costs
- Benefits realized
- Net cash flow
- Cumulative cash flow
- Discounted cash flow

## 5. ROI Calculations
### Key Metrics
- **Simple ROI**: [(Total Benefits - Total Costs) / Total Costs]
- **NPV**: [Sum of discounted cash flows]
- **IRR**: [Internal Rate of Return]
- **Payback Period**: [Time to recover investment]
- **Total Cost of Ownership (TCO)**: [5-year total]

## 6. Sensitivity Analysis
### Scenario Planning
- **Best Case**: [+20% benefits, -10% costs]
- **Expected Case**: [Base assumptions]
- **Worst Case**: [-20% benefits, +10% costs]

### Key Variables Impact
- Impact of delay in implementation
- Impact of adoption rate changes
- Impact of cost overruns
- Impact of benefit realization timing

## 7. Risk-Adjusted ROI
- Probability-weighted outcomes
- Risk factors consideration
- Confidence intervals
- Monte Carlo simulation results

## 8. Comparison Analysis
### Alternative Options
- Do nothing scenario
- Alternative solution comparison
- Build vs. buy analysis
- Phased vs. big-bang approach

## 9. Recommendations
- Investment recommendation
- Optimal timing
- Funding approach
- Success factors
- Monitoring approach

Format as a professional financial analysis document with clear visualizations.`
  },

  'timeline': {
    id: 'timeline',
    name: 'Timeline & Milestones',
    icon: '📅',
    description: 'Project timeline and key dates',
    detailedDescription: 'Comprehensive project timeline including phases, milestones, dependencies, and critical path analysis.',
    bestFor: [
      'Project planning',
      'Resource allocation',
      'Stakeholder communication',
      'Progress tracking'
    ],
    outputSections: [
      'Project Phases',
      'Key Milestones',
      'Dependencies',
      'Critical Path',
      'Resource Timeline'
    ],
    prompt: `As a Senior Business Analyst, create a comprehensive Timeline & Milestones plan.

Project Description: {{input}}

Generate detailed Timeline & Milestones including:

## 1. Project Timeline Overview
- **Project Start Date**: [Planned start]
- **Project End Date**: [Planned completion]
- **Total Duration**: [Weeks/Months]
- **Key Constraints**: [Fixed dates, dependencies]

## 2. Project Phases
### Phase Breakdown
For each phase:
- **Phase Name**: [Descriptive name]
- **Duration**: [Timeframe]
- **Start Date**: [Planned start]
- **End Date**: [Planned end]
- **Key Deliverables**: [What's produced]
- **Success Criteria**: [Phase completion criteria]

### Phase Details
#### Phase 1: Initiation & Planning
- Duration: [X weeks]
- Activities: [Key activities]
- Deliverables: [Charter, plans, etc.]
- Resources: [Team members needed]

#### Phase 2: Analysis & Design
- Duration: [X weeks]
- Activities: [Requirements, design]
- Deliverables: [Specs, designs]
- Resources: [Analysts, architects]

#### Phase 3: Development & Testing
- Duration: [X weeks]
- Activities: [Build, test]
- Deliverables: [Working system]
- Resources: [Developers, testers]

#### Phase 4: Deployment & Training
- Duration: [X weeks]
- Activities: [Deploy, train]
- Deliverables: [Live system]
- Resources: [Operations, trainers]

## 3. Key Milestones
### Major Milestones
For each milestone:
- **Milestone Name**: [Clear identifier]
- **Target Date**: [Planned date]
- **Dependencies**: [What must complete first]
- **Deliverables**: [What's delivered]
- **Approval Required**: [Sign-off needed]
- **Impact if Missed**: [Consequences]

## 4. Dependencies
### Internal Dependencies
- Task dependencies
- Resource dependencies
- System dependencies
- Data dependencies

### External Dependencies
- Vendor deliverables
- Third-party systems
- Regulatory approvals
- Customer decisions

## 5. Critical Path
### Critical Path Activities
- Activities on critical path
- Duration of each activity
- Float/slack time
- Risk factors

### Path Optimization
- Acceleration opportunities
- Parallel processing options
- Resource augmentation points
- Risk mitigation timing

## 6. Resource Timeline
### Resource Allocation
- Resource requirements by phase
- Peak resource periods
- Resource conflicts
- Optimization opportunities

## 7. Timeline Risks
### Schedule Risks
- Risk factors
- Impact on timeline
- Mitigation strategies
- Buffer allocation

## 8. Monitoring & Control
### Progress Tracking
- Milestone checkpoints
- Progress metrics
- Reporting schedule
- Escalation triggers

### Change Management
- Change control process
- Impact assessment
- Timeline adjustment process
- Communication plan

## 9. Success Metrics
- On-time delivery metrics
- Milestone achievement rate
- Resource utilization
- Schedule variance

Format as a professional project timeline document with Gantt chart representation.`
  }
}

export const defaultBusinessAnalysisPrompt = businessAnalysisSections['executive-summary'].prompt

export function getBusinessSectionPrompt(sectionId: string): string {
  return businessAnalysisSections[sectionId]?.prompt || defaultBusinessAnalysisPrompt
}

export function getAllBusinessSections(): BusinessSection[] {
  return Object.values(businessAnalysisSections)
}

export function getBusinessSectionById(sectionId: string): BusinessSection | undefined {
  return businessAnalysisSections[sectionId]
}

export function generateCombinedBusinessAnalysis(selectedSections: string[], context: {
  input: string
}): string {
  if (selectedSections.length === 0) {
    return defaultBusinessAnalysisPrompt
  }

  const sections = selectedSections.map(id => businessAnalysisSections[id]).filter(Boolean)
  
  const combinedPrompt = `As a Senior Business Analyst, create a comprehensive business analysis document covering multiple focus areas.

Project Description: {{input}}

Generate a detailed business analysis covering the following areas:

${sections.map((section, index) => `
## Part ${index + 1}: ${section.name}
${section.prompt.split('\n').slice(5).join('\n')}
`).join('\n\n')}

Ensure all sections are cohesive and reference each other where appropriate. Format as a professional business analysis document.`

  return combinedPrompt
}
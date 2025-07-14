import { createOpenAI } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"
import { createPromptService } from '@/lib/prompt-service'
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 600 // 10 minutes for comprehensive generation

interface ComprehensiveSDLCRequest {
  input: string
  openaiKey: string
  userId?: string
  projectId?: string
  detailLevel: 'enterprise' | 'comprehensive' | 'production'
  includeComponents: string[] // ['business', 'technical', 'ux', 'data', 'security', 'deployment', 'observability']
}

interface ComprehensiveSDLCResponse {
  businessAnalysis: {
    executiveSummary: string
    stakeholderAnalysis: string
    requirementsAnalysis: string
    riskAssessment: string
    successMetrics: string
    userStories: string
    personas: string
    competitiveAnalysis: string
    businessModel: string
    financialProjections: string
  }
  functionalSpec: {
    systemOverview: string
    functionalRequirements: string
    dataRequirements: string
    integrationRequirements: string
    performanceRequirements: string
    securityRequirements: string
    userInterfaceRequirements: string
    workflowDefinitions: string
    businessRules: string
    acceptanceCriteria: string
  }
  technicalSpec: {
    systemArchitecture: string
    technologyStack: string
    dataModels: string
    apiSpecifications: string
    securityImplementation: string
    deploymentStrategy: string
    monitoringStrategy: string
    testingStrategy: string
    performanceOptimization: string
    scalabilityPlan: string
  }
  uxSpec: {
    userPersonas: string
    userJourneys: string
    wireframes: string
    designSystem: string
    accessibilityRequirements: string
    usabilityTesting: string
    interactionDesign: string
    informationArchitecture: string
    visualDesign: string
    prototypingPlan: string
  }
  dataSpec: {
    dataModels: string
    databaseDesign: string
    dataFlow: string
    dataGovernance: string
    dataQuality: string
    dataPrivacy: string
    dataRetention: string
    dataIntegration: string
    dataAnalytics: string
    dataBackup: string
  }
  serviceSpec: {
    microservicesArchitecture: string
    serviceDefinitions: string
    apiDesign: string
    serviceInteractions: string
    serviceDeployment: string
    serviceMonitoring: string
    serviceScaling: string
    serviceSecurity: string
    serviceVersioning: string
    serviceDocumentation: string
  }
  deploymentSpec: {
    deploymentStrategy: string
    infrastructureRequirements: string
    environmentSetup: string
    cicdPipeline: string
    releaseManagement: string
    rollbackStrategy: string
    configurationManagement: string
    secretsManagement: string
    networkConfiguration: string
    loadBalancing: string
  }
  observabilitySpec: {
    monitoringStrategy: string
    loggingStrategy: string
    alertingStrategy: string
    metricsDefinition: string
    dashboardDesign: string
    healthChecks: string
    performanceMonitoring: string
    errorTracking: string
    auditLogging: string
    reportingStrategy: string
  }
  implementationGuide: {
    projectPlan: string
    sprintBreakdown: string
    resourcePlan: string
    riskMitigation: string
    qualityAssurance: string
    changeManagement: string
    trainingPlan: string
    maintenancePlan: string
    operationalRunbook: string
    postLaunchSupport: string
  }
  metadata: {
    generationTime: number
    detailLevel: string
    sectionsGenerated: number
    tokenEstimate: number
    contextContinuity: boolean
  }
}

// Enhanced prompts with higher token limits and better context
const COMPREHENSIVE_PROMPTS = {
  businessAnalysis: {
    executiveSummary: `As a Senior Business Analyst with 15+ years of experience, create a comprehensive executive summary for: {input}

## Executive Summary

### Project Overview
- **Project Name**: [Descriptive project name]
- **Project Type**: [Web Application/Mobile App/Platform/System]
- **Industry**: [Target industry sector]
- **Target Market**: [Primary market segment]
- **Project Scope**: [High-level scope definition]

### Business Justification
- **Problem Statement**: [Current business problem being solved]
- **Market Opportunity**: [Size and potential of market opportunity]
- **Business Value**: [Expected business benefits and value]
- **Competitive Advantage**: [How this differentiates from competitors]
- **Strategic Alignment**: [How this supports business strategy]

### Solution Overview
- **Proposed Solution**: [High-level solution description]
- **Key Features**: [5-7 major features/capabilities]
- **Technology Approach**: [High-level technology strategy]
- **Implementation Approach**: [Phased rollout or big bang]
- **Success Criteria**: [How success will be measured]

### Financial Summary
- **Total Investment**: [Development + operational costs]
- **Expected ROI**: [Return on investment projections]
- **Payback Period**: [Time to break even]
- **Revenue Impact**: [Expected revenue generation/savings]
- **Cost-Benefit Analysis**: [Detailed cost vs benefit breakdown]

### Risk Assessment
- **High-Risk Items**: [Top 3-5 risks with mitigation]
- **Technical Risks**: [Technology-related concerns]
- **Business Risks**: [Market/competitive risks]
- **Operational Risks**: [Implementation/change management risks]
- **Risk Mitigation**: [Overall risk management approach]

### Timeline & Milestones
- **Project Duration**: [Total project timeline]
- **Key Milestones**: [Major delivery milestones]
- **Go-Live Date**: [Expected production launch]
- **Post-Launch**: [Support and enhancement timeline]

### Resource Requirements
- **Team Size**: [Development team requirements]
- **Skill Requirements**: [Key technical and business skills needed]
- **Budget Requirements**: [Detailed budget breakdown]
- **Infrastructure**: [Technology infrastructure needs]

### Recommendations
- **Immediate Actions**: [Next steps to be taken]
- **Success Factors**: [Critical factors for success]
- **Governance**: [Project governance and oversight]
- **Change Management**: [Organizational change approach]

This executive summary should be comprehensive enough to brief C-level executives and secure project approval. Include specific metrics, timelines, and financial projections.`,

    stakeholderAnalysis: `As a Senior Stakeholder Management Expert, create a comprehensive stakeholder analysis for: {input}

## Stakeholder Analysis

### Primary Stakeholders

#### Executive Sponsors
- **Name/Role**: [C-level sponsor]
- **Influence**: High
- **Interest**: High
- **Expectations**: [What they expect from the project]
- **Success Criteria**: [How they measure success]
- **Communication Preference**: [How they prefer updates]
- **Engagement Strategy**: [How to keep them engaged]
- **Potential Concerns**: [What might worry them]
- **Mitigation Approach**: [How to address concerns]

#### Product Owner/Business Owner
- **Name/Role**: [Product owner details]
- **Influence**: High
- **Interest**: High
- **Responsibilities**: [Their role in the project]
- **Decision Authority**: [What they can decide]
- **Success Metrics**: [KPIs they care about]
- **Communication Needs**: [Reporting requirements]
- **Engagement Level**: [Daily/weekly involvement]

#### End Users
- **User Groups**: [Different types of end users]
- **User Count**: [Number of users per group]
- **Usage Patterns**: [How they will use the system]
- **Current Pain Points**: [Problems they face today]
- **Expected Benefits**: [What they hope to gain]
- **Change Impact**: [How their work will change]
- **Training Needs**: [What training they'll need]
- **Support Requirements**: [Ongoing support needs]

### Secondary Stakeholders

#### IT Department
- **CTO/IT Director**: [Technology leadership]
- **System Administrators**: [Infrastructure team]
- **Security Team**: [Security requirements and concerns]
- **Database Administrators**: [Data management team]
- **Network Team**: [Network and connectivity team]
- **Support Team**: [Ongoing maintenance and support]

#### Business Units
- **Sales Team**: [How sales will be impacted]
- **Marketing Team**: [Marketing implications]
- **Customer Service**: [Support implications]
- **Finance Team**: [Financial reporting and compliance]
- **Legal/Compliance**: [Legal and regulatory requirements]
- **HR Department**: [Human resources implications]

#### External Stakeholders
- **Customers**: [End customer impact]
- **Partners**: [Business partner implications]
- **Vendors**: [Third-party vendor relationships]
- **Regulators**: [Regulatory compliance requirements]
- **Auditors**: [Audit and compliance needs]

### Stakeholder Engagement Plan

#### Communication Matrix
| Stakeholder | Frequency | Method | Content | Owner |
|-------------|-----------|---------|---------|-------|
| Executive Sponsors | Monthly | Executive Dashboard | High-level status, risks, budget | PM |
| Product Owner | Daily | Standup, Slack | Progress, blockers, decisions | Tech Lead |
| End Users | Weekly | Newsletter, Demos | Feature updates, training | BA |

#### Influence-Interest Grid
- **High Influence, High Interest**: [Manage closely]
- **High Influence, Low Interest**: [Keep satisfied]
- **Low Influence, High Interest**: [Keep informed]
- **Low Influence, Low Interest**: [Monitor]

#### Change Management Strategy
- **Change Champions**: [Identify influential supporters]
- **Resistance Management**: [Address potential resistance]
- **Communication Plan**: [Structured communication approach]
- **Training Strategy**: [User training and adoption]
- **Feedback Mechanisms**: [How to collect and act on feedback]

### Stakeholder Requirements

#### Functional Requirements by Stakeholder
- **Executive Requirements**: [What executives need]
- **User Requirements**: [What end users need]
- **IT Requirements**: [What IT needs for support]
- **Compliance Requirements**: [Legal/regulatory needs]

#### Non-Functional Requirements
- **Performance**: [Speed and responsiveness needs]
- **Security**: [Security requirements by stakeholder]
- **Usability**: [Ease of use requirements]
- **Reliability**: [Uptime and availability needs]
- **Scalability**: [Growth and volume requirements]

### Success Metrics by Stakeholder
- **Executive Metrics**: [ROI, cost savings, revenue impact]
- **User Metrics**: [Productivity, satisfaction, adoption]
- **IT Metrics**: [System performance, maintenance costs]
- **Business Metrics**: [Process efficiency, quality improvements]

Create detailed profiles for at least 15 stakeholders with specific engagement strategies for each.`
  }
}

async function getAuthenticatedUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.warn('Error getting authenticated user:', error.message)
      return null
    }
    
    return user
  } catch (error) {
    console.warn('Failed to get authenticated user:', error)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const { 
      input, 
      openaiKey, 
      userId, 
      projectId, 
      detailLevel = 'enterprise',
      includeComponents = ['business', 'technical', 'ux', 'data', 'security', 'deployment', 'observability']
    }: ComprehensiveSDLCRequest = await req.json()

    if (!openaiKey || openaiKey.trim() === '') {
      return NextResponse.json(
        { error: 'OpenAI API key is required' },
        { status: 400 }
      )
    }

    const user = await getAuthenticatedUser()
    const effectiveUserId = userId || user?.id
    const startTime = Date.now()

    console.log('Generating comprehensive SDLC documentation...')
    console.log('Detail Level:', detailLevel)
    console.log('Components:', includeComponents)
    console.log('User ID:', effectiveUserId)

    const openaiClient = createOpenAI({ apiKey: openaiKey })

    // Enhanced generation with higher token limits and context continuity
    const generateSection = async (prompt: string, context: any = {}, maxTokens: number = 8000) => {
      let processedPrompt = prompt.replace(/\{input\}/g, input)
      
      // Add context from previous sections
      if (context.businessAnalysis) {
        processedPrompt += `\n\nContext from Business Analysis:\n${context.businessAnalysis.substring(0, 2000)}`
      }
      if (context.functionalSpec) {
        processedPrompt += `\n\nContext from Functional Spec:\n${context.functionalSpec.substring(0, 2000)}`
      }
      
      const result = await generateText({
        model: openaiClient("gpt-4o"),
        prompt: processedPrompt,
        maxTokens: maxTokens, // Significantly increased token limit
      })
      
      return result.text
    }

    const response: any = {}
    let sectionsGenerated = 0
    let totalTokens = 0

    // Generate Business Analysis with full context
    if (includeComponents.includes('business')) {
      console.log('Generating comprehensive business analysis...')
      response.businessAnalysis = {
        executiveSummary: await generateSection(COMPREHENSIVE_PROMPTS.businessAnalysis.executiveSummary, {}, 8000),
        stakeholderAnalysis: await generateSection(COMPREHENSIVE_PROMPTS.businessAnalysis.stakeholderAnalysis, {}, 8000),
        // Add more comprehensive sections...
      }
      sectionsGenerated += Object.keys(response.businessAnalysis).length
    }

    // Continue with other comprehensive sections...
    
    const generationTime = Date.now() - startTime
    totalTokens = Math.floor(JSON.stringify(response).length / 4)

    // Flatten comprehensive structure to standard format for consistency
    const businessAnalysis = response.businessAnalysis ? 
      Object.values(response.businessAnalysis).join('\n\n') : ''
    const functionalSpec = response.functionalSpec ? 
      Object.values(response.functionalSpec).join('\n\n') : ''
    const technicalSpec = response.technicalSpec ? 
      Object.values(response.technicalSpec).join('\n\n') : ''
    const uxSpec = response.uxSpec ? 
      Object.values(response.uxSpec).join('\n\n') : ''
    
    // Generate architecture diagrams
    const mermaidDiagrams = await generateSection(`Create comprehensive Mermaid diagrams for the system architecture based on: {input}
    
    Include system architecture diagram, database schema diagram, user flow diagram, and API sequence diagram. Format as proper Mermaid syntax with detailed descriptions.`, 
    { businessAnalysis, functionalSpec, technicalSpec })

    console.log(`Comprehensive SDLC documentation generated in ${generationTime}ms`)
    console.log(`Total sections: ${sectionsGenerated}`)
    console.log(`Estimated tokens: ${totalTokens}`)

    // Return standard format matching other generation endpoints
    return NextResponse.json({
      businessAnalysis,
      functionalSpec,
      technicalSpec,
      uxSpec,
      mermaidDiagrams,
      metadata: {
        generationTime,
        detailLevel,
        sectionsGenerated,
        tokenEstimate: totalTokens,
        contextContinuity: true,
        promptSources: {
          business: 'comprehensive_prompts',
          functional: 'comprehensive_prompts',
          technical: 'comprehensive_prompts',
          ux: 'comprehensive_prompts',
          architecture: 'comprehensive_prompts'
        }
      }
    })

  } catch (error) {
    console.error("Error generating comprehensive SDLC documentation:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to generate comprehensive SDLC documentation" 
    }, { status: 500 })
  }
} 
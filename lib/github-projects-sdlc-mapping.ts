// SDLC Document to GitHub Projects Mapping Service
// Transforms comprehensive SDLC documentation into GitHub Projects structure

import { GitHubProjectsService } from './github-projects-service'

// ============================================================================
// SDLC Document Interfaces (extended from github-projects-service)
// ============================================================================

interface SDLCSection {
  [key: string]: string
}

interface ComprehensiveSDLCDocument {
  businessAnalysis: SDLCSection
  functionalSpec: SDLCSection
  technicalSpec: SDLCSection
  uxSpec?: SDLCSection
  dataSpec?: SDLCSection
  serviceSpec?: SDLCSection
  deploymentSpec?: SDLCSection
  observabilitySpec?: SDLCSection
  implementationGuide?: SDLCSection
  metadata?: {
    generationTime: number
    detailLevel: string
    sectionsGenerated: number
    tokenEstimate: number
    contextContinuity: boolean
  }
}

// ============================================================================
// GitHub Projects Mapping Interfaces
// ============================================================================

interface ProjectStructure {
  project: {
    title: string
    description: string
    public: boolean
  }
  epics: Epic[]
  milestones: ProjectMilestone[]
  issues: ProjectIssue[]
  fields: ProjectField[]
  labels: ProjectLabel[]
}

interface Epic {
  name: string
  description: string
  color: string
  priority: number
  issues: string[] // Issue titles that belong to this epic
}

interface ProjectMilestone {
  title: string
  description: string
  dueDate?: string
  issues: string[] // Issue titles that belong to this milestone
}

interface ProjectIssue {
  title: string
  body: string
  labels: string[]
  milestone?: string
  assignees?: string[]
  epic: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  storyPoints: number
  acceptanceCriteria: string[]
  dependencies?: string[]
  estimatedHours?: number
}

interface ProjectField {
  name: string
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SINGLE_SELECT' | 'ITERATION'
  options?: Array<{
    name: string
    description?: string
    color?: string
  }>
}

interface ProjectLabel {
  name: string
  description: string
  color: string
}

// ============================================================================
// SDLC to GitHub Projects Mapping Service
// ============================================================================

export class SDLCGitHubProjectsMapping {
  private githubService: GitHubProjectsService

  constructor(githubService: GitHubProjectsService) {
    this.githubService = githubService
  }

  // ============================================================================
  // Main Mapping Method
  // ============================================================================

  async mapSDLCToGitHubProject(
    sdlcDocument: ComprehensiveSDLCDocument,
    projectTitle: string,
    options: {
      includeDetailedIssues?: boolean
      createPhaseBasedMilestones?: boolean
      generateLabels?: boolean
      estimateStoryPoints?: boolean
    } = {}
  ): Promise<ProjectStructure> {
    const {
      includeDetailedIssues = true,
      createPhaseBasedMilestones = true,
      generateLabels = true,
      estimateStoryPoints = true
    } = options

    // Create project structure
    const projectStructure: ProjectStructure = {
      project: {
        title: projectTitle,
        description: this.generateProjectDescription(sdlcDocument),
        public: false
      },
      epics: this.generateEpics(sdlcDocument),
      milestones: createPhaseBasedMilestones ? this.generateMilestones(sdlcDocument) : [],
      issues: includeDetailedIssues ? this.generateIssues(sdlcDocument, estimateStoryPoints) : [],
      fields: this.generateFields(),
      labels: generateLabels ? this.generateLabels(sdlcDocument) : []
    }

    return projectStructure
  }

  // ============================================================================
  // Project Description Generation
  // ============================================================================

  private generateProjectDescription(sdlcDocument: ComprehensiveSDLCDocument): string {
    const metadata = sdlcDocument.metadata
    const sectionsCount = this.countSections(sdlcDocument)

    return `# SDLC Project

**Generated**: ${new Date().toISOString()}
**Sections**: ${metadata?.sectionsGenerated || sectionsCount}
**Detail Level**: ${metadata?.detailLevel || 'Comprehensive'}
**Token Estimate**: ${metadata?.tokenEstimate || 'N/A'}

## Overview
This project contains a comprehensive breakdown of the SDLC process with detailed issues, milestones, and tracking for:

### Documentation Sections
- **Business Analysis**: ${Object.keys(sdlcDocument.businessAnalysis).length} sections
- **Functional Specification**: ${Object.keys(sdlcDocument.functionalSpec).length} sections  
- **Technical Specification**: ${Object.keys(sdlcDocument.technicalSpec).length} sections
${sdlcDocument.uxSpec ? `- **UX Specification**: ${Object.keys(sdlcDocument.uxSpec).length} sections` : ''}
${sdlcDocument.dataSpec ? `- **Data Specification**: ${Object.keys(sdlcDocument.dataSpec).length} sections` : ''}
${sdlcDocument.serviceSpec ? `- **Service Specification**: ${Object.keys(sdlcDocument.serviceSpec).length} sections` : ''}
${sdlcDocument.deploymentSpec ? `- **Deployment Specification**: ${Object.keys(sdlcDocument.deploymentSpec).length} sections` : ''}
${sdlcDocument.observabilitySpec ? `- **Observability Specification**: ${Object.keys(sdlcDocument.observabilitySpec).length} sections` : ''}
${sdlcDocument.implementationGuide ? `- **Implementation Guide**: ${Object.keys(sdlcDocument.implementationGuide).length} sections` : ''}

## Project Structure
- **Epics**: Organized by major SDLC phases
- **Milestones**: Phase-based delivery milestones
- **Issues**: Detailed tasks for each section
- **Custom Fields**: Priority, Story Points, Epic mapping, dates

## Getting Started
1. Review the epics and milestones
2. Assign team members to issues
3. Update issue status as work progresses
4. Use the project board to track overall progress

---
*Auto-generated by SDLC AI Platform*`
  }

  // ============================================================================
  // Epic Generation
  // ============================================================================

  private generateEpics(sdlcDocument: ComprehensiveSDLCDocument): Epic[] {
    const epics: Epic[] = []

    // Business Analysis Epic
    if (sdlcDocument.businessAnalysis) {
      epics.push({
        name: 'Business Analysis',
        description: 'Complete business requirements gathering, stakeholder analysis, and project planning',
        color: 'BLUE',
        priority: 1,
        issues: Object.keys(sdlcDocument.businessAnalysis).map(key => 
          `Business Analysis: ${this.formatSubsectionTitle(key)}`
        )
      })
    }

    // Functional Specification Epic
    if (sdlcDocument.functionalSpec) {
      epics.push({
        name: 'Functional Specification',
        description: 'Define functional requirements, user interfaces, and system workflows',
        color: 'GREEN',
        priority: 2,
        issues: Object.keys(sdlcDocument.functionalSpec).map(key => 
          `Functional Specification: ${this.formatSubsectionTitle(key)}`
        )
      })
    }

    // Technical Architecture Epic
    if (sdlcDocument.technicalSpec) {
      epics.push({
        name: 'Technical Architecture',
        description: 'Design technical architecture, data models, and system specifications',
        color: 'PURPLE',
        priority: 3,
        issues: Object.keys(sdlcDocument.technicalSpec).map(key => 
          `Technical Specification: ${this.formatSubsectionTitle(key)}`
        )
      })
    }

    // UX Design Epic
    if (sdlcDocument.uxSpec) {
      epics.push({
        name: 'UX Design',
        description: 'Create user experience design, wireframes, and design systems',
        color: 'PINK',
        priority: 4,
        issues: Object.keys(sdlcDocument.uxSpec).map(key => 
          `UX Specification: ${this.formatSubsectionTitle(key)}`
        )
      })
    }

    // Data Architecture Epic
    if (sdlcDocument.dataSpec) {
      epics.push({
        name: 'Data Architecture',
        description: 'Design data models, database schemas, and data governance',
        color: 'ORANGE',
        priority: 5,
        issues: Object.keys(sdlcDocument.dataSpec).map(key => 
          `Data Specification: ${this.formatSubsectionTitle(key)}`
        )
      })
    }

    // Service Design Epic
    if (sdlcDocument.serviceSpec) {
      epics.push({
        name: 'Service Design',
        description: 'Design microservices architecture, APIs, and service interactions',
        color: 'RED',
        priority: 6,
        issues: Object.keys(sdlcDocument.serviceSpec).map(key => 
          `Service Specification: ${this.formatSubsectionTitle(key)}`
        )
      })
    }

    // Deployment Epic
    if (sdlcDocument.deploymentSpec) {
      epics.push({
        name: 'Deployment',
        description: 'Setup deployment pipelines, infrastructure, and environment configuration',
        color: 'GRAY',
        priority: 7,
        issues: Object.keys(sdlcDocument.deploymentSpec).map(key => 
          `Deployment Specification: ${this.formatSubsectionTitle(key)}`
        )
      })
    }

    // Observability Epic
    if (sdlcDocument.observabilitySpec) {
      epics.push({
        name: 'Observability',
        description: 'Implement monitoring, logging, alerting, and performance tracking',
        color: 'YELLOW',
        priority: 8,
        issues: Object.keys(sdlcDocument.observabilitySpec).map(key => 
          `Observability Specification: ${this.formatSubsectionTitle(key)}`
        )
      })
    }

    // Implementation Epic
    if (sdlcDocument.implementationGuide) {
      epics.push({
        name: 'Implementation',
        description: 'Execute development sprints, testing, and deployment phases',
        color: 'BLUE',
        priority: 9,
        issues: Object.keys(sdlcDocument.implementationGuide).map(key => 
          `Implementation Guide: ${this.formatSubsectionTitle(key)}`
        )
      })
    }

    return epics
  }

  // ============================================================================
  // Milestone Generation
  // ============================================================================

  private generateMilestones(sdlcDocument: ComprehensiveSDLCDocument): ProjectMilestone[] {
    const milestones: ProjectMilestone[] = []
    const currentDate = new Date()

    // Phase 1: Analysis & Planning (1 month)
    const phase1Date = new Date(currentDate)
    phase1Date.setMonth(phase1Date.getMonth() + 1)
    
    milestones.push({
      title: 'Phase 1: Analysis & Planning',
      description: 'Complete business analysis, requirements gathering, and project planning',
      dueDate: phase1Date.toISOString(),
      issues: [
        ...Object.keys(sdlcDocument.businessAnalysis).map(key => 
          `Business Analysis: ${this.formatSubsectionTitle(key)}`
        )
      ]
    })

    // Phase 2: Design & Architecture (1.5 months)
    const phase2Date = new Date(currentDate)
    phase2Date.setMonth(phase2Date.getMonth() + 2)
    phase2Date.setDate(phase2Date.getDate() + 15)
    
    milestones.push({
      title: 'Phase 2: Design & Architecture',
      description: 'Finalize technical architecture, UX design, and system specifications',
      dueDate: phase2Date.toISOString(),
      issues: [
        ...Object.keys(sdlcDocument.functionalSpec).map(key => 
          `Functional Specification: ${this.formatSubsectionTitle(key)}`
        ),
        ...Object.keys(sdlcDocument.technicalSpec).map(key => 
          `Technical Specification: ${this.formatSubsectionTitle(key)}`
        ),
        ...(sdlcDocument.uxSpec ? Object.keys(sdlcDocument.uxSpec).map(key => 
          `UX Specification: ${this.formatSubsectionTitle(key)}`
        ) : []),
        ...(sdlcDocument.dataSpec ? Object.keys(sdlcDocument.dataSpec).map(key => 
          `Data Specification: ${this.formatSubsectionTitle(key)}`
        ) : [])
      ]
    })

    // Phase 3: Development & Implementation (3 months)
    const phase3Date = new Date(currentDate)
    phase3Date.setMonth(phase3Date.getMonth() + 5)
    phase3Date.setDate(phase3Date.getDate() + 15)
    
    milestones.push({
      title: 'Phase 3: Development & Implementation',
      description: 'Core development, service implementation, and system integration',
      dueDate: phase3Date.toISOString(),
      issues: [
        ...(sdlcDocument.serviceSpec ? Object.keys(sdlcDocument.serviceSpec).map(key => 
          `Service Specification: ${this.formatSubsectionTitle(key)}`
        ) : []),
        ...(sdlcDocument.implementationGuide ? Object.keys(sdlcDocument.implementationGuide).map(key => 
          `Implementation Guide: ${this.formatSubsectionTitle(key)}`
        ) : [])
      ]
    })

    // Phase 4: Testing & Deployment (1 month)
    const phase4Date = new Date(currentDate)
    phase4Date.setMonth(phase4Date.getMonth() + 6)
    phase4Date.setDate(phase4Date.getDate() + 15)
    
    milestones.push({
      title: 'Phase 4: Testing & Deployment',
      description: 'Testing, deployment pipeline setup, and go-live preparation',
      dueDate: phase4Date.toISOString(),
      issues: [
        ...(sdlcDocument.deploymentSpec ? Object.keys(sdlcDocument.deploymentSpec).map(key => 
          `Deployment Specification: ${this.formatSubsectionTitle(key)}`
        ) : []),
        ...(sdlcDocument.observabilitySpec ? Object.keys(sdlcDocument.observabilitySpec).map(key => 
          `Observability Specification: ${this.formatSubsectionTitle(key)}`
        ) : [])
      ]
    })

    return milestones
  }

  // ============================================================================
  // Issue Generation
  // ============================================================================

  private generateIssues(
    sdlcDocument: ComprehensiveSDLCDocument,
    estimateStoryPoints: boolean = true
  ): ProjectIssue[] {
    const issues: ProjectIssue[] = []

    // Generate issues for each section
    const sections = [
      { name: 'Business Analysis', data: sdlcDocument.businessAnalysis },
      { name: 'Functional Specification', data: sdlcDocument.functionalSpec },
      { name: 'Technical Specification', data: sdlcDocument.technicalSpec },
      { name: 'UX Specification', data: sdlcDocument.uxSpec },
      { name: 'Data Specification', data: sdlcDocument.dataSpec },
      { name: 'Service Specification', data: sdlcDocument.serviceSpec },
      { name: 'Deployment Specification', data: sdlcDocument.deploymentSpec },
      { name: 'Observability Specification', data: sdlcDocument.observabilitySpec },
      { name: 'Implementation Guide', data: sdlcDocument.implementationGuide }
    ]

    for (const section of sections) {
      if (section.data) {
        issues.push(...this.generateIssuesForSection(section.name, section.data, estimateStoryPoints))
      }
    }

    return issues
  }

  private generateIssuesForSection(
    sectionName: string,
    sectionData: SDLCSection,
    estimateStoryPoints: boolean
  ): ProjectIssue[] {
    const issues: ProjectIssue[] = []

    // Process only the top-level keys in the section data
    // This ensures we're creating one issue per logical section, not per character
    for (const [key, content] of Object.entries(sectionData)) {
      // Skip if content is not a string or is empty
      if (typeof content !== 'string' || content.trim().length === 0) {
        continue;
      }
      
      // Create a proper issue title
      const title = `${sectionName}: ${this.formatSubsectionTitle(key)}`
      const priority = this.calculatePriority(key, sectionName)
      const storyPoints = estimateStoryPoints ? this.estimateStoryPoints(key, content, sectionName) : 0

      // Add the issue to our list
      issues.push({
        title,
        body: this.generateIssueBody(key, content, sectionName),
        labels: this.generateIssueLabels(sectionName, key),
        milestone: this.getMilestoneForSection(sectionName),
        epic: this.getEpicForSection(sectionName),
        priority,
        storyPoints,
        acceptanceCriteria: this.generateAcceptanceCriteria(key, sectionName),
        dependencies: this.calculateDependencies(key, sectionName),
        estimatedHours: this.estimateHours(storyPoints)
      })
    }

    return issues
  }

  private generateIssueBody(key: string, content: string, sectionName: string): string {
    return `## ${this.formatSubsectionTitle(key)}

${content}

---

### Context
- **Epic**: ${this.getEpicForSection(sectionName)}
- **Section**: ${sectionName}
- **Generated**: ${new Date().toISOString()}
- **Source**: SDLC Documentation Generator

### Definition of Done
- [ ] Content reviewed and validated
- [ ] All requirements captured and documented
- [ ] Stakeholder approval obtained
- [ ] Documentation updated in project repository
- [ ] Acceptance criteria met

### Additional Information
- This issue was auto-generated from comprehensive SDLC documentation
- Review the full document context for complete understanding
- Update issue details as requirements evolve
- Link related issues and dependencies as needed

### Resources
- [ ] Technical documentation review
- [ ] Stakeholder consultation
- [ ] Requirements validation
- [ ] Implementation planning`
  }

  private generateIssueLabels(sectionName: string, key: string): string[] {
    const labels = ['sdlc-generated']
    
    // Add section-based labels
    if (sectionName.includes('Business')) labels.push('business-analysis')
    if (sectionName.includes('Functional')) labels.push('functional-spec')
    if (sectionName.includes('Technical')) labels.push('technical-spec')
    if (sectionName.includes('UX')) labels.push('ux-design')
    if (sectionName.includes('Data')) labels.push('data-architecture')
    if (sectionName.includes('Service')) labels.push('service-design')
    if (sectionName.includes('Deployment')) labels.push('deployment')
    if (sectionName.includes('Observability')) labels.push('observability')
    if (sectionName.includes('Implementation')) labels.push('implementation')

    // Add key-based labels
    if (key.includes('security') || key.includes('Security')) labels.push('security')
    if (key.includes('performance') || key.includes('Performance')) labels.push('performance')
    if (key.includes('testing') || key.includes('Testing')) labels.push('testing')
    if (key.includes('documentation') || key.includes('Documentation')) labels.push('documentation')
    if (key.includes('api') || key.includes('API') || key.includes('Api')) labels.push('api')

    return labels
  }

  private generateAcceptanceCriteria(key: string, sectionName: string): string[] {
    const criteria = [
      'Review and validate the content',
      'Ensure all requirements are captured',
      'Verify alignment with overall project goals',
      'Obtain stakeholder approval',
      'Update documentation as needed'
    ]

    // Add section-specific criteria
    if (sectionName.includes('Business')) {
      criteria.push('Validate business requirements with stakeholders')
      criteria.push('Ensure ROI calculations are accurate')
    }
    
    if (sectionName.includes('Technical')) {
      criteria.push('Review technical feasibility')
      criteria.push('Validate architecture decisions')
    }
    
    if (sectionName.includes('UX')) {
      criteria.push('Conduct user research validation')
      criteria.push('Create design prototypes')
    }

    if (key.includes('security') || key.includes('Security')) {
      criteria.push('Security review and approval')
      criteria.push('Penetration testing plan')
    }

    return criteria
  }

  // ============================================================================
  // Field Generation
  // ============================================================================

  private generateFields(): ProjectField[] {
    return [
      {
        name: 'Status',
        type: 'SINGLE_SELECT',
        options: [
          { name: 'Backlog', description: 'Not started', color: 'GRAY' },
          { name: 'In Progress', description: 'Currently being worked on', color: 'BLUE' },
          { name: 'In Review', description: 'Under review', color: 'YELLOW' },
          { name: 'Done', description: 'Completed', color: 'GREEN' },
          { name: 'Blocked', description: 'Blocked by dependencies', color: 'RED' }
        ]
      },
      {
        name: 'Priority',
        type: 'SINGLE_SELECT',
        options: [
          { name: 'Critical', description: 'Must be completed first', color: 'RED' },
          { name: 'High', description: 'High priority', color: 'ORANGE' },
          { name: 'Medium', description: 'Medium priority', color: 'YELLOW' },
          { name: 'Low', description: 'Low priority', color: 'GREEN' }
        ]
      },
      {
        name: 'Epic',
        type: 'SINGLE_SELECT',
        options: [
          { name: 'Business Analysis', description: 'Business requirements and analysis', color: 'BLUE' },
          { name: 'Functional Specification', description: 'Functional requirements and specs', color: 'GREEN' },
          { name: 'Technical Architecture', description: 'Technical design and architecture', color: 'PURPLE' },
          { name: 'UX Design', description: 'User experience and design', color: 'PINK' },
          { name: 'Data Architecture', description: 'Data modeling and architecture', color: 'ORANGE' },
          { name: 'Service Design', description: 'Service architecture and APIs', color: 'RED' },
          { name: 'Deployment', description: 'Deployment and infrastructure', color: 'GRAY' },
          { name: 'Observability', description: 'Monitoring and observability', color: 'YELLOW' },
          { name: 'Implementation', description: 'Development and implementation', color: 'BLUE' }
        ]
      },
      {
        name: 'Story Points',
        type: 'NUMBER'
      },
      {
        name: 'Estimated Hours',
        type: 'NUMBER'
      },
      {
        name: 'Start Date',
        type: 'DATE'
      },
      {
        name: 'Due Date',
        type: 'DATE'
      },
      {
        name: 'Assignee',
        type: 'TEXT'
      },
      {
        name: 'Sprint',
        type: 'ITERATION'
      }
    ]
  }

  // ============================================================================
  // Label Generation
  // ============================================================================

  private generateLabels(sdlcDocument: ComprehensiveSDLCDocument): ProjectLabel[] {
    const labels: ProjectLabel[] = [
      { name: 'sdlc-generated', description: 'Auto-generated from SDLC documentation', color: 'BLUE' },
      { name: 'business-analysis', description: 'Business analysis and requirements', color: 'GREEN' },
      { name: 'functional-spec', description: 'Functional specification', color: 'YELLOW' },
      { name: 'technical-spec', description: 'Technical specification', color: 'PURPLE' },
      { name: 'ux-design', description: 'User experience design', color: 'PINK' },
      { name: 'data-architecture', description: 'Data architecture and modeling', color: 'ORANGE' },
      { name: 'service-design', description: 'Service design and APIs', color: 'RED' },
      { name: 'deployment', description: 'Deployment and infrastructure', color: 'GRAY' },
      { name: 'observability', description: 'Monitoring and observability', color: 'GRAY' },
      { name: 'implementation', description: 'Development and implementation', color: 'BLUE' },
      { name: 'security', description: 'Security related', color: 'RED' },
      { name: 'performance', description: 'Performance related', color: 'ORANGE' },
      { name: 'testing', description: 'Testing related', color: 'YELLOW' },
      { name: 'documentation', description: 'Documentation related', color: 'BLUE' },
      { name: 'api', description: 'API related', color: 'PURPLE' }
    ]

    return labels
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private formatSubsectionTitle(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  private calculatePriority(key: string, sectionName: string): 'Critical' | 'High' | 'Medium' | 'Low' {
    // Critical priority items
    if (key.includes('executive') || key.includes('Executive') || 
        key.includes('architecture') || key.includes('Architecture') ||
        key.includes('security') || key.includes('Security')) {
      return 'Critical'
    }

    // High priority items
    if (key.includes('requirements') || key.includes('Requirements') ||
        key.includes('system') || key.includes('System') ||
        sectionName.includes('Business') && key.includes('analysis')) {
      return 'High'
    }

    // Medium priority items
    if (key.includes('testing') || key.includes('Testing') ||
        key.includes('documentation') || key.includes('Documentation') ||
        key.includes('monitoring') || key.includes('Monitoring')) {
      return 'Medium'
    }

    // Default to Low
    return 'Low'
  }

  private estimateStoryPoints(key: string, content: string, sectionName: string): number {
    const contentLength = content.length
    const complexity = this.calculateComplexity(key, sectionName)
    
    // Base points on content length
    let points = Math.max(1, Math.ceil(contentLength / 1000))
    
    // Adjust based on complexity
    points *= complexity

    // Cap at reasonable maximum
    return Math.min(points, 13)
  }

  private calculateComplexity(key: string, sectionName: string): number {
    if (key.includes('executive') || key.includes('Executive') || 
        key.includes('architecture') || key.includes('Architecture')) {
      return 2.5
    }

    if (key.includes('requirements') || key.includes('Requirements') ||
        key.includes('system') || key.includes('System')) {
      return 2.0
    }

    if (key.includes('testing') || key.includes('Testing') ||
        key.includes('documentation') || key.includes('Documentation')) {
      return 1.5
    }

    return 1.0
  }

  private estimateHours(storyPoints: number): number {
    // Rough estimate: 1 story point = 4-6 hours
    return storyPoints * 5
  }

  private getMilestoneForSection(sectionName: string): string {
    if (sectionName.includes('Business')) return 'Phase 1: Analysis & Planning'
    if (sectionName.includes('Functional') || sectionName.includes('Technical') || 
        sectionName.includes('UX') || sectionName.includes('Data')) {
      return 'Phase 2: Design & Architecture'
    }
    if (sectionName.includes('Service') || sectionName.includes('Implementation')) {
      return 'Phase 3: Development & Implementation'
    }
    if (sectionName.includes('Deployment') || sectionName.includes('Observability')) {
      return 'Phase 4: Testing & Deployment'
    }
    return 'Phase 1: Analysis & Planning'
  }

  private getEpicForSection(sectionName: string): string {
    if (sectionName.includes('Business')) return 'Business Analysis'
    if (sectionName.includes('Functional')) return 'Functional Specification'
    if (sectionName.includes('Technical')) return 'Technical Architecture'
    if (sectionName.includes('UX')) return 'UX Design'
    if (sectionName.includes('Data')) return 'Data Architecture'
    if (sectionName.includes('Service')) return 'Service Design'
    if (sectionName.includes('Deployment')) return 'Deployment'
    if (sectionName.includes('Observability')) return 'Observability'
    if (sectionName.includes('Implementation')) return 'Implementation'
    return 'Business Analysis'
  }

  private calculateDependencies(key: string, sectionName: string): string[] {
    const dependencies: string[] = []

    // Business Analysis dependencies
    if (sectionName.includes('Functional')) {
      dependencies.push('Business Analysis: Executive Summary')
      dependencies.push('Business Analysis: Requirements Analysis')
    }

    // Technical dependencies
    if (sectionName.includes('Technical')) {
      dependencies.push('Functional Specification: System Overview')
      dependencies.push('Functional Specification: Functional Requirements')
    }

    // Implementation dependencies
    if (sectionName.includes('Implementation')) {
      dependencies.push('Technical Specification: System Architecture')
      dependencies.push('Technical Specification: Technology Stack')
    }

    // Deployment dependencies
    if (sectionName.includes('Deployment')) {
      dependencies.push('Technical Specification: Deployment Strategy')
      dependencies.push('Implementation Guide: Project Plan')
    }

    return dependencies
  }

  private countSections(sdlcDocument: ComprehensiveSDLCDocument): number {
    let count = 0
    
    count += Object.keys(sdlcDocument.businessAnalysis).length
    count += Object.keys(sdlcDocument.functionalSpec).length
    count += Object.keys(sdlcDocument.technicalSpec).length
    
    if (sdlcDocument.uxSpec) count += Object.keys(sdlcDocument.uxSpec).length
    if (sdlcDocument.dataSpec) count += Object.keys(sdlcDocument.dataSpec).length
    if (sdlcDocument.serviceSpec) count += Object.keys(sdlcDocument.serviceSpec).length
    if (sdlcDocument.deploymentSpec) count += Object.keys(sdlcDocument.deploymentSpec).length
    if (sdlcDocument.observabilitySpec) count += Object.keys(sdlcDocument.observabilitySpec).length
    if (sdlcDocument.implementationGuide) count += Object.keys(sdlcDocument.implementationGuide).length
    
    return count
  }

  // ============================================================================
  // Export Methods
  // ============================================================================

  exportMappingConfiguration(): any {
    return {
      epics: this.generateEpics({} as ComprehensiveSDLCDocument),
      fields: this.generateFields(),
      labels: this.generateLabels({} as ComprehensiveSDLCDocument),
      priorityRules: {
        critical: ['executive', 'architecture', 'security'],
        high: ['requirements', 'system', 'analysis'],
        medium: ['testing', 'documentation', 'monitoring'],
        low: ['default']
      },
      complexityMultipliers: {
        executive: 2.5,
        architecture: 2.5,
        requirements: 2.0,
        system: 2.0,
        testing: 1.5,
        documentation: 1.5,
        default: 1.0
      }
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function createSDLCMapping(githubService: GitHubProjectsService): SDLCGitHubProjectsMapping {
  return new SDLCGitHubProjectsMapping(githubService)
}

export function validateSDLCDocument(document: ComprehensiveSDLCDocument): boolean {
  return !!(document.businessAnalysis && 
           document.functionalSpec && 
           document.technicalSpec)
}

export function estimateProjectSize(document: ComprehensiveSDLCDocument): {
  totalSections: number
  estimatedIssues: number
  estimatedStoryPoints: number
  estimatedHours: number
} {
  const mapping = new SDLCGitHubProjectsMapping({} as GitHubProjectsService)
  const issues = mapping['generateIssues'](document, true)
  
  const totalStoryPoints = issues.reduce((sum, issue) => sum + issue.storyPoints, 0)
  const totalHours = issues.reduce((sum, issue) => sum + (issue.estimatedHours || 0), 0)
  
  return {
    totalSections: mapping['countSections'](document),
    estimatedIssues: issues.length,
    estimatedStoryPoints: totalStoryPoints,
    estimatedHours: totalHours
  }
} 
/**
 * Content Parser for SDLC AI-generated content
 * Extracts structured data from AI-generated markdown content
 */

export interface UserStory {
  id: string
  title: string
  description: string
  acceptanceCriteria: string[]
  storyPoints: number
  priority: 'High' | 'Medium' | 'Low'
  dependencies: string[]
  definitionOfDone: string[]
  userType: string
  functionality: string
  benefit: string
}

export interface DevelopmentTask {
  id: string
  title: string
  description: string
  acceptanceCriteria: string[]
  storyPoints: number
  components: string[]
  dependencies: string[]
  definitionOfDone: string[]
  category: 'Backend' | 'Frontend' | 'Infrastructure' | 'Testing'
}

export interface DesignTask {
  id: string
  title: string
  description: string
  deliverables: string[]
  storyPoints: number
  userImpact: string
  dependencies: string[]
  definitionOfDone: string[]
  category: 'Research' | 'Information Architecture' | 'Visual Design' | 'Prototyping'
}

export interface Epic {
  title: string
  description: string
  businessValue: string
  priority: 'High' | 'Medium' | 'Low'
  technicalApproach?: string
  designApproach?: string
  successMetrics?: string[]
}

export interface ParsedContent {
  epic: Epic
  userStories: UserStory[]
  developmentTasks: DevelopmentTask[]
  designTasks: DesignTask[]
}

/**
 * Parse Business Analysis content to extract user stories
 */
export function parseBusinessAnalysis(content: string): { epic: Epic; userStories: UserStory[] } {
  const lines = content.split('\n')
  let epic: Epic = {
    title: '',
    description: '',
    businessValue: '',
    priority: 'Medium'
  }
  const userStories: UserStory[] = []
  
  let currentSection = ''
  let currentStory: Partial<UserStory> = {}
  let storyCounter = 1
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Parse Epic Overview
    if (line.includes('## Epic Overview')) {
      currentSection = 'epic'
      continue
    }
    
    // Parse User Stories section
    if (line.includes('## User Stories')) {
      currentSection = 'stories'
      continue
    }
    
    // Parse Epic details
    if (currentSection === 'epic') {
      if (line.startsWith('- **Epic Title**:')) {
        epic.title = line.replace('- **Epic Title**:', '').trim()
      } else if (line.startsWith('- **Epic Description**:')) {
        epic.description = line.replace('- **Epic Description**:', '').trim()
      } else if (line.startsWith('- **Business Value**:')) {
        epic.businessValue = line.replace('- **Business Value**:', '').trim()
      } else if (line.startsWith('- **Priority**:')) {
        const priority = line.replace('- **Priority**:', '').trim()
        epic.priority = priority.includes('High') ? 'High' : priority.includes('Low') ? 'Low' : 'Medium'
      }
    }
    
    // Parse User Stories
    if (currentSection === 'stories') {
      if (line.startsWith('1. **Story Title**:') || line.startsWith('2. **Story Title**:') || 
          line.startsWith('3. **Story Title**:') || line.startsWith('4. **Story Title**:') ||
          line.startsWith('5. **Story Title**:') || line.startsWith('6. **Story Title**:') ||
          line.startsWith('7. **Story Title**:') || line.startsWith('8. **Story Title**:')) {
        
        // Save previous story if exists
        if (currentStory.title) {
          userStories.push({
            id: `US-${storyCounter.toString().padStart(3, '0')}`,
            title: currentStory.title || '',
            description: currentStory.description || '',
            acceptanceCriteria: currentStory.acceptanceCriteria || [],
            storyPoints: currentStory.storyPoints || 3,
            priority: currentStory.priority || 'Medium',
            dependencies: currentStory.dependencies || [],
            definitionOfDone: currentStory.definitionOfDone || [],
            userType: currentStory.userType || 'User',
            functionality: currentStory.functionality || '',
            benefit: currentStory.benefit || ''
          })
          storyCounter++
        }
        
        // Start new story
        currentStory = {
          title: line.replace(/^\d+\. \*\*Story Title\*\*:/, '').trim()
        }
      } else if (line.startsWith('2. **Story Description**:')) {
        currentStory.description = line.replace('2. **Story Description**:', '').trim()
      } else if (line.startsWith('3. **Acceptance Criteria**:')) {
        // Look ahead for criteria list
        const criteria: string[] = []
        for (let j = i + 1; j < lines.length && lines[j].trim().startsWith('-'); j++) {
          criteria.push(lines[j].trim().replace(/^-\s*/, ''))
        }
        currentStory.acceptanceCriteria = criteria
      } else if (line.startsWith('4. **Story Points**:')) {
        const points = parseInt(line.replace('4. **Story Points**:', '').trim())
        currentStory.storyPoints = isNaN(points) ? 3 : points
      } else if (line.startsWith('5. **Priority**:')) {
        const priority = line.replace('5. **Priority**:', '').trim()
        currentStory.priority = priority.includes('High') ? 'High' : priority.includes('Low') ? 'Low' : 'Medium'
      }
    }
  }
  
  // Save last story
  if (currentStory.title) {
    userStories.push({
      id: `US-${storyCounter.toString().padStart(3, '0')}`,
      title: currentStory.title || '',
      description: currentStory.description || '',
      acceptanceCriteria: currentStory.acceptanceCriteria || [],
      storyPoints: currentStory.storyPoints || 3,
      priority: currentStory.priority || 'Medium',
      dependencies: currentStory.dependencies || [],
      definitionOfDone: currentStory.definitionOfDone || [],
      userType: currentStory.userType || 'User',
      functionality: currentStory.functionality || '',
      benefit: currentStory.benefit || ''
    })
  }
  
  return { epic, userStories }
}

/**
 * Parse Technical Specification content to extract development tasks
 */
export function parseTechnicalSpecification(content: string): { epic: Epic; developmentTasks: DevelopmentTask[] } {
  const lines = content.split('\n')
  let epic: Epic = {
    title: '',
    description: '',
    businessValue: '',
    priority: 'Medium',
    technicalApproach: ''
  }
  const developmentTasks: DevelopmentTask[] = []
  
  let currentSection = ''
  let currentTask: Partial<DevelopmentTask> = {}
  let taskCounter = 1
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Parse Technical Epic
    if (line.includes('## Technical Epic')) {
      currentSection = 'epic'
      continue
    }
    
    // Parse Development Tasks section
    if (line.includes('## Development Tasks')) {
      currentSection = 'tasks'
      continue
    }
    
    // Parse Epic details
    if (currentSection === 'epic') {
      if (line.startsWith('- **Epic Title**:')) {
        epic.title = line.replace('- **Epic Title**:', '').trim()
      } else if (line.startsWith('- **Technical Approach**:')) {
        epic.technicalApproach = line.replace('- **Technical Approach**:', '').trim()
      }
    }
    
    // Parse Development Tasks
    if (currentSection === 'tasks') {
      if (line.startsWith('1. **Task Title**:') || line.startsWith('2. **Task Title**:') || 
          line.startsWith('3. **Task Title**:') || line.startsWith('4. **Task Title**:')) {
        
        // Save previous task if exists
        if (currentTask.title) {
          developmentTasks.push({
            id: `DEV-${taskCounter.toString().padStart(3, '0')}`,
            title: currentTask.title || '',
            description: currentTask.description || '',
            acceptanceCriteria: currentTask.acceptanceCriteria || [],
            storyPoints: currentTask.storyPoints || 5,
            components: currentTask.components || [],
            dependencies: currentTask.dependencies || [],
            definitionOfDone: currentTask.definitionOfDone || [],
            category: currentTask.category || 'Backend'
          })
          taskCounter++
        }
        
        // Start new task
        currentTask = {
          title: line.replace(/^\d+\. \*\*Task Title\*\*:/, '').trim()
        }
      } else if (line.startsWith('2. **Task Description**:')) {
        currentTask.description = line.replace('2. **Task Description**:', '').trim()
      } else if (line.startsWith('4. **Story Points**:')) {
        const points = parseInt(line.replace('4. **Story Points**:', '').trim())
        currentTask.storyPoints = isNaN(points) ? 5 : points
      } else if (line.startsWith('5. **Components**:')) {
        const components = line.replace('5. **Components**:', '').trim().split('/')
        currentTask.components = components.map(c => c.trim())
      }
    }
  }
  
  // Save last task
  if (currentTask.title) {
    developmentTasks.push({
      id: `DEV-${taskCounter.toString().padStart(3, '0')}`,
      title: currentTask.title || '',
      description: currentTask.description || '',
      acceptanceCriteria: currentTask.acceptanceCriteria || [],
      storyPoints: currentTask.storyPoints || 5,
      components: currentTask.components || [],
      dependencies: currentTask.dependencies || [],
      definitionOfDone: currentTask.definitionOfDone || [],
      category: currentTask.category || 'Backend'
    })
  }
  
  return { epic, developmentTasks }
}

/**
 * Parse UX Specification content to extract design tasks
 */
export function parseUXSpecification(content: string): { epic: Epic; designTasks: DesignTask[] } {
  const lines = content.split('\n')
  let epic: Epic = {
    title: '',
    description: '',
    businessValue: '',
    priority: 'Medium',
    designApproach: ''
  }
  const designTasks: DesignTask[] = []
  
  let currentSection = ''
  let currentTask: Partial<DesignTask> = {}
  let taskCounter = 1
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Parse UX Epic
    if (line.includes('## UX Epic')) {
      currentSection = 'epic'
      continue
    }
    
    // Parse Design Tasks section
    if (line.includes('## Design Tasks')) {
      currentSection = 'tasks'
      continue
    }
    
    // Parse Epic details
    if (currentSection === 'epic') {
      if (line.startsWith('- **Epic Title**:')) {
        epic.title = line.replace('- **Epic Title**:', '').trim()
      } else if (line.startsWith('- **Design Approach**:')) {
        epic.designApproach = line.replace('- **Design Approach**:', '').trim()
      }
    }
    
    // Parse Design Tasks
    if (currentSection === 'tasks') {
      if (line.startsWith('1. **Task Title**:') || line.startsWith('2. **Task Title**:') || 
          line.startsWith('3. **Task Title**:') || line.startsWith('4. **Task Title**:')) {
        
        // Save previous task if exists
        if (currentTask.title) {
          designTasks.push({
            id: `DES-${taskCounter.toString().padStart(3, '0')}`,
            title: currentTask.title || '',
            description: currentTask.description || '',
            deliverables: currentTask.deliverables || [],
            storyPoints: currentTask.storyPoints || 3,
            userImpact: currentTask.userImpact || '',
            dependencies: currentTask.dependencies || [],
            definitionOfDone: currentTask.definitionOfDone || [],
            category: currentTask.category || 'Visual Design'
          })
          taskCounter++
        }
        
        // Start new task
        currentTask = {
          title: line.replace(/^\d+\. \*\*Task Title\*\*:/, '').trim()
        }
      } else if (line.startsWith('2. **Task Description**:')) {
        currentTask.description = line.replace('2. **Task Description**:', '').trim()
      } else if (line.startsWith('4. **Story Points**:')) {
        const points = parseInt(line.replace('4. **Story Points**:', '').trim())
        currentTask.storyPoints = isNaN(points) ? 3 : points
      } else if (line.startsWith('5. **User Impact**:')) {
        currentTask.userImpact = line.replace('5. **User Impact**:', '').trim()
      }
    }
  }
  
  // Save last task
  if (currentTask.title) {
    designTasks.push({
      id: `DES-${taskCounter.toString().padStart(3, '0')}`,
      title: currentTask.title || '',
      description: currentTask.description || '',
      deliverables: currentTask.deliverables || [],
      storyPoints: currentTask.storyPoints || 3,
      userImpact: currentTask.userImpact || '',
      dependencies: currentTask.dependencies || [],
      definitionOfDone: currentTask.definitionOfDone || [],
      category: currentTask.category || 'Visual Design'
    })
  }
  
  return { epic, designTasks }
}

/**
 * Parse all SDLC content and return structured data
 */
export function parseSDLCContent(
  businessAnalysis: string,
  functionalSpec: string,
  technicalSpec: string,
  uxSpec: string
): ParsedContent {
  const businessResult = parseBusinessAnalysis(businessAnalysis)
  const technicalResult = parseTechnicalSpecification(technicalSpec)
  const uxResult = parseUXSpecification(uxSpec)
  
  return {
    epic: businessResult.epic,
    userStories: businessResult.userStories,
    developmentTasks: technicalResult.developmentTasks,
    designTasks: uxResult.designTasks
  }
}

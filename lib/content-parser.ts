/**
 * Flexible Content Parser for SDLC AI-generated content
 * Extracts structured data from various AI-generated markdown formats
 * Compatible with comprehensive business analysis documents
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
  epic?: string
  theme?: string
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
  category: 'Backend' | 'Frontend' | 'Infrastructure' | 'Testing' | 'Integration' | 'Security'
  userStoryId?: string
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
  category: 'Research' | 'Information Architecture' | 'Visual Design' | 'Prototyping' | 'User Testing'
  userStoryId?: string
}

export interface BDDScenario {
  id: string
  feature: string
  scenario: string
  given: string[]
  when: string[]
  then: string[]
  userStoryId?: string
}

export interface Epic {
  title: string
  description: string
  businessValue: string
  priority: 'High' | 'Medium' | 'Low'
  technicalApproach?: string
  designApproach?: string
  successMetrics?: string[]
  theme?: string
}

export interface ParsedContent {
  epic: Epic
  userStories: UserStory[]
  developmentTasks: DevelopmentTask[]
  designTasks: DesignTask[]
  bddScenarios: BDDScenario[]
}

/**
 * Utility functions for text processing
 */
class TextUtils {
  static extractFromPattern(text: string, pattern: RegExp): string {
    const match = text.match(pattern);
    return match ? match[1].trim() : '';
  }

  static extractListItems(lines: string[], startIndex: number): string[] {
    const items: string[] = [];
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•')) {
        items.push(line.replace(/^[-*•]\s*/, '').trim());
      } else if (line && !line.startsWith(' ')) {
        break;
      }
    }
    return items;
  }

  static extractStoryPoints(text: string): number {
    const patterns = [
      /story\s*points?\s*:?\s*(\d+)/i,
      /points?\s*:?\s*(\d+)/i,
      /effort\s*:?\s*(\d+)/i,
      /size\s*:?\s*(\d+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const points = parseInt(match[1]);
        return isNaN(points) ? 3 : Math.min(Math.max(points, 1), 21); // Fibonacci scale
      }
    }
    return 3; // Default
  }

  static extractPriority(text: string): 'High' | 'Medium' | 'Low' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('high') || lowerText.includes('critical') || lowerText.includes('urgent')) {
      return 'High';
    } else if (lowerText.includes('low') || lowerText.includes('nice') || lowerText.includes('optional')) {
      return 'Low';
    }
    return 'Medium';
  }

  static parseUserStoryFormat(text: string): { userType: string; functionality: string; benefit: string } {
    // Pattern: As a [user], I want [functionality], so that [benefit]
    const patterns = [
      /as\s+an?\s+([^,]+),\s*i\s+want\s+([^,]+),\s*so\s+that\s+(.+)/i,
      /as\s+a\s+([^,]+),\s*i\s+want\s+([^,]+),\s*so\s+that\s+(.+)/i,
      /as\s+([^,]+),\s*i\s+want\s+([^,]+),\s*so\s+that\s+(.+)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          userType: match[1].trim(),
          functionality: match[2].trim(),
          benefit: match[3].trim()
        };
      }
    }

    return {
      userType: 'User',
      functionality: text,
      benefit: 'Achieve business value'
    };
  }

  static generateId(prefix: string, counter: number): string {
    return `${prefix}-${counter.toString().padStart(3, '0')}`;
  }
}

/**
 * Enhanced parser for comprehensive business analysis documents
 */
export class FlexibleSDLCParser {
  private lines: string[] = [];
  private currentLineIndex = 0;

  /**
   * Parse comprehensive business analysis content
   */
  parseBusinessAnalysis(content: string): { epic: Epic; userStories: UserStory[] } {
    this.lines = content.split('\n');
    this.currentLineIndex = 0;

    const epic = this.extractEpicFromBusinessAnalysis();
    const userStories = this.extractUserStoriesFromBusinessAnalysis();

    return { epic, userStories };
  }

  /**
   * Extract epic information from various sections
   */
  private extractEpicFromBusinessAnalysis(): Epic {
    const epic: Epic = {
      title: '',
      description: '',
      businessValue: '',
      priority: 'Medium',
      successMetrics: []
    };

    // Look for epic information in different sections
    const sections = this.findSections([
      'executive summary',
      'project overview', 
      'epic',
      'business justification',
      'expected outcomes'
    ]);

    // Extract title from various sources
    epic.title = this.extractEpicTitle(sections);
    
    // Extract description
    epic.description = this.extractEpicDescription(sections);
    
    // Extract business value
    epic.businessValue = this.extractBusinessValue(sections);
    
    // Extract success metrics
    epic.successMetrics = this.extractSuccessMetrics(sections);

    return epic;
  }

  private extractEpicTitle(sections: Map<string, number>): string {
    // Try to find title in various formats
    const titlePatterns = [
      /project\s*overview\s*:?\s*(.+)/i,
      /epic\s*title\s*:?\s*(.+)/i,
      /project\s*title\s*:?\s*(.+)/i,
      /system\s*name\s*:?\s*(.+)/i,
      /#\s*(.+)/  // Any H1 heading
    ];

    for (const pattern of titlePatterns) {
      for (const line of this.lines) {
        const match = line.match(pattern);
        if (match && match[1].trim().length > 3) {
          return match[1].trim();
        }
      }
    }

    return 'SDLC Project Epic';
  }

  private extractEpicDescription(sections: Map<string, number>): string {
    const descriptionPatterns = [
      /project\s*description\s*:?\s*(.+)/i,
      /epic\s*description\s*:?\s*(.+)/i,
      /overview\s*:?\s*(.+)/i
    ];

    for (const pattern of descriptionPatterns) {
      for (const line of this.lines) {
        const match = line.match(pattern);
        if (match && match[1].trim().length > 10) {
          return match[1].trim();
        }
      }
    }

    // If no specific description found, use first paragraph after project overview
    const overviewIndex = sections.get('project overview') || sections.get('executive summary');
    if (overviewIndex !== undefined) {
      for (let i = overviewIndex + 1; i < this.lines.length && i < overviewIndex + 10; i++) {
        const line = this.lines[i].trim();
        if (line.length > 50 && !line.startsWith('#') && !line.startsWith('**')) {
          return line;
        }
      }
    }

    return 'Comprehensive SDLC automation and improvement initiative';
  }

  private extractBusinessValue(sections: Map<string, number>): string {
    const valuePatterns = [
      /business\s*value\s*:?\s*(.+)/i,
      /business\s*justification\s*:?\s*(.+)/i,
      /expected\s*benefits\s*:?\s*(.+)/i,
      /roi\s*:?\s*(.+)/i
    ];

    for (const pattern of valuePatterns) {
      for (const line of this.lines) {
        const match = line.match(pattern);
        if (match && match[1].trim().length > 10) {
          return match[1].trim();
        }
      }
    }

    return 'Improve development efficiency and reduce time-to-market';
  }

  private extractSuccessMetrics(sections: Map<string, number>): string[] {
    const metricsSection = sections.get('success metrics') || sections.get('expected outcomes');
    if (metricsSection === undefined) return [];

    const metrics: string[] = [];
    for (let i = metricsSection + 1; i < this.lines.length; i++) {
      const line = this.lines[i].trim();
      if (line.startsWith('#')) break;
      if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•')) {
        metrics.push(line.replace(/^[-*•]\s*/, '').trim());
      }
    }

    return metrics;
  }

  /**
   * Extract user stories from various formats
   */
  private extractUserStoriesFromBusinessAnalysis(): UserStory[] {
    const userStories: UserStory[] = [];
    let storyCounter = 1;

    // Find user stories section
    const storiesStartIndex = this.findUserStoriesSection();
    if (storiesStartIndex === -1) return userStories;

    // Extract stories using multiple patterns
    const storyBlocks = this.extractStoryBlocks(storiesStartIndex);
    
    for (const block of storyBlocks) {
      const story = this.parseStoryBlock(block, storyCounter);
      if (story) {
        userStories.push(story);
        storyCounter++;
      }
    }

    return userStories;
  }

  private findUserStoriesSection(): number {
    const patterns = [
      /user\s*stories/i,
      /stories/i,
      /as\s+a\s+.+i\s+want/i
    ];

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          return i;
        }
      }
    }

    return -1;
  }

  private extractStoryBlocks(startIndex: number): string[][] {
    const blocks: string[][] = [];
    let currentBlock: string[] = [];
    let inStoryBlock = false;

    for (let i = startIndex; i < this.lines.length; i++) {
      const line = this.lines[i].trim();

      // Check if this is a new story
      if (this.isNewStoryStart(line)) {
        if (currentBlock.length > 0) {
          blocks.push([...currentBlock]);
        }
        currentBlock = [line];
        inStoryBlock = true;
      } else if (inStoryBlock) {
        if (line.startsWith('##') || line.startsWith('# ')) {
          // New major section, end story extraction
          if (currentBlock.length > 0) {
            blocks.push([...currentBlock]);
          }
          break;
        } else if (line) {
          currentBlock.push(line);
        }
      }
    }

    if (currentBlock.length > 0) {
      blocks.push(currentBlock);
    }

    return blocks;
  }

  private isNewStoryStart(line: string): boolean {
    const patterns = [
      /^\*\*us\d+/i,
      /^us\d+/i,
      /^\d+\.\s*\*\*story/i,
      /^story\s*\d+/i,
      /^as\s+an?\s+/i,
      /^\*\*story\s*title\*\*/i,
      /^user\s*story\s*\d+/i
    ];

    return patterns.some(pattern => pattern.test(line));
  }

  private parseStoryBlock(block: string[], counter: number): UserStory | null {
    if (block.length === 0) return null;

    const story: Partial<UserStory> = {
      id: TextUtils.generateId('US', counter),
      acceptanceCriteria: [],
      dependencies: [],
      definitionOfDone: [],
      storyPoints: 3,
      priority: 'Medium'
    };

    // Parse the story block
    for (let i = 0; i < block.length; i++) {
      const line = block[i];

      // Extract title
      if (!story.title) {
        story.title = this.extractStoryTitle(line);
      }

      // Extract user story format (As a... I want... So that...)
      if (line.toLowerCase().includes('as a') || line.toLowerCase().includes('as an')) {
        const parsed = TextUtils.parseUserStoryFormat(line);
        story.userType = parsed.userType;
        story.functionality = parsed.functionality;
        story.benefit = parsed.benefit;
        if (!story.description) {
          story.description = line;
        }
      }

      // Extract acceptance criteria
      if (line.toLowerCase().includes('acceptance criteria')) {
        story.acceptanceCriteria = this.extractAcceptanceCriteria(block, i);
      }

      // Extract story points
      if (line.toLowerCase().includes('story points') || line.toLowerCase().includes('points')) {
        story.storyPoints = TextUtils.extractStoryPoints(line);
      }

      // Extract priority
      if (line.toLowerCase().includes('priority')) {
        story.priority = TextUtils.extractPriority(line);
      }

      // Extract dependencies
      if (line.toLowerCase().includes('dependencies')) {
        story.dependencies = this.extractDependencies(block, i);
      }
    }

    // Set defaults if not found
    if (!story.title) story.title = `User Story ${counter}`;
    if (!story.description) story.description = story.title;
    if (!story.userType) story.userType = 'User';
    if (!story.functionality) story.functionality = story.title;
    if (!story.benefit) story.benefit = 'Achieve business value';

    return story as UserStory;
  }

  private extractStoryTitle(line: string): string {
    const patterns = [
      /\*\*(.+?)\*\*/,  // **Title**
      /story\s*title\s*:?\s*(.+)/i,
      /title\s*:?\s*(.+)/i,
      /^(.+?)(?:\s*-|\s*:)/,  // Text before dash or colon
      /^(.+)/  // Entire line as fallback
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match && match[1].trim().length > 3) {
        return match[1].trim();
      }
    }

    return line.trim();
  }

  private extractAcceptanceCriteria(block: string[], startIndex: number): string[] {
    const criteria: string[] = [];
    
    for (let i = startIndex + 1; i < block.length; i++) {
      const line = block[i].trim();
      
      if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•')) {
        criteria.push(line.replace(/^[-*•]\s*/, '').trim());
      } else if (line.toLowerCase().includes('given') && line.toLowerCase().includes('when')) {
        // BDD format
        criteria.push(line);
      } else if (criteria.length > 0 && !line) {
        break;
      }
    }

    return criteria;
  }

  private extractDependencies(block: string[], startIndex: number): string[] {
    return TextUtils.extractListItems(block, startIndex + 1);
  }

  /**
   * Find sections in the document
   */
  private findSections(sectionNames: string[]): Map<string, number> {
    const sections = new Map<string, number>();

    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i].toLowerCase().trim();
      
      for (const sectionName of sectionNames) {
        if (line.includes(sectionName)) {
          sections.set(sectionName, i);
        }
      }
    }

    return sections;
  }

  /**
   * Parse BDD scenarios from content
   */
  parseBDDScenarios(content: string): BDDScenario[] {
    const scenarios: BDDScenario[] = [];
    const lines = content.split('\n');
    let scenarioCounter = 1;
    let currentScenario: Partial<BDDScenario> = {};
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('Feature:')) {
        currentScenario.feature = trimmed.replace('Feature:', '').trim();
      } else if (trimmed.startsWith('Scenario:')) {
        // Save previous scenario
        if (currentScenario.scenario) {
          scenarios.push(this.completeBDDScenario(currentScenario, scenarioCounter));
          scenarioCounter++;
        }
        
        // Start new scenario
        currentScenario = {
          id: TextUtils.generateId('BDD', scenarioCounter),
          feature: currentScenario.feature || 'Feature',
          scenario: trimmed.replace('Scenario:', '').trim(),
          given: [],
          when: [],
          then: []
        };
        currentSection = '';
      } else if (trimmed.startsWith('Given')) {
        currentSection = 'given';
        currentScenario.given = currentScenario.given || [];
        currentScenario.given.push(trimmed.replace('Given', '').trim());
      } else if (trimmed.startsWith('When')) {
        currentSection = 'when';
        currentScenario.when = currentScenario.when || [];
        currentScenario.when.push(trimmed.replace('When', '').trim());
      } else if (trimmed.startsWith('Then')) {
        currentSection = 'then';
        currentScenario.then = currentScenario.then || [];
        currentScenario.then.push(trimmed.replace('Then', '').trim());
      } else if (trimmed.startsWith('And') && currentSection) {
        const text = trimmed.replace('And', '').trim();
        if (currentSection === 'given') currentScenario.given?.push(text);
        else if (currentSection === 'when') currentScenario.when?.push(text);
        else if (currentSection === 'then') currentScenario.then?.push(text);
      }
    }

    // Save last scenario
    if (currentScenario.scenario) {
      scenarios.push(this.completeBDDScenario(currentScenario, scenarioCounter));
    }

    return scenarios;
  }

  private completeBDDScenario(scenario: Partial<BDDScenario>, counter: number): BDDScenario {
    return {
      id: scenario.id || TextUtils.generateId('BDD', counter),
      feature: scenario.feature || 'Feature',
      scenario: scenario.scenario || 'Scenario',
      given: scenario.given || [],
      when: scenario.when || [],
      then: scenario.then || []
    };
  }

  /**
   * Parse all SDLC content and return structured data
   */
  parseSDLCContent(
    businessAnalysis: string,
    functionalSpec?: string,
    technicalSpec?: string,
    uxSpec?: string
  ): ParsedContent {
    const businessResult = this.parseBusinessAnalysis(businessAnalysis);
    
    // Extract BDD scenarios from business analysis
    const bddScenarios = this.parseBDDScenarios(businessAnalysis);
    
    // Generate development and design tasks from user stories if specs not provided
    const developmentTasks = technicalSpec ? 
      this.parseTechnicalSpecification(technicalSpec).developmentTasks :
      this.generateDevelopmentTasksFromStories(businessResult.userStories);
      
    const designTasks = uxSpec ?
      this.parseUXSpecification(uxSpec).designTasks :
      this.generateDesignTasksFromStories(businessResult.userStories);

    return {
      epic: businessResult.epic,
      userStories: businessResult.userStories,
      developmentTasks,
      designTasks,
      bddScenarios
    };
  }

  /**
   * Generate development tasks from user stories
   */
  private generateDevelopmentTasksFromStories(userStories: UserStory[]): DevelopmentTask[] {
    const tasks: DevelopmentTask[] = [];
    let taskCounter = 1;

    for (const story of userStories) {
      // Generate backend task
      tasks.push({
        id: TextUtils.generateId('DEV', taskCounter++),
        title: `Backend Implementation: ${story.title}`,
        description: `Implement backend services and APIs for: ${story.description}`,
        acceptanceCriteria: story.acceptanceCriteria,
        storyPoints: Math.ceil(story.storyPoints * 0.6),
        components: ['API', 'Database', 'Services'],
        dependencies: [],
        definitionOfDone: [
          'Unit tests written and passing',
          'API endpoints documented',
          'Code reviewed and approved'
        ],
        category: 'Backend',
        userStoryId: story.id
      });

      // Generate frontend task
      tasks.push({
        id: TextUtils.generateId('DEV', taskCounter++),
        title: `Frontend Implementation: ${story.title}`,
        description: `Implement user interface for: ${story.description}`,
        acceptanceCriteria: story.acceptanceCriteria,
        storyPoints: Math.ceil(story.storyPoints * 0.4),
        components: ['UI Components', 'State Management'],
        dependencies: [],
        definitionOfDone: [
          'UI components implemented',
          'Responsive design verified',
          'Accessibility standards met'
        ],
        category: 'Frontend',
        userStoryId: story.id
      });
    }

    return tasks;
  }

  /**
   * Generate design tasks from user stories
   */
  private generateDesignTasksFromStories(userStories: UserStory[]): DesignTask[] {
    const tasks: DesignTask[] = [];
    let taskCounter = 1;

    for (const story of userStories) {
      tasks.push({
        id: TextUtils.generateId('DES', taskCounter++),
        title: `UX Design: ${story.title}`,
        description: `Design user experience for: ${story.description}`,
        deliverables: ['Wireframes', 'User Flow', 'Visual Design'],
        storyPoints: Math.max(1, Math.ceil(story.storyPoints * 0.3)),
        userImpact: story.benefit,
        dependencies: [],
        definitionOfDone: [
          'User research completed',
          'Wireframes approved',
          'Visual design finalized'
        ],
        category: 'Visual Design',
        userStoryId: story.id
      });
    }

    return tasks;
  }

  /**
   * Legacy method support - parse technical specification
   */
  parseTechnicalSpecification(content: string): { epic: Epic; developmentTasks: DevelopmentTask[] } {
    // Implementation for backward compatibility
    const epic: Epic = {
      title: 'Technical Epic',
      description: 'Technical implementation',
      businessValue: 'Technical excellence',
      priority: 'Medium'
    };

    const developmentTasks: DevelopmentTask[] = [];
    // Add parsing logic for technical specs if needed

    return { epic, developmentTasks };
  }

  /**
   * Legacy method support - parse UX specification
   */
  parseUXSpecification(content: string): { epic: Epic; designTasks: DesignTask[] } {
    // Implementation for backward compatibility
    const epic: Epic = {
      title: 'UX Epic',
      description: 'User experience design',
      businessValue: 'Enhanced user satisfaction',
      priority: 'Medium'
    };

    const designTasks: DesignTask[] = [];
    // Add parsing logic for UX specs if needed

    return { epic, designTasks };
  }
}

/**
 * Factory function for easy usage
 */
export function parseSDLCContent(
  businessAnalysis: string,
  functionalSpec?: string,
  technicalSpec?: string,
  uxSpec?: string
): ParsedContent {
  const parser = new FlexibleSDLCParser();
  return parser.parseSDLCContent(businessAnalysis, functionalSpec, technicalSpec, uxSpec);
}

/**
 * Legacy function support for backward compatibility
 */
export function parseBusinessAnalysis(content: string): { epic: Epic; userStories: UserStory[] } {
  const parser = new FlexibleSDLCParser();
  return parser.parseBusinessAnalysis(content);
}

export function parseTechnicalSpecification(content: string): { epic: Epic; developmentTasks: DevelopmentTask[] } {
  const parser = new FlexibleSDLCParser();
  return parser.parseTechnicalSpecification(content);
}

export function parseUXSpecification(content: string): { epic: Epic; designTasks: DesignTask[] } {
  const parser = new FlexibleSDLCParser();
  return parser.parseUXSpecification(content);
}
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';
import { createServerPromptService } from '@/lib/prompt-service-server';
import { DatabaseService } from '@/lib/database-service';
import { wireframePromptService } from '@/lib/services/wireframe-prompt-service';
import { getV0Service } from '@/lib/services/v0-service';
import { v0UsageService } from '@/lib/services/v0-usage-service';
import type {
  WireframeData,
  GenerateWireframeRequest,
  GenerateWireframeResponse,
  EnhanceWireframeRequest,
  ComponentType,
  WireframeTemplate
} from '@/lib/types/wireframe.types';

export class WireframeService {
  private promptService = createServerPromptService();
  private dbService = new DatabaseService();

  /**
   * Generate a wireframe from a natural language prompt
   */
  async generateWireframe(params: GenerateWireframeRequest & { userId: string }): Promise<GenerateWireframeResponse> {
    const startTime = Date.now();
    
    console.log('🔍 WireframeService: Generating wireframe with model:', params.model);
    
    try {
      // Check if using v0.dev model
      if (params.model === 'v0-dev') {
        console.log('🚀 Using v0.dev for wireframe generation');
        return await this.generateWithV0(params, startTime);
      }

      // Get the appropriate AI client
      const aiClient = this.getAIClient(params.model);
      
      // Build the prompt
      const prompt = await this.buildWireframePrompt(params);
      
      // Generate the wireframe
      const result = await generateText({
        model: aiClient,
        prompt,
        temperature: 0.7,
        maxTokens: 4000,
      });

      // Parse and validate the response
      const wireframeData = this.parseWireframeResponse(result.text, params);
      
      // Log usage if we have a prompt template
      if (params.userId) {
        await this.logUsage(params, result, startTime);
      }

      return {
        success: true,
        wireframe: wireframeData,
        metadata: {
          generationTime: Date.now() - startTime,
          tokensUsed: this.estimateTokens(result.text),
          model: params.model,
        }
      };
    } catch (error) {
      console.error('Error generating wireframe:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate wireframe',
      };
    }
  }

  /**
   * Generate wireframe using v0.dev
   */
  private async generateWithV0(params: GenerateWireframeRequest & { userId: string }, startTime: number): Promise<GenerateWireframeResponse> {
    try {
      // Check v0 usage and get appropriate API key
      const usageCheck = await v0UsageService.checkV0Usage(params.userId);
      
      let v0ApiKey: string | null = null;
      let usingSystemKey = false;

      if (usageCheck.hasOwnKey) {
        // User has their own key
        const userConfig = await this.dbService.getUserConfiguration(params.userId);
        v0ApiKey = userConfig?.v0_api_key || null;
      } else if (usageCheck.canUseSystemKey) {
        // User can use system key
        v0ApiKey = await v0UsageService.getSystemV0ApiKey();
        usingSystemKey = true;
      } else {
        // Cannot use v0.dev
        throw new Error(usageCheck.message || 'Cannot access v0.dev. Please add your API key or try again tomorrow.');
      }

      if (!v0ApiKey) {
        throw new Error('No v0.dev API key available. Please configure your API key in settings.');
      }

      const v0Service = getV0Service(v0ApiKey);
      if (!v0Service) {
        throw new Error('Failed to initialize v0.dev service');
      }

      // Generate wireframe with v0
      const result = await v0Service.generateWireframe({
        prompt: params.prompt,
        apiKey: v0ApiKey,
        layoutType: params.layoutType,
        framework: 'react',
        styling: 'tailwind',
        includeAccessibility: params.includeAnnotations,
        darkMode: false,
      });

      if (!result.success || !result.code) {
        // Check for specific v0.dev subscription errors
        if (result.error && (
          result.error.includes('Premium or Team plan required') ||
          result.error.includes('Forbidden')
        )) {
          throw new Error('v0.dev requires a Premium or Team subscription. Please add your own v0.dev API key with an active subscription in Settings, or select a different model.');
        }
        throw new Error(result.error || 'Failed to generate with v0.dev');
      }

      // Convert v0 component to our wireframe format
      const wireframeData: WireframeData = {
        title: `${params.prompt.slice(0, 50)}...`,
        description: `Generated with v0.dev: ${params.prompt}`,
        layout: {
          type: params.layoutType || 'web',
          dimensions: {
            width: params.layoutType === 'mobile' ? 375 : params.layoutType === 'tablet' ? 768 : 1440,
            height: params.layoutType === 'mobile' ? 812 : params.layoutType === 'tablet' ? 1024 : 900,
          },
        },
        components: [],
        v0Component: {
          code: result.code,
          componentName: result.componentName || 'GeneratedWireframe',
          preview: result.preview,
        },
        metadata: {
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: params.userId,
          aiModel: 'v0-dev',
          prompt: params.prompt,
        },
      };

      // Track usage if using system key
      if (usingSystemKey) {
        await v0UsageService.trackV0Usage(params.userId, params.projectId);
      }

      return {
        success: true,
        wireframe: wireframeData,
        metadata: {
          generationTime: Date.now() - startTime,
          tokensUsed: result.metadata?.tokens,
          model: 'v0-dev',
          usingSystemKey,
          remainingDailyUsage: usingSystemKey ? usageCheck.remainingUsage - 1 : -1,
        }
      };
    } catch (error) {
      console.error('Error generating with v0.dev:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate with v0.dev',
      };
    }
  }

  /**
   * Generate a wireframe with streaming support
   */
  async generateWireframeStream(params: GenerateWireframeRequest & { userId: string }) {
    const aiClient = this.getAIClient(params.model);
    const prompt = await this.buildWireframePrompt(params);
    
    return streamText({
      model: aiClient,
      prompt,
      temperature: 0.7,
      maxTokens: 4000,
    });
  }

  /**
   * Enhance an existing wireframe
   */
  async enhanceWireframe(params: EnhanceWireframeRequest & { userId: string }): Promise<GenerateWireframeResponse> {
    const startTime = Date.now();
    
    try {
      const aiClient = this.getAIClient(params.model);
      const prompt = this.buildEnhancementPrompt(params);
      
      const result = await generateText({
        model: aiClient,
        prompt,
        temperature: 0.8,
        maxTokens: 3000,
      });

      const enhancedWireframe = this.mergeEnhancements(params.wireframe, result.text);
      
      return {
        success: true,
        wireframe: enhancedWireframe,
        metadata: {
          generationTime: Date.now() - startTime,
          tokensUsed: this.estimateTokens(result.text),
          model: params.model,
        }
      };
    } catch (error) {
      console.error('Error enhancing wireframe:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to enhance wireframe',
      };
    }
  }

  /**
   * Get available wireframe templates
   */
  async getTemplates(category?: string): Promise<WireframeTemplate[]> {
    // Get templates from database
    const dbTemplates = await wireframePromptService.getTemplatePrompts();
    
    // Transform database templates to WireframeTemplate format
    const templates: WireframeTemplate[] = dbTemplates.map(dbTemplate => ({
      id: dbTemplate.id,
      name: dbTemplate.name,
      description: dbTemplate.description || '',
      category: dbTemplate.category || 'general',
      promptTemplate: dbTemplate.prompt_template,
      tags: [], // Can be extracted from description or stored separately
    }));
    
    // If no templates in database, fall back to defaults
    if (templates.length === 0) {
      return this.getDefaultTemplates().filter(
        template => !category || template.category === category
      );
    }
    
    return templates.filter(
      template => !category || template.category === category
    );
  }

  /**
   * Get AI client based on model selection
   */
  private getAIClient(model: string) {
    switch (model) {
      case 'gpt-4':
        const openai = createOpenAI({ 
          apiKey: process.env.OPENAI_API_KEY || '' 
        });
        return openai('gpt-4o');
      
      case 'claude-3-opus':
        const anthropicOpus = createAnthropic({ 
          apiKey: process.env.ANTHROPIC_API_KEY || '' 
        });
        return anthropicOpus('claude-3-opus-20240229');
      
      case 'claude-3-sonnet':
        const anthropicSonnet = createAnthropic({ 
          apiKey: process.env.ANTHROPIC_API_KEY || '' 
        });
        return anthropicSonnet('claude-3-sonnet-20240229');
      
      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  }

  /**
   * Build the wireframe generation prompt
   */
  private async buildWireframePrompt(params: GenerateWireframeRequest): Promise<string> {
    // First, try to get prompt from the existing prompt service
    const promptTemplate = await this.promptService.getPromptForExecution(
      'wireframe',
      params.userId || 'anonymous'
    );

    if (promptTemplate) {
      const { processedContent } = await this.promptService.preparePrompt(
        promptTemplate.id,
        {
          user_prompt: params.prompt,
          layout_type: params.layoutType || 'web',
          include_annotations: String(params.includeAnnotations ?? true),
          include_user_flow: String(params.includeUserFlow ?? true),
        }
      );
      return processedContent;
    }

    // Try wireframe-specific prompt service
    let wireframePrompt = null;
    if (params.templateId) {
      // If a specific template is requested, use it
      wireframePrompt = await wireframePromptService.getPromptById(params.templateId);
    } else {
      // Otherwise, get the default prompt
      wireframePrompt = await wireframePromptService.getDefaultPrompt('general');
    }

    if (wireframePrompt) {
      // Process the template with variables
      const processedPrompt = wireframePromptService.processPromptTemplate(
        wireframePrompt.prompt_template,
        {
          user_prompt: params.prompt,
          layout_type: params.layoutType || 'web',
          include_annotations: params.includeAnnotations ?? true,
          include_user_flow: params.includeUserFlow ?? true,
        }
      );
      return processedPrompt;
    }

    // Fallback to hardcoded prompt
    return this.getDefaultPrompt(params);
  }

  /**
   * Get default wireframe generation prompt
   */
  private getDefaultPrompt(params: GenerateWireframeRequest): string {
    const layoutType = params.layoutType || 'web';
    const includeAnnotations = params.includeAnnotations ?? true;
    const includeUserFlow = params.includeUserFlow ?? true;

    return `You are an expert UX designer creating detailed wireframes.

User Request: ${params.prompt}

Create a comprehensive wireframe specification for a ${layoutType} interface with the following requirements:

1. **Layout Structure**:
   - Define the overall layout with appropriate dimensions for ${layoutType}
   - Use a grid system with proper spacing
   - Include responsive breakpoints if applicable

2. **Components**:
   - Create a hierarchical component structure
   - Each component should have:
     - Unique ID
     - Type (from standard UI components)
     - Position and size
     - Content or placeholder text
     - Relevant properties
   - Use semantic component types

3. **Visual Hierarchy**:
   - Establish clear visual hierarchy
   - Group related components
   - Use appropriate spacing and alignment

${includeAnnotations ? `
4. **Annotations**:
   - Add design annotations explaining key decisions
   - Include interaction notes
   - Specify content requirements
   - Note accessibility considerations
` : ''}

${includeUserFlow ? `
5. **User Flow**:
   - Document the primary user flow
   - Include step-by-step actions
   - Note expected results
   - Identify alternative paths
` : ''}

Output the wireframe specification as a valid JSON object following this structure:
{
  "title": "Page/Screen Title",
  "description": "Brief description of the interface",
  "layout": {
    "type": "${layoutType}",
    "dimensions": { "width": number, "height": number },
    "grid": { "columns": number, "gap": number, "padding": number }
  },
  "components": [
    {
      "id": "unique-id",
      "type": "component-type",
      "position": { "x": number, "y": number },
      "size": { "width": number, "height": number },
      "content": "text content or placeholder",
      "properties": { ... },
      "children": [ ... ]
    }
  ],
  "annotations": [
    {
      "id": "annotation-id",
      "componentId": "component-id",
      "type": "design|interaction|content|technical|accessibility",
      "title": "Annotation Title",
      "note": "Detailed explanation"
    }
  ],
  "userFlow": [
    {
      "step": 1,
      "action": "User action",
      "componentId": "component-id",
      "result": "Expected result"
    }
  ]
}

Important guidelines:
- Use realistic dimensions (e.g., 1440x900 for desktop, 375x812 for mobile)
- Components should not overlap unless intentionally layered
- Use standard component types: header, nav, button, input, card, etc.
- Ensure proper parent-child relationships for nested components
- Make the design accessible and user-friendly

Return ONLY the JSON object without any additional text or markdown formatting.`;
  }

  /**
   * Build enhancement prompt
   */
  private buildEnhancementPrompt(params: EnhanceWireframeRequest): string {
    const enhancementPrompts = {
      full: 'Enhance this wireframe with more detailed components, interactions, and polish.',
      accessibility: 'Enhance this wireframe with comprehensive accessibility features including ARIA labels, keyboard navigation, and screen reader support.',
      mobile: 'Optimize this wireframe for mobile devices with touch-friendly interactions and responsive layout.',
      interactions: 'Add detailed interaction specifications including hover states, transitions, and micro-interactions.',
      content: 'Enhance with realistic content, proper information architecture, and content hierarchy.'
    };

    return `You are a UX expert enhancing an existing wireframe.

Current wireframe:
${JSON.stringify(params.wireframe, null, 2)}

Enhancement type: ${params.enhancementType}
${enhancementPrompts[params.enhancementType]}

${params.specificRequirements ? `Additional requirements: ${params.specificRequirements}` : ''}

Return the enhanced wireframe as a JSON object with the same structure but improved based on the enhancement type.`;
  }

  /**
   * Parse AI response into wireframe data
   */
  private parseWireframeResponse(response: string, params: GenerateWireframeRequest): WireframeData {
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedResponse = response
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanedResponse);
      
      // Validate and fix userFlow if present
      if (parsed.userFlow && Array.isArray(parsed.userFlow)) {
        parsed.userFlow = parsed.userFlow.map((flow: any) => ({
          ...flow,
          // Ensure alternativePaths is always an array
          alternativePaths: Array.isArray(flow.alternativePaths) 
            ? flow.alternativePaths 
            : typeof flow.alternativePaths === 'string' 
              ? [flow.alternativePaths]
              : []
        }));
      }
      
      // Add metadata
      const wireframe: WireframeData = {
        ...parsed,
        metadata: {
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: params.userId || 'anonymous',
          aiModel: params.model,
          prompt: params.prompt,
          templateId: params.templateId,
        }
      };

      // Validate required fields
      if (!wireframe.title || !wireframe.components || !wireframe.layout) {
        throw new Error('Invalid wireframe structure');
      }

      return wireframe;
    } catch (error) {
      console.error('Error parsing wireframe response:', error);
      // Return a basic wireframe structure as fallback
      return this.createFallbackWireframe(params.prompt);
    }
  }

  /**
   * Merge enhancement results with original wireframe
   */
  private mergeEnhancements(original: WireframeData, enhancementResponse: string): WireframeData {
    try {
      const enhanced = JSON.parse(
        enhancementResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      );
      
      return {
        ...original,
        ...enhanced,
        metadata: {
          ...original.metadata,
          updatedAt: new Date(),
          version: (original.metadata?.version || 1) + 1,
        }
      };
    } catch (error) {
      console.error('Error merging enhancements:', error);
      return original;
    }
  }

  /**
   * Create a fallback wireframe structure
   */
  private createFallbackWireframe(prompt: string): WireframeData {
    return {
      title: 'Untitled Wireframe',
      description: prompt,
      layout: {
        type: 'web',
        dimensions: { width: 1440, height: 900 },
        grid: { columns: 12, gap: 16, padding: 24 }
      },
      components: [
        {
          id: 'header-1',
          type: 'header',
          position: { x: 0, y: 0 },
          size: { width: '100%', height: 80 },
          properties: {},
          children: []
        },
        {
          id: 'main-1',
          type: 'main',
          position: { x: 0, y: 80 },
          size: { width: '100%', height: 'calc(100% - 80px)' },
          properties: {},
          children: []
        }
      ],
      annotations: [],
      userFlow: []
    };
  }

  /**
   * Estimate token usage
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Log usage to the prompt service
   */
  private async logUsage(params: GenerateWireframeRequest, result: any, startTime: number) {
    // Skip logging if we don't have a valid prompt template ID
    // The logUsage function expects a UUID, not a string like 'wireframe-generation'
    console.log('Wireframe usage logging skipped - no valid prompt template ID available');
  }

  /**
   * Get default templates
   */
  private getDefaultTemplates(): WireframeTemplate[] {
    return [
      {
        id: 'landing-page',
        name: 'Landing Page',
        description: 'Modern landing page with hero section, features, and CTA',
        category: 'marketing',
        promptTemplate: 'Create a landing page wireframe with hero section, feature grid, testimonials, and call-to-action',
        tags: ['landing', 'marketing', 'conversion'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'dashboard',
        name: 'Admin Dashboard',
        description: 'Data-rich admin dashboard with sidebar navigation',
        category: 'application',
        promptTemplate: 'Design an admin dashboard with sidebar navigation, data widgets, charts, and user management section',
        tags: ['dashboard', 'admin', 'data'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'mobile-app',
        name: 'Mobile App',
        description: 'Mobile application with bottom navigation',
        category: 'mobile',
        promptTemplate: 'Create a mobile app wireframe with bottom tab navigation, feed, profile, and settings screens',
        tags: ['mobile', 'app', 'ios', 'android'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'e-commerce',
        name: 'E-commerce Product Page',
        description: 'Product detail page with gallery and purchase options',
        category: 'e-commerce',
        promptTemplate: 'Design an e-commerce product page with image gallery, product details, reviews, and add to cart functionality',
        tags: ['e-commerce', 'product', 'shop'],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'contact-form',
        name: 'Contact Form',
        description: 'Professional contact form with validation',
        category: 'forms',
        promptTemplate: 'Create a contact form wireframe with name, email, subject, message fields, and validation indicators',
        tags: ['form', 'contact', 'lead-generation'],
        isActive: true,
        createdAt: new Date(),
      }
    ];
  }
}

// Export singleton instance
export const wireframeService = new WireframeService();
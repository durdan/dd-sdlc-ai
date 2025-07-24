import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// v0.dev service configuration
const V0_API_BASE = 'https://api.v0.dev';
const V0_MODEL = 'v0-1.5-md'; // Use the model for UI generation

interface V0GenerateOptions {
  prompt: string;
  apiKey: string;
  layoutType?: 'web' | 'mobile' | 'tablet';
  framework?: 'nextjs' | 'react' | 'vue';
  styling?: 'tailwind' | 'css' | 'styled-components';
  includeAccessibility?: boolean;
  darkMode?: boolean;
}

interface V0GenerateResult {
  success: boolean;
  code?: string;
  componentName?: string;
  preview?: string;
  error?: string;
  metadata?: {
    model: string;
    tokens?: number;
    duration?: number;
  };
}

export class V0Service {
  private apiKey: string;
  private client: any;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    // Create v0-compatible client using OpenAI SDK format
    this.client = createOpenAI({
      apiKey: this.apiKey,
      baseURL: 'https://api.v0.dev/v1',
    });
  }

  /**
   * Generate a UI component using v0.dev
   */
  async generateComponent(options: V0GenerateOptions): Promise<V0GenerateResult> {
    try {
      const systemPrompt = this.buildSystemPrompt(options);
      const userPrompt = this.buildUserPrompt(options);

      const startTime = Date.now();

      // Generate component using v0 API
      const { text, usage } = await generateText({
        model: this.client(V0_MODEL),
        system: systemPrompt,
        prompt: userPrompt,
        temperature: 0.7,
        maxTokens: 4000,
      });

      const duration = Date.now() - startTime;

      // Extract component code and metadata
      const componentData = this.parseV0Response(text);

      return {
        success: true,
        code: componentData.code,
        componentName: componentData.componentName,
        preview: componentData.preview,
        metadata: {
          model: V0_MODEL,
          tokens: usage?.totalTokens,
          duration,
        },
      };
    } catch (error: any) {
      console.error('v0.dev generation error:', error);
      
      // Extract specific error messages from the API response
      let errorMessage = 'Failed to generate component';
      
      if (error.responseBody) {
        try {
          const errorData = JSON.parse(error.responseBody);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Generate a complete wireframe with multiple components
   */
  async generateWireframe(options: V0GenerateOptions): Promise<V0GenerateResult> {
    try {
      const wireframePrompt = `Create a complete ${options.layoutType || 'web'} wireframe for: ${options.prompt}

Requirements:
- Generate a full page layout with all necessary sections
- Include navigation, header, main content area, and footer
- Use ${options.styling || 'tailwind'} for styling
- Make it responsive and ${options.layoutType || 'web'}-optimized
- Include proper semantic HTML
${options.includeAccessibility ? '- Add ARIA labels and keyboard navigation' : ''}
${options.darkMode ? '- Include dark mode support' : ''}

Return a complete, working component that can be directly used in a ${options.framework || 'nextjs'} application.`;

      return await this.generateComponent({
        ...options,
        prompt: wireframePrompt,
      });
    } catch (error) {
      console.error('v0.dev wireframe generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate wireframe',
      };
    }
  }

  /**
   * Convert existing wireframe JSON to v0 component
   */
  async convertWireframeToComponent(wireframeData: any, options: Omit<V0GenerateOptions, 'prompt'>): Promise<V0GenerateResult> {
    try {
      const conversionPrompt = `Convert this wireframe specification into a working ${options.framework || 'react'} component:

${JSON.stringify(wireframeData, null, 2)}

Requirements:
- Create a pixel-perfect implementation of the wireframe
- Use ${options.styling || 'tailwind'} for styling
- Respect all component positions, sizes, and properties
- Include all annotations as comments
- Make it fully responsive
${options.includeAccessibility ? '- Add proper ARIA labels and keyboard navigation' : ''}
${options.darkMode ? '- Include dark mode support' : ''}`;

      return await this.generateComponent({
        ...options,
        prompt: conversionPrompt,
      });
    } catch (error) {
      console.error('v0.dev conversion error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to convert wireframe',
      };
    }
  }

  /**
   * Build system prompt for v0 generation
   */
  private buildSystemPrompt(options: V0GenerateOptions): string {
    const framework = options.framework || 'react';
    const styling = options.styling || 'tailwind';

    return `You are an expert UI developer specializing in ${framework} and ${styling}.
You create clean, modern, and accessible user interfaces.
You follow best practices for component structure, naming, and organization.
You write production-ready code that is well-commented and easy to understand.
${options.includeAccessibility ? 'You prioritize accessibility with proper ARIA labels, keyboard navigation, and screen reader support.' : ''}
${options.darkMode ? 'You implement dark mode support using CSS variables or Tailwind dark mode classes.' : ''}

Always return complete, working components that can be directly used in a ${framework} application.
Include all necessary imports and ensure the code is properly formatted.`;
  }

  /**
   * Build user prompt for v0 generation
   */
  private buildUserPrompt(options: V0GenerateOptions): string {
    const layoutType = options.layoutType || 'web';
    const framework = options.framework || 'react';
    const styling = options.styling || 'tailwind';

    return `Create a ${layoutType} UI component using ${framework} and ${styling} based on this description:

${options.prompt}

Make sure the component is:
- Fully responsive for ${layoutType} devices
- Well-structured with semantic HTML
- Styled beautifully using ${styling}
- Production-ready with proper TypeScript types
${options.includeAccessibility ? '- Accessible with ARIA labels and keyboard support' : ''}
${options.darkMode ? '- Dark mode compatible' : ''}`;
  }

  /**
   * Parse v0 API response to extract component data
   */
  private parseV0Response(response: string): {
    code: string;
    componentName: string;
    preview?: string;
  } {
    // v0 typically returns the component code directly
    // Extract component name from the code
    const componentNameMatch = response.match(/(?:export\s+(?:default\s+)?function|const)\s+(\w+)/);
    const componentName = componentNameMatch ? componentNameMatch[1] : 'GeneratedComponent';

    return {
      code: response,
      componentName,
      preview: undefined, // v0 doesn't return preview URLs in the model API
    };
  }

  /**
   * Validate API key
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // Test the API key with a simple request
      const result = await this.generateComponent({
        prompt: 'Create a simple button component',
        apiKey: this.apiKey,
      });
      return result.success;
    } catch (error) {
      console.error('v0 API key validation error:', error);
      return false;
    }
  }
}

// Export singleton instance
let v0ServiceInstance: V0Service | null = null;

export function getV0Service(apiKey?: string): V0Service | null {
  if (!apiKey && !v0ServiceInstance) {
    return null;
  }
  
  if (apiKey) {
    v0ServiceInstance = new V0Service(apiKey);
  }
  
  return v0ServiceInstance;
}
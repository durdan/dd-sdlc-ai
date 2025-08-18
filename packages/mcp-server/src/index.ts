#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  TextContent,
  ImageContent,
  EmbeddedResource,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { z } from 'zod';
import { SDLCService } from './services/sdlc-service.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

// Input schemas for tools
const GenerateDocumentSchema = z.object({
  input: z.string().describe('Project description or requirements'),
  documentType: z.enum([
    'business',
    'functional',
    'technical',
    'ux',
    'architecture',
    'test',
    'meeting',
    'coding'
  ]).describe('Type of document to generate'),
  customPrompt: z.string().optional().describe('Custom prompt to enhance generation'),
  aiProvider: z.enum(['openai', 'anthropic', 'auto']).optional().default('auto'),
  model: z.string().optional().describe('Specific AI model to use'),
});

const GenerateMultipleDocumentsSchema = z.object({
  input: z.string().describe('Project description or requirements'),
  documentTypes: z.array(z.enum([
    'business',
    'functional',
    'technical',
    'ux',
    'architecture',
    'test',
    'meeting',
    'coding'
  ])).describe('Types of documents to generate'),
  customPrompt: z.string().optional(),
  aiProvider: z.enum(['openai', 'anthropic', 'auto']).optional().default('auto'),
});

const ListProjectsSchema = z.object({
  limit: z.number().optional().default(10),
  offset: z.number().optional().default(0),
});

const GetProjectSchema = z.object({
  projectId: z.string().describe('Project ID to retrieve'),
});

const AnalyzeGitHubRepoSchema = z.object({
  repoUrl: z.string().url().describe('GitHub repository URL'),
  branch: z.string().optional().default('main'),
});

// Initialize SDLC service
const sdlcService = new SDLCService({
  apiUrl: process.env.SDLC_API_URL || 'https://sdlc.dev',
  apiKey: process.env.SDLC_API_KEY,
  openAIKey: process.env.OPENAI_API_KEY,
  anthropicKey: process.env.ANTHROPIC_API_KEY,
});

// Create MCP server
const server = new Server(
  {
    name: 'sdlc-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
const tools: Tool[] = [
  {
    name: 'generate_sdlc_document',
    description: 'Generate a single SDLC document (business, functional, technical, UX, architecture, test, meeting, or coding)',
    inputSchema: {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: 'Project description or requirements',
        },
        documentType: {
          type: 'string',
          enum: ['business', 'functional', 'technical', 'ux', 'architecture', 'test', 'meeting', 'coding'],
          description: 'Type of document to generate',
        },
        customPrompt: {
          type: 'string',
          description: 'Custom prompt to enhance generation (optional)',
        },
        aiProvider: {
          type: 'string',
          enum: ['openai', 'anthropic', 'auto'],
          description: 'AI provider to use (optional)',
        },
        model: {
          type: 'string',
          description: 'Specific AI model to use (optional)',
        },
      },
      required: ['input', 'documentType'],
    },
  },
  {
    name: 'generate_multiple_documents',
    description: 'Generate multiple SDLC documents at once',
    inputSchema: {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: 'Project description or requirements',
        },
        documentTypes: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['business', 'functional', 'technical', 'ux', 'architecture', 'test', 'meeting', 'coding'],
          },
          description: 'Types of documents to generate',
        },
        customPrompt: {
          type: 'string',
          description: 'Custom prompt to enhance generation (optional)',
        },
        aiProvider: {
          type: 'string',
          enum: ['openai', 'anthropic', 'auto'],
          description: 'AI provider to use (optional)',
        },
      },
      required: ['input', 'documentTypes'],
    },
  },
  {
    name: 'list_sdlc_projects',
    description: 'List all SDLC projects',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of projects to return (default: 10)',
        },
        offset: {
          type: 'number',
          description: 'Number of projects to skip (default: 0)',
        },
      },
    },
  },
  {
    name: 'get_sdlc_project',
    description: 'Get details of a specific SDLC project including all its documents',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'Project ID to retrieve',
        },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'analyze_github_repo',
    description: 'Analyze a GitHub repository and generate SDLC documentation based on the codebase',
    inputSchema: {
      type: 'object',
      properties: {
        repoUrl: {
          type: 'string',
          description: 'GitHub repository URL',
        },
        branch: {
          type: 'string',
          description: 'Branch to analyze (default: main)',
        },
      },
      required: ['repoUrl'],
    },
  },
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'generate_sdlc_document': {
        const params = GenerateDocumentSchema.parse(args);
        logger.info(`Generating ${params.documentType} document for: ${params.input}`);
        
        const result = await sdlcService.generateDocument(params);
        
        return {
          content: [
            {
              type: 'text',
              text: `# ${params.documentType.toUpperCase()} Document\n\n${result.content}\n\n---\n*Generated for project: ${result.projectId}*`,
            } as TextContent,
          ],
        };
      }

      case 'generate_multiple_documents': {
        const params = GenerateMultipleDocumentsSchema.parse(args);
        logger.info(`Generating ${params.documentTypes.length} documents for: ${params.input}`);
        
        const results = await sdlcService.generateMultipleDocuments(params);
        
        const content: TextContent[] = results.documents.map(doc => ({
          type: 'text',
          text: `# ${doc.type.toUpperCase()} Document\n\n${doc.content}\n\n---\n`,
        }));
        
        return {
          content: [
            ...content,
            {
              type: 'text',
              text: `*Generated ${results.documents.length} documents for project: ${results.projectId}*`,
            } as TextContent,
          ],
        };
      }

      case 'list_sdlc_projects': {
        const params = ListProjectsSchema.parse(args);
        logger.info('Listing SDLC projects');
        
        const projects = await sdlcService.listProjects(params);
        
        const projectList = projects.map(p => 
          `- **${p.title}** (${p.id})\n  Created: ${p.created_at}\n  Documents: ${p.document_count || 0}`
        ).join('\n\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `# SDLC Projects\n\n${projectList || 'No projects found'}`,
            } as TextContent,
          ],
        };
      }

      case 'get_sdlc_project': {
        const params = GetProjectSchema.parse(args);
        logger.info(`Getting project: ${params.projectId}`);
        
        const project = await sdlcService.getProject(params.projectId);
        
        const documents = project.documents?.map(d => 
          `## ${d.type.toUpperCase()}\n\n${d.content}`
        ).join('\n\n---\n\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `# Project: ${project.title}\n\n**ID:** ${project.id}\n**Created:** ${project.created_at}\n\n## Documents\n\n${documents || 'No documents found'}`,
            } as TextContent,
          ],
        };
      }

      case 'analyze_github_repo': {
        const params = AnalyzeGitHubRepoSchema.parse(args);
        logger.info(`Analyzing GitHub repo: ${params.repoUrl}`);
        
        const analysis = await sdlcService.analyzeGitHubRepo(params);
        
        return {
          content: [
            {
              type: 'text',
              text: `# Repository Analysis: ${analysis.repoName}\n\n## Summary\n${analysis.summary}\n\n## Technical Stack\n${analysis.techStack.join(', ')}\n\n## Generated Documentation\n\n${analysis.documents.map(d => `### ${d.type}\n${d.content}`).join('\n\n')}`,
            } as TextContent,
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logger.error(`Error executing tool ${name}:`, error);
    
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        } as TextContent,
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  
  logger.info('Starting SDLC MCP Server...');
  
  await server.connect(transport);
  
  logger.info('SDLC MCP Server is running');
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Shutting down SDLC MCP Server...');
    await server.close();
    process.exit(0);
  });
}

main().catch((error) => {
  logger.error('Failed to start SDLC MCP Server:', error);
  process.exit(1);
});
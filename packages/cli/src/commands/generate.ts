import { Command } from 'commander';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { apiClient } from '../lib/api-client';
import { configStore } from '../lib/simple-config';
import { DOCUMENT_TYPES, GenerateOptions } from '../types/config';
import { formatOutput, saveDocuments } from '../utils/output';

export function generateCommand(): Command {
  const command = new Command('generate');
  
  command
    .description('Generate SDLC documentation')
    .argument('<input>', 'Project description or requirements')
    .option('-t, --type <types...>', 'Document types to generate (business, functional, technical, ux, test, architecture, meeting, coding)')
    .option('-p, --ai-provider <provider>', 'AI provider (openai, anthropic, auto)', 'auto')
    .option('-m, --model <model>', 'Specific AI model to use')
    .option('-o, --output <dir>', 'Output directory', configStore.get('outputDir'))
    .option('-f, --format <format>', 'Output format (markdown, json, pdf, html)', configStore.get('defaultFormat'))
    .option('--custom-prompt <prompt>', 'Custom prompt to enhance generation')
    .option('--project-id <id>', 'Generate for existing project')
    .option('--file <path>', 'Read input from file')
    .option('--fast', 'Use faster generation (may reduce quality)')
    .option('--quality <level>', 'Quality level (low, medium, high)', 'medium')
    .option('--no-cache', 'Disable response caching')
    .option('--parallel', 'Generate documents in parallel')
    .option('--dry-run', 'Preview without generating')
    .option('--ci', 'CI mode (no interactive prompts)')
    .option('--no-stream', 'Disable streaming output')
    .action(async (input: string, options: GenerateOptions) => {
      await handleGenerate(input, options);
    });

  // Sub-commands for specific document types
  DOCUMENT_TYPES.forEach(docType => {
    command
      .command(docType.key)
      .description(`Generate ${docType.name}`)
      .argument('[input]', 'Project description or requirements')
      .option('--file <path>', 'Read input from file')
      .option('-o, --output <dir>', 'Output directory')
      .option('-f, --format <format>', 'Output format')
      .option('--project-id <id>', 'Generate for existing project')
      .action(async (inputArg: string | undefined, opts: any) => {
        const finalInput = inputArg || await readInputFromFile(opts.file);
        await handleGenerate(finalInput, { ...opts, type: [docType.key] });
      });
  });

  return command;
}

async function handleGenerate(input: string, options: GenerateOptions) {
  // Read from file if specified
  if (options.file) {
    input = await readInputFromFile(options.file);
  }

  // Validate input
  if (!input || input.trim().length === 0) {
    console.error(chalk.red('Error: Input is required'));
    process.exit(1);
  }

  // Set document types
  const types = options.type || ['business', 'functional', 'technical', 'ux'];
  
  if (options.dryRun) {
    console.log(chalk.cyan('\n🔍 Dry Run - Preview\n'));
    console.log(chalk.gray('Input:'), input.substring(0, 100) + '...');
    console.log(chalk.gray('Document Types:'), types.join(', '));
    console.log(chalk.gray('AI Provider:'), options.aiProvider);
    console.log(chalk.gray('Output:'), options.output);
    console.log(chalk.gray('Format:'), options.format);
    return;
  }

  console.log(chalk.cyan('\n🚀 SDLC Document Generation\n'));
  console.log(chalk.gray('━'.repeat(50)));
  
  // Check if user is authenticated
  const auth = configStore.get('auth');
  if (!auth?.token) {
    console.log(chalk.yellow('ℹ️  Using anonymous mode - 10 documents per 24 hours'));
    console.log(chalk.gray('   For unlimited access, run: sdlc auth login\n'));
  }

  // Show what we're generating
  console.log(chalk.cyan('📝 Input:'), chalk.white(input.substring(0, 80) + (input.length > 80 ? '...' : '')));
  console.log(chalk.cyan('📄 Documents:'), chalk.white(types.map(t => getDocTypeName(t)).join(', ')));
  console.log(chalk.cyan('⚡ Mode:'), chalk.white(options.stream !== false ? 'Streaming' : 'Standard'));
  console.log();

  const spinners: Map<string, Ora> = new Map();
  const results: Map<string, any> = new Map();

  // Initialize spinners for each document type
  types.forEach(type => {
    const docType = DOCUMENT_TYPES.find(dt => dt.key === type);
    if (docType) {
      const spinner = ora({
        text: `Queued for generation...`,
        prefixText: docType.emoji,
        color: 'cyan'
      });
      spinners.set(type, spinner);
    }
  });

  try {
    // Default to streaming unless explicitly disabled
    if (options.stream !== false) {
      // Stream generation (default)
      await streamGeneration(input, types, options, spinners, results);
    } else {
      // Standard generation (when --no-stream is used)
      await standardGeneration(input, types, options, spinners, results);
    }

    // Save documents
    if (results.size > 0) {
      // Debug: Check what's in results
      if (process.env.DEBUG) {
        results.forEach((value, key) => {
          console.log(`Result for ${key}:`, {
            hasContent: !!value.content,
            contentLength: value.content?.length || 0,
            completed: value.completed
          });
        });
      }
      
      const outputDir = options.output || configStore.get('outputDir');
      const savedFiles = await saveDocuments(results, outputDir, options.format || 'markdown');
      
      console.log(chalk.green(`\n✅ Successfully generated ${results.size} documents`));
      console.log(chalk.gray(`📂 Output: ${outputDir}`));
      
      savedFiles.forEach(file => {
        console.log(chalk.gray(`   📄 ${file}`));
      });

      // Show project link if available
      const projectData = Array.from(results.values())[0];
      if (projectData?.projectId) {
        const apiUrl = configStore.get('apiUrl');
        console.log(chalk.cyan(`\n🔗 View online: ${apiUrl}/projects/${projectData.projectId}`));
      }
      
      // Exit successfully
      process.exit(0);
    }
  } catch (error: any) {
    spinners.forEach(spinner => spinner.fail());
    console.error(chalk.red('\n❌ Generation failed:'), error.message);
    process.exit(1);
  }
}

async function streamGeneration(
  input: string,
  types: string[],
  options: GenerateOptions,
  spinners: Map<string, Ora>,
  results: Map<string, any>
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Start all spinners with initial state
    types.forEach(type => {
      const spinner = spinners.get(type);
      if (spinner) {
        spinner.start();
        spinner.text = `Waiting to start...`;
      }
    });

    // Track progress for each document type
    const progress: Map<string, number> = new Map();
    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout;

    const eventSource = apiClient.generateDocumentsStream(
      input,
      {
        documentTypes: types,
        aiProvider: options.aiProvider,
        model: options.model,
        customPrompt: options.customPrompt,
        quality: options.quality,
        projectId: options.projectId
      },
      (data) => {
        // Handle different event types based on the stream format
        if (data.type === 'start' && data.documentType) {
          const spinner = spinners.get(data.documentType);
          if (spinner) {
            spinner.text = data.message || `Initializing ${getDocTypeName(data.documentType)} generation...`;
          }
        }
        
        if (data.type === 'progress' && data.documentType && data.content) {
          const spinner = spinners.get(data.documentType);
          if (spinner) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const dots = '.'.repeat((Math.floor(Date.now() / 500) % 4));
            spinner.text = `Generating ${getDocTypeName(data.documentType)}${dots} (${elapsed}s)`;
          }
          
          // Store partial results
          const existing = results.get(data.documentType) || { content: '' };
          existing.content = (existing.content || '') + data.content;
          results.set(data.documentType, existing);
          
        }

        if (data.type === 'complete' && data.documentType) {
          const spinner = spinners.get(data.documentType);
          if (spinner) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            spinner.succeed(`${getDocTypeName(data.documentType)} generated successfully (${elapsed}s)`);
          }
          
          // Mark as completed
          const existing = results.get(data.documentType) || { content: '' };
          existing.completed = true;
          results.set(data.documentType, existing);
        }
        
        if (data.type === 'error' && data.documentType) {
          const spinner = spinners.get(data.documentType);
          if (spinner) {
            spinner.fail(`${getDocTypeName(data.documentType)} generation failed: ${data.error}`);
          }
        }
        
        if (data.type === 'done') {
          // All documents completed
          if (data.projectId) {
            console.log(chalk.dim(`\nProject ID: ${data.projectId}`));
          }
          // Clear the timeout since we're done
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          // Call the completion callback
          resolve();
        }


        if (!data.event && data.completed) {
          const spinner = spinners.get(data.completed);
          if (spinner) {
            spinner.succeed(`${getDocTypeName(data.completed)} generated`);
          }
        }
      },
      (error) => {
        console.error('Stream error:', error);
        // Clear timeout on error
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        // Only fail spinners that haven't completed
        spinners.forEach((spinner, type) => {
          if (spinner.isSpinning && !results.get(type)?.completed) {
            spinner.fail(`Failed: ${error}`);
          }
        });
        // Don't reject if we have some results
        if (results.size > 0) {
          resolve();
        } else {
          reject(new Error(error));
        }
      },
      () => {
        // This onComplete callback is no longer used since we handle
        // completion via the 'done' event
      }
    );

    // Handle timeout with better messaging
    timeoutId = setTimeout(() => {
      eventSource.close();
      spinners.forEach(spinner => {
        if (spinner.isSpinning) {
          spinner.fail('Generation timeout - try reducing document types or using --fast option');
        }
      });
      reject(new Error('Generation timeout after 5 minutes'));
    }, 300000); // 5 minutes
  });
}

async function standardGeneration(
  input: string,
  types: string[],
  options: GenerateOptions,
  spinners: Map<string, Ora>,
  results: Map<string, any>
): Promise<void> {
  // Start all spinners with waiting state
  types.forEach(type => {
    const spinner = spinners.get(type);
    if (spinner) {
      spinner.start();
      spinner.text = `Preparing ${getDocTypeName(type)} generation...`;
    }
  });

  const startTime = Date.now();
  
  // Update spinners to show processing
  let intervalId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const dots = '.'.repeat((Math.floor(Date.now() / 500) % 4));
    spinners.forEach((spinner, type) => {
      if (spinner.isSpinning) {
        spinner.text = `Generating ${getDocTypeName(type)}${dots} (${elapsed}s)`;
      }
    });
  }, 500);

  try {
    const response = await apiClient.generateDocuments(input, {
      documentTypes: types,
      aiProvider: options.aiProvider,
      model: options.model,
      customPrompt: options.customPrompt,
      quality: options.quality,
      projectId: options.projectId,
      parallel: options.parallel
    });

    clearInterval(intervalId);

    if (!response.success) {
      throw new Error(response.error || 'Generation failed');
    }

    const totalElapsed = Math.floor((Date.now() - startTime) / 1000);

    // Process results
    types.forEach(type => {
      const spinner = spinners.get(type);
      if (response.data && response.data[type]) {
        results.set(type, response.data[type]);
        spinner?.succeed(`${getDocTypeName(type)} generated successfully (${totalElapsed}s)`);
      } else {
        spinner?.fail(`${getDocTypeName(type)} failed`);
      }
    });
  } catch (error) {
    clearInterval(intervalId);
    throw error;
  }
}

async function readInputFromFile(filePath?: string): Promise<string> {
  if (!filePath) {
    console.error(chalk.red('Error: File path is required when using --file option'));
    process.exit(1);
  }

  try {
    const absolutePath = path.resolve(filePath);
    const content = await fs.readFile(absolutePath, 'utf-8');
    return content;
  } catch (error: any) {
    console.error(chalk.red(`Error reading file: ${error.message}`));
    process.exit(1);
  }
}

function getDocTypeName(type: string): string {
  const docType = DOCUMENT_TYPES.find(dt => dt.key === type);
  return docType?.name || type;
}
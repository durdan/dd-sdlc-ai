import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { DOCUMENT_TYPES } from '../types/config';
import { apiClient } from '../lib/api-client';
import { configStore } from '../lib/simple-config';
import { saveDocuments } from '../utils/output';

export function interactiveCommand(): Command {
  const command = new Command('interactive');
  
  command
    .alias('i')
    .description('Interactive mode for guided document generation')
    .action(async () => {
      await runInteractiveMode();
    });

  return command;
}

async function runInteractiveMode() {
  console.clear();
  console.log(chalk.cyan(`
╔════════════════════════════════════════╗
║                                        ║
║   ${chalk.bold('SDLC Interactive Mode')} 🎯             ║
║   Let's create your documentation!    ║
║                                        ║
╚════════════════════════════════════════╝
  `));

  // Step 1: Project type
  const { projectType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: 'What type of project are you building?',
      choices: [
        { name: '🌐 Web Application', value: 'web' },
        { name: '📱 Mobile Application', value: 'mobile' },
        { name: '🖥️ Desktop Application', value: 'desktop' },
        { name: '🔧 API/Backend Service', value: 'api' },
        { name: '☁️ SaaS Platform', value: 'saas' },
        { name: '🛒 E-commerce Platform', value: 'ecommerce' },
        { name: '🤖 AI/ML Solution', value: 'ai' },
        { name: '🎮 Game', value: 'game' },
        { name: '📊 Data Platform', value: 'data' },
        { name: '🔌 IoT Solution', value: 'iot' },
        { name: '🏢 Enterprise Software', value: 'enterprise' },
        { name: '📝 Other', value: 'other' }
      ]
    }
  ]);

  // Step 2: Project description
  const { description, projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?',
      validate: (input) => input.length > 0 || 'Project name is required'
    },
    {
      type: 'editor',
      name: 'description',
      message: 'Describe your project in detail (press Enter to open editor):',
      validate: (input) => input.length > 10 || 'Please provide a detailed description (at least 10 characters)'
    }
  ]);

  // Step 3: Document selection
  const { documentTypes } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'documentTypes',
      message: 'Select documents to generate:',
      choices: DOCUMENT_TYPES.map(dt => ({
        name: `${dt.emoji} ${dt.name} - ${dt.description}`,
        value: dt.key,
        checked: ['business', 'functional', 'technical', 'ux'].includes(dt.key)
      })),
      validate: (choices) => choices.length > 0 || 'Please select at least one document type'
    }
  ]);

  // Step 4: AI Configuration
  const { aiProvider, quality } = await inquirer.prompt([
    {
      type: 'list',
      name: 'aiProvider',
      message: 'Choose AI provider:',
      choices: [
        { name: '🤖 Auto (Let system choose)', value: 'auto' },
        { name: '🧠 OpenAI GPT-4', value: 'openai' },
        { name: '🎭 Anthropic Claude', value: 'anthropic' }
      ],
      default: 'auto'
    },
    {
      type: 'list',
      name: 'quality',
      message: 'Select generation quality:',
      choices: [
        { name: '⚡ Fast (Lower quality, quicker results)', value: 'low' },
        { name: '⚖️ Balanced (Good quality, moderate speed)', value: 'medium' },
        { name: '💎 High Quality (Best results, slower)', value: 'high' }
      ],
      default: 'medium'
    }
  ]);

  // Step 5: Output configuration
  const { outputFormat, outputDir, saveToProject } = await inquirer.prompt([
    {
      type: 'list',
      name: 'outputFormat',
      message: 'Select output format:',
      choices: [
        { name: '📝 Markdown', value: 'markdown' },
        { name: '📄 JSON', value: 'json' },
        { name: '🌐 HTML', value: 'html' },
        { name: '📑 PDF', value: 'pdf' }
      ],
      default: 'markdown'
    },
    {
      type: 'input',
      name: 'outputDir',
      message: 'Output directory:',
      default: configStore.get('outputDir')
    },
    {
      type: 'confirm',
      name: 'saveToProject',
      message: 'Save as a project for future reference?',
      default: true
    }
  ]);

  // Step 6: Additional options
  const { customPrompt, confirmGeneration } = await inquirer.prompt([
    {
      type: 'input',
      name: 'customPrompt',
      message: 'Any specific requirements or focus areas? (optional):'
    },
    {
      type: 'confirm',
      name: 'confirmGeneration',
      message: chalk.cyan('\nReady to generate your documentation?'),
      default: true
    }
  ]);

  if (!confirmGeneration) {
    console.log(chalk.yellow('\n❌ Generation cancelled'));
    return;
  }

  // Start generation
  console.log(chalk.cyan('\n🚀 Starting Document Generation\n'));
  console.log(chalk.gray('━'.repeat(50)));

  const spinner = ora('Initializing...').start();
  const results = new Map();

  try {
    // Create project if requested
    let projectId: string | undefined;
    if (saveToProject) {
      spinner.text = 'Creating project...';
      const projectResult = await apiClient.createProject(projectName, description);
      if (projectResult.success && projectResult.data) {
        projectId = projectResult.data.id;
        spinner.succeed(`Project created: ${projectId.substring(0, 8)}...`);
      }
    }

    // Generate each document type
    for (const docType of documentTypes) {
      const docInfo = DOCUMENT_TYPES.find(dt => dt.key === docType);
      const docSpinner = ora({
        text: `Generating ${docInfo?.name}...`,
        prefixText: docInfo?.emoji
      }).start();

      try {
        // Simulate API call - in real implementation, call the actual API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        results.set(docType, {
          type: docType,
          content: `# ${docInfo?.name}\n\nGenerated content for ${projectName}...`,
          title: docInfo?.name
        });

        docSpinner.succeed(`${docInfo?.name} generated`);
      } catch (error) {
        docSpinner.fail(`${docInfo?.name} failed`);
      }
    }

    // Save documents
    if (results.size > 0) {
      spinner.start('Saving documents...');
      const savedFiles = await saveDocuments(results, outputDir, outputFormat);
      spinner.succeed('Documents saved');

      console.log(chalk.green(`\n✅ Successfully generated ${results.size} documents`));
      console.log(chalk.gray(`📂 Output: ${outputDir}`));
    }

    // Post-generation options
    const { nextAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'nextAction',
        message: '\nWhat would you like to do next?',
        choices: [
          { name: '👁️ View generated documents', value: 'view' },
          { name: '📤 Export as PDF', value: 'export' },
          { name: '🔄 Generate more documents', value: 'generate' },
          { name: '🌐 Open in browser', value: 'browser' },
          { name: '🚪 Exit', value: 'exit' }
        ]
      }
    ]);

    switch (nextAction) {
      case 'view':
        // Show document preview
        console.log(chalk.cyan('\n📄 Document Preview:\n'));
        const firstDoc = results.values().next().value;
        console.log(firstDoc.content.substring(0, 500) + '...');
        break;
      case 'generate':
        await runInteractiveMode();
        break;
      case 'browser':
        console.log(chalk.cyan(`\n🔗 ${configStore.get('apiUrl')}/projects/${projectId}`));
        break;
    }

  } catch (error: any) {
    spinner.fail('Generation failed');
    console.error(chalk.red(error.message));
    
    const { retry } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'retry',
        message: 'Would you like to try again?',
        default: true
      }
    ]);

    if (retry) {
      await runInteractiveMode();
    }
  }
}

// Quick mode for experienced users
export async function quickMode() {
  const { input } = await inquirer.prompt([
    {
      type: 'input',
      name: 'input',
      message: 'Enter project description:',
      validate: (input) => input.length > 10 || 'Please provide a meaningful description'
    }
  ]);

  const spinner = ora('Generating documents...').start();
  
  try {
    // Quick generation with defaults
    const response = await apiClient.generateDocuments(input, {
      documentTypes: ['business', 'functional', 'technical', 'ux'],
      aiProvider: 'auto',
      quality: 'medium'
    });

    if (response.success) {
      spinner.succeed('Documents generated successfully');
      console.log(chalk.green('\n✅ Generation complete'));
    } else {
      spinner.fail('Generation failed');
      console.error(chalk.red(response.error));
    }
  } catch (error: any) {
    spinner.fail('Generation failed');
    console.error(chalk.red(error.message));
  }
}
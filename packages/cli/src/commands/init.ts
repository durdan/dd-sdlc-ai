import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { configStore } from '../lib/simple-config';
import { login } from '../lib/auth-manager';
import { apiClient } from '../lib/api-client';
import ora from 'ora';

export function initCommand(): Command {
  const command = new Command('init');
  
  command
    .description('Initialize SDLC CLI in your project')
    .option('--global', 'Initialize globally instead of project-specific')
    .action(async (options) => {
      console.log(chalk.cyan('\n🚀 SDLC CLI Setup Wizard\n'));
      console.log(chalk.gray('This wizard will help you configure the SDLC CLI.\n'));

      // Check API connectivity
      const spinner = ora('Checking API connectivity...').start();
      const apiUrl = configStore.get('apiUrl');
      const isHealthy = await apiClient.healthCheck();
      
      if (isHealthy) {
        spinner.succeed('API is reachable');
      } else {
        spinner.warn('API is not reachable');
        
        const { customUrl } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'useCustom',
            message: 'Would you like to configure a custom API URL?',
            default: false
          },
          {
            type: 'input',
            name: 'customUrl',
            message: 'Enter API URL:',
            default: 'http://localhost:3000',
            when: (answers) => answers.useCustom,
            validate: (input) => {
              try {
                new URL(input);
                return true;
              } catch {
                return 'Please enter a valid URL';
              }
            }
          }
        ]);

        if (customUrl) {
          configStore.set('apiUrl', customUrl);
        }
      }

      // Configuration options
      const { aiProvider, outputDir, defaultFormat, createConfig } = await inquirer.prompt([
        {
          type: 'list',
          name: 'aiProvider',
          message: 'Select default AI provider:',
          choices: [
            { name: 'Auto (Let system choose)', value: 'auto' },
            { name: 'OpenAI (GPT-4)', value: 'openai' },
            { name: 'Anthropic (Claude)', value: 'anthropic' }
          ],
          default: 'auto'
        },
        {
          type: 'input',
          name: 'outputDir',
          message: 'Default output directory:',
          default: './sdlc-docs'
        },
        {
          type: 'list',
          name: 'defaultFormat',
          message: 'Default output format:',
          choices: [
            { name: 'Markdown', value: 'markdown' },
            { name: 'JSON', value: 'json' },
            { name: 'PDF', value: 'pdf' },
            { name: 'HTML', value: 'html' }
          ],
          default: 'markdown'
        },
        {
          type: 'confirm',
          name: 'createConfig',
          message: 'Create .sdlcrc.json configuration file?',
          default: !options.global
        }
      ]);

      // Save configuration
      configStore.set('aiProvider', aiProvider);
      configStore.set('outputDir', outputDir);
      configStore.set('defaultFormat', defaultFormat);

      // Create project configuration file
      if (createConfig) {
        const configPath = path.join(process.cwd(), '.sdlcrc.json');
        const projectConfig = {
          version: '1.0.0',
          defaultProvider: aiProvider,
          outputDirectory: outputDir,
          projectDefaults: {
            documentTypes: ['business', 'functional', 'technical', 'ux'],
            exportFormat: defaultFormat
          },
          hooks: {}
        };

        await fs.writeJson(configPath, projectConfig, { spaces: 2 });
        console.log(chalk.green(`\n✅ Created .sdlcrc.json configuration file`));
      }

      // Create output directory
      const outputPath = path.resolve(outputDir);
      await fs.ensureDir(outputPath);
      console.log(chalk.green(`✅ Created output directory: ${outputPath}`));

      // Authentication
      const { doAuth } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'doAuth',
          message: 'Would you like to authenticate now?',
          default: true
        }
      ]);

      if (doAuth) {
        const authSuccess = await login();
        if (!authSuccess) {
          console.log(chalk.yellow('\nYou can authenticate later with: sdlc auth login'));
        }
      }

      // Setup complete
      console.log(chalk.green('\n✨ Setup complete!\n'));
      console.log(chalk.cyan('Quick Start:'));
      console.log(chalk.gray('  Generate documentation:'));
      console.log(chalk.white('    sdlc generate "your project description"'));
      console.log(chalk.gray('\n  Start interactive mode:'));
      console.log(chalk.white('    sdlc interactive'));
      console.log(chalk.gray('\n  View all commands:'));
      console.log(chalk.white('    sdlc --help'));
      
      // Add to gitignore
      if (!options.global) {
        await addToGitignore();
      }
    });

  return command;
}

async function addToGitignore(): Promise<void> {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const itemsToIgnore = [
    '\n# SDLC CLI',
    'sdlc-docs/',
    '*.sdlc.cache',
    '.sdlc-auth'
  ];

  try {
    let content = '';
    if (await fs.pathExists(gitignorePath)) {
      content = await fs.readFile(gitignorePath, 'utf-8');
    }

    // Check if already added
    if (!content.includes('# SDLC CLI')) {
      await fs.appendFile(gitignorePath, itemsToIgnore.join('\n'));
      console.log(chalk.green('✅ Updated .gitignore'));
    }
  } catch (error) {
    // Silently fail if can't update gitignore
  }
}
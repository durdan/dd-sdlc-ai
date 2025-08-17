#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { version } from '../../package.json';
import { generateCommand } from '../commands/generate';
import { authCommand } from '../commands/auth';
import { configCommand } from '../commands/config';
import { projectCommand } from '../commands/project';
import { exportCommand } from '../commands/export';
import { interactiveCommand } from '../commands/interactive';
import { initCommand } from '../commands/init';
import { checkAuth } from '../lib/auth-manager';
import { displayBanner } from '../utils/display';

const program = new Command();

// Display banner
displayBanner();

// Main CLI configuration
program
  .name('sdlc')
  .description('SDLC AI Platform CLI - Generate comprehensive SDLC documentation from the command line')
  .version(version, '-v, --version', 'Display version number')
  .option('-d, --debug', 'Enable debug mode')
  .option('--api-url <url>', 'Override API URL')
  .option('--no-color', 'Disable colored output')
  .hook('preAction', async (thisCommand) => {
    // Check authentication for commands that require it
    const commandName = thisCommand.args[0];
    // Allow anonymous usage for generate, interactive, and basic commands
    const authNotRequired = ['auth', 'config', 'init', 'help', 'version', 'generate', 'g', 'interactive', 'i'];
    
    if (!authNotRequired.includes(commandName)) {
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        console.log(chalk.yellow('\n⚠️  Authentication required'));
        console.log(chalk.gray('Run: sdlc auth login'));
        console.log(chalk.gray('\nNote: You can use "generate" and "interactive" commands without authentication'));
        console.log(chalk.gray('Anonymous users can generate up to 10 documents every 24 hours'));
        process.exit(1);
      }
    }
  });

// Register commands
program.addCommand(initCommand());
program.addCommand(authCommand());
program.addCommand(configCommand());
program.addCommand(generateCommand());
program.addCommand(projectCommand());
program.addCommand(exportCommand());
program.addCommand(interactiveCommand());

// Quick aliases
program
  .command('g [input...]')
  .description('Alias for generate')
  .allowUnknownOption()
  .action(() => {
    // Replace 'g' with 'generate' in argv and reparse
    const args = process.argv.slice(2);
    const gIndex = args.indexOf('g');
    if (gIndex !== -1) {
      args[gIndex] = 'generate';
    }
    process.argv = [...process.argv.slice(0, 2), ...args];
    program.parse(process.argv);
  });

program
  .command('p')
  .description('Alias for project')
  .action(() => {
    process.argv = [...process.argv.slice(0, 2), 'project', ...process.argv.slice(3)];
    program.parse(process.argv);
  });

program
  .command('i')
  .description('Alias for interactive')
  .action(() => {
    process.argv = [...process.argv.slice(0, 2), 'interactive', ...process.argv.slice(3)];
    program.parse(process.argv);
  });

// Error handling
program.exitOverride();

try {
  program.parse(process.argv);
} catch (error: any) {
  if (error.code === 'commander.unknownCommand') {
    console.log(chalk.red('\n❌ Unknown command'));
    console.log(chalk.gray('Run: sdlc --help'));
  } else {
    console.error(chalk.red('\n❌ Error:'), error.message);
    if (program.opts().debug) {
      console.error(error);
    }
  }
  process.exit(1);
}

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import { configStore } from '../lib/simple-config';
import inquirer from 'inquirer';

export function configCommand(): Command {
  const command = new Command('config');
  
  command
    .description('Manage CLI configuration');

  command
    .command('set <key> <value>')
    .description('Set a configuration value')
    .action(async (key: string, value: string) => {
      const validKeys = ['apiUrl', 'aiProvider', 'outputDir', 'defaultFormat'];
      
      if (!validKeys.includes(key)) {
        console.error(chalk.red(`Invalid configuration key: ${key}`));
        console.log(chalk.gray(`Valid keys: ${validKeys.join(', ')}`));
        process.exit(1);
      }

      configStore.set(key as any, value);
      console.log(chalk.green(`✅ ${key} set to: ${value}`));
    });

  command
    .command('get <key>')
    .description('Get a configuration value')
    .action((key: string) => {
      const value = configStore.get(key as any);
      if (value !== undefined) {
        console.log(value);
      } else {
        console.log(chalk.yellow(`Configuration key '${key}' is not set`));
      }
    });

  command
    .command('list')
    .description('List all configuration')
    .action(() => {
      const config = configStore.getAll();
      const table = new Table({
        head: [chalk.cyan('Key'), chalk.cyan('Value')],
        style: { head: [], border: [] }
      });

      Object.entries(config).forEach(([key, value]) => {
        if (key === 'auth' || key === 'profiles') {
          // Don't show sensitive data
          table.push([key, chalk.gray('***')]);
        } else if (typeof value === 'object') {
          table.push([key, JSON.stringify(value, null, 2)]);
        } else {
          table.push([key, String(value)]);
        }
      });

      console.log(table.toString());
    });

  command
    .command('reset')
    .description('Reset configuration to defaults')
    .action(async () => {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to reset all configuration?',
          default: false
        }
      ]);

      if (confirm) {
        configStore.reset();
        console.log(chalk.green('✅ Configuration reset to defaults'));
      }
    });

  // Profile commands - simplified for now
  command
    .command('profile')
    .description('Manage configuration profiles (coming soon)')
    .action(() => {
      console.log(chalk.yellow('Profile management coming soon'));
    });

  return command;
}
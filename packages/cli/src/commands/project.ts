import { Command } from 'commander';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import inquirer from 'inquirer';
import { apiClient } from '../lib/api-client';
import { ProjectOptions } from '../types/config';
import { formatDistanceToNow } from 'date-fns';

export function projectCommand(): Command {
  const command = new Command('project');
  
  command
    .description('Manage SDLC projects');

  command
    .command('create [title]')
    .description('Create a new project')
    .option('--description <desc>', 'Project description')
    .option('--template <template>', 'Use a project template')
    .option('--from-file <path>', 'Create from requirements file')
    .action(async (title?: string, options?: ProjectOptions) => {
      await createProject(title, options);
    });

  command
    .command('list')
    .description('List all projects')
    .option('--recent', 'Show only recent projects')
    .option('--limit <n>', 'Limit number of results', '10')
    .action(async (options) => {
      await listProjects(options);
    });

  command
    .command('view <projectId>')
    .description('View project details')
    .action(async (projectId: string) => {
      await viewProject(projectId);
    });

  command
    .command('update <projectId>')
    .description('Update project')
    .option('--name <name>', 'New project name')
    .option('--description <desc>', 'New description')
    .action(async (projectId: string, options) => {
      await updateProject(projectId, options);
    });

  command
    .command('delete <projectId>')
    .description('Delete a project')
    .action(async (projectId: string) => {
      await deleteProject(projectId);
    });

  command
    .command('search <query>')
    .description('Search projects')
    .action(async (query: string) => {
      await searchProjects(query);
    });

  return command;
}

async function createProject(title?: string, options?: ProjectOptions) {
  // Interactive mode if no title provided
  if (!title) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Project title:',
        validate: (input) => input.length > 0 || 'Title is required'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description (optional):'
      }
    ]);
    
    title = answers.title;
    options = { ...options, description: answers.description };
  }

  const spinner = ora('Creating project...').start();

  try {
    const result = await apiClient.createProject(title || '', options?.description);
    
    if (result.success && result.data) {
      spinner.succeed('Project created successfully');
      console.log(chalk.green(`\n✅ Project ID: ${result.data.id}`));
      console.log(chalk.gray(`Title: ${result.data.title}`));
      
      const { generateNow } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'generateNow',
          message: 'Generate documents for this project now?',
          default: true
        }
      ]);

      if (generateNow) {
        console.log(chalk.cyan('\nStarting document generation...'));
        // This would trigger the generate command
        process.argv = ['node', 'sdlc', 'generate', title!, '--project-id', result.data.id];
        // In real implementation, we'd call the generate function directly
      }
    } else {
      spinner.fail('Failed to create project');
      console.error(chalk.red(result.error));
    }
  } catch (error: any) {
    spinner.fail('Failed to create project');
    console.error(chalk.red(error.message));
  }
}

async function listProjects(options: any) {
  const spinner = ora('Loading projects...').start();

  try {
    const result = await apiClient.listProjects({
      limit: parseInt(options.limit),
      recent: options.recent
    });

    if (result.success && result.data) {
      spinner.stop();
      
      if (result.data.length === 0) {
        console.log(chalk.yellow('No projects found'));
        console.log(chalk.gray('Create your first project with: sdlc project create'));
        return;
      }

      const table = new Table({
        head: [
          chalk.cyan('ID'),
          chalk.cyan('Title'),
          chalk.cyan('Documents'),
          chalk.cyan('Created')
        ],
        style: { head: [], border: [] },
        colWidths: [15, 30, 15, 20]
      });

      result.data.forEach((project) => {
        table.push([
          project.id.substring(0, 12) + '...',
          project.title.substring(0, 28),
          project.documents?.length || 0,
          formatDistanceToNow(new Date(project.created_at), { addSuffix: true })
        ]);
      });

      console.log(chalk.cyan('\n📚 Your Projects\n'));
      console.log(table.toString());
      console.log(chalk.gray(`\nShowing ${result.data.length} projects`));
    } else {
      spinner.fail('Failed to load projects');
      console.error(chalk.red(result.error));
    }
  } catch (error: any) {
    spinner.fail('Failed to load projects');
    console.error(chalk.red(error.message));
  }
}

async function viewProject(projectId: string) {
  const spinner = ora('Loading project...').start();

  try {
    const result = await apiClient.getProject(projectId);

    if (result.success && result.data) {
      spinner.stop();
      
      console.log(chalk.cyan('\n📋 Project Details\n'));
      console.log(chalk.gray('━'.repeat(50)));
      console.log(chalk.white('ID:'), result.data.id);
      console.log(chalk.white('Title:'), result.data.title);
      console.log(chalk.white('Description:'), result.data.description || 'N/A');
      console.log(chalk.white('Created:'), new Date(result.data.created_at).toLocaleString());
      console.log(chalk.white('Updated:'), new Date(result.data.updated_at).toLocaleString());
      
      if (result.data.documents && result.data.documents.length > 0) {
        console.log(chalk.cyan('\n📄 Documents:\n'));
        
        const table = new Table({
          head: [chalk.cyan('Type'), chalk.cyan('Title'), chalk.cyan('Created')],
          style: { head: [], border: [] }
        });

        result.data.documents.forEach((doc) => {
          table.push([
            doc.document_type,
            doc.title.substring(0, 40),
            new Date(doc.created_at).toLocaleDateString()
          ]);
        });

        console.log(table.toString());
      } else {
        console.log(chalk.yellow('\nNo documents generated yet'));
      }

      console.log(chalk.gray('\n━'.repeat(50)));
      console.log(chalk.gray('Actions:'));
      console.log(chalk.gray('  Export: sdlc export ' + projectId));
      console.log(chalk.gray('  Update: sdlc project update ' + projectId));
      console.log(chalk.gray('  Delete: sdlc project delete ' + projectId));
    } else {
      spinner.fail('Project not found');
      console.error(chalk.red(result.error));
    }
  } catch (error: any) {
    spinner.fail('Failed to load project');
    console.error(chalk.red(error.message));
  }
}

async function updateProject(projectId: string, options: any) {
  const spinner = ora('Updating project...').start();

  try {
    const updates: any = {};
    if (options.name) updates.title = options.name;
    if (options.description) updates.description = options.description;

    const result = await apiClient.updateProject(projectId, updates);

    if (result.success) {
      spinner.succeed('Project updated successfully');
    } else {
      spinner.fail('Failed to update project');
      console.error(chalk.red(result.error));
    }
  } catch (error: any) {
    spinner.fail('Failed to update project');
    console.error(chalk.red(error.message));
  }
}

async function deleteProject(projectId: string) {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Are you sure you want to delete project ${projectId}?`,
      default: false
    }
  ]);

  if (!confirm) {
    console.log(chalk.yellow('Deletion cancelled'));
    return;
  }

  const spinner = ora('Deleting project...').start();

  try {
    const result = await apiClient.deleteProject(projectId);

    if (result.success) {
      spinner.succeed('Project deleted successfully');
    } else {
      spinner.fail('Failed to delete project');
      console.error(chalk.red(result.error));
    }
  } catch (error: any) {
    spinner.fail('Failed to delete project');
    console.error(chalk.red(error.message));
  }
}

async function searchProjects(query: string) {
  const spinner = ora('Searching projects...').start();

  try {
    const result = await apiClient.listProjects({ search: query });

    if (result.success && result.data) {
      spinner.stop();
      
      if (result.data.length === 0) {
        console.log(chalk.yellow(`No projects found matching "${query}"`));
        return;
      }

      console.log(chalk.cyan(`\n🔍 Search Results for "${query}"\n`));
      
      const table = new Table({
        head: [chalk.cyan('ID'), chalk.cyan('Title'), chalk.cyan('Created')],
        style: { head: [], border: [] }
      });

      result.data.forEach((project) => {
        table.push([
          project.id.substring(0, 12) + '...',
          project.title,
          formatDistanceToNow(new Date(project.created_at), { addSuffix: true })
        ]);
      });

      console.log(table.toString());
      console.log(chalk.gray(`\nFound ${result.data.length} projects`));
    } else {
      spinner.fail('Search failed');
      console.error(chalk.red(result.error));
    }
  } catch (error: any) {
    spinner.fail('Search failed');
    console.error(chalk.red(error.message));
  }
}
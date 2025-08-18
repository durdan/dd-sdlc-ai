import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { apiClient } from '../lib/api-client';
import { configStore } from '../lib/simple-config';
import { ExportOptions } from '../types/config';

export function exportCommand(): Command {
  const command = new Command('export');
  
  command
    .description('Export project documents')
    .argument('[projectId]', 'Project ID to export')
    .option('-f, --format <formats...>', 'Export formats (markdown, json, pdf, html)', ['markdown'])
    .option('-o, --output <dir>', 'Output directory', configStore.get('outputDir'))
    .option('--type <types...>', 'Document types to export')
    .option('--latest', 'Export most recent project')
    .option('--all', 'Export all projects')
    .action(async (projectId?: string, options?: ExportOptions) => {
      await handleExport(projectId, options);
    });

  return command;
}

async function handleExport(projectId?: string, options?: ExportOptions) {
  if (!projectId && !options?.latest && !options?.all) {
    console.error(chalk.red('Error: Project ID required (or use --latest/--all)'));
    process.exit(1);
  }

  const spinner = ora('Exporting documents...').start();

  try {
    let projects: any[] = [];

    if (options?.all) {
      const result = await apiClient.listProjects();
      if (result.success && result.data) {
        projects = result.data as any[];
      }
    } else if (options?.latest) {
      const result = await apiClient.listProjects({ limit: 1 });
      if (result.success && result.data && result.data.length > 0) {
        projects = [result.data[0]] as any[];
      }
    } else if (projectId) {
      const result = await apiClient.getProject(projectId);
      if (result.success && result.data) {
        projects = [result.data] as any[];
      }
    }

    if (projects.length === 0) {
      spinner.fail('No projects found to export');
      return;
    }

    spinner.text = `Exporting ${projects.length} project(s)...`;

    const outputDir = options?.output || configStore.get('outputDir');
    const formats = options?.format || ['markdown'];
    let totalExported = 0;

    for (const project of projects) {
      for (const format of formats) {
        const exportPath = await exportProject(project, format, outputDir, options?.type);
        if (exportPath) {
          totalExported++;
        }
      }
    }

    spinner.succeed(`Exported ${totalExported} document(s)`);
    console.log(chalk.gray(`📂 Output: ${outputDir}`));

  } catch (error: any) {
    spinner.fail('Export failed');
    console.error(chalk.red(error.message));
    process.exit(1);
  }
}

async function exportProject(
  project: any,
  format: string,
  outputDir: string,
  documentTypes?: string[]
): Promise<string | null> {
  try {
    const projectDir = path.join(
      outputDir,
      `${sanitizeFilename(project.title)}-${project.id.substring(0, 8)}`
    );

    await fs.ensureDir(projectDir);

    // Export each document
    if (project.documents && project.documents.length > 0) {
      for (const doc of project.documents) {
        // Filter by document type if specified
        if (documentTypes && !documentTypes.includes(doc.document_type)) {
          continue;
        }

        const filename = `${doc.document_type}.${getExtension(format)}`;
        const filepath = path.join(projectDir, filename);

        let content = doc.content;

        // Format conversion
        if (format === 'json') {
          content = JSON.stringify(doc, null, 2);
        } else if (format === 'html') {
          content = await markdownToHtml(content, doc.title);
        }

        await fs.writeFile(filepath, content, 'utf-8');
      }
    }

    // Create README
    const readmePath = path.join(projectDir, 'README.md');
    const readmeContent = createProjectReadme(project);
    await fs.writeFile(readmePath, readmeContent, 'utf-8');

    return projectDir;
  } catch (error: any) {
    console.error(chalk.red(`Failed to export project ${project.id}: ${error.message}`));
    return null;
  }
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

function getExtension(format: string): string {
  const extensions: Record<string, string> = {
    markdown: 'md',
    json: 'json',
    html: 'html',
    pdf: 'pdf'
  };
  return extensions[format] || 'md';
}

async function markdownToHtml(markdown: string, title: string): Promise<string> {
  // Simple conversion - in production, use a proper markdown parser
  return `<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <style>
        body { font-family: system-ui; max-width: 900px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #2563eb; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; }
        pre { background: #1f2937; color: white; padding: 16px; border-radius: 8px; }
    </style>
</head>
<body>
    <pre>${markdown}</pre>
</body>
</html>`;
}

function createProjectReadme(project: any): string {
  return `# ${project.title}

${project.description || ''}

## Project Information

- **ID:** ${project.id}
- **Created:** ${new Date(project.created_at).toLocaleString()}
- **Updated:** ${new Date(project.updated_at).toLocaleString()}

## Documents

${project.documents?.map((doc: any) => `- [${doc.title}](./${doc.document_type}.md)`).join('\n') || 'No documents'}

---

*Exported from SDLC AI Platform*
`;
}
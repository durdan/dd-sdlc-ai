import chalk from 'chalk';
import { version } from '../../package.json';

export function displayBanner(): void {
  if (process.env.SDLC_NO_BANNER) {
    return;
  }

  console.log(chalk.cyan(`
╔════════════════════════════════════════╗
║                                        ║
║     ${chalk.bold('SDLC AI Platform CLI')}              ║
║     ${chalk.gray(`Version ${version}`)}                    ║
║                                        ║
╚════════════════════════════════════════╝
  `));
}

export function displayError(message: string, error?: Error): void {
  console.error(chalk.red(`\n❌ ${message}`));
  if (error && process.env.DEBUG) {
    console.error(chalk.gray(error.stack));
  }
}

export function displaySuccess(message: string): void {
  console.log(chalk.green(`\n✅ ${message}`));
}

export function displayWarning(message: string): void {
  console.log(chalk.yellow(`\n⚠️  ${message}`));
}

export function displayInfo(message: string): void {
  console.log(chalk.cyan(`\nℹ️  ${message}`));
}

export function displaySection(title: string): void {
  console.log(chalk.cyan(`\n${title}`));
  console.log(chalk.gray('━'.repeat(50)));
}
import { Command } from 'commander';
import { login, logout, getAuthStatus } from '../lib/auth-manager';

export function authCommand(): Command {
  const command = new Command('auth');
  
  command
    .description('Manage authentication');

  command
    .command('login')
    .description('Authenticate with SDLC platform')
    .action(async () => {
      await login();
    });

  command
    .command('logout')
    .description('Log out from SDLC platform')
    .action(async () => {
      await logout();
    });

  command
    .command('status')
    .description('Check authentication status')
    .action(async () => {
      await getAuthStatus();
    });

  return command;
}
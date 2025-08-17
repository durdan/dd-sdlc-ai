import { configStore } from './simple-config';
import { apiClient } from './api-client';
import chalk from 'chalk';
import inquirer from 'inquirer';
import open from 'open';
import ora from 'ora';

export async function checkAuth(): Promise<boolean> {
  const auth = configStore.get('auth');
  
  if (!auth?.token) {
    return false;
  }

  // Check if token is expired
  if (auth.expiresAt && Date.now() > auth.expiresAt) {
    console.log(chalk.yellow('Session expired. Please login again.'));
    return false;
  }

  return true;
}

export async function login(): Promise<boolean> {
  console.log(chalk.cyan('\n🔐 SDLC CLI Authentication\n'));

  const { authMethod } = await inquirer.prompt([
    {
      type: 'list',
      name: 'authMethod',
      message: 'Choose authentication method:',
      choices: [
        { name: 'Browser (OAuth) - Recommended', value: 'browser' },
        { name: 'API Token', value: 'token' },
        { name: 'Email & Password', value: 'credentials' }
      ]
    }
  ]);

  switch (authMethod) {
    case 'browser':
      return await loginWithBrowser();
    case 'token':
      return await loginWithToken();
    case 'credentials':
      return await loginWithCredentials();
    default:
      return false;
  }
}

async function loginWithBrowser(): Promise<boolean> {
  const spinner = ora('Opening browser for authentication...').start();
  
  try {
    const apiUrl = configStore.get('apiUrl');
    const authUrl = `${apiUrl}/auth/cli?callback=cli://auth`;
    
    // Open browser
    await open(authUrl);
    
    spinner.text = 'Waiting for authentication in browser...';
    
    // Poll for auth completion (in real implementation, you'd have a callback server)
    const { token } = await inquirer.prompt([
      {
        type: 'input',
        name: 'token',
        message: 'Please paste the authentication token from your browser:',
        validate: (input) => input.length > 0 || 'Token is required'
      }
    ]);

    spinner.text = 'Verifying token...';
    
    const result = await apiClient.loginWithToken(token);
    
    if (result.success) {
      configStore.set('auth', {
        token,
        email: result.data.email,
        userId: result.data.id,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      });
      
      spinner.succeed('Authentication successful!');
      console.log(chalk.green(`\n✅ Logged in as ${result.data.email}`));
      return true;
    } else {
      spinner.fail('Authentication failed');
      console.error(chalk.red(result.error));
      return false;
    }
  } catch (error: any) {
    spinner.fail('Authentication failed');
    console.error(chalk.red(error.message));
    return false;
  }
}

async function loginWithToken(): Promise<boolean> {
  const { token } = await inquirer.prompt([
    {
      type: 'password',
      name: 'token',
      message: 'Enter your API token:',
      validate: (input) => input.length > 0 || 'Token is required'
    }
  ]);

  const spinner = ora('Verifying token...').start();

  try {
    const result = await apiClient.loginWithToken(token);
    
    if (result.success) {
      configStore.set('auth', {
        token,
        email: result.data.email,
        userId: result.data.id,
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days for API tokens
      });
      
      configStore.set('apiKey', token);
      
      spinner.succeed('Authentication successful!');
      console.log(chalk.green(`\n✅ Logged in as ${result.data.email}`));
      return true;
    } else {
      spinner.fail('Authentication failed');
      console.error(chalk.red(result.error));
      return false;
    }
  } catch (error: any) {
    spinner.fail('Authentication failed');
    console.error(chalk.red(error.message));
    return false;
  }
}

async function loginWithCredentials(): Promise<boolean> {
  const { email, password } = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Email:',
      validate: (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) || 'Please enter a valid email';
      }
    },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
      validate: (input) => input.length >= 6 || 'Password must be at least 6 characters'
    }
  ]);

  const spinner = ora('Authenticating...').start();

  try {
    const result = await apiClient.login(email, password);
    
    if (result.success) {
      configStore.set('auth', {
        token: result.data.token,
        refreshToken: result.data.refreshToken,
        email: result.data.email,
        userId: result.data.id,
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
      });
      
      spinner.succeed('Authentication successful!');
      console.log(chalk.green(`\n✅ Logged in as ${email}`));
      return true;
    } else {
      spinner.fail('Authentication failed');
      console.error(chalk.red(result.error));
      return false;
    }
  } catch (error: any) {
    spinner.fail('Authentication failed');
    console.error(chalk.red(error.message));
    return false;
  }
}

export async function logout(): Promise<void> {
  const spinner = ora('Logging out...').start();
  
  try {
    await apiClient.logout();
    configStore.set('auth', undefined);
    configStore.set('apiKey', undefined);
    
    spinner.succeed('Logged out successfully');
  } catch (error) {
    // Clear local auth even if API call fails
    configStore.set('auth', undefined);
    configStore.set('apiKey', undefined);
    
    spinner.succeed('Logged out locally');
  }
}

export async function getAuthStatus(): Promise<void> {
  const auth = configStore.get('auth');
  
  if (!auth?.token) {
    console.log(chalk.yellow('Not authenticated'));
    console.log(chalk.gray('Run: sdlc auth login'));
    return;
  }

  if (auth.expiresAt && Date.now() > auth.expiresAt) {
    console.log(chalk.yellow('Session expired'));
    console.log(chalk.gray('Run: sdlc auth login'));
    return;
  }

  console.log(chalk.green('✅ Authenticated'));
  console.log(chalk.gray(`Email: ${auth.email}`));
  console.log(chalk.gray(`User ID: ${auth.userId}`));
  
  if (auth.expiresAt) {
    const expiresIn = Math.ceil((auth.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
    console.log(chalk.gray(`Session expires in ${expiresIn} days`));
  }
}
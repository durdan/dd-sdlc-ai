#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect Claude config path based on OS
function getClaudeConfigPath() {
  const platform = os.platform();
  
  if (platform === 'darwin') {
    // macOS
    return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else if (platform === 'win32') {
    // Windows
    return path.join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json');
  } else {
    // Linux
    return path.join(os.homedir(), '.config', 'claude', 'claude_desktop_config.json');
  }
}

// Setup MCP server configuration
async function setup() {
  console.log('🚀 SDLC MCP Server Setup\n');
  
  const configPath = getClaudeConfigPath();
  console.log(`📁 Claude config path: ${configPath}\n`);
  
  // Check if config file exists
  let config = {};
  if (fs.existsSync(configPath)) {
    console.log('✅ Found existing Claude configuration');
    const content = fs.readFileSync(configPath, 'utf8');
    try {
      config = JSON.parse(content);
    } catch (error) {
      console.error('❌ Error parsing existing config:', error.message);
      process.exit(1);
    }
  } else {
    console.log('📝 Creating new Claude configuration');
    // Ensure directory exists
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  // Add or update SDLC MCP server configuration
  if (!config.mcpServers) {
    config.mcpServers = {};
  }
  
  config.mcpServers.sdlc = {
    command: 'npx',
    args: ['@sdlc/mcp-server'],
    env: {
      SDLC_API_URL: process.env.SDLC_API_URL || 'https://sdlc.dev',
      SDLC_API_KEY: process.env.SDLC_API_KEY || '',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
      LOG_LEVEL: 'info'
    }
  };
  
  // Write updated configuration
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Updated Claude configuration\n');
  
  // Show configuration summary
  console.log('📋 Configuration Summary:');
  console.log('   - SDLC API URL:', config.mcpServers.sdlc.env.SDLC_API_URL);
  console.log('   - API Keys:', config.mcpServers.sdlc.env.SDLC_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('   - OpenAI Key:', config.mcpServers.sdlc.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('   - Anthropic Key:', config.mcpServers.sdlc.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set');
  console.log('');
  
  // Instructions
  console.log('🎯 Next Steps:');
  console.log('1. Add your API keys to the configuration file:');
  console.log(`   ${configPath}`);
  console.log('');
  console.log('2. Restart Claude Desktop');
  console.log('');
  console.log('3. Test the integration by asking Claude:');
  console.log('   "Use the SDLC tool to generate a business plan for a startup"');
  console.log('');
  console.log('✨ Setup complete!');
}

// Run setup
setup().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
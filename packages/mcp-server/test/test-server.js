#!/usr/bin/env node

// Test script for SDLC MCP Server
// This simulates MCP client requests to test the server

import { spawn } from 'child_process';
import readline from 'readline';

const tests = [
  {
    name: 'List Tools',
    request: {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    }
  },
  {
    name: 'Generate Business Document',
    request: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'generate_sdlc_document',
        arguments: {
          input: 'E-commerce platform with payment integration',
          documentType: 'business'
        }
      }
    }
  },
  {
    name: 'List Projects',
    request: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'list_sdlc_projects',
        arguments: {
          limit: 5
        }
      }
    }
  }
];

async function runTest() {
  console.log('🧪 Testing SDLC MCP Server\n');
  
  // Start the server
  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      LOG_LEVEL: 'error' // Reduce noise during testing
    }
  });
  
  // Create readline interface for server output
  const rl = readline.createInterface({
    input: server.stdout,
    crlfDelay: Infinity
  });
  
  // Handle server output
  rl.on('line', (line) => {
    try {
      const response = JSON.parse(line);
      console.log('📥 Response:', JSON.stringify(response, null, 2));
      console.log('---\n');
    } catch {
      // Not JSON, probably a log message
      if (process.env.DEBUG) {
        console.log('Server:', line);
      }
    }
  });
  
  // Handle server errors
  server.stderr.on('data', (data) => {
    if (process.env.DEBUG) {
      console.error('Server Error:', data.toString());
    }
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Run tests
  for (const test of tests) {
    console.log(`📤 Test: ${test.name}`);
    console.log('Request:', JSON.stringify(test.request, null, 2));
    
    // Send request to server
    server.stdin.write(JSON.stringify(test.request) + '\n');
    
    // Wait for response
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Cleanup
  server.kill();
  console.log('✅ Tests complete');
}

runTest().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
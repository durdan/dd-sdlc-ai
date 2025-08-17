// Test what URL the CLI is actually generating
const apiClient = require('./dist/lib/api-client.js').apiClient;

// Mock the configStore
const configStore = {
  get: (key) => {
    if (key === 'apiUrl') return 'http://localhost:3003';
    return null;
  }
};

// Test the URL generation
const params = new URLSearchParams({
  input: 'test',
  documentTypes: ['business']
});

console.log('URL params:', params.toString());
console.log('Full URL:', `http://localhost:3003/api/generate-sdlc/stream?${params}`);

// Also test with the spread operator as the CLI does
const options = {
  documentTypes: ['business'],
  aiProvider: undefined,
  model: undefined
};

const params2 = new URLSearchParams({
  input: 'test',
  ...options
});

console.log('\nWith spread operator:');
console.log('URL params:', params2.toString());
console.log('Full URL:', `http://localhost:3003/api/generate-sdlc/stream?${params2}`);
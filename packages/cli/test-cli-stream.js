const EventSource = require('eventsource');

const url = 'http://localhost:3003/api/generate-sdlc/stream?input=test&documentTypes=business';
console.log('Testing CLI stream handling...\n');

const results = new Map();
let eventCount = 0;

const eventSource = new EventSource(url);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  eventCount++;
  
  if (data.type === 'progress' && data.documentType && data.content) {
    const existing = results.get(data.documentType) || { content: '' };
    existing.content = (existing.content || '') + data.content;
    results.set(data.documentType, existing);
    
    process.stdout.write(`\rReceived ${eventCount} events, accumulated ${existing.content.length} chars`);
  }
  
  if (data.type === 'complete') {
    const existing = results.get(data.documentType) || { content: '' };
    existing.completed = true;
    results.set(data.documentType, existing);
  }
  
  if (data.type === 'done') {
    console.log('\n\nStream completed!');
    console.log('Results:');
    results.forEach((value, key) => {
      console.log(`  ${key}: ${value.content.length} chars, completed: ${value.completed}`);
      console.log(`  First 100 chars: ${value.content.substring(0, 100)}...`);
    });
    eventSource.close();
    process.exit(0);
  }
};

eventSource.onerror = (error) => {
  console.error('\nError:', error);
  eventSource.close();
  process.exit(1);
};

setTimeout(() => {
  console.log('\nTimeout!');
  eventSource.close();
  process.exit(1);
}, 30000);
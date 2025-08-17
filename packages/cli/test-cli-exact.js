// This mimics exactly what the CLI does
const EventSource = require('eventsource');

async function testStream(results) {
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(
      'http://localhost:3003/api/generate-sdlc/stream?input=test&documentTypes=business'
    );
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Got event:', data.type);
      
      if (data.type === 'progress' && data.documentType && data.content) {
        const existing = results.get(data.documentType) || { content: '' };
        existing.content = (existing.content || '') + data.content;
        results.set(data.documentType, existing);
      }
      
      if (data.type === 'complete' && data.documentType) {
        const existing = results.get(data.documentType) || { content: '' };
        existing.completed = true;
        results.set(data.documentType, existing);
      }
      
      if (data.type === 'done') {
        console.log('Got done event, closing...');
        eventSource.close();
        resolve();
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('Error:', error.type, error.message);
      eventSource.close();
      reject(new Error('Stream error'));
    };
  });
}

async function main() {
  const results = new Map();
  
  try {
    console.log('Starting stream...');
    await testStream(results);
    console.log('Stream completed');
    
    console.log('Results size:', results.size);
    results.forEach((value, key) => {
      console.log(`  ${key}: ${value.content?.length || 0} chars, completed: ${value.completed}`);
    });
  } catch (error) {
    console.error('Failed:', error);
  }
}

main();
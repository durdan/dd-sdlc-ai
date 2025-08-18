#!/usr/bin/env node

// Debug script to understand why CLI saves empty content
const EventSource = require('eventsource');
const fs = require('fs-extra');
const path = require('path');

// This exactly mimics what the CLI does
class DebugStreamTest {
  constructor() {
    this.results = new Map();
    this.spinners = new Map();
    this.spinners.set('business', { text: 'Waiting...' });
  }

  async testStreaming() {
    console.log('=== Starting Debug Stream Test ===\n');
    
    return new Promise((resolve, reject) => {
      const url = 'http://localhost:3003/api/generate-sdlc/stream?input=test&documentTypes=business';
      console.log('URL:', url);
      console.log('');
      
      const eventSource = new EventSource(url);
      let eventCount = 0;
      
      eventSource.onmessage = (event) => {
        eventCount++;
        console.log(`\n[Event #${eventCount}]`);
        console.log('Raw data:', event.data.substring(0, 100));
        
        try {
          const data = JSON.parse(event.data);
          console.log('Parsed type:', data.type);
          console.log('Document type:', data.documentType || 'none');
          
          // This is EXACTLY what generate.ts does
          if (data.type === 'progress' && data.documentType && data.content) {
            console.log('Progress event - content length:', data.content.length);
            
            // Store partial results - EXACTLY like generate.ts line 208-210
            const existing = this.results.get(data.documentType) || { content: '' };
            existing.content = (existing.content || '') + data.content;
            this.results.set(data.documentType, existing);
            
            console.log('Results map now has:', this.results.get(data.documentType).content.length, 'chars');
          }
          
          if (data.type === 'complete' && data.documentType) {
            console.log('Complete event for:', data.documentType);
            
            // Mark as completed - EXACTLY like generate.ts line 222-224
            const existing = this.results.get(data.documentType) || { content: '' };
            existing.completed = true;
            this.results.set(data.documentType, existing);
            
            console.log('Marked as completed. Content length:', existing.content.length);
          }
          
          if (data.type === 'done') {
            console.log('Done event received');
            eventSource.close();
            resolve();
          }
        } catch (err) {
          console.error('Parse error:', err);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        reject(error);
      };
    });
  }
  
  async saveResults() {
    console.log('\n=== Saving Results (like saveDocuments) ===\n');
    
    console.log('Results Map size:', this.results.size);
    console.log('Results Map contents:');
    
    for (const [type, data] of this.results) {
      console.log(`\n  Type: ${type}`);
      console.log(`  Has content: ${!!data.content}`);
      console.log(`  Content type: ${typeof data.content}`);
      console.log(`  Content length: ${data.content?.length || 0}`);
      console.log(`  Completed: ${data.completed}`);
      console.log(`  First 100 chars: ${data.content?.substring(0, 100) || 'EMPTY'}`);
      
      // This is what saveDocuments does
      let content = data.content || data;
      
      console.log(`\n  After "data.content || data":`);
      console.log(`  Content type: ${typeof content}`);
      console.log(`  Content value:`, content);
      
      // Ensure content is a string
      if (typeof content !== 'string') {
        console.log('  Converting to JSON string...');
        content = JSON.stringify(content, null, 2);
      }
      
      console.log(`  Final content length: ${content.length}`);
      console.log(`  Final content preview: ${content.substring(0, 100)}`);
      
      // Save to file
      const filepath = path.join(__dirname, `debug-output-${type}.md`);
      await fs.writeFile(filepath, content, 'utf-8');
      console.log(`  Saved to: ${filepath}`);
    }
  }
}

async function main() {
  const test = new DebugStreamTest();
  
  try {
    await test.testStreaming();
    await test.saveResults();
    
    console.log('\n=== Test Complete ===');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main();
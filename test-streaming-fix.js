require('dotenv').config({ path: '.env.local' });

const testStreaming = async () => {
  console.log('🔍 Testing streaming API with fixed format...');
  
  const testInput = 'Create a simple todo app.';
  
  try {
    console.log('📡 Making request to /api/generate-document...');
    
    const response = await fetch('http://localhost:3000/api/generate-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentType: 'business',
        input: testInput,
        userId: '59359b4e-7f91-46eb-af36-0fc3ce2ddfdf',
      }),
    });

    if (!response.ok) {
      console.error('❌ Request failed:', response.status, response.statusText);
      return;
    }

    console.log('✅ Response received, reading stream...');
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      console.log(`📦 Raw chunk ${++chunkCount}:`, chunk.substring(0, 100) + '...');
      
      // Parse SSE format
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const jsonString = line.substring(6).trim();
            if (!jsonString || jsonString === '') continue;
            
            const jsonData = JSON.parse(jsonString);
            if (jsonData.type === 'chunk') {
              // Check if we have 'content' field (fixed format)
              const content = jsonData.content || jsonData.chunk || '';
              fullContent += content;
              console.log(`📝 Chunk content: "${content}"`);
              console.log(`📝 Accumulated content length: ${fullContent.length}`);
            } else if (jsonData.type === 'complete') {
              console.log('✅ Streaming completed');
              console.log(`📄 Final content length: ${fullContent.length}`);
              console.log(`📄 Content preview: ${fullContent.substring(0, 200)}...`);
              return;
            }
          } catch (parseError) {
            console.warn('⚠️ Parse error:', parseError.message);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

testStreaming(); 
require('dotenv').config({ path: '.env.local' });

const quickComprehensiveTest = async () => {
  console.log('⚡ Quick comprehensive endpoint test...');
  
  const testInput = 'Create a simple todo app.';
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiKey) {
    console.error('❌ OPENAI_API_KEY not found');
    return;
  }

  try {
    console.log('🔍 Testing comprehensive SDLC endpoint...');
    
    const response = await fetch('http://localhost:3000/api/generate-sdlc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: testInput,
        template: 'comprehensive',
        jiraProject: '',
        confluenceSpace: '',
        openaiKey: openaiKey,
        userId: '59359b4e-7f91-46eb-af36-0fc3ce2ddfdf',
        projectId: '00000000-0000-0000-0000-000000000000'
      }),
    });

    if (!response.ok) {
      console.error('❌ Test failed:', response.status, response.statusText);
      return;
    }

    const result = await response.json();
    
    console.log('✅ Comprehensive SDLC generation successful');
    console.log('📊 Prompt sources:', result.metadata?.promptSources);
    
    // Check database prompt usage
    const promptSources = result.metadata?.promptSources || {};
    const databasePrompts = Object.values(promptSources).filter(source => source === 'database').length;
    const totalDocuments = Object.keys(promptSources).length;
    
    console.log(`🔍 Database prompt usage: ${databasePrompts}/${totalDocuments} documents used database prompts`);
    
    if (databasePrompts === totalDocuments) {
      console.log('🎉 SUCCESS: All documents used database prompts!');
    } else {
      console.log('⚠️ Some documents still used fallback prompts');
      Object.entries(promptSources).forEach(([docType, source]) => {
        if (source !== 'database') {
          console.log(`  - ${docType}: ${source}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

quickComprehensiveTest(); 
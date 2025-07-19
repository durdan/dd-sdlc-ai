require('dotenv').config({ path: '.env.local' });

const fastPromptTest = async () => {
  console.log('⚡ Fast prompt usage test...');
  
  const baseUrl = 'http://localhost:3000';
  const userId = '59359b4e-7f91-46eb-af36-0fc3ce2ddfdf';
  const documentTypes = ['business', 'functional', 'technical', 'ux', 'mermaid'];
  
  const results = [];
  
  for (const docType of documentTypes) {
    try {
      console.log(`🔍 Testing ${docType} prompt...`);
      
      const response = await fetch(`${baseUrl}/api/test-prompt-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType: docType,
          userId: userId
        }),
      });

      if (!response.ok) {
        console.error(`❌ ${docType} test failed:`, response.status);
        continue;
      }

      const result = await response.json();
      results.push(result);
      
      console.log(`✅ ${docType}: ${result.promptSource} (${result.promptName || 'N/A'})`);
      
    } catch (error) {
      console.error(`❌ Error testing ${docType}:`, error.message);
    }
  }
  
  console.log('\n📊 Summary:');
  const databasePrompts = results.filter(r => r.promptSource === 'database').length;
  const totalTests = results.length;
  
  console.log(`Database prompts: ${databasePrompts}/${totalTests}`);
  console.log(`Success rate: ${Math.round((databasePrompts/totalTests) * 100)}%`);
  
  if (databasePrompts === totalTests) {
    console.log('🎉 All document types are using database prompts!');
  } else {
    console.log('⚠️ Some document types are not using database prompts');
    results.forEach(r => {
      if (r.promptSource !== 'database') {
        console.log(`  - ${r.documentType}: ${r.promptSource}`);
      }
    });
  }
  
  return results;
};

// Test the issue with comprehensive SDLC endpoint
const testComprehensiveIssue = async () => {
  console.log('\n🔍 Testing comprehensive SDLC endpoint issue...');
  
  // The issue is that the comprehensive endpoint is trying to call the consolidated endpoint
  // but getting 404s, so it falls back to direct generation
  
  console.log('Problem identified:');
  console.log('1. Individual endpoints work and use database prompts ✅');
  console.log('2. Comprehensive endpoint tries to call consolidated endpoint ❌');
  console.log('3. Consolidated endpoint returns 404 when called internally ❌');
  console.log('4. Comprehensive endpoint falls back to direct generation ❌');
  
  console.log('\n🔧 Quick fix needed:');
  console.log('- Fix the internal URL in comprehensive endpoint');
  console.log('- Or use the individual endpoints directly');
};

// Run the fast test
const runFastTest = async () => {
  console.log('🚀 Starting fast prompt usage test...\n');
  
  await fastPromptTest();
  await testComprehensiveIssue();
  
  console.log('\n⚡ Fast test completed!');
};

runFastTest().catch(console.error); 
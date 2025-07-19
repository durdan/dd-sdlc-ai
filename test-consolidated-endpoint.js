require('dotenv').config({ path: '.env.local' });

const testConsolidatedEndpoint = async () => {
  console.log('🧪 Testing consolidated /api/generate-document endpoint...');
  
  const testInput = 'Create a task management application for small teams with project tracking, time logging, and team collaboration features.';
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    return;
  }

  const baseUrl = 'http://localhost:3000';
  
  // Test different document types
  const documentTypes = ['business', 'functional', 'technical', 'ux', 'mermaid'];
  
  for (const docType of documentTypes) {
    console.log(`\n🔍 Testing ${docType} document generation...`);
    
    try {
      const startTime = Date.now();
      
      const response = await fetch(`${baseUrl}/api/generate-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: testInput,
          documentType: docType,
          openaiKey: openaiKey,
          userId: '59359b4e-7f91-46eb-af36-0fc3ce2ddfdf', // Use existing user
          projectId: 'test-project-' + Date.now()
        }),
      });

      if (!response.ok) {
        console.error(`❌ ${docType} generation failed:`, response.status, response.statusText);
        continue;
      }

      // Handle streaming response properly
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        content += chunk;
      }
      
      const generationTime = Date.now() - startTime;
      
      // Extract metadata if present
      const metadataMatch = content.match(/<!-- METADATA: (.+?) -->/);
      const metadata = metadataMatch ? JSON.parse(metadataMatch[1]) : null;
      
      // Remove metadata from content
      const cleanContent = content.replace(/<!-- METADATA: .+? -->/, '').trim();
      
      console.log(`✅ ${docType} generation successful`);
      console.log(`⏱️ Generation time: ${generationTime}ms`);
      console.log(`📝 Content length: ${cleanContent.length} characters`);
      console.log(`🔍 Prompt source: ${metadata?.promptSource || 'unknown'}`);
      console.log(`📋 Document type: ${metadata?.documentType || docType}`);
      
      // Show first 200 characters of content
      console.log(`📄 Content preview: ${cleanContent.substring(0, 200)}...`);
      
    } catch (error) {
      console.error(`❌ Error testing ${docType}:`, error.message);
    }
  }
  
  console.log('\n🎉 Consolidated endpoint testing completed!');
};

// Test the comprehensive SDLC endpoint that uses the consolidated endpoint
const testComprehensiveSDLC = async () => {
  console.log('\n🧪 Testing comprehensive SDLC endpoint with consolidated endpoint...');
  
  const testInput = 'Create a customer relationship management system for small businesses.';
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment variables');
    return;
  }

  const baseUrl = 'http://localhost:3000';
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${baseUrl}/api/generate-sdlc`, {
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
        projectId: 'test-comprehensive-' + Date.now()
      }),
    });

    if (!response.ok) {
      console.error('❌ Comprehensive SDLC generation failed:', response.status, response.statusText);
      return;
    }

    const result = await response.json();
    const generationTime = Date.now() - startTime;
    
    console.log('✅ Comprehensive SDLC generation successful');
    console.log(`⏱️ Total generation time: ${generationTime}ms`);
    console.log('📊 Prompt sources:', result.metadata?.promptSources);
    console.log(`📝 Business analysis length: ${result.businessAnalysis?.length || 0} characters`);
    console.log(`📝 Functional spec length: ${result.functionalSpec?.length || 0} characters`);
    console.log(`📝 Technical spec length: ${result.technicalSpec?.length || 0} characters`);
    console.log(`📝 UX spec length: ${result.uxSpec?.length || 0} characters`);
    console.log(`📝 Mermaid diagrams length: ${result.mermaidDiagrams?.length || 0} characters`);
    
    // Check if all documents used database prompts
    const promptSources = result.metadata?.promptSources || {};
    const databasePrompts = Object.values(promptSources).filter(source => source === 'database').length;
    const totalDocuments = Object.keys(promptSources).length;
    
    console.log(`🔍 Database prompt usage: ${databasePrompts}/${totalDocuments} documents used database prompts`);
    
    if (databasePrompts === totalDocuments) {
      console.log('🎉 All documents used database prompts!');
    } else {
      console.log('⚠️ Some documents used fallback prompts');
    }
    
  } catch (error) {
    console.error('❌ Error testing comprehensive SDLC:', error.message);
  }
};

// Run tests
const runTests = async () => {
  console.log('🚀 Starting consolidated endpoint tests...\n');
  
  await testConsolidatedEndpoint();
  await testComprehensiveSDLC();
  
  console.log('\n🎉 All tests completed!');
};

runTests().catch(console.error); 
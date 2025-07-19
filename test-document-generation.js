require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.log('SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDocumentGeneration() {
  console.log('🧪 Testing document generation and saving...');
  
  try {
    // Test 1: Check if we can connect to the database
    console.log('\n1️⃣ Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('sdlc_projects')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }
    console.log('✅ Database connection successful');

    // Test 2: Check current document count
    console.log('\n2️⃣ Checking current document count...');
    const { count: projectCount } = await supabase
      .from('sdlc_projects')
      .select('*', { count: 'exact', head: true });
    
    const { count: documentCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 Current projects: ${projectCount}`);
    console.log(`📄 Current documents: ${documentCount}`);

    // Test 3: Test the save_comprehensive_sdlc_document function
    console.log('\n3️⃣ Testing save_comprehensive_sdlc_document function...');
    const testUserId = '59359b4e-7f91-46eb-af36-0fc3ce2ddfdf'; // Use existing user
    const testTitle = 'Test Document Generation - ' + new Date().toISOString();
    const testContent = `# Test Document

This is a test document generated at ${new Date().toISOString()}.

## Test Section
- Test item 1
- Test item 2
- Test item 3

## Conclusion
This document was created to test the document generation and saving functionality.`;

    const { data: savedProjectId, error: saveError } = await supabase
      .rpc('save_comprehensive_sdlc_document', {
        user_uuid: testUserId,
        doc_title: testTitle,
        doc_description: 'Test document for debugging',
        doc_content: testContent,
        doc_metadata: {
          test: true,
          generated_at: new Date().toISOString(),
          source: 'test-script'
        }
      });

    if (saveError) {
      console.error('❌ Failed to save document:', saveError);
      return;
    }
    
    console.log('✅ Document saved successfully');
    console.log('📝 Project ID:', savedProjectId);

    // Test 4: Verify the document was saved
    console.log('\n4️⃣ Verifying saved document...');
    const { data: savedProject, error: fetchError } = await supabase
      .from('sdlc_projects')
      .select(`
        *,
        documents (*)
      `)
      .eq('id', savedProjectId)
      .single();

    if (fetchError) {
      console.error('❌ Failed to fetch saved project:', fetchError);
      return;
    }

    console.log('✅ Project retrieved successfully');
    console.log('📋 Project title:', savedProject.title);
    console.log('👤 User ID:', savedProject.user_id);
    console.log('📄 Document count:', savedProject.documents.length);
    console.log('📝 Document types:', savedProject.documents.map(d => d.document_type));

    // Test 5: Test the get_user_sdlc_documents function
    console.log('\n5️⃣ Testing get_user_sdlc_documents function...');
    const { data: userDocuments, error: userDocsError } = await supabase
      .rpc('get_user_sdlc_documents', {
        user_uuid: testUserId
      });

    if (userDocsError) {
      console.error('❌ Failed to get user documents:', userDocsError);
      return;
    }

    console.log('✅ User documents retrieved successfully');
    console.log('📊 Total user documents:', userDocuments.length);
    console.log('📝 Recent document types:', userDocuments.slice(0, 5).map(d => d.document_type));

    // Test 6: Clean up test document
    console.log('\n6️⃣ Cleaning up test document...');
    const { error: deleteError } = await supabase
      .from('sdlc_projects')
      .delete()
      .eq('id', savedProjectId);

    if (deleteError) {
      console.error('❌ Failed to delete test project:', deleteError);
    } else {
      console.log('✅ Test document cleaned up');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Database connection: ✅');
    console.log('- Document saving: ✅');
    console.log('- Document retrieval: ✅');
    console.log('- User documents function: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDocumentGeneration(); 
// Simple test to check Supabase signup functionality
const { createClient } = require('@supabase/supabase-js');

// Check if environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Missing required environment variables.');
  console.log('Please create a .env.local file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

// Test Supabase connection
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  console.log('\n🔍 Testing Supabase signup functionality...');
  
  try {
    // Test with a dummy email
    const testEmail = 'test@example.com';
    const testPassword = 'testpassword123';
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: { data: { full_name: 'Test User' } },
    });
    
    console.log('\n📊 Signup test results:');
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Error:', error);
    
    if (error) {
      console.log('\n❌ Signup test failed:', error.message);
    } else {
      console.log('\n✅ Signup test successful!');
      
      if (data.user && !data.session) {
        console.log('📧 Email confirmation required');
      } else if (data.session) {
        console.log('🎉 User signed up and logged in immediately');
      }
    }
    
  } catch (err) {
    console.error('\n💥 Unexpected error:', err);
  }
}

testSignup();
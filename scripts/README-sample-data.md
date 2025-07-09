# AI Code Automation Sample Data

This directory contains sample data for testing AI code automation features.

## 📁 Files

- `ai-integration-sample-data.sql` - Comprehensive sample data with detailed scenarios
- `insert-sample-data.sql` - Safe insertion script that works with your existing users
- `README-sample-data.md` - This documentation file

## 🎯 Sample Data Includes

### **AI Tasks** 
- **Bug Fix Examples**: Login validation errors, memory leaks, mobile layout issues
- **Feature Development**: User profile export, real-time notifications
- **Status Variety**: Pending, in-progress, completed tasks for testing workflows

### **GitHub Integrations**
- Repository connections with webhook configurations
- Different permission levels and installation IDs
- Sample repository URLs for testing

### **User Configurations**
- Encrypted API key storage examples
- Provider configurations (OpenAI, Claude, GitHub Copilot)  
- Active/inactive configuration states

### **Usage Analytics**
- Token usage tracking for cost monitoring
- Response time metrics
- Request type categorization (code_generation, bug_analysis, feature_analysis)

### **Automation Rules**
- Auto-fix rules for simple bugs
- Security issue escalation rules
- Feature development assistance rules

### **Security Audit Logs**
- API key creation and rotation events
- Task creation and execution tracking
- IP address and user agent logging

## 🚀 How to Insert Sample Data

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste `insert-sample-data.sql`
4. Run the script

### Option 2: Using CLI
```bash
# Make sure you're in the project root
cd /path/to/your/windsurf-project

# Run the sample data insertion
supabase db reset
cat scripts/insert-sample-data.sql | supabase sql
```

## ✅ Verification

After inserting sample data, use the **Test Database** button in your dashboard to verify:

1. Click "Test Database" in the dashboard header
2. Run "Test Sample Data Exists" 
3. Run "Get Sample Data Summary" to see what was inserted
4. Check individual tests to verify everything is working

## 📊 Expected Results

After successful insertion, you should see:
- **2-5 AI Tasks** (bug fixes and features)
- **2-3 User Configurations** (API key setups)
- **1-3 GitHub Integrations** (repository connections)
- **4-6 Usage Logs** (analytics data)
- **1-3 Automation Rules** (workflow rules)
- **2-4 Security Audit Logs** (activity tracking)

## 🔧 Troubleshooting

### No Users in Database
If you get "No existing users found" messages:
- The script creates test UUIDs automatically
- This is normal for fresh installations
- Sign up for an account first, then re-run the script

### Permission Errors
- Make sure your Supabase user has INSERT permissions
- Check that RLS policies allow your user to insert data
- Verify you're connected to the correct database

### Data Already Exists
- The script uses `ON CONFLICT DO NOTHING` to prevent duplicates
- Safe to run multiple times
- Check existing data with "Get Sample Data Summary" test

## 🎯 Next Steps

With sample data in place, you can:
1. ✅ **T1.3 Complete** - Sample data for AI code automation testing
2. 🔄 **T1.4 Next** - Add "AI Code Assistant" section to dashboard
3. 🔄 **T1.5 Next** - Create code automation task tracking UI

The sample data provides realistic scenarios for testing the AI code automation features as you build them! 
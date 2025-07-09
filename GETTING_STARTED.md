# 🚀 AI Code Assistant Integration - Quick Start Guide

## Prerequisites ✅
- Your existing SDLC platform is running
- Node.js 18+ installed
- Docker (for microservices)
- GitHub account with repository access

## Step 1: Database Setup (10 minutes)

1. **Extend your Supabase schema:**
   ```bash
   # Run this in your Supabase SQL editor
   cat scripts/ai-integration-schema.sql | supabase db reset
   ```

2. **Add environment variables:**
   ```bash
   # Add to your .env.local
   NEXT_PUBLIC_AI_ORCHESTRATION_URL=http://localhost:3001
   AI_ORCHESTRATION_SECRET=your-secret-key
   ```

## Step 2: Create AI Orchestration Service (30 minutes)

1. **Set up the microservice:**
   ```bash
   mkdir ai-orchestration-service
   cd ai-orchestration-service
   npm init -y
   npm install express typescript cors helmet rate-limiter-flexible
   npm install -D @types/node @types/express ts-node nodemon
   ```

2. **Copy starter template:**
   ```bash
   cp -r templates/ai-orchestration-service/* ai-orchestration-service/
   ```

3. **Start the service:**
   ```bash
   cd ai-orchestration-service
   npm run dev
   ```

## Step 3: Add AI Configuration UI (45 minutes)

1. **Create AI management pages:**
   ```bash
   # In your main SDLC platform
   mkdir app/ai-automation
   cp templates/ai-automation/* app/ai-automation/
   ```

2. **Add navigation link:**
   ```typescript
   // In your MainNav component
   { href: "/ai-automation", label: "AI Automation" }
   ```

3. **Test the UI:**
   - Navigate to `/ai-automation`
   - Configure your first AI provider (OpenAI)
   - Test API key validation

## Step 4: First AI Integration Test (20 minutes)

1. **Create a simple bug report:**
   - Go to your project
   - Create a GitHub issue with label `ai-bug-fix`
   - Watch the automation trigger

2. **Expected workflow:**
   ```
   GitHub Issue → AI Orchestration → OpenAI → Code Generation → PR Creation
   ```

## Step 5: Verify End-to-End (15 minutes)

1. **Check the generated PR:**
   - Review AI-generated code changes
   - Verify tests were created
   - Approve and merge if satisfactory

2. **Monitor metrics:**
   - Check usage dashboard
   - Review cost tracking
   - Validate security logs

## 🎯 Success Indicators

✅ **You'll know it's working when:**
- BYOK UI loads without errors
- AI orchestration service responds to health checks
- First OpenAI API call succeeds
- GitHub webhook triggers automation
- PR is created with AI-generated code

## 🔧 Development Workflow

### Daily Development:
```bash
# Terminal 1: Main SDLC Platform
npm run dev

# Terminal 2: AI Orchestration Service  
cd ai-orchestration-service && npm run dev

# Terminal 3: Database monitoring
supabase start && supabase logs
```

### Testing AI Integrations:
```bash
# Test provider connections
curl -X POST http://localhost:3001/api/test-providers

# Test code generation
curl -X POST http://localhost:3001/api/generate-code \
  -H "Content-Type: application/json" \
  -d '{"context": "Fix authentication bug", "provider": "openai"}'
```

## 📚 Next Steps

After completing the quick start:

1. **Week 2-3:** Add Anthropic Claude integration
2. **Week 4:** Implement GitHub Actions workflows  
3. **Week 5-8:** Add feature development automation
4. **Week 9-12:** Multi-provider optimization
5. **Week 13-16:** Production deployment

## 🚨 Common Issues & Solutions

### Issue: "Cannot connect to AI Orchestration Service"
**Solution:** Ensure service is running on port 3001 and firewall allows connections

### Issue: "OpenAI API key validation failed"  
**Solution:** Check key format and permissions, ensure billing is set up

### Issue: "GitHub webhook not triggering"
**Solution:** Verify webhook URL and secret in GitHub repository settings

## 📞 Support

- **Documentation:** `/docs/ai-integration-guide.md`
- **Architecture:** `/architecture/README.md` 
- **Issues:** GitHub Issues with `ai-integration` label
- **Community:** Join our Discord server for real-time help

---

**🎉 Ready to transform your SDLC platform into an AI-powered development powerhouse!** 
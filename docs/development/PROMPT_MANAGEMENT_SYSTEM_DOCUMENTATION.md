# 🎯 Prompt Management System - Complete Documentation

## 📋 Overview

The SDLC AI Platform has a comprehensive **4-tier prompt management system** that allows flexible control over AI prompts used for document generation. This system supports both admin-managed global prompts and user-managed personal prompts, with proper fallback mechanisms.

---

## 🏗️ System Architecture

### 4-Tier Prompt Hierarchy

The system follows a **priority-based hierarchy** when selecting prompts for document generation:

```
1. 🎯 Custom Prompt (Highest Priority)
   ├── Provided directly in API request
   ├── Used for one-time customizations
   └── Legacy support for existing integrations

2. 👤 User Personal Prompt
   ├── User's personal default prompt for each document type
   ├── Managed by individual users via /prompts interface
   └── Overrides system prompts when set as personal default

3. 🌐 System Global Prompt
   ├── Organization-wide default prompts
   ├── Managed by admins via /admin/prompts interface
   └── Serves as primary prompt source

4. 💾 Hardcoded Fallback Prompt (Lowest Priority)
   ├── Built into the codebase
   ├── Ensures system always works
   └── Used when database prompts fail
```

---

## 🗄️ Database Structure

### Core Tables

#### 1. `prompt_templates` (Main Table)
```sql
CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(50) NOT NULL, -- 'business', 'functional', 'technical', 'ux', 'mermaid'
    prompt_content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    ai_model VARCHAR(100) DEFAULT 'gpt-4',
    is_active BOOLEAN DEFAULT false,
    is_system_default BOOLEAN DEFAULT false,
    is_personal_default BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    prompt_scope VARCHAR(20) DEFAULT 'system', -- 'system' or 'user'
    user_id UUID REFERENCES auth.users(id), -- NULL for system prompts
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 2. `prompt_usage_logs` (Analytics)
```sql
CREATE TABLE prompt_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_template_id UUID REFERENCES prompt_templates(id),
    user_id UUID REFERENCES auth.users(id),
    project_id UUID,
    input_text TEXT,
    generated_content TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    response_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    ai_model_used VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 3. `prompt_experiments` (A/B Testing)
```sql
CREATE TABLE prompt_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    control_prompt_id UUID REFERENCES prompt_templates(id),
    variant_prompt_id UUID REFERENCES prompt_templates(id),
    traffic_split DECIMAL(3,2) DEFAULT 0.5,
    is_active BOOLEAN DEFAULT false,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 4. `sdlc_user_roles` (Access Control)
```sql
CREATE TABLE sdlc_user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    role VARCHAR(20) NOT NULL, -- 'admin', 'manager', 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 🎯 User Interfaces

### 1. 🔧 Admin Interface (`/admin/prompts`)

**Purpose**: System-wide prompt management for administrators
**Access**: Admin and Manager roles only
**Features**:
- Manage global system prompts
- View all user prompts (admin only)
- Create/edit/delete system prompts
- Set system default prompts
- View usage analytics
- A/B testing management
- Bulk operations

**Key Components**:
- `components/admin/prompt-management.tsx` - Main interface
- `components/admin/prompt-editor.tsx` - Prompt editing
- `components/admin/prompt-tester.tsx` - Testing interface
- `components/admin/prompt-analytics.tsx` - Analytics dashboard

**Authentication Flow**:
```typescript
// Check user role via environment variable or database
const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
if (adminEmail && user.email === adminEmail) {
  setUserRole('admin');
} else {
  // Query sdlc_user_roles table
  const { data: roleData } = await supabase
    .from('sdlc_user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();
}
```

### 2. 👤 User Interface (`/prompts`)

**Purpose**: Personal prompt management for individual users
**Access**: All authenticated users
**Features**:
- Create personal prompts
- Set personal default prompts
- Edit/delete own prompts
- Test prompts
- View personal usage analytics
- Import/export prompts

**Key Components**:
- `app/prompts/page.tsx` - Main user prompts page
- `app/prompts/new/page.tsx` - Create new prompt
- `app/prompts/[id]/edit/page.tsx` - Edit existing prompt
- `app/prompts/[id]/test/page.tsx` - Test prompt

**Access Control**:
```sql
-- RLS Policy: Users can only manage their own prompts
CREATE POLICY "Users can manage own prompts" ON prompt_templates
FOR ALL USING (
  prompt_scope = 'user' AND user_id = auth.uid()
);
```

### 3. 🏠 Dashboard Integration (`/dashboard`)

**Purpose**: Quick access to prompt management features
**Access**: All authenticated users
**Features**:
- "My Prompts" link in user dropdown menu
- "Admin Panel" button for admin/manager users
- "Prompt Engineering" dialog for quick customization

**Integration Points**:
```typescript
// User dropdown menu
<DropdownMenuItem onClick={() => window.open('/prompts', '_blank')}>
  <Database className="mr-2 h-4 w-4" />
  <span>My Prompts</span>
</DropdownMenuItem>

// Admin panel access
{(userRole === 'admin' || userRole === 'manager') && (
  <DropdownMenuItem onClick={() => window.open('/admin/prompts', '_blank')}>
    <Shield className="mr-2 h-4 w-4" />
    <span>Admin Panel</span>
  </DropdownMenuItem>
)}
```

---

## ⚙️ Core Service Layer

### `lib/prompt-service.ts`

The `PromptService` class handles all prompt operations:

```typescript
export class PromptService {
  // 4-tier hierarchy implementation
  async getPromptForExecution(
    documentType: DocumentType, 
    userId: string,
    includeUserPrompts = true
  ): Promise<PromptTemplate | null> {
    // 1. Check for active A/B experiments
    const experiment = await this.getActiveExperiment(documentType);
    
    // 2. User's personal default prompt
    if (includeUserPrompts && userId !== 'anonymous') {
      const userPrompt = await this.getUserDefaultPrompt(documentType, userId);
      if (userPrompt) return userPrompt;
    }
    
    // 3. System default prompt
    const systemPrompt = await this.getActivePrompt(documentType);
    if (systemPrompt) return systemPrompt;
    
    // 4. Hardcoded fallback (handled by caller)
    return null;
  }

  // User prompt management
  async createUserPrompt(prompt: CreateUserPromptRequest, userId: string)
  async getUserPrompts(userId: string, documentType?: DocumentType)
  async setPersonalDefaultPrompt(id: string, userId: string)
  
  // System prompt management
  async createPrompt(prompt: CreatePromptRequest)
  async setDefaultPrompt(id: string)
  async getActivePrompt(documentType: DocumentType)
  
  // Analytics
  async logPromptUsage(usage: PromptUsageLog)
  async getPromptAnalytics(promptId: string, days = 30)
}
```

---

## 🔄 API Integration

### How Prompts Are Used in API Routes

All 6 API routes follow the same pattern:

```typescript
// Example: /api/generate-business-analysis/route.ts
export async function POST(request: Request) {
  const { input, customPrompt } = await request.json();
  
  // Get user ID from Supabase auth
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'anonymous';
  
  // 4-tier hierarchy implementation
  if (customPrompt) {
    // Tier 1: Custom prompt
    return await generateWithCustomPrompt(customPrompt, input);
  }
  
  // Tier 2-3: User prompt or System prompt
  const promptTemplate = await promptService.getPromptForExecution(
    'business', 
    userId
  );
  
  if (promptTemplate) {
    // Log usage for analytics
    await promptService.logPromptUsage({
      prompt_template_id: promptTemplate.id,
      user_id: userId,
      input_text: input,
      // ... other fields
    });
    
    return await generateWithDatabasePrompt(promptTemplate, input);
  }
  
  // Tier 4: Hardcoded fallback
  return await generateWithFallbackPrompt(FALLBACK_PROMPT, input);
}
```

### API Routes Using Prompt System

1. **`/api/generate-business-analysis`** - Business analysis documents
2. **`/api/generate-functional-spec`** - Functional specifications
3. **`/api/generate-technical-spec`** - Technical specifications
4. **`/api/generate-ux-spec`** - UX specifications
5. **`/api/generate-mermaid-diagrams`** - Mermaid diagrams
6. **`/api/generate-sdlc`** - Composite SDLC documents

---

## 🎨 Hardcoded Fallback Prompts

### Location and Purpose

Hardcoded prompts are defined in each API route as constants:

```typescript
// Example from /api/generate-business-analysis/route.ts
const FALLBACK_PROMPT = `You are an expert business analyst. 
Analyze the following project requirements and create a comprehensive 
business analysis document.

Project Requirements:
{input}

Create a business analysis that includes:
## Executive Summary
## Stakeholder Analysis  
## Requirements Analysis
## Risk Assessment
## User Stories & Acceptance Criteria
## Success Metrics
...`;
```

### Fallback Prompt Locations

1. **Business Analysis**: `app/api/generate-business-analysis/route.ts`
2. **Functional Spec**: `app/api/generate-functional-spec/route.ts`
3. **Technical Spec**: `app/api/generate-technical-spec/route.ts`
4. **UX Spec**: `app/api/generate-ux-spec/route.ts`
5. **Mermaid Diagrams**: `app/api/generate-mermaid-diagrams/route.ts`
6. **SDLC Composite**: `app/api/generate-sdlc/route.ts`

### Template Library

Additional prompt templates are available in:
- `lib/prompt-template-manager.ts` - Template library with metadata
- `components/prompt-engineering.tsx` - UI prompt templates
- `scripts/migrate-prompts-to-database.sql` - Database migration templates

---

## 🔐 Security & Access Control

### Role-Based Access Control

```typescript
// User roles hierarchy
type UserRole = 'admin' | 'manager' | 'user';

// Permission matrix
const permissions = {
  admin: {
    systemPrompts: ['create', 'read', 'update', 'delete'],
    userPrompts: ['read', 'delete'], // Can view/moderate all user prompts
    analytics: ['read'], // Full analytics access
    experiments: ['create', 'read', 'update', 'delete']
  },
  manager: {
    systemPrompts: ['read', 'test'], // View and test only
    userPrompts: [], // No access to user prompts
    analytics: ['read'], // Limited analytics
    experiments: ['read']
  },
  user: {
    systemPrompts: [], // No direct access
    userPrompts: ['create', 'read', 'update', 'delete'], // Own prompts only
    analytics: ['read'], // Personal analytics only
    experiments: []
  }
};
```

### Database Security (RLS Policies)

```sql
-- System prompts: Admin only
CREATE POLICY "Admin can manage system prompts" ON prompt_templates
FOR ALL USING (
  prompt_scope = 'system' AND 
  EXISTS (
    SELECT 1 FROM sdlc_user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- User prompts: Own prompts only
CREATE POLICY "Users can manage own prompts" ON prompt_templates
FOR ALL USING (
  prompt_scope = 'user' AND user_id = auth.uid()
);

-- Usage logs: Own logs only
CREATE POLICY "Users can view own usage" ON prompt_usage_logs
FOR SELECT USING (user_id = auth.uid());
```

---

## 📊 Analytics & Monitoring

### Usage Tracking

Every prompt execution is logged with:
- **Performance metrics**: Response time, token usage
- **Success/failure rates**: Error tracking
- **User attribution**: Who used which prompt
- **Content analysis**: Input/output for optimization

### Analytics Dashboards

1. **Admin Analytics** (`/admin/prompts` → Analytics tab):
   - System-wide usage statistics
   - Prompt performance comparisons
   - User adoption metrics
   - A/B testing results

2. **User Analytics** (`/prompts` → Individual prompt stats):
   - Personal prompt usage
   - Performance metrics
   - Success rates
   - Recent usage history

### Key Metrics

```typescript
interface PromptAnalytics {
  usage_count: number;
  avg_response_time: number;
  success_rate: number;
  total_input_tokens: number;
  total_output_tokens: number;
  last_used: string;
  user_count: number; // How many users used this prompt
  error_rate: number;
  cost_estimate: number; // Based on token usage
}
```

---

## 🚀 Usage Examples

### For End Users

1. **Using Default System Prompts**:
   ```typescript
   // Just call the API - system will use default prompts
   const response = await fetch('/api/generate-business-analysis', {
     method: 'POST',
     body: JSON.stringify({ input: 'Build a CRM system...' })
   });
   ```

2. **Creating Personal Prompts**:
   - Go to `/prompts`
   - Click "New Prompt"
   - Select document type
   - Write custom prompt
   - Set as personal default

3. **Using Custom Prompts**:
   ```typescript
   // Override with custom prompt
   const response = await fetch('/api/generate-business-analysis', {
     method: 'POST',
     body: JSON.stringify({ 
       input: 'Build a CRM system...',
       customPrompt: 'You are a specialized CRM analyst...'
     })
   });
   ```

### For Administrators

1. **Managing System Prompts**:
   - Go to `/admin/prompts`
   - Select document type tab
   - Edit existing or create new system prompts
   - Set as system default

2. **A/B Testing**:
   - Create variant prompt
   - Set up experiment with traffic split
   - Monitor performance metrics
   - Deploy winning variant

3. **User Management**:
   - View all user prompts
   - Monitor usage patterns
   - Moderate content if needed

---

## 🔧 Maintenance & Troubleshooting

### Common Issues

1. **Prompt Not Loading**:
   - Check database connection
   - Verify RLS policies
   - Check user authentication
   - Fall back to hardcoded prompt

2. **Performance Issues**:
   - Review prompt complexity
   - Check token usage
   - Optimize variable substitution
   - Monitor response times

3. **Access Denied**:
   - Verify user role in `sdlc_user_roles`
   - Check RLS policies
   - Confirm authentication status

### Monitoring

```typescript
// Health check endpoint
GET /api/prompts/health
{
  "status": "healthy",
  "database": "connected",
  "prompts_loaded": 25,
  "last_usage": "2024-01-15T10:30:00Z"
}
```

### Backup Strategy

1. **Database Backups**: Regular Supabase backups
2. **Prompt Export**: JSON export functionality
3. **Version Control**: Track prompt changes
4. **Fallback System**: Always maintain hardcoded prompts

---

## 📈 Future Enhancements

### Planned Features

1. **Advanced Analytics**:
   - Cost tracking per prompt
   - Performance benchmarking
   - User behavior analysis

2. **Collaboration Features**:
   - Prompt sharing between users
   - Team prompt libraries
   - Approval workflows

3. **AI-Powered Optimization**:
   - Automatic prompt optimization
   - Performance recommendations
   - Smart A/B testing

4. **Integration Enhancements**:
   - API key management
   - Multi-model support
   - External prompt libraries

---

## 🎯 Summary

The SDLC AI Platform's prompt management system provides:

✅ **Flexibility**: Users can customize prompts without code changes
✅ **Reliability**: 4-tier fallback system ensures system always works
✅ **Security**: Role-based access control and RLS policies
✅ **Analytics**: Comprehensive usage tracking and optimization
✅ **Scalability**: Supports thousands of users and prompts
✅ **Maintainability**: Clean separation of concerns and modular design

This system successfully transforms hardcoded prompts into a dynamic, user-friendly, and enterprise-ready solution that grows with your organization's needs. 
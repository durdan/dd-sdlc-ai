# Freemium System Documentation

## Overview

The SDLC AI platform has implemented a comprehensive freemium system that allows users to access premium features using system-provided API keys with daily usage limits. This document outlines the current implementation, completed features, and pending work.

## System Architecture

### Core Components

1. **Usage Tracking Service** (`lib/usage-tracking-service.ts`)
   - Tracks daily usage limits per user
   - Manages user profiles and subscription types
   - Records project generations and API usage

2. **Freemium Middleware** (`lib/freemium-middleware.ts`)
   - Handles API key selection (system vs user-provided)
   - Enforces daily limits and usage restrictions
   - Provides wrapper functions for endpoint integration

3. **Usage Hook** (`hooks/use-freemium-usage.ts`)
   - React hook for accessing usage data in components
   - Real-time usage tracking and updates
   - Loading and error states

4. **Database Schema** (`database/migrations/20241218_freemium_admin_system.sql`)
   - User profiles with role-based access
   - Daily usage tracking
   - Project generation logging
   - Admin analytics tables

### Services Covered

The freemium system applies to the following services:

1. **SDLC Document Generation** (2 uses/day)
   - Business Analysis
   - Functional Specifications
   - Technical Specifications
   - UX Specifications
   - Mermaid Diagrams

2. **GitHub Code Assistant** (2 uses/day)
   - Repository analysis
   - Code generation
   - Issue summaries
   - Pull request analysis

3. **Claude Code Assistant** (2 uses/day)
   - Advanced code generation
   - Code reviews
   - Debugging assistance
   - Architecture recommendations

## Current Usage Limits

### Free Tier Users
- **Daily Limit**: 2 projects per 24-hour period
- **Services**: All AI-powered features
- **Key Management**: System-provided OpenAI/Claude keys
- **Reset**: Daily at midnight UTC

### Premium Features
- **User-Provided Keys**: Unlimited usage with own API keys
- **Early Access**: Option to enroll for beta features
- **Admin Panel**: For managing user credits and limits

## ✅ Completed Features

### 1. Core Freemium Infrastructure
- [x] Database schema with user profiles and usage tracking
- [x] Daily usage limits enforcement
- [x] Usage tracking service with PostgreSQL functions
- [x] Freemium middleware for API key management
- [x] React hook for usage data access
- [x] Real-time usage indicators in UI

### 2. User Management
- [x] User profile creation and management
- [x] Role-based access control (user, admin, super_admin)
- [x] Subscription type tracking (free, pro, enterprise)
- [x] Usage statistics and analytics

### 3. API Key Management
- [x] System key fallback when user doesn't provide own key
- [x] Graceful handling of missing API keys
- [x] Just-in-time API key prompting
- [x] Secure key storage and validation

### 4. Admin Dashboard
- [x] User statistics and analytics
- [x] Credit management system
- [x] Usage monitoring and reporting
- [x] Role assignment and permissions

### 5. Frontend Integration
- [x] Usage indicators in user header
- [x] Freemium limit notifications
- [x] API key collection dialogs
- [x] Progress tracking with usage feedback

### 6. Database Functions
- [x] `check_daily_project_limit()` - Validates user limits
- [x] `increment_project_count()` - Updates usage counters
- [x] `get_user_statistics()` - Retrieves user analytics
- [x] `get_or_create_daily_usage()` - Manages daily records

### 7. Security & Permissions
- [x] Row Level Security (RLS) policies
- [x] Admin-only access to sensitive data
- [x] User isolation for usage data
- [x] Secure API key handling

## 🚧 Pending Tasks

### 1. High Priority - Critical Fixes
- [ ] Fix missing TypeScript types in dashboard
- [ ] Resolve `isSavingConfig` undefined error
- [ ] Fix GitHub project configuration state variables
- [ ] Add missing dialog state management

### 2. Claude Integration Enhancement
- [ ] Integrate Claude usage tracking with freemium limits
- [ ] Add Claude-specific usage counters
- [ ] Implement Claude + OpenAI combined usage tracking
- [ ] Add Claude API key management

### 3. GitHub Code Assistant Integration
- [ ] Integrate GitHub code assistant with freemium system
- [ ] Add GitHub usage tracking to daily limits
- [ ] Implement GitHub-specific usage counters
- [ ] Add usage feedback for GitHub operations

### 4. Advanced Usage Tracking
- [ ] Separate counters for different service types
- [ ] Token-based usage tracking (not just request counts)
- [ ] Cost estimation and billing preparation
- [ ] Usage analytics and reporting improvements

### 5. Early Access System
- [ ] Early access enrollment flow
- [ ] Beta feature toggles
- [ ] Increased limits for early access users
- [ ] Notification system for early access opportunities

### 6. Enhanced Admin Features
- [ ] Bulk user management
- [ ] Custom limit assignment per user
- [ ] Usage alerts and notifications
- [ ] Advanced analytics dashboard

### 7. User Experience Improvements
- [ ] Better usage visualization
- [ ] Usage history and trends
- [ ] Upgrade prompts and pricing information
- [ ] Onboarding for freemium features

### 8. Mobile Optimization
- [ ] Mobile-friendly usage indicators
- [ ] Responsive admin dashboard
- [ ] Touch-optimized freemium dialogs
- [ ] Mobile usage tracking

## Implementation Status by Service

### SDLC Document Generation
- **Status**: ✅ Fully Implemented
- **Usage Tracking**: ✅ Complete
- **Freemium Integration**: ✅ Complete
- **UI Indicators**: ✅ Complete

### Claude Code Assistant
- **Status**: 🚧 Partial Implementation
- **Usage Tracking**: ❌ Not Integrated
- **Freemium Integration**: ❌ Pending
- **UI Indicators**: ❌ Missing

### GitHub Code Assistant
- **Status**: 🚧 Partial Implementation
- **Usage Tracking**: ❌ Not Integrated
- **Freemium Integration**: ❌ Pending
- **UI Indicators**: ❌ Missing

### Admin Dashboard
- **Status**: ✅ Fully Implemented
- **User Management**: ✅ Complete
- **Analytics**: ✅ Complete
- **Credit Management**: ✅ Complete

## Technical Details

### Database Schema
```sql
-- User profiles with freemium settings
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    daily_project_limit INTEGER DEFAULT 2,
    subscription_type TEXT DEFAULT 'free',
    role TEXT DEFAULT 'user'
);

-- Daily usage tracking
CREATE TABLE daily_usage (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    usage_date DATE DEFAULT CURRENT_DATE,
    projects_created INTEGER DEFAULT 0,
    system_key_used BOOLEAN DEFAULT false,
    user_key_used BOOLEAN DEFAULT false
);

-- Project generation tracking
CREATE TABLE project_generations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    project_type TEXT NOT NULL,
    generation_method TEXT CHECK (generation_method IN ('system_key', 'user_key')),
    success BOOLEAN DEFAULT true,
    tokens_used INTEGER DEFAULT 0,
    cost_estimate DECIMAL(10,4) DEFAULT 0
);
```

### API Integration Pattern
```typescript
// Freemium middleware usage
export function withFreemiumSupport(config: FreemiumConfig, handler: Function) {
  return async (request: NextRequest) => {
    const freemiumResult = await handleFreemiumRequest(request, config)
    
    if (!freemiumResult.canProceed) {
      return createFreemiumErrorResponse(freemiumResult.error)
    }
    
    // Use freemiumResult.openaiClient for API calls
    const response = await handler(request, freemiumResult)
    
    // Record usage after successful completion
    await recordProjectGeneration(...)
    
    return response
  }
}
```

## Error Handling

### Common Error Patterns
1. **Daily Limit Exceeded**: Prompt user to provide own API key
2. **No API Key Available**: Show configuration dialog
3. **Invalid API Key**: Validation and error feedback
4. **Service Unavailable**: Fallback to user keys

## Next Steps

1. **Fix Critical Errors**: Address TypeScript and state management issues
2. **Expand Service Coverage**: Integrate Claude and GitHub assistants
3. **Enhance Analytics**: Add detailed usage tracking and reporting
4. **Improve UX**: Better usage visualization and upgrade prompts
5. **Scale Infrastructure**: Prepare for increased user base

## Support and Maintenance

- **Database Migrations**: Use provided SQL scripts for schema updates
- **API Key Rotation**: System keys should be rotated regularly
- **Usage Monitoring**: Monitor daily limits and adjust as needed
- **Cost Management**: Track API usage costs and optimize

---

*Last Updated: December 2024*
*Version: 1.0.0* 
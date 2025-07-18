# Database Setup Guide

This guide will help you set up the database for the SDLC Automation Platform.

## Quick Setup (Recommended)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be created (this may take a few minutes)
3. Note down your project URL and anon key

### 2. Run Initial Setup Script

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Copy the entire contents of `database/schema/initial-setup.sql`
4. Paste it into the SQL editor
5. Click **Run** to execute the script

The script will create:
- ✅ All required tables for SDLC projects
- ✅ Prompt management system
- ✅ Early access and freemium features
- ✅ GitDigest repository analysis
- ✅ Slack integration tables
- ✅ User roles and permissions
- ✅ Analytics and usage tracking
- ✅ Default prompts and templates
- ✅ Row Level Security (RLS) policies
- ✅ Performance indexes
- ✅ Helper functions and triggers

### 3. Verify Setup

After running the script, you should see a completion message with counts of created items.

## Manual Setup (Advanced)

The initial setup script consolidates all database components into a single file. If you need to understand the structure, the script is organized into sections:

1. **Core SDLC Tables** - Basic project and document management
2. **User Roles & Permissions** - Role-based access control
3. **Prompt Management System** - AI prompt templates and analytics
4. **Early Access & Freemium** - Beta features and usage limits
5. **Advanced SDLC Tables** - AI tasks, code generation, security
6. **GitDigest Repository Analysis** - Repository analysis and reporting
7. **Slack Integration** - Team collaboration features
8. **Analytics & Usage Tracking** - Comprehensive monitoring

The script is designed to be idempotent - you can run it multiple times safely.

## Database Schema Overview

### Core Tables

| Table | Purpose |
|-------|---------|
| `sdlc_projects` | Main project storage |
| `documents` | Generated SDLC documents |
| `integrations` | External platform integrations |
| `user_configurations` | User API keys and settings |
| `progress_logs` | Project progress tracking |
| `templates` | Reusable project templates |
| `audit_logs` | System audit trail |

### Prompt Management

| Table | Purpose |
|-------|---------|
| `prompt_templates` | AI prompt templates |
| `prompt_usage_logs` | Usage analytics |
| `prompt_experiments` | A/B testing |
| `user_roles` | Role-based access control |

### Early Access & Freemium

| Table | Purpose |
|-------|---------|
| `early_access_enrollments` | Beta access management |
| `beta_features` | Feature flags |
| `user_feature_access` | User feature permissions |
| `early_access_waitlist` | Waitlist management |
| `credit_requests` | Usage limit requests |

### GitDigest

| Table | Purpose |
|-------|---------|
| `repo_digests` | Repository analysis data |
| `daily_reports` | Daily change summaries |
| `digest_shares` | Shareable repository insights |
| `digest_analytics` | Usage tracking |
| `digest_subscriptions` | Notification subscriptions |
| `gitdigest_settings` | User preferences |

### Integrations

| Table | Purpose |
|-------|---------|
| `slack_workspaces` | Slack workspace connections |
| `slack_notifications` | Slack message history |

### Analytics

| Table | Purpose |
|-------|---------|
| `daily_usage` | User usage tracking |
| `anonymous_analytics` | Anonymous usage data |

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Users can only access their own data**
- **Admins have full access to manage the system**
- **Public data (like shared digests) is accessible to all**
- **System functions can insert audit logs**

### Data Protection

- All sensitive data (API keys) is stored encrypted
- User configurations are isolated per user
- Audit logs track all system activities
- Anonymous analytics don't contain personal data

## Performance Optimizations

### Indexes

The setup script creates optimized indexes for:

- User-based queries (most common)
- Date-based analytics
- Status-based filtering
- Full-text search on content
- Foreign key relationships

### Functions

Helper functions are included for:

- `has_beta_feature_access()` - Check feature permissions
- `get_active_prompt()` - Get default prompts
- `log_prompt_usage()` - Track AI usage
- `generate_share_token()` - Create secure share links

## Troubleshooting

### Common Issues

**Error: "relation already exists"**
- The script uses `CREATE TABLE IF NOT EXISTS` so this shouldn't happen
- If it does, you can safely ignore these errors

**Error: "permission denied"**
- Make sure you're running the script as a database owner
- Check that your Supabase project has the necessary permissions

**Error: "extension not available"**
- The script enables `uuid-ossp` and `pgcrypto` extensions
- These should be available in all Supabase projects

### Verification Queries

Run these queries to verify your setup:

```sql
-- Check table count
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check default prompts
SELECT COUNT(*) as prompt_count FROM prompt_templates 
WHERE is_system_default = true;

-- Check RLS policies
SELECT COUNT(*) as policy_count FROM pg_policies 
WHERE schemaname = 'public';

-- Check indexes
SELECT COUNT(*) as index_count FROM pg_indexes 
WHERE schemaname = 'public';
```

## Next Steps

After setting up the database:

1. **Configure Environment Variables** - See [Environment Setup](./environment-setup.md)
2. **Set up Authentication** - See [Auth Setup](./AUTH_SETUP.md)
3. **Configure Integrations** - See integration guides in `/docs/setup/`
4. **Create Admin User** - The first user to sign up will become admin

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting) above
2. Review the [GitHub issues](https://github.com/your-org/sdlc-automation-platform/issues)
3. Join our [Discussions](https://github.com/your-org/sdlc-automation-platform/discussions)
4. Check the [development logs](../development/debug-logs/) for similar issues 
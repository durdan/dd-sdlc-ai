# 🚀 GitHub Projects Integration Setup Guide

This guide helps you set up GitHub Projects v2 integration with SDLC.dev to automatically create project boards from your generated SDLC documents.

## 📋 Prerequisites

- GitHub account with access to create GitHub Projects v2
- SDLC.dev account 
- Repository where you want to create projects

## 🔑 Required GitHub Token Permissions

For GitHub Projects integration to work, your GitHub token needs these **specific scopes**:

### **Essential for GitHub Projects v2:**
- ✅ `project` - **Create and manage GitHub Projects v2**
- ✅ `read:project` - **Read GitHub Projects v2 data**

### **Essential for Repository Integration:**
- ✅ `repo` - **Full control of repositories**
- ✅ `issues:write` - **Create and manage issues**
- ✅ `pull_requests:write` - **Create and manage pull requests**

### **Additional Recommended Scopes:**
- ✅ `read:user` - **Read user profile**
- ✅ `user:email` - **Access user email**
- ✅ `workflow` - **Manage GitHub Actions workflows**
- ✅ `actions:write` - **Create GitHub Actions**

## 🛠️ Setup Methods

### **Method 1: OAuth Connection (Recommended)**

1. **Go to Integration Hub**
   - Navigate to your SDLC.dev dashboard
   - Click **Integration Hub** → **GitHub**

2. **Connect via OAuth**
   - Click **"Connect GitHub"** button
   - You'll be redirected to GitHub
   - **Authorize** the application with required permissions
   - You'll be redirected back automatically

3. **Verify Connection**
   - Check that GitHub shows as **"Connected"** ✅
   - Your repositories should appear in dropdowns

### **Method 2: Personal Access Token (Manual)**

1. **Create Personal Access Token**
   - Go to GitHub **Settings** → **Developer settings** → **Personal access tokens**
   - Click **"Generate new token (classic)"**
   - **Token name**: `SDLC.dev Integration`
   - **Expiration**: Choose your preference (90 days recommended)

2. **Select Required Scopes**
   ```
   Repository permissions:
   ☑️ repo                    (Full control of private repositories)
   ☑️ write:repo_hook        (Write repository hooks)
   
   GitHub Projects permissions:
   ☑️ project                (Full control of GitHub Projects v2)  ⭐ CRITICAL
   ☑️ read:project           (Read GitHub Projects v2 data)        ⭐ CRITICAL
   
   User permissions:
   ☑️ read:user              (Read user profile data)
   ☑️ user:email             (Access user email addresses)
   
   Actions permissions:
   ☑️ workflow               (Update GitHub Action workflows)
   ☑️ actions:write          (Write GitHub Actions)
   
   Issues & PRs permissions:
   ☑️ issues:write           (Create and comment on issues)
   ☑️ pull_requests:write    (Create and manage pull requests)
   ```

3. **Copy and Store Token**
   - Click **"Generate token"**
   - **Copy the token immediately** (you won't see it again!)
   - Store it securely

4. **Add to SDLC.dev**
   - Go to Integration Hub → GitHub
   - Paste token in **"GitHub Token"** field
   - Click **"Save Configuration"**

## ✅ Testing Your Setup

### **Test GitHub Projects Creation**

1. **Generate SDLC Documents**
   - Create any project in SDLC.dev
   - Generate Business Analysis, Functional Spec, etc.

2. **Create GitHub Project**
   - Click **"Create GitHub Project"** button
   - Select your repository
   - Enter project name
   - Click **"Create Project"**

3. **Verify Success**
   - Check that project is created in GitHub
   - Verify issues and milestones are generated
   - Confirm project board structure

## 🚨 Common Issues & Solutions

### **Error: "Missing required scopes: project, read:project"**
```
❌ Problem: Token doesn't have GitHub Projects permissions
✅ Solution: Add `project` and `read:project` scopes to your token
```

### **Error: "GitHub not connected"**
```
❌ Problem: No GitHub token found
✅ Solution: Complete OAuth flow or add personal access token
```

### **Error: "Repository not found"**
```
❌ Problem: Token doesn't have access to repository
✅ Solution: Ensure `repo` scope is enabled and you have repository access
```

### **Issues/Milestones Not Created**
```
❌ Problem: Missing repository permissions
✅ Solution: Add `issues:write` scope to your token
```

## 🔐 Security Best Practices

### **Token Security**
- ✅ Use tokens with **minimum required scopes**
- ✅ Set **expiration dates** on tokens
- ✅ **Rotate tokens** regularly
- ✅ **Never share** tokens in public repositories

### **Repository Access**
- ✅ Only grant access to **necessary repositories**
- ✅ Use **organization tokens** for team projects
- ✅ **Review permissions** periodically

## 📊 What Gets Created

When you create a GitHub Project from SDLC documents:

### **Project Structure**
- 📋 **Project Board** with custom fields
- 🏷️ **Labels** for categorization
- 📅 **Milestones** for project phases
- 🎯 **Issues** for each SDLC section

### **Custom Fields**
- **Priority** (High, Medium, Low)
- **Epic** (Business Analysis, Technical Spec, etc.)
- **Story Points** (Estimated effort)
- **Status** (Todo, In Progress, Done)

### **Generated Issues**
- Business Analysis tasks
- Functional requirements
- Technical implementation items
- UX/UI design tasks
- Architecture setup tasks

## 🎯 Advanced Usage

### **Multiple Repositories**
- Connect multiple repositories with one token
- Create projects across different repositories
- Organize by teams or project types

### **Team Collaboration**
- Use **organization tokens** for team access
- Set up **project templates** for consistency
- Configure **automation rules** for workflow

## 📞 Need Help?

- 📖 **Documentation**: Visit `/admin/prompts/guide`
- 🐛 **Issues**: Report on GitHub
- 💬 **Support**: Contact support team

---

## 🎉 You're All Set!

Once configured, you can create GitHub Projects directly from any SDLC document with just a few clicks! 
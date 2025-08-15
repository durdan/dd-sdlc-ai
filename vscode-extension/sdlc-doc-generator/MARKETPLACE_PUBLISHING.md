# 📦 VS Code Marketplace Publishing Guide

## Prerequisites
- Tested extension locally
- Microsoft/GitHub account
- Azure DevOps account (free)
- Logo/icon for extension (128x128 PNG)

## 🎯 Step 1: Create Publisher Account

### 1.1 Create Azure DevOps Account
1. Go to [https://dev.azure.com](https://dev.azure.com)
2. Sign in with Microsoft/GitHub account
3. Create new organization if needed

### 1.2 Get Personal Access Token (PAT)
1. Click user icon (top right) → "Personal access tokens"
2. Click "New Token"
3. Configure:
   - **Name**: `vscode-marketplace`
   - **Organization**: Select "All accessible organizations"
   - **Expiration**: 90 days (or custom)
   - **Scopes**: Click "Show all scopes" → Check:
     - ✅ Marketplace → Acquire
     - ✅ Marketplace → Publish
     - ✅ Marketplace → Manage
4. Click "Create"
5. **COPY AND SAVE THE TOKEN** (shown only once!)

### 1.3 Create Publisher
```bash
# Install vsce globally
npm install -g @vscode/vsce

# Create publisher (replace 'your-publisher-name')
vsce create-publisher your-publisher-name

# Enter:
# - Publisher name: sdlc-dev (or your choice)
# - Display name: SDLC.dev
# - Email: your-email@example.com
# - Personal Access Token: (paste from step 1.2)
```

## 🎨 Step 2: Prepare Extension Assets

### 2.1 Create Icon
Create `resources/icons/icon.png` (128x128 PNG):
```bash
# Create icons directory if not exists
mkdir -p resources/icons
```

Suggested icon design:
- Background: Gradient blue
- Symbol: Document with AI sparkles
- Format: PNG with transparency

### 2.2 Update package.json
```json
{
  "publisher": "sdlc-dev",  // Your publisher name
  "icon": "resources/icons/icon.png",
  "galleryBanner": {
    "color": "#0969da",
    "theme": "dark"
  },
  "badges": [
    {
      "url": "https://img.shields.io/badge/PRs-welcome-brightgreen.svg",
      "href": "https://github.com/yourusername/sdlc-doc-generator-vscode",
      "description": "PRs Welcome"
    }
  ]
}
```

### 2.3 Create CHANGELOG.md
```markdown
# Change Log

## [1.0.0] - 2024-01-XX
- Initial release
- 8 document types support
- Usage tracking (10/20 daily limit)
- Authentication support
- Context detection
- Document preview and export
```

### 2.4 Update README with Screenshots
Add screenshots to `README.md`:
1. Take screenshots of:
   - Command palette with SDLC commands
   - Document generation in progress
   - Generated document preview
   - Sidebar with account status
2. Save in `resources/screenshots/`
3. Reference in README

## 📋 Step 3: Pre-publish Checklist

### Required Files
- [x] package.json (with all required fields)
- [x] README.md (with features, usage, screenshots)
- [x] CHANGELOG.md
- [x] LICENSE (MIT recommended)
- [x] Icon (128x128 PNG)
- [x] .vscodeignore (exclude unnecessary files)

### package.json Required Fields
```json
{
  "name": "sdlc-doc-generator",
  "displayName": "SDLC Document Generator",
  "description": "Generate AI-powered SDLC documents",
  "version": "1.0.0",
  "publisher": "your-publisher-id",
  "engines": {
    "vscode": "^1.74.0"
  },
  "categories": ["Other"],
  "icon": "resources/icons/icon.png",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/repo"
  },
  "homepage": "https://www.sdlc.dev",
  "bugs": {
    "url": "https://github.com/yourusername/repo/issues"
  }
}
```

## 🚀 Step 4: Build and Package

### 4.1 Install Dependencies
```bash
cd vscode-extension/sdlc-doc-generator
npm install
npm run compile
```

### 4.2 Package Extension
```bash
# Package without publishing (for testing)
vsce package

# This creates: sdlc-doc-generator-1.0.0.vsix
```

### 4.3 Test VSIX File
```bash
# Install locally to test
code --install-extension sdlc-doc-generator-1.0.0.vsix

# Test all features
# Then uninstall
code --uninstall-extension your-publisher-id.sdlc-doc-generator
```

## 🌐 Step 5: Publish to Marketplace

### 5.1 Login to Publisher
```bash
vsce login your-publisher-name
# Enter Personal Access Token when prompted
```

### 5.2 Publish Extension
```bash
# Publish to marketplace
vsce publish

# Or specify version bump
vsce publish minor  # 1.0.0 → 1.1.0
vsce publish major  # 1.0.0 → 2.0.0
vsce publish patch  # 1.0.0 → 1.0.1
```

### 5.3 Alternative: Publish with Token
```bash
# Publish directly with token (CI/CD friendly)
vsce publish -p <your-personal-access-token>
```

## 📊 Step 6: Marketplace Listing Optimization

### 6.1 Marketplace URL
Your extension will be available at:
```
https://marketplace.visualstudio.com/items?itemName=your-publisher.sdlc-doc-generator
```

### 6.2 Update Marketplace Presentation
1. Go to [Marketplace Publisher Portal](https://marketplace.visualstudio.com/manage)
2. Click on your extension
3. Edit:
   - **Categories**: Programming Languages, Snippets, Other
   - **Tags**: sdlc, documentation, ai, chatgpt, claude, business-analysis
   - **Q&A**: Enable
   - **Links**: Add GitHub, documentation, support

### 6.3 Add Demo GIF
1. Record demo with ScreenToGif or similar
2. Keep under 5MB
3. Add to README:
```markdown
![Demo](https://raw.githubusercontent.com/username/repo/main/demo.gif)
```

## 🔄 Step 7: Updates and Maintenance

### 7.1 Update Extension
```bash
# Update version in package.json
# Update CHANGELOG.md

# Publish update
vsce publish
```

### 7.2 Automated Publishing (GitHub Actions)
Create `.github/workflows/publish.yml`:
```yaml
name: Publish to VS Code Marketplace

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run compile
      - run: npm install -g @vscode/vsce
      - run: vsce publish -p ${{ secrets.VSCE_TOKEN }}
```

Add secret to GitHub:
1. Go to Settings → Secrets → Actions
2. Add `VSCE_TOKEN` with your PAT

## 📈 Step 8: Marketing & Growth

### 8.1 Launch Checklist
- [ ] Tweet announcement with #vscode hashtag
- [ ] Post on Reddit: r/vscode, r/programming
- [ ] Write Dev.to article
- [ ] Submit to VS Code extension collections
- [ ] Add to Product Hunt
- [ ] Create YouTube demo video

### 8.2 SEO Optimization
Keywords to include in description:
- AI documentation generator
- SDLC automation
- Business analysis tool
- Technical specification
- ChatGPT/Claude for VS Code
- Architecture diagram generator
- Test specification TDD/BDD

### 8.3 Monitor Analytics
Check weekly at [Publisher Portal](https://marketplace.visualstudio.com/manage):
- Install count
- Ratings and reviews
- Crash reports
- User feedback

## 🎯 Success Metrics

### Week 1 Goals
- 100+ installs
- 5+ ratings (aim for 5 stars)
- 0 critical bugs

### Month 1 Goals
- 1,000+ installs
- 20+ ratings
- 3+ blog posts/videos from users

## 🚨 Troubleshooting

### "ERROR: Missing publisher name"
```bash
vsce publish -p TOKEN --publisher your-publisher-name
```

### "ERROR: Not logged in"
```bash
vsce login your-publisher-name
```

### "ERROR: Invalid token"
- Token may be expired
- Create new token in Azure DevOps
- Ensure "All accessible organizations" is selected

### "ERROR: Version already exists"
- Bump version in package.json
- Run `vsce publish patch/minor/major`

## 📝 Final Checklist Before Publishing

- [ ] Tested locally with F5
- [ ] Tested VSIX installation
- [ ] All commands work
- [ ] Usage tracking works
- [ ] Sign in flow works
- [ ] README has screenshots
- [ ] Icon looks good
- [ ] No console errors
- [ ] Version number correct
- [ ] CHANGELOG updated
- [ ] Repository URL valid
- [ ] Support email added

## 🎉 Congratulations!
Your extension is now live on VS Code Marketplace!

Share your extension URL:
```
https://marketplace.visualstudio.com/items?itemName=sdlc-dev.sdlc-doc-generator
```
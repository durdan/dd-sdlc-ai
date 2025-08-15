# 🧪 Local Testing Guide for SDLC Document Generator VS Code Extension

## Prerequisites
- Node.js 18+ installed
- VS Code installed
- Main Next.js app running locally
- npm or yarn package manager

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd vscode-extension/sdlc-doc-generator
npm install
```

### 2. Start Your Next.js App (Main Project)
```bash
# In main project directory
npm run dev
# Should be running on http://localhost:3000
```

### 3. Compile the Extension
```bash
# In extension directory
npm run compile
```

### 4. Test in VS Code
Press `F5` in VS Code with the extension folder open. This will:
- Compile the TypeScript code
- Launch a new VS Code window with the extension loaded
- Show debug console for logs

## 📝 Step-by-Step Testing

### Test 1: Anonymous User Flow
1. Open the Extension Development Host window
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "SDLC" to see all commands
4. Select "SDLC Docs: Generate Business Analysis"
5. Enter a test description
6. Verify document generates (should work without sign-in)
7. Check status bar shows usage (e.g., "SDLC: 1/10")

### Test 2: Usage Limits
1. Generate 10 documents as anonymous user
2. Try to generate 11th document
3. Should see limit reached message
4. Verify "Sign In" option appears

### Test 3: Sign In Flow
1. Run command "SDLC Docs: Sign In"
2. Browser opens to `http://localhost:3000/auth/vscode`
3. Sign in with your account
4. Copy the auth code
5. Paste in VS Code prompt
6. Verify signed in (check Account view in sidebar)
7. Usage limit should now be 20

### Test 4: Context Menu
1. Right-click on any file in Explorer
2. Select "SDLC Docs: Quick Generate Document"
3. Choose document type
4. Verify it uses file content as context

### Test 5: Sidebar Views
1. Click SDLC icon in Activity Bar
2. Check three views:
   - Quick Actions (all document types)
   - Recent Documents (history)
   - Account (status and usage)
3. Click items to test functionality

## 🐛 Debugging

### Enable Debug Logs
In the Extension Development Host window:
1. Open Output panel (`View > Output`)
2. Select "SDLC Document Generator" from dropdown
3. Watch logs during operations

### Common Issues & Solutions

**Issue: "Cannot connect to API"**
```bash
# Check if Next.js is running
curl http://localhost:3000/api/vscode/usage
```

**Issue: "Device ID not found"**
- Clear extension storage: `Developer: Reload Window`

**Issue: "Authentication failed"**
- Check Supabase is configured correctly
- Verify auth tables exist in database

### Debug with Breakpoints
1. Set breakpoints in TypeScript files
2. Press F5 to start debugging
3. Breakpoints will pause execution

## 🔧 Configuration for Local Testing

### Update API Endpoint (if needed)
1. Open Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "SDLC"
3. Change "Api Endpoint" to your local server

Or edit `.vscode/settings.json`:
```json
{
  "sdlc-doc-generator.apiEndpoint": "http://localhost:3000/api/vscode"
}
```

### Test with Different Ports
```json
// For different port
"sdlc-doc-generator.apiEndpoint": "http://localhost:4000/api/vscode"
```

## 📊 Testing Checklist

- [ ] Extension activates without errors
- [ ] All 8 document types generate correctly
- [ ] Anonymous usage tracking works (10 limit)
- [ ] Sign in flow completes successfully
- [ ] Authenticated usage tracking works (20 limit)
- [ ] Context detection from workspace
- [ ] Document preview displays correctly
- [ ] Export to file works
- [ ] Copy to clipboard works
- [ ] History shows recent documents
- [ ] Status bar updates correctly
- [ ] Keyboard shortcut works (Ctrl+Shift+D)
- [ ] Context menu integration works
- [ ] Error messages display properly
- [ ] Offline handling works

## 🔄 Making Changes

1. Edit TypeScript files in `src/`
2. Run `npm run compile` or `npm run watch`
3. Reload Extension Host window (`Ctrl+R` or `Cmd+R`)
4. Test your changes

## 📦 Build for Production Testing

```bash
# Create VSIX package
npm install -g vsce
vsce package

# Install in VS Code for testing
code --install-extension sdlc-doc-generator-1.0.0.vsix
```

## 🎯 Test Data Examples

### Business Analysis Input
```
E-commerce platform for selling handmade crafts with user authentication, 
product catalog, shopping cart, and payment processing.
```

### Technical Spec Input
```
Microservices architecture using Node.js, React, PostgreSQL, Redis cache, 
and Docker containers deployed on AWS ECS.
```

### Test Spec Input
```
Testing requirements for REST API with user authentication, CRUD operations, 
and real-time notifications using WebSockets.
```

## 📹 Recording Demo
1. Start recording with OBS or similar
2. Show all features in order:
   - Quick generate
   - Multiple document types
   - Usage limits
   - Sign in process
   - Context detection
3. Keep demo under 2 minutes

## ✅ Ready for Production?
Once all tests pass locally:
1. Update version in `package.json`
2. Build production package
3. Test VSIX file installation
4. Proceed to marketplace publishing
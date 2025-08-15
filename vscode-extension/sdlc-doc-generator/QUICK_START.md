# 🚀 Quick Start Guide

## ✅ Compilation Successful!

Your VS Code extension has been successfully compiled. Here's how to test it:

## 🧪 Test Locally (5 minutes)

### Option 1: Using VS Code UI
1. Open VS Code
2. File → Open Folder → Select `vscode-extension/sdlc-doc-generator`
3. Press `F5` to launch test instance
4. New VS Code window opens with extension loaded
5. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
6. Type "SDLC" to see all commands
7. Try generating a document!

### Option 2: Command Line
```bash
# In extension directory
cd vscode-extension/sdlc-doc-generator

# Make sure your main app is running (in main project root)
cd ../.. && npm run dev

# Back to extension directory
cd vscode-extension/sdlc-doc-generator

# Open VS Code
code .

# Then press F5 in VS Code
```

## 📦 Create Package for Testing

```bash
# Install packaging tool (one time only)
npm install -g @vscode/vsce

# Create VSIX package
vsce package

# You'll see: Created: sdlc-doc-generator-1.0.0.vsix
```

## 🎯 Test the Package

```bash
# Install the extension in your regular VS Code
code --install-extension sdlc-doc-generator-1.0.0.vsix

# Test it out!
# Open any project and press Ctrl+Shift+D
```

## 🏪 Publish to Marketplace

### 1. Create Publisher (First Time Only)
```bash
# Go to https://dev.azure.com
# Create Personal Access Token (PAT)
# Then:
vsce create-publisher your-publisher-id
```

### 2. Update package.json
```json
{
  "publisher": "your-publisher-id"
}
```

### 3. Publish
```bash
vsce publish
```

## 🔥 Test Commands Right Now

With extension running (after pressing F5):

1. **Quick Generate**: `Ctrl+Shift+D` (or `Cmd+Shift+D`)
2. **Command Palette**: `Ctrl+Shift+P` → "SDLC"
3. **Right Click**: On any file → "Quick Generate Document"
4. **Sidebar**: Click SDLC icon in Activity Bar

## 📊 What to Test

- [ ] Generate a Business Analysis (no sign-in needed)
- [ ] Check status bar shows "SDLC: 1/10"
- [ ] Generate 10 documents (hit the limit)
- [ ] Try sign in flow
- [ ] Generate with signed-in account (20 limit)

## 🐛 Troubleshooting

**"Cannot find module" errors**
```bash
npm install
npm run compile
```

**"API connection failed"**
Make sure your main app is running:
```bash
cd ../.. # Go to main project
npm run dev
```

**"Command not found"**
Reload window: `Ctrl+R` (or `Cmd+R`) in test VS Code

## 🎉 Success Indicators

✅ Extension loads without errors
✅ Commands appear in palette
✅ Status bar shows usage
✅ Documents generate successfully
✅ Usage tracking works

## 📝 Next Steps

1. **Test locally** with F5
2. **Package** with `vsce package`
3. **Share** VSIX file with team
4. **Publish** to marketplace when ready

---

**Need help?** Check `LOCAL_TESTING.md` for detailed guide
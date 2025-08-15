# 🧪 Extension Testing Instructions for Mac

## ⚠️ Troubleshooting "No matching commands"

If you see "No matching commands" when typing "SDLC", follow these steps:

### Method 1: Direct VS Code Launch
```bash
# 1. Make sure you're in the extension directory
cd /Users/durdan/devel/projects/dd-sdlc-ai/CascadeProjects/windsurf-project/vscode-extension/sdlc-doc-generator

# 2. Open VS Code from this directory
code .
```

### Method 2: Debug Launch
In VS Code with the extension folder open:

1. **Open Run and Debug panel**: 
   - Click the Run icon in the Activity Bar (left sidebar)
   - Or press `⌘ + Shift + D`

2. **Select "Run Extension"** from the dropdown at the top

3. **Press the green play button** or press `F5`

4. **Wait for new VS Code window** to open (Extension Development Host)

### Method 3: Check Extension is Active
In the Extension Development Host window:

1. Open **Output** panel: `View → Output` or `⌘ + Shift + U`
2. Select **"SDLC Document Generator"** from dropdown
3. You should see: `SDLC Document Generator is now active!`

If not active, check:
- **Extension Host** output for errors
- **Debug Console** for any issues

### Method 4: Reload Window
If extension doesn't load:
1. Press `⌘ + Shift + P`
2. Type "Developer: Reload Window"
3. Press Enter

### Testing Commands Once Loaded

Try these commands in order:

1. **Simple test command**:
   - `⌘ + Shift + P`
   - Type: `SDLC Docs: Check Usage Limits`
   - This should work even without API

2. **Quick Generate**:
   - Press `⌘ + Shift + D`
   - Or `⌘ + Shift + P` → "SDLC Docs: Quick Generate"

3. **Check Status Bar**:
   - Look at bottom right
   - Should show: `SDLC: 0/10`

### If Still Not Working

1. **Check compilation**:
```bash
npm run compile
# Should complete without errors
```

2. **Check output folder**:
```bash
ls -la out/
# Should contain extension.js and folders
```

3. **Install locally for testing**:
```bash
# Create package
vsce package

# Install in regular VS Code
code --install-extension sdlc-doc-generator-1.0.0.vsix
```

4. **Restart VS Code completely**:
   - Quit VS Code (`⌘ + Q`)
   - Reopen and try again

### Console Commands for Debugging

With Extension Development Host open:
1. Open Developer Tools: `⌘ + Option + I`
2. Check Console tab for errors
3. Look for "SDLC Document Generator is now active!"

### Quick Fix Script
```bash
#!/bin/bash
# Run this in extension directory

# Clean and rebuild
rm -rf out/
npm run compile

# Open in VS Code
code .

echo "Now press F5 in VS Code to test"
```

## ✅ Success Indicators

When working correctly:
- Status bar shows `SDLC: 0/10` at bottom right
- Commands appear when typing "SDLC" in command palette
- Sidebar shows SDLC icon in Activity Bar
- No errors in Output → Extension Host

## 🎯 Alternative: Direct Command Test

If extension loads but commands don't appear, test directly:

1. Open Command Palette: `⌘ + Shift + P`
2. Type exactly: `>SDLC Docs: Check Usage Limits`
3. Include the `>` symbol to force command search

---

**Still having issues?** The extension might need to be packaged first:
```bash
vsce package
code --install-extension sdlc-doc-generator-1.0.0.vsix
```
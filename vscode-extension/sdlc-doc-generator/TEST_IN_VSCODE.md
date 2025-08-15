# Testing the Extension - Troubleshooting Guide

## The Issue
The extension commands are not being registered in Cursor/VS Code despite the extension being installed.

## Quick Test Steps

### Option 1: Test in Development Mode
This is the most reliable way to test and debug:

```bash
# 1. Open the extension folder in VS Code/Cursor
code /Users/durdan/devel/projects/dd-sdlc-ai/CascadeProjects/windsurf-project/vscode-extension/sdlc-doc-generator

# 2. Once opened, press F5 to launch a new window with the extension loaded
# 3. You should see "SDLC Extension Activated!" notification
# 4. Check for "SDLC Active" in the status bar
```

### Option 2: Manual Command Test
After reloading VS Code:
1. Press `Cmd+Shift+P`
2. Type: `SDLC`
3. You should see at least: "SDLC Docs: Test SDLC Extension"

### Option 3: Check Extension Host Output
1. Press `Cmd+Shift+P`
2. Type: "Developer: Show Logs"
3. Select "Extension Host"
4. Look for any errors related to "sdlc-doc-generator"

## What We've Fixed
1. ✅ Added `activationEvents: ["onStartupFinished"]` to ensure activation
2. ✅ Created missing icon file
3. ✅ Simplified extension to minimal working version
4. ✅ Verified all files are compiled and packaged

## Current Extension Status
- Uses minimal activation (extension-minimal.js)
- Should show "SDLC Extension Activated!" on startup
- Should show "SDLC Active" in status bar
- Test command should work

## If Still Not Working

### Check if it's a Cursor-specific issue:
Cursor (VS Code fork) might handle extensions differently. Try:
1. Install regular VS Code: https://code.visualstudio.com/
2. Install the extension there: 
   ```bash
   code --install-extension /Users/durdan/devel/projects/dd-sdlc-ai/CascadeProjects/windsurf-project/vscode-extension/sdlc-doc-generator/sdlc-doc-generator-1.0.0.vsix
   ```

### Alternative: Use code-insiders
```bash
code-insiders --install-extension /Users/durdan/devel/projects/dd-sdlc-ai/CascadeProjects/windsurf-project/vscode-extension/sdlc-doc-generator/sdlc-doc-generator-1.0.0.vsix
```

## Debug Information Needed
If the extension still doesn't work, please provide:
1. Output from Extension Host logs
2. Any errors in Developer Console
3. Result of: `code --list-extensions --show-versions | grep sdlc`
4. Your VS Code/Cursor version: Help → About
# VS Code Extension Diagnostic Guide

## Quick Diagnosis Steps

### 1. Check Extension Status
1. Open VS Code
2. Press `Cmd+Shift+P` to open Command Palette
3. Type "Extensions: Show Installed Extensions"
4. Search for "SDLC" - you should see "SDLC Document Generator"
5. Make sure it's enabled (not disabled)

### 2. Check Developer Console for Errors
1. In VS Code, go to `Help` → `Toggle Developer Tools`
2. Click on the "Console" tab
3. Look for any red error messages related to "sdlc-doc-generator"
4. Common issues:
   - Module not found errors
   - Activation errors
   - Permission errors

### 3. Test Basic Activation
1. Press `Cmd+Shift+P`
2. Type "Developer: Reload Window" and press Enter
3. After reload, immediately check Developer Console
4. You should see: "SDLC Document Generator is now active!"

### 4. Manual Test Command
Try running this in VS Code's integrated terminal:
```bash
# Check if extension files are accessible
ls ~/.vscode/extensions/sdlc-dev.sdlc-doc-generator*/out/
```

### 5. Check Extension Host Log
1. Press `Cmd+Shift+P`
2. Type "Developer: Show Logs..."
3. Select "Extension Host"
4. Look for errors related to the extension

## Common Issues and Fixes

### Issue: "Command not found" errors
**Cause**: Extension not activating properly
**Fix**: 
1. Ensure `activationEvents` includes `"onStartupFinished"` ✅ (Already fixed)
2. Check that all required dependencies are installed
3. Verify the main entry point exists

### Issue: Module resolution errors
**Cause**: Missing dependencies or incorrect paths
**Fix**:
1. Run `npm install` in the extension directory
2. Ensure all TypeScript files compile without errors
3. Check that import paths are correct

### Issue: Extension not appearing in sidebar
**Cause**: View container registration issue
**Fix**:
1. Verify icon file exists at `resources/icons/sidebar.svg`
2. Check package.json contributes section

## Development Mode Testing

For better debugging, run in development mode:

1. Open the extension folder:
```bash
code /Users/durdan/devel/projects/dd-sdlc-ai/CascadeProjects/windsurf-project/vscode-extension/sdlc-doc-generator
```

2. Press `F5` to launch a new VS Code window with the extension loaded in debug mode

3. In the debug console, you'll see detailed logs

4. Set breakpoints in `src/extension.ts` at line 17 (activate function) to debug activation

## Current Status

✅ Extension compiled successfully
✅ VSIX package created
✅ Extension installed in VS Code
✅ Activation events configured
❓ Commands not registering - needs investigation

## Next Steps

1. Check Developer Console for specific error messages
2. Run in development mode (F5) for detailed debugging
3. Verify all service dependencies are properly initialized
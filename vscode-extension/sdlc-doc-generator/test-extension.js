#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing SDLC VS Code Extension...\n');

// Check if extension is compiled
const extensionPath = path.join(__dirname, 'out', 'extension.js');
if (!fs.existsSync(extensionPath)) {
    console.error('❌ Extension not compiled. Run: npm run compile');
    process.exit(1);
}

// Check if VSIX package exists
const vsixPath = path.join(__dirname, 'sdlc-doc-generator-1.0.0.vsix');
if (!fs.existsSync(vsixPath)) {
    console.error('❌ VSIX package not found. Run: npm run package');
    process.exit(1);
}

// List all registered commands from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const commands = packageJson.contributes.commands;

console.log('📋 Registered Commands:');
commands.forEach(cmd => {
    console.log(`  ✓ ${cmd.command}`);
    console.log(`    Title: ${cmd.title}`);
    if (cmd.category) console.log(`    Category: ${cmd.category}`);
    console.log('');
});

console.log(`Total commands: ${commands.length}`);
console.log('');

// Check views
const views = packageJson.contributes.views['sdlc-doc-generator'];
console.log('📊 Registered Views:');
views.forEach(view => {
    console.log(`  ✓ ${view.id}`);
    console.log(`    Name: ${view.name}`);
    console.log('');
});

// Check configuration
const config = packageJson.contributes.configuration.properties;
console.log('⚙️  Configuration Options:');
Object.keys(config).forEach(key => {
    console.log(`  ✓ ${key}`);
    console.log(`    Default: ${config[key].default}`);
    console.log('');
});

// Check required source files
const requiredFiles = [
    'src/extension.ts',
    'src/services/authService.ts',
    'src/services/apiClient.ts',
    'src/services/usageTracker.ts',
    'src/commands/documentCommands.ts',
    'src/commands/accountCommands.ts',
    'src/providers/documentGeneratorProvider.ts',
    'src/providers/quickActionsProvider.ts',
    'src/providers/historyProvider.ts',
    'src/providers/accountProvider.ts'
];

console.log('📁 Source Files Check:');
let allFilesExist = true;
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`  ✓ ${file}`);
    } else {
        console.log(`  ❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

console.log('\n' + '='.repeat(50));
if (allFilesExist) {
    console.log('✅ Extension is ready for testing!');
    console.log('\nNext steps:');
    console.log('1. Install in VS Code: code --install-extension sdlc-doc-generator-1.0.0.vsix');
    console.log('2. Or press F5 in VS Code to run in development mode');
    console.log('3. Test the command: Cmd+Shift+P → "SDLC Docs: Test SDLC Extension"');
} else {
    console.log('❌ Some files are missing. Please check the extension structure.');
    process.exit(1);
}
// Test command parsing
const { Command } = require('commander');

const program = new Command();
program.name('test');

const generate = new Command('generate');
generate.alias('g');

// Main generate command
generate
  .description('Generate SDLC documentation')
  .argument('<input>', 'Project description')
  .action((input, options) => {
    console.log('Main command - Input:', input);
    console.log('Options:', options);
  });

// Sub-command for business
generate
  .command('business')
  .description('Generate Business Analysis')
  .argument('[input]', 'Project description')
  .action((input, options) => {
    console.log('Business sub-command - Input:', input);
    console.log('Options:', options);
  });

program.addCommand(generate);

// Test parsing
console.log('Test 1: sdlc g "school management"');
program.parse(['node', 'test', 'g', 'school management']);

console.log('\nTest 2: sdlc g business "school management"');
program.parse(['node', 'test', 'g', 'business', 'school management']);
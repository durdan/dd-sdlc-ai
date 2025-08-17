#!/usr/bin/env node

const chalk = require('chalk');

console.log(chalk.green(`
╔════════════════════════════════════════╗
║                                        ║
║     SDLC CLI installed successfully!   ║
║                                        ║
╚════════════════════════════════════════╝

Quick Start:
  $ sdlc init        - Initialize CLI
  $ sdlc auth login  - Authenticate
  $ sdlc generate    - Generate docs

For help:
  $ sdlc --help
`));
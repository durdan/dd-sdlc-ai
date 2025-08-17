# Contributing to SDLC AI Platform

First off, thank you for considering contributing to the SDLC AI Platform! It's people like you that make this platform a great tool for the developer community.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and expected**
- **Include screenshots if relevant**
- **Include your environment details** (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed enhancement**
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes**:
   - Follow the existing code style
   - Add tests if applicable
   - Update documentation as needed
3. **Test your changes**:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   npm test  # when available
   ```
4. **Commit your changes**:
   - Use clear and meaningful commit messages
   - Follow conventional commits format: `type(scope): description`
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
5. **Push to your fork** and submit a pull request

## Development Setup

### Web Platform

```bash
# Clone your fork
git clone https://github.com/your-username/sdlc-ai-platform.git
cd sdlc-ai-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Run tests and linting
npm run lint
npm run type-check
```

### CLI Tool

```bash
cd packages/cli

# Install dependencies
npm install

# Build the CLI
npm run build

# Link for local testing
npm link

# Test the CLI
sdlc --help
```

## Project Structure

```
sdlc-ai-platform/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/           # Authentication pages
│   └── (dashboard)/      # Dashboard pages
├── components/            # React components
├── lib/                  # Core business logic
├── packages/
│   └── cli/             # CLI tool
│       ├── src/
│       │   ├── commands/  # CLI commands
│       │   ├── lib/       # CLI utilities
│       │   └── types/     # TypeScript types
│       └── dist/         # Compiled JavaScript
└── database/            # Database schemas and migrations
```

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define interfaces for all data structures
- Avoid using `any` type
- Use proper type guards

### React/Next.js
- Use functional components with hooks
- Follow React best practices
- Keep components small and focused
- Use proper prop types

### General
- Write clear, self-documenting code
- Add comments for complex logic
- Follow DRY (Don't Repeat Yourself) principle
- Keep functions small and focused

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Include both unit and integration tests where applicable
- Test edge cases and error conditions

## Documentation

- Update README.md if needed
- Document new features in appropriate docs
- Add JSDoc comments for public APIs
- Update CLI help text for new commands

## Review Process

1. **Automated checks** run on all PRs (linting, type checking, tests)
2. **Code review** by maintainers
3. **Testing** in development environment
4. **Merge** once approved and all checks pass

## Release Process

1. Updates are collected in the `main` branch
2. Releases are tagged with semantic versioning
3. Release notes are generated from commit messages
4. NPM packages are published for CLI tool

## Questions?

Feel free to open an issue with the label `question` or start a discussion in the GitHub Discussions tab.

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- The contributors page

Thank you for contributing to SDLC AI Platform! 🚀
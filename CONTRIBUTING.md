# Contributing to SDLC Automation Platform

Thank you for your interest in contributing to the SDLC Automation Platform! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL 14+
- Supabase account (for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/sdlc-automation-platform.git
cd sdlc-automation-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables (see [Environment Setup](docs/setup/environment-setup.md))

5. Set up the database:
```bash
# Run database migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

## Code Style

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use TypeScript interfaces for props
- Implement proper error boundaries

### Database
- Use Prisma for database operations
- Follow naming conventions for tables and columns
- Add proper indexes for performance
- Document complex queries

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- path/to/test.ts
```

### Writing Tests
- Write unit tests for utility functions
- Write integration tests for API endpoints
- Test error scenarios
- Maintain good test coverage

## Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the code style guidelines
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Run tests** to ensure everything works
6. **Submit a pull request** with a clear description

### Pull Request Guidelines

- Use descriptive commit messages
- Include a summary of changes
- Reference related issues
- Add screenshots for UI changes
- Ensure all tests pass

## Reporting Issues

When reporting issues, please include:

- **Description**: Clear description of the problem
- **Steps to reproduce**: Detailed steps to reproduce the issue
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, browser, Node.js version
- **Screenshots**: If applicable

## Feature Requests

For feature requests:

- Check existing issues first
- Provide a clear description of the feature
- Explain the use case and benefits
- Consider implementation complexity
- Be open to discussion and feedback

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Questions?

If you have questions about contributing, please:

1. Check the [documentation](docs/)
2. Search existing issues
3. Create a new issue with the "question" label

Thank you for contributing to the SDLC Automation Platform! 
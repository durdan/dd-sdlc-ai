# Claude AI Integration for Agentic Coding Workflows

## Overview

This project now includes Claude 3.5 Sonnet integration for advanced agentic coding workflows, providing AI-powered code analysis, bug detection, feature implementation, and automated testing with **seamless GitHub repository integration**.

## Features

### ✨ Claude-Powered Capabilities
- **Code Analysis**: Deep code review and bug detection
- **Feature Implementation**: Automated feature development
- **Code Refactoring**: Intelligent code improvements
- **Test Generation**: Automated unit and integration tests
- **Risk Assessment**: Security and performance analysis

### 🔄 Agentic Workflows
- **Multi-step Planning**: Claude breaks down complex tasks into manageable steps
- **Context-Aware**: Large 200K+ token context window for entire codebase analysis
- **Reasoning Transparency**: See Claude's step-by-step thinking process
- **Implementation Validation**: Automated verification steps

### 🔗 GitHub Integration
- **Repository Context**: Works with existing repositories for bug fixes and features
- **New Repository Creation**: Supports greenfield project development
- **Branch Management**: Automatic feature branch creation
- **Pull Request Generation**: Optional PR creation for generated code

## Setup

### 1. Install Dependencies
```bash
npm install @ai-sdk/anthropic @anthropic-ai/sdk
```

### 2. Configure Claude API Key

#### Option A: Integration Hub (Recommended)
1. Navigate to **Dashboard** → **Integration Hub**
2. Find **Claude AI** integration card
3. Enter your Claude API key
4. Select preferred model (Claude 3.5 Sonnet recommended)
5. Configure features and GitHub integration settings

#### Option B: Environment Variables
```env
# Claude/Anthropic Configuration
ANTHROPIC_API_KEY=your_claude_api_key_here
```

### 3. Get Claude API Key
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create account or sign in
3. Navigate to API Keys section
4. Generate new API key
5. Add to Integration Hub or `.env.local` file

### 4. GitHub Integration Setup
For bug fixes and feature requests on existing repositories:

1. **Connect GitHub**: Integration Hub → GitHub → Connect Account
2. **Select Repository**: Choose target repository for Claude workflows
3. **Enable Integration**: Toggle "GitHub Integration" in Claude settings
4. **Configure Permissions**: Ensure repo access for issues, PRs, and content

## Usage Workflows

### 🎯 Bug Fixes on Existing Repositories

1. **Prerequisites**:
   - GitHub account connected
   - Target repository selected
   - Claude configured with GitHub integration enabled

2. **Workflow**:
   ```
   GitHub Issue → Claude Analysis → Code Fix → Optional PR Creation
   ```

3. **Steps**:
   - Navigate to **Claude AI** tab in AI Code Assistant
   - Select "Bug Detection & Fix" analysis type
   - Paste problematic code or reference GitHub issue
   - Add context about expected vs actual behavior
   - Click "Analyze Code" → Review analysis → "Generate Code"
   - Claude provides complete fix with tests and validation

### 🚀 Feature Implementation on Existing Repositories

1. **Prerequisites**:
   - GitHub repository connected
   - Feature requirements defined
   - Claude configured with GitHub integration

2. **Workflow**:
   ```
   Feature Request → Claude Planning → Implementation → Integration → Testing
   ```

3. **Steps**:
   - Select "Feature Implementation" analysis type
   - Describe feature requirements and constraints
   - Provide existing codebase context
   - Claude generates step-by-step implementation plan
   - Review and execute agentic code generation

### 🆕 New System Development

1. **Prerequisites**:
   - Claude configured (GitHub optional)
   - System requirements defined

2. **Workflow**:
   ```
   Requirements → Architecture → Implementation → New Repository (Optional)
   ```

3. **Steps**:
   - Use "Feature Implementation" for greenfield development
   - Provide system requirements and tech stack preferences
   - Claude generates complete system architecture
   - Optionally create new GitHub repository
   - Generate initial project structure and code

## Configuration Options

### 🎨 Model Selection
Available models in Integration Hub:

- **Claude 3.5 Sonnet** (Recommended): Best balance of capability and speed
- **Claude 3.5 Haiku**: Fastest responses, good for simple tasks
- **Claude 3 Opus**: Most capable, best for complex reasoning
- **Claude 3 Sonnet**: Previous generation, still powerful
- **Claude 3 Haiku**: Previous generation, fast and efficient

### ⚙️ Advanced Settings
- **Max Tokens**: 1,000 - 200,000 (default: 200,000)
- **Temperature**: 0.0 - 1.0 (default: 0.1 for analysis, 0.2 for generation)
- **GitHub Integration**: Enable/disable repository workflows
- **Auto-create PRs**: Automatically create pull requests for generated code

### 🔐 Security Settings
- **API Key Storage**: Securely stored in browser localStorage
- **Repository Permissions**: Granular access control
- **Code Privacy**: Option to exclude sensitive files from analysis

## Integration Hub Configuration

### Claude AI Card Settings
```typescript
{
  apiKey: "sk-ant-api03-...",           // Your Claude API key
  model: "claude-3-5-sonnet-20241022", // Selected model
  enableCodeAnalysis: true,            // Enable code analysis features
  enableAgenticCode: true,             // Enable code generation
  enableGitHubIntegration: true,       // Enable GitHub workflows
  autoCreatePRs: false,                // Auto-create pull requests
  maxTokens: 200000,                   // Token limit
  temperature: 0.1                     // Response randomness
}
```

### GitHub Integration Requirements
When `enableGitHubIntegration` is `true`:

- GitHub account must be connected
- Repository must be selected
- Required permissions: `issues`, `pull_requests`, `contents`
- Warning shown if GitHub not connected

## API Endpoints

### Code Analysis
```typescript
POST /api/claude-code-analysis
{
  "codeContent": "your code here",
  "analysisType": "bug_fix" | "feature_implementation" | "code_review" | "refactoring",
  "context": "optional context",
  "requirements": "optional requirements",
  "claudeConfig": {
    "apiKey": "user's api key",
    "model": "claude-3-5-sonnet-20241022",
    "maxTokens": 200000,
    "temperature": 0.1
  }
}
```

### Agentic Code Generation
```typescript
POST /api/claude-agentic-code
{
  "task_type": "bug_fix" | "feature_implementation" | "code_review" | "test_generation",
  "codebase_context": "codebase information",
  "specific_request": "detailed task description",
  "file_contents": { "path": "content" }, // optional
  "requirements": "requirements", // optional
  "constraints": ["constraint1", "constraint2"], // optional
  "claudeConfig": {
    "apiKey": "user's api key",
    "model": "claude-3-5-sonnet-20241022",
    "maxTokens": 200000,
    "temperature": 0.1
  }
}
```

## User Interface Features

### 🎛️ Configuration Validation
- **API Key Check**: Validates key on connection
- **GitHub Status**: Shows connection status and requirements
- **Model Selection**: Dropdown with descriptions and recommendations
- **Feature Toggles**: Enable/disable specific capabilities

### 📊 Analysis Results
- **Comprehensive Analysis**: Deep technical review with risk assessment
- **Implementation Plans**: Step-by-step execution roadmap
- **Code Generation**: Complete implementations with tests
- **Export Options**: Copy to clipboard or download as JSON

### 🔄 Workflow Integration
- **Repository Context**: Automatic repository information loading
- **Issue Linking**: Connect analyses to GitHub issues
- **Branch Creation**: Generate feature branches for implementations
- **PR Generation**: Optional pull request creation with generated code

## Troubleshooting

### Configuration Issues

1. **"Claude API key not configured"**
   - Solution: Configure API key in Integration Hub → Claude AI
   - Check: API key format (should start with `sk-ant-`)

2. **"GitHub integration required"**
   - Solution: Connect GitHub in Integration Hub → GitHub
   - Check: Repository permissions and selection

3. **Model not available**
   - Solution: Check API key permissions and billing
   - Alternative: Select different model from dropdown

### Analysis Issues

1. **"Context window exceeded"**
   - Solution: Reduce code content size or max tokens
   - Strategy: Analyze code in smaller chunks

2. **"Rate limit exceeded"**
   - Solution: Wait before next request or upgrade API plan
   - Prevention: Use appropriate temperature and token limits

### GitHub Integration Issues

1. **Repository not found**
   - Solution: Refresh GitHub connection
   - Check: Repository permissions and visibility

2. **Cannot create PR**
   - Solution: Verify write permissions to repository
   - Check: Branch protection rules and required reviews

## Best Practices

### 🎯 Effective Workflows

1. **Start with Analysis**: Always analyze before generating code
2. **Provide Context**: Include relevant background and constraints
3. **Review Plans**: Examine implementation plans before execution
4. **Test Thoroughly**: Use generated tests and add custom validation
5. **Iterate**: Use Claude's feedback for continuous improvement

### 🔧 Repository Management

1. **Branch Strategy**: Use feature branches for Claude-generated code
2. **Code Review**: Always review generated code before merging
3. **Testing**: Validate all generated tests and add edge cases
4. **Documentation**: Update docs with Claude-generated changes

### 🔒 Security Considerations

1. **API Key Security**: Never commit API keys to repositories
2. **Code Privacy**: Be mindful of sensitive code in analysis requests
3. **Review Generated Code**: Always audit AI-generated implementations
4. **Access Control**: Use appropriate GitHub repository permissions

## Future Enhancements

- [ ] **Direct GitHub API Integration**: Pull issues and PRs directly
- [ ] **Automated Testing**: Run generated tests in CI/CD pipelines
- [ ] **Code Quality Metrics**: Track improvements and success rates
- [ ] **Team Collaboration**: Share analyses and implementations
- [ ] **Custom Prompts**: User-defined analysis and generation templates
- [ ] **Workflow Automation**: Multi-step agentic task chains
- [ ] **Performance Monitoring**: Track API usage and costs

## Support

For questions or issues:
1. Check Integration Hub for configuration status
2. Review GitHub connection and permissions
3. Verify Claude API key and billing status
4. See [Technical Architecture](../technical-architecture.md) for details
5. Create GitHub issue for bugs or feature requests 
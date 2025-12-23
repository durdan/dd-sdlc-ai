"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Download,
  ChevronRight,
  Terminal,
  Code,
  GitBranch,
  Cpu,
  Zap,
  ExternalLink,
  Check
} from "lucide-react"

interface CodeAssistantTool {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  filename: string
  configPath: string
  color: string
  popular?: boolean
}

const codeAssistantTools: CodeAssistantTool[] = [
  {
    id: "cursor",
    name: "Cursor",
    icon: Terminal,
    description: "AI-first IDE with native integration",
    filename: ".cursorrules",
    configPath: "/.cursorrules",
    color: "text-purple-600",
    popular: true
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    icon: GitBranch,
    description: "AI pair programmer by GitHub",
    filename: "copilot-instructions.md",
    configPath: "/.github/copilot-instructions.md",
    color: "text-gray-700"
  },
  {
    id: "windsurf",
    name: "Windsurf",
    icon: Zap,
    description: "Cascade Write & auto-memories",
    filename: "windsurf-rules.md",
    configPath: "/.windsurf/rules/rules.md",
    color: "text-blue-600",
    popular: true
  },
  {
    id: "claude",
    name: "Claude Code",
    icon: Cpu,
    description: "Anthropic's coding assistant",
    filename: "CLAUDE.md",
    configPath: "/CLAUDE.md",
    color: "text-orange-600",
    popular: true
  },
  {
    id: "devin",
    name: "Devin",
    icon: Code,
    description: "Autonomous AI software engineer",
    filename: ".bashrc",
    configPath: "/.bashrc",
    color: "text-green-600"
  }
]

interface CodeAssistantMenuProps {
}

export function CodeAssistantMenu({}: CodeAssistantMenuProps = {}) {
  const [showMenu, setShowMenu] = useState(false)
  const [downloadedTools, setDownloadedTools] = useState<Set<string>>(new Set())
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Track if we're mounted (for portal)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate menu position when opening
  const updateMenuPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      // Position above the button
      setMenuPosition({
        top: rect.top - 8, // 8px gap above button
        left: rect.left
      })
    }
  }, [])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        buttonRef.current && !buttonRef.current.contains(target)
      ) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      // Update position on scroll/resize
      window.addEventListener('scroll', updateMenuPosition, true)
      window.addEventListener('resize', updateMenuPosition)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', updateMenuPosition, true)
      window.removeEventListener('resize', updateMenuPosition)
    }
  }, [showMenu, updateMenuPosition])

  const handleToggleMenu = () => {
    if (!showMenu) {
      updateMenuPosition()
    }
    setShowMenu(!showMenu)
  }

  const getCodingRules = () => {
    // This is the comprehensive coding rules prompt
    return `# Ultimate Code Generation System Prompt for Disciplined Development

## Core System Instructions

You are an expert software architect and developer who follows strict engineering principles. Every piece of code you generate must adhere to industry best practices and proven design patterns. You think systematically, plan thoroughly, and execute with precision.

## 🎯 Fundamental Operating Principles

### 1. PLAN-ACT-REFLECT Methodology
ALWAYS follow this three-phase approach for every task:

**PLAN Phase (Think First, Code Later):**
- Analyze requirements completely before writing any code
- Create a detailed implementation plan with:
  - Architecture diagram (even if textual)
  - Module breakdown
  - Data flow design
  - Interface contracts
  - Test strategy
  - Migration/deployment plan
- Identify potential edge cases and failure points
- Document assumptions and constraints
- Define success criteria

**ACT Phase (Systematic Implementation):**
- Implement in small, testable increments
- Each code block should have a single, clear purpose
- Write tests BEFORE implementation (TDD)
- Commit frequently with meaningful messages
- Validate each step before proceeding

**REFLECT Phase (Continuous Improvement):**
- Review code against SOLID principles
- Check for DRY violations
- Measure against success criteria
- Document lessons learned
- Refactor if necessary

## 📐 Architecture & Design Principles

### SOLID Principles (MANDATORY)
**S - Single Responsibility Principle**
- Each class/module/function does ONE thing well
- If you use "and" to describe functionality, split it

**O - Open/Closed Principle**
- Open for extension, closed for modification
- Use interfaces and abstract classes
- Prefer composition over inheritance

**L - Liskov Substitution Principle**
- Derived classes must be substitutable for base classes
- Don't break parent class contracts

**I - Interface Segregation Principle**
- Many specific interfaces > one general interface
- Clients shouldn't depend on methods they don't use

**D - Dependency Inversion Principle**
- Depend on abstractions, not concretions
- High-level modules shouldn't depend on low-level modules

### DRY (Don't Repeat Yourself)
- Every piece of knowledge has a single, unambiguous representation
- If you copy-paste code, you're doing it wrong
- Extract common functionality into:
  - Utility functions
  - Base classes
  - Shared modules
  - Configuration files

### KISS (Keep It Simple, Stupid)
- Simplest solution that works is the best
- Avoid clever code - write clear code
- If it takes more than 10 seconds to understand, refactor
- Prefer explicit over implicit

### YAGNI (You Aren't Gonna Need It)
- Don't add functionality until it's necessary
- No speculative features
- Build for today's requirements, design for tomorrow's changes

## 🏗️ Modular Architecture Rules

### Module Structure
\`\`\`
/src
  /modules
    /user
      /domain         # Business logic, entities
        - User.ts
        - UserRepository.interface.ts
      /application    # Use cases, services
        - CreateUser.usecase.ts
        - UserService.ts
      /infrastructure # External dependencies
        - UserRepository.postgres.ts
        - UserController.ts
      /tests
        /unit
        /integration
        /e2e
    /shared          # Shared utilities
      /utils
      /types
      /constants
\`\`\`

### Module Rules:
1. **Each module is independent** - Can be extracted as microservice
2. **Clear boundaries** - Modules communicate through interfaces
3. **No circular dependencies** - Enforce with dependency graphs
4. **Domain-driven** - Modules represent business capabilities
5. **Self-contained tests** - Each module has its own test suite

## 🧪 Testing Methodology

### Test-Driven Development (TDD)
\`\`\`
ALWAYS follow Red-Green-Refactor cycle:
1. RED: Write failing test first
2. GREEN: Write minimal code to pass
3. REFACTOR: Improve code while keeping tests green
\`\`\`

### Testing Pyramid
\`\`\`
         /\\
        /E2E\\      (5%) - Critical user journeys
       /-----\\
      / Integ \\    (15%) - API, database integration
     /---------\\
    /   Unit    \\  (80%) - Business logic, utilities
   /-------------\\
\`\`\`

### Test Requirements:
- **Minimum 80% code coverage** for unit tests
- **All edge cases covered** with explicit test cases
- **Test names describe behavior**, not implementation
- **Each test tests ONE thing**
- **Tests are documentation** - should be readable

## 📁 File Organization Standards

### File Size Limits
- **Maximum 200 lines per file** (prefer 100-150)
- **Maximum 50 lines per function** (prefer 20-30)
- **Maximum 5 parameters per function** (use objects for more)
- **Maximum 3 levels of nesting** (extract to functions)

### Naming Conventions
\`\`\`typescript
// Files
UserService.ts          // PascalCase for classes
userService.test.ts     // camelCase with .test
IUserRepository.ts      // Interface prefix with 'I'
user.constants.ts       // lowercase for utilities
CreateUser.usecase.ts   // PascalCase for use cases

// Variables & Functions
const userId: string              // camelCase
const MAX_RETRY_COUNT = 3        // SCREAMING_SNAKE for constants
function calculateTotalPrice()   // camelCase, verb-noun
class UserService                // PascalCase
interface IUserRepository        // PascalCase with 'I' prefix
type UserRole = 'admin' | 'user' // PascalCase for types
\`\`\`

## 🗄️ Database Best Practices

### Database Versioning (Migrations)
\`\`\`sql
-- migrations/001_create_users_table.up.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migrations/001_create_users_table.down.sql
DROP TABLE IF EXISTS users;
\`\`\`

### Migration Rules:
1. **Never modify existing migrations** in production
2. **Always provide rollback** (down migration)
3. **One change per migration** for clarity
4. **Timestamp-based naming** (20240101120000_description)
5. **Test migrations** on copy of production data
6. **Version control everything** including seeds

## 🔄 Code Generation Workflow

### Before Writing Any Code:
\`\`\`markdown
1. REQUIREMENTS ANALYSIS
   - What problem are we solving?
   - Who are the users?
   - What are the constraints?
   - What are the success metrics?

2. DESIGN DECISIONS
   - Which design patterns apply?
   - What are the trade-offs?
   - How will this scale?
   - What could go wrong?

3. INTERFACE DEFINITION
   - Define all interfaces first
   - Document expected behavior
   - Specify error conditions
   - Create type definitions

4. TEST SPECIFICATION
   - Write test cases for happy path
   - Write test cases for edge cases
   - Write test cases for error conditions
   - Define performance benchmarks
\`\`\`

## 🛡️ Error Handling & Logging

### Error Handling Strategy
\`\`\`typescript
// NEVER use generic catches without re-throwing
try {
    await riskyOperation();
} catch (error) {
    if (error instanceof ValidationError) {
        logger.warn('Validation failed', { error, context });
        throw new BadRequestError('Invalid input provided');
    } else if (error instanceof DatabaseError) {
        logger.error('Database operation failed', { error, context });
        throw new ServiceUnavailableError('Service temporarily unavailable');
    } else {
        logger.error('Unexpected error', { error, context });
        throw new InternalServerError('An unexpected error occurred');
    }
}
\`\`\`

### Logging Levels
- **ERROR**: System is broken, immediate attention needed
- **WARN**: Something unexpected, but system continues
- **INFO**: Important business events
- **DEBUG**: Detailed diagnostic information
- **TRACE**: Most detailed information (dev only)

## 📊 Performance Considerations

### Performance Rules:
1. **Measure before optimizing** - Use profilers
2. **Optimize algorithms before code** - O(n) vs O(n²)
3. **Cache expensive operations** - But invalidate properly
4. **Paginate large datasets** - Never return unlimited results
5. **Use database indexes** - But not too many
6. **Implement rate limiting** - Protect your APIs
7. **Lazy load when possible** - Don't fetch until needed

## 🔒 Security Principles

### Security Checklist:
- [ ] Input validation on ALL user inputs
- [ ] Output encoding to prevent XSS
- [ ] Parameterized queries to prevent SQL injection
- [ ] Authentication required for protected resources
- [ ] Authorization checked for every operation
- [ ] Sensitive data encrypted at rest and in transit
- [ ] Secrets in environment variables, never in code
- [ ] Dependencies regularly updated
- [ ] Security headers implemented
- [ ] Rate limiting on all endpoints

## 📝 Documentation Standards

### Code Documentation
\`\`\`typescript
/**
 * Creates a new user account with email verification
 * 
 * @param userData - User registration data
 * @param userData.email - Valid email address (RFC 5322)
 * @param userData.password - Minimum 8 characters, 1 uppercase, 1 number
 * @returns Newly created user with generated ID
 * @throws {ValidationError} If input data is invalid
 * @throws {ConflictError} If email already exists
 * 
 * @example
 * const user = await createUser({
 *   email: 'user@example.com',
 *   password: 'SecurePass123'
 * });
 */
async function createUser(userData: CreateUserDto): Promise<User> {
    // Implementation
}
\`\`\`

## 🚀 Deployment & DevOps

### CI/CD Pipeline Stages
1. **Lint** - Code style validation
2. **Type Check** - TypeScript compilation
3. **Unit Tests** - Fast, isolated tests
4. **Integration Tests** - Database, API tests
5. **Security Scan** - Dependency vulnerabilities
6. **Build** - Create production artifacts
7. **E2E Tests** - Critical path validation
8. **Deploy** - Blue-green or canary deployment
9. **Smoke Tests** - Verify deployment
10. **Monitor** - Track metrics and errors

## 🎯 Code Review Checklist

Before submitting any code, verify:

### Functionality
- [ ] Code does what it's supposed to do
- [ ] Edge cases handled
- [ ] Error scenarios covered
- [ ] Performance acceptable

### Code Quality
- [ ] SOLID principles followed
- [ ] DRY principle maintained
- [ ] KISS principle applied
- [ ] No code smells

### Testing
- [ ] Unit tests comprehensive
- [ ] Integration tests for boundaries
- [ ] E2E tests for critical paths
- [ ] All tests passing

### Documentation
- [ ] Code self-documenting
- [ ] Complex logic explained
- [ ] API documentation updated
- [ ] README current

### Security
- [ ] Input validation complete
- [ ] Authentication/authorization correct
- [ ] No sensitive data exposed
- [ ] Dependencies secure

## 🔥 Final Rules

1. **NEVER write code without a plan**
2. **NEVER skip tests to save time**
3. **NEVER ignore error handling**
4. **NEVER leave TODO comments - fix it now**
5. **NEVER use magic numbers - use constants**
6. **NEVER trust user input - always validate**
7. **NEVER store secrets in code**
8. **NEVER optimize prematurely**
9. **NEVER comment bad code - rewrite it**
10. **NEVER merge without review**

Remember: You are crafting software, not just writing code. Every line should be purposeful, tested, and maintainable. Think like you're writing code that you'll have to maintain at 3 AM during an outage, because you might be.`
  }

  const handleDownload = (tool: CodeAssistantTool) => {
    const rules = getCodingRules()
    const blob = new Blob([rules], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = tool.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    // Track downloaded tool
    setDownloadedTools(prev => new Set(prev).add(tool.id))
    
    // Show success message (could be a toast in production)
    console.log(`Downloaded ${tool.name} rules as ${tool.filename}`)
  }

  // Render the dropdown menu via portal
  const dropdownMenu = showMenu && mounted ? createPortal(
    <div
      ref={menuRef}
      className="fixed w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 py-2 z-[9999]"
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
        transform: 'translateY(-100%)'
      }}
    >
      <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">AI Coding Assistant Tools</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">Select to download</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Download optimized coding rules for your preferred tool
        </p>
      </div>

      <div className="py-2 max-h-80 overflow-y-auto">
        {codeAssistantTools.map((tool) => {
          const isDownloaded = downloadedTools.has(tool.id)
          const Icon = tool.icon

          return (
            <button
              key={tool.id}
              onClick={() => handleDownload(tool)}
              className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className={`w-8 h-8 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-slate-700 transition-colors`}>
                <Icon className={`h-4 w-4 ${tool.color}`} />
              </div>
              <div className="text-left flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{tool.name}</span>
                  {tool.popular && (
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">{tool.configPath}</div>
              </div>
              {isDownloaded ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Download className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              )}
            </button>
          )
        })}
      </div>

      <div className="px-3 py-2 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 rounded-b-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Place downloaded file in your project root or specified config path
        </p>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        className="h-8 sm:h-9 px-2 sm:px-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-purple-200"
        onClick={handleToggleMenu}
        title="Download AI Coding Rules"
      >
        <Download className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">AI Rules</span>
        <ChevronRight className={`hidden sm:inline h-3 w-3 ml-1 transition-transform ${showMenu ? 'rotate-90' : ''}`} />
      </Button>

      {dropdownMenu}
    </div>
  )
}
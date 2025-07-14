"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { 
  ArrowRight, 
  Code, 
  FileText, 
  GitBranch, 
  Zap, 
  Bot,
  Merge,
  Globe,
  CheckCircle,
  Clock,
  Users,
  Target,
  Workflow,
  Database,
  Settings,
  Eye,
  Play,
  Star,
  ArrowDown,
  Sparkles,
  Shield,
  Layers,
  Gauge,
  Key,
  Plug,
  Cog,
  Repeat,
  BookOpen,
  Menu,
  X,
  Share2
} from "lucide-react"

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Handle GitHub OAuth callback
  useEffect(() => {
    const handleGitHubCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const storedState = sessionStorage.getItem('github_oauth_state')
      
      if (code && state && state === storedState) {
        try {
          console.log('Processing GitHub OAuth callback...')
          
          // Exchange authorization code for access token
          const response = await fetch('/api/auth/github/exchange', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          })
          
          if (!response.ok) {
            throw new Error('Failed to exchange code for token')
          }
          
          const data = await response.json()
          
          if (data.access_token) {
            // Get user info from GitHub API
            const userResponse = await fetch('https://api.github.com/user', {
              headers: {
                Authorization: `Bearer ${data.access_token}`,
              },
            })
            
            if (userResponse.ok) {
              const userData = await userResponse.json()
              
              // Store token securely (in httpOnly cookie via backend)
              await fetch('/api/auth/github/store-token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ access_token: data.access_token }),
              })
              
              // Clean up URL and session storage
              window.history.replaceState({}, document.title, window.location.pathname)
              sessionStorage.removeItem('github_oauth_state')
              
              // Show success message and redirect to dashboard
              alert(`✅ Successfully connected to GitHub as ${userData.login}! Redirecting to dashboard...`)
              // Add a small delay to ensure alert is shown, then redirect with refresh
              setTimeout(() => {
                window.location.href = '/dashboard?refresh=github'
              }, 1000)
            } else {
              throw new Error('Failed to get user info from GitHub')
            }
          } else {
            throw new Error('No access token received')
          }
        } catch (error) {
          console.error('GitHub OAuth error:', error)
          alert('❌ Failed to connect to GitHub. Please try again.')
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
          sessionStorage.removeItem('github_oauth_state')
        }
      }
    }

    handleGitHubCallback()
  }, [])

  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: "Claude AI Code Assistant",
      description: "Autonomous bug fixing, feature implementation, and code optimization with Claude 3.5 Sonnet",
      badge: "✅ PRODUCTION READY",
      badgeColor: "bg-green-100 text-green-700"
    },
    {
      icon: <GitBranch className="h-8 w-8" />,
      title: "GitDigest Repository Analysis", 
      description: "AI-powered repository insights with automated digest generation and SDLC scoring",
      badge: "🚀 NEW",
      badgeColor: "bg-blue-100 text-blue-700"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "90+ Section SDLC Documentation",
      description: "Comprehensive business analysis, functional specs, technical architecture, and UX specifications",
      badge: "📚 ENHANCED",
      badgeColor: "bg-purple-100 text-purple-700"
    },
    {
      icon: <Settings className="h-8 w-8" />,
      title: "Enterprise Prompt Management",
      description: "Advanced prompt engineering with version control, A/B testing, and role-based access",
      badge: "🎯 ENTERPRISE",
      badgeColor: "bg-indigo-100 text-indigo-700"
    },
    {
      icon: <Plug className="h-8 w-8" />,
      title: "Native Tool Integrations",
      description: "JIRA, Confluence, GitHub Projects, Slack, ClickUp, Trello with automated workflows",
      badge: "🔗 INTEGRATED",
      badgeColor: "bg-orange-100 text-orange-700"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "BYOK Security Model",
      description: "Bring your own API keys with enterprise-grade security and data privacy",
      badge: "🔒 SECURE",
      badgeColor: "bg-red-100 text-red-700"
    },
    {
      icon: <Workflow className="h-8 w-8" />,
      title: "GitHub Automation Hub",
      description: "OAuth integration, automated workflows, repository management, and PR automation",
      badge: "⚡ AUTOMATED",
      badgeColor: "bg-yellow-100 text-yellow-700"
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Usage tracking, cost monitoring, performance analytics, and prompt optimization insights",
      badge: "📊 INSIGHTS",
      badgeColor: "bg-teal-100 text-teal-700"
    }
  ]

  const workflowSteps = [
    {
      step: "01",
      title: "Requirements Input",
      description: "Capture project requirements, user stories, or technical specifications in natural language",
      icon: <FileText className="h-5 w-5" />
    },
    {
      step: "02", 
      title: "AI Orchestration",
      description: "Platform coordinates multiple AI models using your keys to analyze and structure requirements",
      icon: <Bot className="h-5 w-5" />
    },
    {
      step: "03",
      title: "Parallel Generation",
      description: "Simultaneously create business analysis, technical specs, architecture diagrams, and project plans",
      icon: <Merge className="h-5 w-5" />
    },
    {
      step: "04",
      title: "Tool Integration",
      description: "Automatically populate JIRA epics, Confluence docs, GitHub issues, and notify your team",
      icon: <Plug className="h-5 w-5" />
    }
  ]

  const stats = [
    { value: "90+", label: "SDLC Doc Sections", icon: <FileText className="h-5 w-5" /> },
    { value: "9+", label: "Native Integrations", icon: <Plug className="h-5 w-5" /> },
    { value: "200K+", label: "AI Context Tokens", icon: <Bot className="h-5 w-5" /> },
    { value: "100%", label: "BYOK Security", icon: <Shield className="h-5 w-5" /> }
  ]

  const sdlcPhases = [
    { 
      phase: "Requirements", 
      description: "AI-powered business analysis, stakeholder mapping, and comprehensive requirement gathering",
      icon: <Target className="h-6 w-6" />,
      color: "bg-blue-500",
      outputs: ["Business Analysis", "Stakeholder Matrix", "Risk Assessment", "Success Metrics"]
    },
    { 
      phase: "Design", 
      description: "System architecture, UX specifications, technical design, and interactive diagrams",
      icon: <Eye className="h-6 w-6" />,
      color: "bg-purple-500",
      outputs: ["Architecture Diagrams", "UX Specs", "API Design", "Data Models"]
    },
    { 
      phase: "Development", 
      description: "Automated code generation, bug fixing, feature implementation with Claude AI assistant",
      icon: <Code className="h-6 w-6" />,
      color: "bg-green-500",
      outputs: ["User Stories", "Code Implementation", "Automated Testing", "Pull Requests"]
    },
    { 
      phase: "Integration", 
      description: "Automated project setup, documentation export, team coordination, and workflow automation",
      icon: <GitBranch className="h-6 w-6" />,
      color: "bg-orange-500",
      outputs: ["JIRA Epics", "Confluence Pages", "GitHub Projects", "Team Notifications"]
    }
  ]

  const integrations = [
    { name: "GitHub", description: "Repository automation & OAuth", icon: "🐙", status: "✅ Active" },
    { name: "JIRA", description: "Epic & issue creation", icon: "🎯", status: "✅ Active" },
    { name: "Confluence", description: "Documentation export", icon: "📚", status: "✅ Active" },
    { name: "GitHub Projects", description: "Project board automation", icon: "📋", status: "✅ Active" },
    { name: "Slack", description: "Team notifications & OAuth", icon: "💬", status: "✅ Active" },
    { name: "ClickUp", description: "Task management", icon: "📝", status: "✅ Active" },
    { name: "Trello", description: "Board automation", icon: "📌", status: "✅ Active" },
    { name: "OpenAI", description: "GPT-4 for documentation", icon: "🤖", status: "✅ BYOK" },
    { name: "Anthropic", description: "Claude for code automation", icon: "🧠", status: "✅ BYOK" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <img 
                  src="/img/SDLC.dev.logo.png" 
                  alt="SDLC.dev Logo" 
                  className="h-40 w-40 sm:h-40 sm:w-40 object-contain"
                  style={{ minWidth: '80px', minHeight: '80px' }}
                />
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <span className="hidden sm:inline">SDLC.dev</span>
                  <span className="sm:hidden">SDLC.dev</span>
                </span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link href="#gitdigest" className="text-gray-600 hover:text-gray-900 transition-colors">GitDigest</Link>
              <Link href="#integrations" className="text-gray-600 hover:text-gray-900 transition-colors">Integrations</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</Link>
            </div>
            
            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                <Link href="/signin">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <Link
                href="#features"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#gitdigest"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                GitDigest
              </Link>
              <Link
                href="#integrations"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Integrations
              </Link>
              <Link
                href="#how-it-works"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <div className="pt-2">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
                  <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-grid-gray-100 bg-[size:20px_20px] opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <img 
                  src="/img/SDLC.dev.logo.png" 
                  alt="SDLC.dev Logo" 
                  className="h-16 w-16 sm:h-16 sm:w-16 object-contain"
                  style={{ minWidth: '64px', minHeight: '64px' }}
                />
              <span className="text-sm font-medium text-gray-700">Enterprise SDLC Automation</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">AI-Powered</Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700">✨ Production Ready</Badge>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Enterprise-Grade AI
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Software Development Platform
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              Complete AI-powered development platform with <strong>Claude AI Code Assistant</strong> for autonomous bug fixing, 
              <strong>GitDigest repository analysis</strong> with automated insights, <strong>90+ section SDLC documentation</strong>, 
              enterprise prompt management, and native integrations with GitHub, JIRA, Confluence, Slack, and more. 
              BYOK security with production-ready workflows.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4" asChild>
                <Link href="/signin">
                  Start Automating SDLC
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4" asChild>
                <Link href="#demo">
                  <Play className="mr-2 h-5 w-5" />
                  See It In Action
                </Link>
              </Button>
            </div>

            {/* Key Benefits Banner */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 mb-12 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <GitBranch className="h-4 w-4 text-emerald-600" />
                  <span className="text-gray-700">AI Repository Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">Autonomous Code Development</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Enterprise BYOK Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Plug className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-700">9+ Native Integrations</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-white/60 backdrop-blur-sm rounded-full p-2 mr-2">
                      {stat.icon}
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Claude AI Code Assistant Section */}
      <section className="py-12 sm:py-24 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Badge variant="secondary" className="bg-green-100 text-green-700">✨ NEW & PRODUCTION READY</Badge>
              <span className="text-sm font-medium text-gray-700">Claude AI Code Assistant</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Autonomous Code Development with 
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent block">
                Claude 3.5 Sonnet
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Go beyond documentation. Our Claude AI Code Assistant automatically fixes bugs, implements features, 
              and optimizes code with direct GitHub integration and real-time progress tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg mt-1">
                    <Bot className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Agentic Code Workflows</h3>
                    <p className="text-gray-600">Autonomous bug fixing and feature implementation with step-by-step execution</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg mt-1">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">GitHub Integration</h3>
                    <p className="text-gray-600">Direct repository access with OAuth authentication and automated workflow setup</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg mt-1">
                    <Layers className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Multi-Model Support</h3>
                    <p className="text-gray-600">Choose from Claude 3.5 Sonnet, Opus, or Haiku based on task complexity</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg mt-1">
                    <Gauge className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Real-time Monitoring</h3>
                    <p className="text-gray-600">Live progress tracking with streaming updates during task execution</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-gray-900">✅ PRODUCTION READY</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Autonomous bug fixing with pull request creation</li>
                  <li>• Feature implementation with code review</li>
                  <li>• Repository analysis and optimization</li>
                  <li>• 200K+ token context for large codebases</li>
                  <li>• Secure API key management (BYOK)</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-green-500 rounded-full p-1">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-mono">Claude AI Code Assistant</span>
                </div>
                <div className="space-y-3 text-sm font-mono">
                  <div className="text-green-400">✅ GitHub repository connected</div>
                  <div className="text-blue-400">🔄 Analyzing codebase...</div>
                  <div className="text-yellow-400">🛠️ Implementing feature: user authentication</div>
                  <div className="text-purple-400">📝 Creating pull request...</div>
                  <div className="text-green-400">✅ Task completed successfully!</div>
                </div>
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Task: Fix authentication bug</div>
                  <div className="text-sm">
                    <span className="text-green-400">+</span> Fixed JWT token validation
                  </div>
                  <div className="text-sm">
                    <span className="text-green-400">+</span> Added error handling
                  </div>
                  <div className="text-sm">
                    <span className="text-green-400">+</span> Updated tests
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700" asChild>
              <Link href="/signin">
                Try Claude AI Code Assistant
                <Bot className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* GitDigest Repository Analysis Section */}
      <section id="gitdigest" className="py-12 sm:py-24 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">🚀 NEW FEATURE</Badge>
              <span className="text-sm font-medium text-gray-700">GitDigest Repository Analysis</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Repository Insights
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent block">
                With Automated SDLC Scoring
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Automatically analyze any GitHub repository and generate comprehensive insights, 
              SDLC readiness scores, and actionable recommendations with AI-powered analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-emerald-100 p-3 rounded-lg mt-1">
                  <GitBranch className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Repository Analysis</h3>
                  <p className="text-gray-600">Deep analysis of code structure, documentation quality, security practices, and development workflows.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-teal-100 p-3 rounded-lg mt-1">
                  <Target className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">SDLC Scoring</h3>
                  <p className="text-gray-600">Comprehensive scoring across documentation, testing, security, and best practices with actionable recommendations.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-cyan-100 p-3 rounded-lg mt-1">
                  <Clock className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Automated Digests</h3>
                  <p className="text-gray-600">Regular digest generation with webhook integration, daily reports, and team collaboration features.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg mt-1">
                  <Share2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Export & Share</h3>
                  <p className="text-gray-600">Export insights to JIRA epics, Confluence pages, GitHub Projects, or share via secure links.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-emerald-500 rounded-full p-1">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <span className="text-sm font-mono">GitDigest Analysis</span>
                </div>
                <div className="space-y-3 text-sm font-mono">
                  <div className="text-emerald-400">✅ Repository connected: awesome-project</div>
                  <div className="text-blue-400">🔍 Analyzing 247 files, 15,432 lines of code...</div>
                  <div className="text-yellow-400">📊 SDLC Score: 8.5/10 (Excellent)</div>
                  <div className="text-purple-400">📋 Generated comprehensive digest</div>
                  <div className="text-green-400">✅ Analysis complete!</div>
                </div>
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <div className="text-xs text-gray-400 mb-1">Key Insights</div>
                  <div className="text-sm space-y-1">
                    <div><span className="text-green-400">+</span> Strong documentation coverage (92%)</div>
                    <div><span className="text-green-400">+</span> Comprehensive test suite</div>
                    <div><span className="text-yellow-400">•</span> Consider adding security scanning</div>
                    <div><span className="text-blue-400">ℹ</span> 23 actionable recommendations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700" asChild>
              <Link href="/signin">
                Try GitDigest Analysis
                <GitBranch className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Enterprise Prompt Management Section */}
      <section className="py-12 sm:py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">🎯 Enterprise Grade</Badge>
              <span className="text-sm font-medium text-gray-700">Prompt Management System</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Advanced Prompt Engineering
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                For Enterprise Teams
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Professional prompt management with version control, A/B testing, and analytics. 
              Build, test, and deploy enterprise-grade AI workflows with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
                <Code className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Editor</h3>
              <p className="text-gray-600 text-sm">Syntax highlighting, variable management, and template inheritance for professional prompt development.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
                <GitBranch className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Version Control</h3>
              <p className="text-gray-600 text-sm">Git-like versioning with rollback capabilities, change tracking, and collaborative development workflows.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-pink-100 p-3 rounded-lg w-fit mb-4">
                <Gauge className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">A/B Testing</h3>
              <p className="text-gray-600 text-sm">Statistical comparison of prompt variations with performance analytics and automated optimization.</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-teal-100 p-3 rounded-lg w-fit mb-4">
                <Users className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Role-Based Access</h3>
              <p className="text-gray-600 text-sm">Enterprise security with Admin, Manager, and User roles, plus granular permissions and audit trails.</p>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700" asChild>
              <Link href="/signin">
                Explore Prompt Management
                <Settings className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-12 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See SDLC Automation in Action
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Watch how our platform transforms a simple idea into complete project documentation, 
              JIRA epics, and Confluence pages in minutes
            </p>
          </div>

          {/* Two Video Layout */}
          <div className="max-w-6xl mx-auto space-y-8">
            {/* First Video */}
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  Complete Platform Demo
                </h3>
                <p className="text-gray-600">
                  See the full SDLC automation workflow in action
                </p>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src="https://www.youtube.com/embed/bHcceP_9oLk"
                  title="SDLC Automation Platform - Complete Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>

            {/* Second Video */}
            <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-8 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                  Advanced Features Showcase
                </h3>
                <p className="text-gray-600">
                  Explore advanced automation capabilities and integrations
                </p>
              </div>
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src="https://www.youtube.com/embed/NSloNS3sZRg"
                  title="SDLC Automation Platform - Advanced Features"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Complete Workflow Demo</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Play className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Real-time Generation</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">AI-Powered Results</span>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto" asChild>
              <Link href="/signin">
                Try It Yourself
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SDLC Phases Section */}
      <section id="sdlc-phases" className="py-12 sm:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete SDLC Phase Coverage
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Automate every phase of your software development lifecycle with AI-powered intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {sdlcPhases.map((phase, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="text-center">
                  <div className={`${phase.color} p-4 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform`}>
                    {phase.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-semibold">{phase.phase}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center mb-4 text-sm sm:text-base">{phase.description}</p>
                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm font-medium text-gray-700">Generated Outputs:</div>
                    {phase.outputs.map((output, idx) => (
                      <div key={idx} className="text-xs bg-gray-100 rounded-full px-3 py-1 inline-block mr-2 mb-1">
                        {output}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete AI Development Platform
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              From repository analysis to autonomous code development - everything you need for modern SDLC automation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
                <CardHeader>
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                  <Badge variant="secondary" className={`mt-4 ${feature.badgeColor}`}>{feature.badge}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How SDLC Automation Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Intelligent orchestration of AI models and development tools to automate your entire workflow
            </p>
          </div>

          <div className="relative">
            {/* Workflow Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-16">
              {workflowSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        {step.step}
                      </div>
                      <div className="bg-gray-100 p-2 rounded-lg">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                  
                  {/* Arrow between steps */}
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* BYOK (Bring Your Own Keys) Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
                <Key className="h-8 w-8 mb-2 sm:mb-0 sm:mr-3" />
                <h3 className="text-xl sm:text-2xl font-bold">Bring Your Own AI Keys</h3>
              </div>
              <p className="text-blue-100 mb-6 max-w-3xl mx-auto text-sm sm:text-base">
                Use your own OpenAI, Claude, or other AI provider keys. No vendor lock-in, complete data control, 
                and transparent usage costs. Your keys, your data, your control.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <div className="text-2xl font-bold">🔒</div>
                  <div className="text-blue-100 text-sm sm:text-base">Secure Key Storage</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">💰</div>
                  <div className="text-blue-100 text-sm sm:text-base">Transparent Costs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">🔄</div>
                  <div className="text-blue-100 text-sm sm:text-base">No Vendor Lock-in</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-12 sm:py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Native Tool Integrations
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Connect with your existing development ecosystem seamlessly
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white rounded-xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{integration.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{integration.name}</h3>
                <p className="text-xs text-gray-600">{integration.description}</p>
                <Badge variant="secondary" className="mt-4">{integration.status}</Badge>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Plus many more integrations available through our extensible platform
            </p>
            <Button variant="outline" className="border-gray-300 w-full sm:w-auto">
              <Plug className="mr-2 h-4 w-4" />
              View All Integrations
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Ready to Automate Your SDLC?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed">
              Join development teams who are already accelerating their software delivery with intelligent SDLC automation. 
              Bring your own AI keys, integrate with your tools, and transform how you build software.
            </p>
            <div className="flex flex-col gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4 w-full sm:w-auto" asChild>
                <Link href="/signin">
                  Start Automating Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4 w-full sm:w-auto">
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Documentation
              </Button>
            </div>
            <p className="text-blue-200 text-xs sm:text-sm mt-4 sm:mt-6">
              ✨ Free to start • Use your own AI keys • No vendor lock-in
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img 
                  src="/img/SDLC.dev.logo.png" 
                  alt="SDLC.dev Logo" 
                  className="h-16 w-16 sm:h-20 sm:w-20 bg-white rounded-lg p-2 object-contain"
                  style={{ minWidth: '64px', minHeight: '64px' }}
                />
                <span className="text-lg sm:text-xl font-bold">SDLC.dev</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md text-sm sm:text-base">
                Automate your entire software development lifecycle with AI-powered intelligence. 
                From requirements to autonomous code development with Claude AI, streamline every phase of development.
              </p>
              <div className="flex space-x-4">
                <div className="bg-gray-800 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <Workflow className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Platform</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Templates</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-sm sm:text-base">Resources</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Guides</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-xs sm:text-sm">
              © {new Date().getFullYear()} SDLC.dev. All rights reserved.
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">Terms of Service</Link>
              <Link href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

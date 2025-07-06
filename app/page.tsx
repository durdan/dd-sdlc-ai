import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  BookOpen
} from "lucide-react"

export default function Home() {
  const features = [
    {
      icon: <Workflow className="h-6 w-6" />,
      title: "End-to-End SDLC Automation",
      description: "Automate your entire software development lifecycle from requirements gathering to deployment documentation",
      color: "bg-blue-500"
    },
    {
      icon: <Key className="h-6 w-6" />,
      title: "Bring Your Own AI",
      description: "Use your own OpenAI, Claude, or other AI provider keys - no vendor lock-in, full control over your data",
      color: "bg-purple-500"
    },
    {
      icon: <Merge className="h-6 w-6" />,
      title: "Intelligent Orchestration",
      description: "Smart workflow orchestration that coordinates multiple AI models and integrations seamlessly",
      color: "bg-green-500"
    },
    {
      icon: <GitBranch className="h-6 w-6" />,
      title: "Native Integrations",
      description: "Deep integration with your existing development tools - JIRA, Confluence, GitHub, and more",
      color: "bg-orange-500"
    },
    {
      icon: <Cog className="h-6 w-6" />,
      title: "Customizable Workflows",
      description: "Adapt templates and processes to match your team's specific development methodologies",
      color: "bg-indigo-500"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Your data stays with you - secure, compliant, and audit-ready with complete transparency",
      color: "bg-teal-500"
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
    { value: "10x", label: "Faster Project Setup", icon: <Clock className="h-5 w-5" /> },
    { value: "5 min", label: "Idea to Epic Creation", icon: <Gauge className="h-5 w-5" /> },
    { value: "100%", label: "Your Own AI Keys", icon: <Key className="h-5 w-5" /> },
    { value: "6+", label: "Tool Integrations", icon: <Plug className="h-5 w-5" /> }
  ]

  const sdlcPhases = [
    { 
      phase: "Planning", 
      description: "Requirements analysis, stakeholder mapping, project scoping",
      icon: <Target className="h-6 w-6" />,
      color: "bg-blue-500",
      outputs: ["Business Analysis", "Project Charter", "Stakeholder Matrix"]
    },
    { 
      phase: "Design", 
      description: "System architecture, UX specifications, technical design",
      icon: <Eye className="h-6 w-6" />,
      color: "bg-purple-500",
      outputs: ["Architecture Diagrams", "UX Specs", "API Design"]
    },
    { 
      phase: "Development", 
      description: "User stories, acceptance criteria, development tasks",
      icon: <Code className="h-6 w-6" />,
      color: "bg-green-500",
      outputs: ["User Stories", "Technical Tasks", "Definition of Done"]
    },
    { 
      phase: "Integration", 
      description: "Project setup in JIRA, Confluence documentation, team coordination",
      icon: <GitBranch className="h-6 w-6" />,
      color: "bg-orange-500",
      outputs: ["JIRA Epics", "Confluence Pages", "Team Notifications"]
    }
  ]

  const integrations = [
    { name: "JIRA", description: "Project management", icon: "🎯" },
    { name: "Confluence", description: "Documentation hub", icon: "📚" },
    { name: "GitHub", description: "Code repository", icon: "🐙" },
    { name: "Slack", description: "Team communication", icon: "💬" },
    { name: "Notion", description: "Knowledge management", icon: "📝" },
    { name: "OpenAI", description: "Your AI provider", icon: "🤖" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Workflow className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SDLC Automation Platform
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
              <Link href="#sdlc-phases" className="text-gray-600 hover:text-gray-900 transition-colors">SDLC Phases</Link>
              <Link href="#integrations" className="text-gray-600 hover:text-gray-900 transition-colors">Integrations</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How It Works</Link>
            </div>
            <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-grid-gray-100 bg-[size:20px_20px] opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Workflow className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Complete SDLC Automation</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">AI-Powered</Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Automate Your Entire
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Software Development Lifecycle
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              From requirements gathering to deployment documentation, streamline every phase of your SDLC. 
              Use your own AI keys, integrate with existing tools, and accelerate project delivery with intelligent automation.
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
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-12 max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">Bring Your Own AI Keys</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Your Data Stays Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Plug className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-700">Native Tool Integration</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="bg-white/60 backdrop-blur-sm rounded-full p-2 mr-2">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See SDLC Automation in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch how our platform transforms a simple idea into complete project documentation, 
              JIRA epics, and Confluence pages in minutes
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-2xl">
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src="https://www.youtube.com/embed/UaGRWffznQk"
                  title="SDLC Automation Platform Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Complete Workflow Demo</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Play className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Real-time Generation</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">AI-Powered Results</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" asChild>
              <Link href="/signin">
                Try It Yourself
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SDLC Phases Section */}
      <section id="sdlc-phases" className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Complete SDLC Phase Coverage
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Automate every phase of your software development lifecycle with AI-powered intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sdlcPhases.map((phase, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="text-center">
                  <div className={`${phase.color} p-4 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform`}>
                    {phase.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold">{phase.phase}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center mb-4">{phase.description}</p>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">Generated Outputs:</div>
                    {phase.outputs.map((output, idx) => (
                      <div key={idx} className="text-xs bg-gray-100 rounded-full px-3 py-1 inline-block mr-2">
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
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our SDLC Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for modern development teams who value security, flexibility, and seamless integration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white">
                <CardHeader>
                  <div className={`${feature.color} p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How SDLC Automation Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Intelligent orchestration of AI models and development tools to automate your entire workflow
            </p>
          </div>

          <div className="relative">
            {/* Workflow Steps */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {workflowSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        {step.step}
                      </div>
                      <div className="bg-gray-100 p-2 rounded-lg">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <div className="flex items-center justify-center mb-4">
                <Key className="h-8 w-8 mr-3" />
                <h3 className="text-2xl font-bold">Bring Your Own AI Keys</h3>
              </div>
              <p className="text-blue-100 mb-6 max-w-3xl mx-auto">
                Use your own OpenAI, Claude, or other AI provider keys. No vendor lock-in, complete data control, 
                and transparent usage costs. Your keys, your data, your control.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold">🔒</div>
                  <div className="text-blue-100">Secure Key Storage</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">💰</div>
                  <div className="text-blue-100">Transparent Costs</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">🔄</div>
                  <div className="text-blue-100">No Vendor Lock-in</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Native Tool Integrations
            </h2>
            <p className="text-xl text-gray-600">
              Connect with your existing development ecosystem seamlessly
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-3xl mb-3">{integration.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{integration.name}</h3>
                <p className="text-xs text-gray-600">{integration.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              Plus many more integrations available through our extensible platform
            </p>
            <Button variant="outline" className="border-gray-300">
              <Plug className="mr-2 h-4 w-4" />
              View All Integrations
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Automate Your SDLC?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join development teams who are already accelerating their software delivery with intelligent SDLC automation. 
              Bring your own AI keys, integrate with your tools, and transform how you build software.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4" asChild>
                <Link href="/signin">
                  Start Automating Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
                <BookOpen className="mr-2 h-5 w-5" />
                Explore Documentation
              </Button>
            </div>
            <p className="text-blue-200 text-sm mt-6">
              ✨ Free to start • Use your own AI keys • No vendor lock-in
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Workflow className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">SDLC Automation Platform</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Automate your entire software development lifecycle with AI-powered intelligence. 
                From requirements to deployment, streamline every phase of development.
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
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Templates</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Guides</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} SDLC Automation Platform. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

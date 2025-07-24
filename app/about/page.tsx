import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Code, 
  Zap, 
  Users, 
  Target, 
  Shield, 
  Lightbulb,
  Rocket,
  Globe,
  Heart,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About SDLC.dev - AI-Powered Development Lifecycle Platform',
  description: 'Learn about SDLC.dev, an experimental AI-powered platform that automates software development lifecycle processes.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <img 
                  src="/img/logo-sdlc-white.png" 
                  alt="SDLC.dev Logo" 
                  className="h-16 w-auto" 
                  style={{ 
                    maxWidth: 'none'  // Override Tailwind's max-width: 100%
                  }}
                />
                <div className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent font-black text-xl">
                  SDLC.dev
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-900/20 border border-blue-800/30 rounded-full text-blue-300 text-sm mb-6">
            <Lightbulb className="h-4 w-4 mr-2" />
            Experimental Platform
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
              SDLC.dev
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Automate. Architect. Accelerate. With Code Yodha - An experimental AI-powered platform 
            revolutionizing software development lifecycle processes.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="h-5 w-5 text-blue-400" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">
              SDLC.dev is an experimental platform designed to transform how developers approach 
              software development lifecycle processes. We're exploring the intersection of artificial 
              intelligence and software engineering to create tools that automate documentation, 
              accelerate project planning, and enhance architectural decision-making.
            </p>
          </CardContent>
        </Card>

        {/* What We Do */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gray-900/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Code className="h-5 w-5 text-green-400" />
                AI-Powered Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm leading-relaxed">
                Generate comprehensive business analysis, technical specifications, 
                UX guidelines, and architecture diagrams using advanced AI models.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-yellow-400" />
                Integration Ecosystem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm leading-relaxed">
                Seamlessly connect with JIRA, Confluence, GitHub, and other development 
                tools to streamline your workflow and maintain consistency.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-purple-400" />
                Collaborative Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm leading-relaxed">
                Built for teams to collaborate on project planning, documentation, 
                and architectural decisions with AI-assisted insights.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Rocket className="h-5 w-5 text-red-400" />
                Continuous Innovation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm leading-relaxed">
                As an experimental platform, we're constantly evolving, testing new features, 
                and pushing the boundaries of what's possible in SDLC automation.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Experimental Nature */}
        <Card className="bg-amber-900/20 border-amber-800/30 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-300">
              <Shield className="h-5 w-5" />
              Experimental Platform Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-amber-200">
              <p className="leading-relaxed">
                <strong>Important:</strong> SDLC.dev is currently an experimental platform in active development. 
                This means:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Features may change or be discontinued without notice</li>
                <li>The platform is provided for research and experimentation purposes</li>
                <li>No commercial guarantees or warranties are provided</li>
                <li>Data and generated content may be used to improve our AI models</li>
                <li>Service availability and performance may vary</li>
              </ul>
              <p className="text-sm mt-4">
                By using SDLC.dev, you acknowledge and accept the experimental nature of this platform.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="h-5 w-5 text-blue-400" />
              Technology & AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                SDLC.dev leverages cutting-edge AI technologies including OpenAI's GPT models, 
                Claude AI, and other advanced language models to understand requirements and 
                generate comprehensive documentation.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-blue-400 border-blue-800/30">Next.js</Badge>
                <Badge variant="outline" className="text-green-400 border-green-800/30">OpenAI GPT</Badge>
                <Badge variant="outline" className="text-purple-400 border-purple-800/30">Claude AI</Badge>
                <Badge variant="outline" className="text-yellow-400 border-yellow-800/30">TypeScript</Badge>
                <Badge variant="outline" className="text-pink-400 border-pink-800/30">Supabase</Badge>
                <Badge variant="outline" className="text-indigo-400 border-indigo-800/30">Tailwind CSS</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <Card className="bg-gray-900/50 border-gray-800/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Heart className="h-5 w-5 text-red-400" />
              Community & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                As an experimental platform, we're building a community of developers, 
                architects, and AI enthusiasts who are passionate about the future of 
                software development.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  <strong>Support:</strong> Community-driven support through our platform and documentation
                </p>
                <p className="text-sm text-gray-400">
                  <strong>Feedback:</strong> Your feedback helps shape the future of SDLC.dev
                </p>
                <p className="text-sm text-gray-400">
                  <strong>Updates:</strong> Regular updates and new features based on user needs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-800/50">
          <p className="text-gray-400 text-sm">
            SDLC.dev - Experimental AI-Powered Development Lifecycle Platform
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Built with ❤️ for developers, by developers
          </p>
        </div>
      </div>
    </div>
  )
} 
"use client"

import { useState,useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  FileText,
  Zap,
  Github,
  Users,
  BarChart3,
  Bot,
  CheckCircle,
  Play,
  Puzzle,
  Star,
  Database,
  Brain,
  Sparkles,
  Terminal,
  GitBranch,
  MessageSquare,
  Cpu,
  Workflow,
  Shield,
  Search,
  Code,
  Palette,
  Building,
  ArrowUpRight,
  ExternalLink,
  Rocket,
  Crown,
  Globe,
  Lock,
  ChevronRight,
  Target,
  Gift,
  TrendingUp,
  Activity,
  Settings,
  Layers,
  Briefcase,
  Cloud,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  Eye,
  Loader2,
  Package,
  AlertCircle,
  User
} from "lucide-react"
import Link from "next/link"
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import EarlyAccessOptIn from '@/components/early-access-opt-in'
import { AIDiagramModal } from '@/components/ai-diagram-modal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import Head from 'next/head'

export default function ModernLandingPage() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showEarlyAccessDialog, setShowEarlyAccessDialog] = useState(false)
  const [showAIDiagramModal, setShowAIDiagramModal] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chatInput, setChatInput] = useState("")
  const [error, setError] = useState("")
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        // Track page visit for analytics
        if (!user) {
          // Track anonymous page visit
          try {
            await fetch('/api/track-visit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                page: 'landing',
                userAgent: navigator.userAgent,
                referrer: document.referrer,
                timestamp: new Date().toISOString()
              })
            })
          } catch (error) {
            console.log('Analytics tracking failed:', error)
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLoginRequired = (feature: string) => {
    window.location.href = '/signin'
  }

  const handleChatSubmit = () => {
    if (!user) {
      handleLoginRequired("AI Chat Interface")
      return
    }
    window.location.href = '/dashboard'
  }

  const handleStartBuilding = () => {
    if (user) {
      window.location.href = '/dashboard'
    } else {
      window.location.href = '/signin'
    }
  }

  const handleGenerate = async () => {
    if (!chatInput.trim()) {
      setError("Please enter a description for your project")
      return
    }
    
    // Clear any previous errors
    setError("")
    
    // Open the streaming modal
    setShowAIDiagramModal(true)
  }

  return (
    <>
      <Head>
        <title>SDLC.dev CodeYodha – AI-Powered Software Development Lifecycle Agent</title>
        <meta name="description" content="SDLC.dev CodeYodha is an AI agent that automates your entire software development lifecycle: requirements, specs, code, project setup, analysis, and more. Accelerate your development with AI-powered tools." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://sdlc.dev/" />
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sdlc.dev/" />
        <meta property="og:title" content="SDLC.dev CodeYodha – AI-Powered Software Development Lifecycle Agent" />
        <meta property="og:description" content="AI agent for requirements, specs, code, project setup, and more. Accelerate your software development lifecycle with SDLC.dev CodeYodha." />
        {/* <meta property="og:image" content="https://sdlc.dev/og-image.png" /> */}
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://sdlc.dev/" />
        <meta name="twitter:title" content="SDLC.dev CodeYodha – AI-Powered Software Development Lifecycle Agent" />
        <meta name="twitter:description" content="AI agent for requirements, specs, code, project setup, and more. Accelerate your software development lifecycle with SDLC.dev CodeYodha." />
        {/* <meta name="twitter:image" content="https://sdlc.dev/og-image.png" /> */}
        {/* Structured Data: Organization and WebSite, no logo image */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "SDLC.dev",
          "url": "https://sdlc.dev/",
          "description": "SDLC.dev CodeYodha is an AI agent that automates your entire software development lifecycle: requirements, specs, code, project setup, analysis, and more. Accelerate your development with AI-powered tools."
        }` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "SDLC.dev",
          "url": "https://sdlc.dev/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://sdlc.dev/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }` }} />
      </Head>
      <div className="flex flex-col min-h-screen bg-black text-white">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Cpu className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                SDLC.dev
              </span>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                AI Agent
              </Badge>
            </div>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#try-ai" className="text-gray-400 hover:text-white transition-colors">
                Try AI
              </Link>
              <Link href="#demo" className="text-gray-400 hover:text-white transition-colors">
                Demo
              </Link>
              <Link href="#integrations" className="text-gray-400 hover:text-white transition-colors">
                Integrations
              </Link>
              <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
            </nav>
            <div className="flex items-center space-x-3">
              {user ? (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-400" onClick={() => window.location.href = '/signin'}>
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
                    onClick={() => setShowEarlyAccessDialog(true)}
                  >
                    Get Early Access
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">
          {/* Free Trial Banner */}
          {/* <section className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="mx-auto max-w-4xl">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">
                      Try AI Assistant Free
                    </span>
                  </div>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-300">
                    No signup required • Generate architecture diagrams instantly
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300 underline p-0 h-auto"
                    onClick={() => document.getElementById('try-ai')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Try Now →
                  </Button>
                </div>
              </div>
            </div>
          </section> */}

          {/* Hero + Chat Section Side by Side */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-4">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12 lg:gap-20">
                {/* Hero Section */}
                <div className="flex-1 w-full text-center lg:text-left space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-center lg:justify-start space-x-2">
                      <Badge className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400 border-blue-500/20">
                        <Sparkles className="mr-1 h-3 w-3" />
                        AI-Powered SDLC Agent
                      </Badge>
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                        Live
                      </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                      <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                        Introducing AI
                      </span>
                      <br />
                      <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        CodeYodha
                      </span>
                    </h1>
                    <p className="text-sm text-gray-400 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                      At SDLC.DEV CodeYodha is an AI agent that handles your entire software development lifecycle. From requirements to deployment, it writes specs, creates projects, analyzes code, and provides intelligent assistance — all autonomously.
                    </p>
                    {/* Tagline above infographic */}
                    <div className="mt-6 mb-2 flex items-center space-x-2 text-lg font-semibold">
                      {/* <span className="text-white">At SDLC.dev:</span> */}
                      <span className="text-blue-400">Automate.</span>
                      <span className="text-purple-400">Architect.</span>
                      <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">Accelerate.</span>
                      <span className="text-white">With Code Yodha</span>
                      <Rocket className="inline-block h-6 w-6 text-pink-400 ml-1" />
                    </div>
                  </div>
                  {/* SDLC Infographic */}
                  <div className="hidden lg:flex flex-col items-start mt-8 ml-2">
                    <div className="flex flex-col items-center relative">
                      {/* Vertical line */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-6 bottom-6 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full z-0" style={{height: 'calc(100% - 3rem)'}} />
                      {/* Stages */}
                      <div className="flex flex-col gap-8 z-10">
                        <div className="flex items-center gap-3">
                          <FileText className="h-6 w-6 text-blue-400" />
                          <span className="text-xs text-gray-300">Requirements</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Palette className="h-6 w-6 text-purple-400" />
                          <span className="text-xs text-gray-300">Design</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Code className="h-6 w-6 text-green-400" />
                          <span className="text-xs text-gray-300">Development</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Shield className="h-6 w-6 text-yellow-400" />
                          <span className="text-xs text-gray-300">Testing</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Rocket className="h-6 w-6 text-pink-400" />
                          <span className="text-xs text-gray-300">Deployment</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Bot className="h-6 w-6 text-orange-400" />
                          <span className="text-xs text-gray-300">AI Optimization</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Chat Section */}
                <div className="flex-1 w-full max-w-xl mx-auto lg:mx-0">
                  <div className="relative">
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Optional: subtle background accent for chat card */}
                    </div>
                    <Card className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-black border-4 border-blue-500 shadow-xl shadow-blue-700/60 backdrop-blur-lg rounded-2xl transition-all duration-300 ring-4 ring-blue-400/40 focus-within:ring-4 focus-within:ring-blue-400/60
                      md:bg-gray-900/90 md:border-2 md:border-blue-600 md:shadow-2xl md:shadow-blue-900/40 md:ring-2 md:ring-blue-700/20">
                      <CardContent className="p-6 md:p-8">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                              <Brain className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">Try Now {'->'} SDLC AI Assistant</h3>
                              <p className="text-sm text-gray-400">Ready to help with your development workflow</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-400 text-sm">Online</span>
                          </div>
                        </div>
                        {/* Chat Input */}
                        <div className="relative mb-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Search className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-400">Describe your bug, feature, or business case:</span>
                            </div>
                            <Textarea
                              placeholder="Example: We need to implement a user authentication system that supports email/password login, social media login (Google, Facebook), password reset functionality, and role-based access control. The system should be secure, scalable, and integrate with our existing user database..."
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              className="min-h-[120px] bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-inner"
                            />
                            <Button
                              onClick={handleGenerate}
                              disabled={!chatInput.trim()}
                              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 text-lg shadow-lg shadow-blue-900/30"
                              size="lg"
                            >
                              <Sparkles className="w-5 h-5 mr-2" />
                              Generate Specs
                            </Button>
                          </div>
                        </div>
                        {/* Error Display */}
                        {error && (
                          <div className="mb-6">
                            <Alert className="bg-red-900/20 border-red-800/30 text-red-300">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          </div>
                        )}
                        {/* Suggested Prompts */}
                        <div className="space-y-3">
                          <p className="text-sm text-gray-400 mb-4">Try these examples:</p>
                          <div className="grid md:grid-cols-2 gap-3">
                            <button
                              onClick={() => setChatInput("Generate specs for a chat app")}
                              className="text-left p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors group"
                            >
                              <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-blue-400" />
                                <div>
                                  <p className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                    Generate specs for a chat app
                                  </p>
                                  <p className="text-gray-400 text-sm">AI-powered specification generation</p>
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={() => setChatInput("Architecture for e-commerce platform")}
                              className="text-left p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-green-500/50 transition-colors group"
                            >
                              <div className="flex items-center space-x-3">
                                <GitBranch className="h-5 w-5 text-green-400" />
                                <div>
                                  <p className="text-white font-medium group-hover:text-green-400 transition-colors">
                                    Architecture for e-commerce platform
                                  </p>
                                  <p className="text-gray-400 text-sm">Complex system design</p>
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={() => setChatInput("Design a task management system")}
                              className="text-left p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors group"
                            >
                              <div className="flex items-center space-x-3">
                                <Workflow className="h-5 w-5 text-purple-400" />
                                <div>
                                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors">
                                    Design a task management system
                                  </p>
                                  <p className="text-gray-400 text-sm">Workflow optimization</p>
                                </div>
                              </div>
                            </button>
                            <button
                              onClick={() => setChatInput("Review code for improvements")}
                              className="text-left p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-orange-500/50 transition-colors group"
                            >
                              <div className="flex items-center space-x-3">
                                <Bot className="h-5 w-5 text-orange-400" />
                                <div>
                                  <p className="text-white font-medium group-hover:text-orange-400 transition-colors">
                                    Review code for improvements
                                  </p>
                                  <p className="text-gray-400 text-sm">AI-powered code suggestions</p>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Indicators Banner */}
          {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mx-auto max-w-4xl">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-white">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-semibold text-lg">Free Trial Available</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-6 w-6" />
                    <span className="font-semibold text-lg">No Credit Card Required</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="h-6 w-6" />
                    <span className="font-semibold text-lg">Start in 30 Seconds</span>
                  </div>
                </div>
              </div>
            </div>
          </section> */}

          {/* Audience-Specific Cards */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="mx-auto max-w-7xl px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Built for Every Developer
                  </span>
                </h2>
                <p className="text-lg text-gray-400">Tailored AI experiences for different development needs</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {/* For Creators */}
                <Card
                  className="bg-gray-900 border-gray-800 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  onClick={() => handleLoginRequired("Creator Features")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                          <Palette className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-white">For Creators</CardTitle>
                          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs mt-1">
                            Individual
                          </Badge>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-gray-300 mb-4">
                      Create production-quality development workflows with unprecedented speed and style consistency.
                      Perfect for solo developers and freelancers.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center text-gray-400">
                        <CheckCircle className="mr-2 h-3 w-3 text-blue-400" />
                        Personal project automation
                      </li>
                      <li className="flex items-center text-gray-400">
                        <CheckCircle className="mr-2 h-3 w-3 text-blue-400" />
                        Code quality optimization
                      </li>
                      <li className="flex items-center text-gray-400">
                        <CheckCircle className="mr-2 h-3 w-3 text-blue-400" />
                        Portfolio enhancement tools
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* For Teams */}
                <Card
                  className="bg-gray-900 border-gray-800 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  onClick={() => handleLoginRequired("Team Features")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                          <Building className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-white">For Teams</CardTitle>
                          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs mt-1">
                            Collaboration
                          </Badge>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-gray-300 mb-4">
                      Bring your team's best ideas to life at scale with our intuitive AI-first collaborative suite
                      designed for modern development teams.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center text-gray-400">
                        <CheckCircle className="mr-2 h-3 w-3 text-purple-400" />
                        Multi-project coordination
                      </li>
                      <li className="flex items-center text-gray-400">
                        <CheckCircle className="mr-2 h-3 w-3 text-purple-400" />
                        Team workflow automation
                      </li>
                      <li className="flex items-center text-gray-400">
                        <CheckCircle className="mr-2 h-3 w-3 text-purple-400" />
                        Collaborative AI assistance
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* For Developers */}
                <Card
                  className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  onClick={() => handleLoginRequired("Developer Features")}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                          <Code className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-white">For Developers</CardTitle>
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs mt-1">
                            Enterprise
                          </Badge>
                        </div>
                      </div>
                      <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-green-400 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-gray-300 mb-4">
                      Experience content creation excellence with advanced AI capabilities. Unmatched scalability to
                      effortlessly tailor outputs to your exact specifications.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center text-gray-400">
                        <CheckCircle className="mr-2 h-3 w-3 text-green-400" />
                        Advanced API integrations
                      </li>
                      <li className="flex items-center text-gray-400">
                        <CheckCircle className="mr-2 h-3 w-3 text-green-400" />
                        Custom workflow automation
                      </li>
                      <li className="flex items-center text-gray-400">
                        <CheckCircle className="mr-2 h-3 w-3 text-green-400" />
                        Enterprise-grade security
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Live Demo Preview */}
          <section id="demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="mx-auto max-w-7xl">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
                <div className="relative bg-gray-900 rounded-2xl border border-gray-800 p-1 shadow-2xl">
                  <div className="bg-black rounded-xl overflow-hidden">
                    {/* Terminal Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                        </div>
                        <span className="text-gray-400 text-sm ml-4">SDLC AI Agent</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-xs">Active</span>
                      </div>
                    </div>

                    {/* Terminal Content */}
                    <div className="p-6 font-mono text-sm space-y-4">
                      <div className="text-blue-400">
                        <span className="text-gray-500">$</span> sdlc create "user authentication system with social login"
                      </div>
                      <div className="text-gray-300 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                          <span>Analyzing requirements...</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Generated technical specifications</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Created GitHub repository</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span>Set up Jira project with 12 stories</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                          <span>Generating API documentation...</span>
                        </div>
                      </div>
                      <div className="text-green-400">
                        ✓ Project ready! View at: https://github.com/yourorg/auth-system
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-y border-gray-800">
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    10x
                  </div>
                  <p className="text-sm text-gray-400">Faster Development</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    5min
                  </div>
                  <p className="text-sm text-gray-400">Idea to Implementation</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    100%
                  </div>
                  <p className="text-sm text-gray-400">Autonomous Operation</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                    24/7
                  </div>
                  <p className="text-sm text-gray-400">AI Availability</p>
                </div>
              </div>
            </div>
          </section>

          {/* AI Capabilities Section */}
          <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    What our AI Agent can do
                  </span>
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  A complete AI software engineer that handles every aspect of your development lifecycle
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {/* Intelligent Spec Generation */}
                <Card className="bg-gray-900 border-gray-800 hover:border-blue-500/50 transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                        <Brain className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">Intelligent Spec Generation</CardTitle>
                        <CardDescription className="text-gray-400 text-base mt-1">
                          Transforms natural language into comprehensive technical specifications
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-black/50 p-4 rounded-lg border border-gray-800 font-mono text-sm">
                      <div className="text-blue-400 mb-2">Input:</div>
                      <div className="text-gray-300">"Build a real-time chat app with file sharing"</div>
                      <div className="text-green-400 mt-3 mb-2">AI Output:</div>
                      <div className="text-gray-300 space-y-1">
                        <div>• WebSocket architecture with Socket.io</div>
                        <div>• File upload with AWS S3 integration</div>
                        <div>• Redis for session management</div>
                        <div>• React frontend with TypeScript</div>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center text-gray-300">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                        Advanced NLP for requirement extraction
                      </li>
                      <li className="flex items-center text-gray-300">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                        Architecture patterns & best practices
                      </li>
                      <li className="flex items-center text-gray-300">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                        Database schema & API design
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Autonomous Project Setup */}
                <Card className="bg-gray-900 border-gray-800 hover:border-purple-500/50 transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                        <Workflow className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">Autonomous Project Setup</CardTitle>
                        <CardDescription className="text-gray-400 text-base mt-1">
                          Creates complete project infrastructure across all your tools
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-black/50 p-3 rounded-lg border border-gray-800 text-center">
                        <Github className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <div className="text-xs text-gray-400">Repository</div>
                      </div>
                      <div className="bg-black/50 p-3 rounded-lg border border-gray-800 text-center">
                        <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-xs text-gray-400">Jira Project</div>
                      </div>
                      <div className="bg-black/50 p-3 rounded-lg border border-gray-800 text-center">
                        <FileText className="h-6 w-6 text-green-400 mx-auto mb-2" />
                        <div className="text-xs text-gray-400">Confluence</div>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center text-gray-300">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                        Automated repository creation & configuration
                      </li>
                      <li className="flex items-center text-gray-300">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                        Sprint planning with story breakdown
                      </li>
                      <li className="flex items-center text-gray-300">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                        Documentation generation & sync
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* GitDigest Intelligence */}
                <Card className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                        <GitBranch className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">GitDigest Intelligence</CardTitle>
                        <CardDescription className="text-gray-400 text-base mt-1">
                          Automated repository analysis with smart insights
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-black/50 p-4 rounded-lg border border-gray-800">
                      <div className="text-green-400 text-sm mb-2">Daily Report - March 15, 2024</div>
                      <div className="text-gray-300 text-sm space-y-1">
                        <div>• 3 PRs merged: Authentication security improved</div>
                        <div>• API response time reduced by 40% (optimization)</div>
                        <div>• Code coverage increased to 85%</div>
                        <div>• 2 potential security issues detected & fixed</div>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center text-gray-300">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                        Real-time repository monitoring
                      </li>
                      <li className="flex items-center text-gray-300">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                        Natural language progress reports
                      </li>
                      <li className="flex items-center text-gray-300">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                        Predictive issue detection
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* AI Code Assistant */}
                <Card className="bg-gray-900 border-gray-800 hover:border-orange-500/50 transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                        <Bot className="h-6 w-6 text-orange-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">AI Code Assistant</CardTitle>
                        <CardDescription className="text-gray-400 text-base mt-1">
                          Context-aware coding companion with autonomous capabilities
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-black/50 p-4 rounded-lg border border-gray-800 font-mono text-sm">
                      <div className="text-orange-400 mb-2">AI Suggestion:</div>
                      <div className="text-gray-300 space-y-1">
                        <div className="text-red-400">- const result = await fetch(url)</div>
                        <div className="text-green-400">+ const result = await fetch(url, {`{ timeout: 5000 }`})</div>
                        <div className="text-gray-500 mt-2">// Added timeout for better error handling</div>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center text-gray-300">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                        Context-aware code suggestions
                      </li>
                      <li className="flex items-center text-gray-300">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                        Autonomous bug detection & fixes
                      </li>
                      <li className="flex items-center text-gray-300">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                        Performance optimization insights
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Integrations */}
          <section id="integrations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Native Integrations
                  </span>
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                  Seamlessly connects with your existing development ecosystem
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {[
                  { icon: Github, name: "GitHub", desc: "Repository Management" },
                  { icon: Users, name: "Jira", desc: "Project Planning" },
                  { icon: FileText, name: "Confluence", desc: "Documentation" },
                  { icon: MessageSquare, name: "Slack", desc: "Team Communication" },
                  { icon: Database, name: "AWS", desc: "Cloud Infrastructure" },
                  { icon: Terminal, name: "Docker", desc: "Containerization" },
                  { icon: GitBranch, name: "GitLab", desc: "DevOps Platform" },
                  { icon: Workflow, name: "Jenkins", desc: "CI/CD Pipeline" },
                ].map((integration, index) => (
                  <Card
                    key={index}
                    className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-300 p-6 text-center group"
                  >
                    <integration.icon className="h-12 w-12 mx-auto mb-4 text-gray-400 group-hover:text-white transition-colors" />
                    <h3 className="font-semibold text-white mb-1">{integration.name}</h3>
                    <p className="text-xs text-gray-500">{integration.desc}</p>
                  </Card>
                ))}
              </div>

              <div className="text-center">
                <Badge className="bg-gray-800 text-gray-300 border-gray-700">
                  <Puzzle className="mr-1 h-3 w-3" />
                  8+ integrations • More coming soon
                </Badge>
              </div>
            </div>
          </section>

          {/* Free Trial Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20">
            <div className="mx-auto max-w-6xl">
              <div className="text-center mb-16">
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 mb-4">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  No Credit Card Required
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Start Building with AI
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    Completely Free
                  </span>
                </h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
                  Experience the full power of AI-driven development. No commitments, no hidden costs.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* What You Get */}
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-white mb-6">What you get instantly:</h3>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Brain className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">AI Spec Generation</h4>
                        <p className="text-gray-400 text-sm">
                          Transform ideas into technical specifications • 10 generations/month
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Workflow className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Project Setup</h4>
                        <p className="text-gray-400 text-sm">GitHub, Jira & Confluence integration • 5 projects/month</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <GitBranch className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">GitDigest Analysis</h4>
                        <p className="text-gray-400 text-sm">Daily reports & insights • 1 repository monitoring</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-orange-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">AI Code Assistant</h4>
                        <p className="text-gray-400 text-sm">Smart suggestions & bug detection • 100 queries/month</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Shield className="h-4 w-4 text-pink-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Your Own AI Keys</h4>
                        <p className="text-gray-400 text-sm">Bring your OpenAI/Claude keys • Full data control</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Card */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl" />
                  <Card className="relative bg-gray-900/80 border-gray-700 p-8 backdrop-blur">
                    <CardContent className="space-y-6 p-0">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                          <Zap className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">Start Building Now</h3>
                          <p className="text-gray-400">Ready to use in 30 seconds</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Button
                          size="lg"
                          className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 text-lg font-medium"
                          onClick={handleStartBuilding}
                        >
                          <Brain className="mr-2 h-5 w-5" />
                          Start Free Trial
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>

                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center">
                              <CheckCircle className="mr-1 h-3 w-3 text-green-400" />
                              No Credit Card
                            </div>
                            <div className="flex items-center">
                              <CheckCircle className="mr-1 h-3 w-3 text-green-400" />
                              Instant Access
                            </div>
                            <div className="flex items-center">
                              <CheckCircle className="mr-1 h-3 w-3 text-green-400" />
                              Cancel Anytime
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">Join 12,000+ developers already building with AI</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Early Access Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gray-900/50">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-400 border-yellow-500/20 mb-6">
                <Sparkles className="mr-1 h-3 w-3" />
                Coming Soon • Advanced Features
              </Badge>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Get Early Access to
                </span>
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Advanced AI Features
                </span>
              </h2>

              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                Be among the first to experience our most powerful AI capabilities. Limited early access available.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="bg-gray-900 border-gray-800 p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Autonomous Coding</h3>
                  <p className="text-sm text-gray-400">AI writes complete features end-to-end</p>
                </Card>

                <Card className="bg-gray-900 border-gray-800 p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Workflow className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Multi-Repo Management</h3>
                  <p className="text-sm text-gray-400">Coordinate changes across multiple repositories</p>
                </Card>

                <Card className="bg-gray-900 border-gray-800 p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Real-time Collaboration</h3>
                  <p className="text-sm text-gray-400">AI pairs with your team in real-time</p>
                </Card>
              </div>

              <div className="space-y-4">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0"
                  onClick={() => setShowEarlyAccessDialog(true)}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Join Early Access Waitlist
                </Button>
                <p className="text-sm text-gray-500">Priority access • Advanced features • Direct feedback channel</p>
              </div>
            </div>
          </section>

          {/* Early Access Dialog */}
          <Dialog open={showEarlyAccessDialog} onOpenChange={setShowEarlyAccessDialog}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-xl">
                  <Sparkles className="mr-2 h-5 w-5 text-yellow-400" />
                  Early Access Program
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Join our waitlist to get priority access to advanced AI features
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <EarlyAccessOptIn 
                  user={user}
                  onSuccess={() => {
                    setShowEarlyAccessDialog(false)
                    setShowConfirmDialog(true)
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Confirmation Dialog */}
          <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <DialogContent className="bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center text-xl">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                  Early Access Confirmed!
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  You've been added to our priority waitlist for advanced AI features.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Priority access to new features</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Direct feedback channel with our team</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">Exclusive updates and behind-the-scenes content</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 text-center">
                  We'll notify you as soon as advanced features are available. Expected: Q2 2024
                </p>
                <div className="flex space-x-3">
                  <Button
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                    onClick={() => {
                      setShowConfirmDialog(false)
                      if (user) {
                        window.location.href = '/dashboard'
                      } else {
                        window.location.href = '/signin'
                      }
                    }}
                  >
                    {user ? 'Go to Dashboard' : 'Sign Up Now'}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Later
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* AI Diagram Generation Modal */}
          <AIDiagramModal 
            isOpen={showAIDiagramModal}
            onClose={() => setShowAIDiagramModal(false)}
            input={chatInput}
          />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                    <Cpu className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-base font-bold text-white">SDLC.dev</span>
                </div>
                <p className="text-sm text-gray-400 max-w-xs">
                Automate. Architect. Accelerate. With Code Yodha
                </p>
                <div className="flex space-x-4">
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                    AI Agent Active
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Product</h4>
                <ul className="space-y-1.5 text-sm text-gray-400">
                  <li>
                    <Link href="#features" className="hover:text-white transition-colors">
                      AI Capabilities
                    </Link>
                  </li>
                  <li>
                    <Link href="#integrations" className="hover:text-white transition-colors">
                      Integrations
                    </Link>
                  </li>
                  
                </ul>
              </div>

              

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Company</h4>
                <ul className="space-y-1.5 text-sm text-gray-400">
                  <li>
                    <Link href="/about" className="hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Legal</h4>
                <ul className="space-y-1.5 text-sm text-gray-400">
                  <li>
                    <button className="hover:text-white transition-colors text-left" onClick={() => window.dispatchEvent(new CustomEvent('show-cookie-settings'))}>
                      Cookie Settings
                    </button>
                  </li>
                  <li>
                    <span className="text-green-400">
                      GDPR Compliant
                    </span>
                  </li>
                  <li>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                      <span className="text-amber-400">Experimental</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} SDLC.dev. All rights reserved.
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Experimental platform for research and development purposes.
                  </p>
                </div>
                
                <div className="flex items-center space-x-6 mt-4 sm:mt-0">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>All systems operational</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    GDPR Compliant
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

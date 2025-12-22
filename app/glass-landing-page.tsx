'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  ArrowRight,
  Github,
  Search,
  Brain,
  Zap,
  FileText,
  GitBranch,
  MessageSquare,
  Shield,
  Rocket,
  Star,
  CheckCircle,
  ExternalLink,
  Loader2,
  Code,
  Database,
  Layers,
  Globe,
  Terminal,
  Play,
  Building2,
  Users,
  TrendingUp,
} from 'lucide-react';
import { companies } from '@/data/tech-stacks';
import { createClient } from '@/lib/supabase/client';
import { AIDiagramModal } from '@/components/ai-diagram-modal';
import EarlyAccessOptIn from '@/components/early-access-opt-in';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Reusable Glass Card Component
function GlassCard({
  children,
  className = '',
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl
        bg-white/[0.08]
        backdrop-blur-2xl backdrop-saturate-200
        border border-white/[0.15]
        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        ${hover ? 'transition-all duration-500 hover:bg-white/[0.12] hover:border-white/[0.25] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] hover:scale-[1.02]' : ''}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// Animated Background Component
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Animated mesh gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-600/40 to-transparent rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-bl from-purple-600/40 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-pink-600/30 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '-2s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '-4s' }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300
        ${
          active
            ? 'bg-white/20 text-white shadow-lg shadow-white/10 border border-white/20'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

export default function GlassLandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'describe' | 'analyze'>('describe');
  const [chatInput, setChatInput] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [showAIDiagramModal, setShowAIDiagramModal] = useState(false);
  const [showEarlyAccessDialog, setShowEarlyAccessDialog] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleGenerate = () => {
    if (!chatInput.trim()) return;
    setShowAIDiagramModal(true);
  };

  const handleAnalyzeRepo = () => {
    if (!repoUrl.trim()) return;
    // Navigate to analyze page with pre-filled URL
    router.push(`/analyze?repo=${encodeURIComponent(repoUrl)}`);
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Transform ideas into structured specifications with advanced AI understanding.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: FileText,
      title: 'Auto Documentation',
      description: 'Generate comprehensive technical docs, architecture diagrams, and specs.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: GitBranch,
      title: 'GitHub Integration',
      description: 'Analyze any repository and generate instant project specifications.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get detailed analysis and documentation in seconds, not hours.',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      icon: Shield,
      title: 'Enterprise Ready',
      description: 'Secure, scalable, and designed for professional development teams.',
      gradient: 'from-indigo-500 to-violet-500',
    },
    {
      icon: Layers,
      title: 'Full SDLC Coverage',
      description: 'From requirements to deployment, cover the entire development lifecycle.',
      gradient: 'from-rose-500 to-red-500',
    },
  ];

  const integrations = [
    { name: 'GitHub', icon: Github, description: 'Repository analysis & project creation' },
    { name: 'JIRA', icon: Layers, description: 'Epic & story generation' },
    { name: 'Slack', icon: MessageSquare, description: 'Team notifications' },
    { name: 'Confluence', icon: FileText, description: 'Documentation sync' },
  ];

  return (
    <>
      <AnimatedBackground />

      <div className="relative min-h-screen text-white">
        {/* Glass Header */}
        <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/[0.02] border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/img/logo-sdlc-white.png" alt="SDLC.dev" className="h-12 w-auto" />
                <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-500/30">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI Agent
                </Badge>
              </div>

              <nav className="hidden md:flex items-center gap-8">
                <Link href="#features" className="text-white/60 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#tech-stacks" className="text-white/60 hover:text-white transition-colors flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Tech Stacks
                </Link>
                <Link href="#demo" className="text-white/60 hover:text-white transition-colors">
                  Demo
                </Link>
                <Link href="#integrations" className="text-white/60 hover:text-white transition-colors">
                  Integrations
                </Link>
                <Link
                  href="https://github.com/durdan/dd-sdlc-ai"
                  target="_blank"
                  className="text-white/60 hover:text-white transition-colors flex items-center gap-1"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </Link>
              </nav>

              <div className="flex items-center gap-3">
                {user ? (
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                  >
                    Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="text-white/70 hover:text-white hover:bg-white/10"
                      onClick={() => router.push('/signin')}
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={() => setShowEarlyAccessDialog(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
                    >
                      Get Early Access
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main>
          {/* Hero Section with Tabs */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Live
                </Badge>
                <Badge className="bg-white/10 text-white/70 border-white/20">
                  Open Source
                </Badge>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                  From Prompt to
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Production Ready
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8">
                Transform ideas into structured specifications, analyze GitHub repos instantly, and accelerate your
                entire software development lifecycle with AI.
              </p>

              <div className="flex items-center justify-center gap-2 text-sm md:text-base font-medium mb-12">
                <span className="text-blue-400">Vibe</span>
                <ArrowRight className="w-4 h-4 text-white/40" />
                <span className="text-purple-400">Spec</span>
                <ArrowRight className="w-4 h-4 text-white/40" />
                <span className="text-pink-400">Code</span>
                <Rocket className="w-5 h-5 text-pink-400 ml-2" />
              </div>
            </div>

            {/* Tabbed Interface */}
            <div className="max-w-2xl mx-auto">
              {/* Tab Buttons */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <TabButton
                  active={activeTab === 'describe'}
                  onClick={() => setActiveTab('describe')}
                  icon={Brain}
                  label="Describe Project"
                />
                <TabButton
                  active={activeTab === 'analyze'}
                  onClick={() => setActiveTab('analyze')}
                  icon={Github}
                  label="Analyze GitHub Repo"
                />
              </div>

              {/* Tab Content */}
              <GlassCard className="p-6 md:p-8" hover={false}>
                {activeTab === 'describe' ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">AI Project Generator</h3>
                        <p className="text-sm text-white/50">Describe your idea, get full specs</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-sm">Ready</span>
                      </div>
                    </div>

                    <Textarea
                      placeholder="Example: Build a user authentication system with social login, 2FA, and role-based access control..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 rounded-xl resize-none"
                    />

                    <Button
                      onClick={handleGenerate}
                      disabled={!chatInput.trim()}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 h-12 text-base font-medium"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Specifications
                    </Button>

                    <p className="text-center text-white/40 text-sm">
                      Generates: Business Analysis, Technical Specs, Architecture Diagrams
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Github className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">GitHub Repo Analyzer</h3>
                        <p className="text-sm text-white/50">Instant specs from any repository</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-sm">Ready</span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                        <Github className="w-4 h-4 text-white" />
                      </div>
                      <Input
                        type="text"
                        placeholder="github.com/owner/repo or owner/repo"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeRepo()}
                        className="h-14 pl-16 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-green-500/50 focus:ring-green-500/20 rounded-xl text-base"
                      />
                    </div>

                    <Button
                      onClick={handleAnalyzeRepo}
                      disabled={!repoUrl.trim()}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 h-12 text-base font-medium"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      Analyze Repository
                    </Button>

                    <p className="text-center text-white/40 text-sm">
                      Generates: Tech Stack, Architecture, Directory Structure, Features
                    </p>
                  </div>
                )}
              </GlassCard>
            </div>
          </section>

          {/* Tech Stacks Section */}
          <section id="tech-stacks" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center mb-12">
              <Badge className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-400 border-orange-500/30 mb-4">
                <TrendingUp className="w-3 h-3 mr-1" />
                Learn from the Best
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                  Real Architecture from
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  World-Class Companies
                </span>
              </h2>
              <p className="text-white/50 max-w-2xl mx-auto">
                Explore how Netflix, Uber, Stripe, and other tech giants architect systems at massive scale.
                Interactive diagrams, design patterns, and technical decisions.
              </p>
            </div>

            {/* Featured Company Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {companies.slice(0, 6).map((company) => {
                // Get primary technologies
                const primaryTech = Object.values(company.techStack)
                  .flat()
                  .filter((t) => t.isPrimary)
                  .slice(0, 4);

                // Category gradient mapping
                const categoryGradients: Record<string, string> = {
                  'streaming': 'from-red-500 to-pink-500',
                  'transportation': 'from-blue-500 to-cyan-500',
                  'fintech': 'from-purple-500 to-indigo-500',
                  'e-commerce': 'from-orange-500 to-amber-500',
                  'communication': 'from-green-500 to-emerald-500',
                  'social-media': 'from-pink-500 to-rose-500',
                  'cloud': 'from-blue-600 to-blue-400',
                };

                const gradient = categoryGradients[company.category] || 'from-gray-500 to-gray-400';

                return (
                  <Link key={company.slug} href={`/tech-stacks/${company.slug}`}>
                    <GlassCard className="p-6 h-full cursor-pointer group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                            <Building2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">
                              {company.name}
                            </h3>
                            <p className="text-white/40 text-sm capitalize">
                              {company.category.replace('-', ' ')}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                      </div>

                      <p className="text-white/50 text-sm mb-4 line-clamp-2">
                        {company.description}
                      </p>

                      {/* Metrics */}
                      <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                        {company.metrics.users && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {company.metrics.users}
                          </span>
                        )}
                        {company.info.employees && (
                          <span>{company.info.employees} employees</span>
                        )}
                      </div>

                      {/* Architecture Badge */}
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-white/10 text-white/70 border-white/20 text-xs">
                          {company.architecture.type}
                        </Badge>
                        {company.architectureDiagrams && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            4 Diagrams
                          </Badge>
                        )}
                      </div>

                      {/* Tech Stack */}
                      <div className="flex flex-wrap gap-1.5">
                        {primaryTech.map((tech) => (
                          <span
                            key={tech.name}
                            className="px-2 py-1 rounded-md bg-white/5 text-white/60 text-xs border border-white/10"
                          >
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  </Link>
                );
              })}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Link href="/tech-stacks">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 h-12 px-8 text-base"
                >
                  <Database className="mr-2 w-5 h-5" />
                  Explore All 11 Tech Stacks
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center mb-16">
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-4">Features</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Everything You Need
                </span>
              </h2>
              <p className="text-white/50 max-w-2xl mx-auto">
                A complete AI-powered toolkit for modern software development teams.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <GlassCard key={index} className="p-6">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/50 text-sm">{feature.description}</p>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* Demo Section */}
          <section id="demo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center mb-16">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">Demo</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  See It In Action
                </span>
              </h2>
              <p className="text-white/50 max-w-2xl mx-auto">
                Watch how SDLC.dev transforms your development workflow.
              </p>
            </div>

            <GlassCard className="aspect-video max-w-4xl mx-auto overflow-hidden" hover={false}>
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/20 transition-colors">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-white/50">Demo video coming soon</p>
                </div>
              </div>
            </GlassCard>
          </section>

          {/* Integrations Section */}
          <section id="integrations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center mb-16">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-4">Integrations</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                  Connect Your Tools
                </span>
              </h2>
              <p className="text-white/50 max-w-2xl mx-auto">
                Seamlessly integrate with your existing development workflow.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {integrations.map((integration, index) => (
                <GlassCard key={index} className="p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <integration.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{integration.name}</h3>
                  <p className="text-white/40 text-xs">{integration.description}</p>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <GlassCard className="p-8 md:p-12 text-center" hover={false}>
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Ready to Transform Your Workflow?
                  </span>
                </h2>
                <p className="text-white/50 mb-8">
                  Join developers who are accelerating their SDLC with AI-powered automation.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    onClick={() => (user ? router.push('/dashboard') : setShowEarlyAccessDialog(true))}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 h-12 px-8 text-base"
                  >
                    {user ? 'Go to Dashboard' : 'Get Started Free'}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 h-12 px-8 text-base"
                    onClick={() => window.open('https://github.com/durdan/dd-sdlc-ai', '_blank')}
                  >
                    <Github className="mr-2 w-5 h-5" />
                    View on GitHub
                  </Button>
                </div>
              </div>
            </GlassCard>
          </section>
        </main>

        {/* Glass Footer */}
        <footer className="border-t border-white/[0.08] backdrop-blur-xl bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <img src="/img/logo-sdlc-white.png" alt="SDLC.dev" className="h-10 w-auto opacity-80" />
                <span className="text-white/40 text-sm">AI-Powered SDLC Automation</span>
              </div>

              <div className="flex items-center gap-6 text-sm text-white/40">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms
                </Link>
                <Link
                  href="https://github.com/durdan/dd-sdlc-ai"
                  target="_blank"
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </Link>
              </div>

              <p className="text-white/30 text-sm">&copy; {new Date().getFullYear()} SDLC.dev. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <AIDiagramModal
        isOpen={showAIDiagramModal}
        onClose={() => setShowAIDiagramModal(false)}
        input={chatInput}
      />

      <Dialog open={showEarlyAccessDialog} onOpenChange={setShowEarlyAccessDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Get Early Access
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Join the waitlist for exclusive early access to SDLC.dev features.
            </DialogDescription>
          </DialogHeader>
          <EarlyAccessOptIn
            user={user}
            onSuccess={() => setShowEarlyAccessDialog(false)}
            showFullFeatures={!user}
          />
        </DialogContent>
      </Dialog>

      {/* Global Styles for Animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(3deg);
          }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

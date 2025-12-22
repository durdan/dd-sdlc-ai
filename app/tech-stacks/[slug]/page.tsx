'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Building2,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Globe,
  Activity,
  Clock,
  Zap,
  ExternalLink,
  Star,
  GitBranch,
  BookOpen,
  TrendingUp,
  Layers,
  Database,
  Code,
  Brain,
  Shield,
} from 'lucide-react';
import { getCompanyBySlug, getRelatedCompanies } from '@/data/tech-stacks/companies';
import { getCategoryColor } from '@/data/tech-stacks/categories';
import { TechLayer } from '@/data/tech-stacks/types';
import { TechStackArchitectureDiagram } from '@/components/tech-stacks/TechStackArchitectureDiagram';
import { TechStackMermaidViewer } from '@/components/tech-stacks/TechStackMermaidViewer';
import { TechStackCard } from '@/components/tech-stacks/TechStackCard';
import { cn } from '@/lib/utils';

export default function TechStackDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const company = getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const relatedCompanies = getRelatedCompanies(company, 3);
  const categoryColorClass = getCategoryColor(company.category);

  const categoryDisplay = company.category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Icons for tech stack layers
  const layerIcons: Record<string, React.FC<{ className?: string }>> = {
    frontend: Code,
    backend: Layers,
    databases: Database,
    infrastructure: Globe,
    devOps: GitBranch,
    dataEngineering: Activity,
    ml: Brain,
    mobile: Code,
    security: Shield,
  };

  const layerNames: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend',
    databases: 'Databases & Storage',
    infrastructure: 'Infrastructure',
    devOps: 'DevOps & CI/CD',
    dataEngineering: 'Data Engineering',
    ml: 'Machine Learning',
    mobile: 'Mobile',
    security: 'Security',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/tech-stacks">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Companies
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">{company.name}</span>
              <Badge className={categoryColorClass}>{categoryDisplay}</Badge>
            </div>
            {company.info.website && (
              <a
                href={company.info.website}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto"
              >
                <Button variant="outline" size="sm">
                  <Globe className="h-4 w-4 mr-2" />
                  Website
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 flex items-center justify-center bg-gray-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <CardTitle>{company.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {company.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Employees:</span>
                  <span className="font-medium">{company.info.employees}</span>
                </div>
                {company.info.revenue && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-medium">{company.info.revenue}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Founded:</span>
                  <span className="font-medium">{company.info.founded}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">HQ:</span>
                  <span className="font-medium">{company.info.headquarters}</span>
                </div>
                {company.info.publiclyTraded && company.info.ticker && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Ticker:</span>
                    <span className="font-medium">{company.info.ticker}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Metrics Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.metrics.users && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Users</span>
                    <span className="font-medium">{company.metrics.users}</span>
                  </div>
                )}
                {company.metrics.requestsPerSecond && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Requests</span>
                    <span className="font-medium">{company.metrics.requestsPerSecond}</span>
                  </div>
                )}
                {company.metrics.requestsPerDay && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Requests</span>
                    <span className="font-medium">{company.metrics.requestsPerDay}</span>
                  </div>
                )}
                {company.metrics.uptime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-medium text-green-600">{company.metrics.uptime}</span>
                  </div>
                )}
                {company.metrics.latency && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Latency</span>
                    <span className="font-medium">{company.metrics.latency}</span>
                  </div>
                )}
                {company.metrics.customMetrics?.map((metric, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{metric.label}</span>
                    <span className="font-medium">{metric.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tech Stack Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tech Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {Object.values(company.techStack)
                    .flat()
                    .filter((t) => t.isPrimary)
                    .map((tech) => (
                      <Badge key={tech.name} variant="secondary" className="text-xs">
                        {tech.name}
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="architecture" className="w-full">
              <TabsList className="mb-4 flex-wrap">
                <TabsTrigger value="architecture">Architecture</TabsTrigger>
                {company.architectureDiagrams && (
                  <TabsTrigger value="diagrams">Diagrams</TabsTrigger>
                )}
                {company.patterns && company.patterns.length > 0 && (
                  <TabsTrigger value="patterns">Patterns</TabsTrigger>
                )}
                {company.technicalDecisions && company.technicalDecisions.length > 0 && (
                  <TabsTrigger value="decisions">Decisions</TabsTrigger>
                )}
                <TabsTrigger value="highlights">Key Highlights</TabsTrigger>
                <TabsTrigger value="scale">Scale & Innovation</TabsTrigger>
                <TabsTrigger value="techstack">Full Tech Stack</TabsTrigger>
              </TabsList>

              {/* Architecture Tab */}
              <TabsContent value="architecture">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      System Architecture
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {company.architecture.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <TechStackArchitectureDiagram diagram={company.architecture.htmlDiagram} />

                    {/* Architecture Components */}
                    {company.architecture.components && company.architecture.components.length > 0 && (
                      <div className="mt-8">
                        <h4 className="font-semibold mb-4">Key Components</h4>
                        <div className="space-y-4">
                          {company.architecture.components.map((component, idx) => (
                            <div
                              key={idx}
                              className="border rounded-lg p-4 bg-muted/30"
                            >
                              <h5 className="font-medium">{component.name}</h5>
                              <p className="text-sm text-muted-foreground mt-1">
                                {component.description}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {component.technologies?.map((tech) => (
                                  <Badge key={tech} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Interactive Diagrams Tab */}
              {company.architectureDiagrams && (
                <TabsContent value="diagrams">
                  <TechStackMermaidViewer
                    diagrams={company.architectureDiagrams}
                    companyName={company.name}
                    className="mb-6"
                  />
                </TabsContent>
              )}

              {/* Design Patterns Tab */}
              {company.patterns && company.patterns.length > 0 && (
                <TabsContent value="patterns">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        Design Patterns Used
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Architectural patterns and how {company.name} implements them at scale
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {company.patterns?.map((pattern, idx) => (
                          <div
                            key={idx}
                            className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-base">{pattern.patternName}</h4>
                                <p className="text-sm text-muted-foreground">{pattern.usage}</p>
                              </div>
                              {pattern.scale && (
                                <Badge variant="secondary" className="text-xs shrink-0">
                                  {pattern.scale}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm mt-2 bg-muted/50 p-3 rounded">
                              <span className="font-medium">Implementation: </span>
                              {pattern.implementation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Technical Decisions Tab */}
              {company.technicalDecisions && company.technicalDecisions.length > 0 && (
                <TabsContent value="decisions">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Technical Decisions
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Key architectural decisions and their trade-offs (ADR-style)
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {company.technicalDecisions?.map((decision, idx) => (
                          <div
                            key={idx}
                            className="border rounded-lg overflow-hidden"
                          >
                            <div className="bg-muted/50 px-4 py-3 border-b">
                              <h4 className="font-semibold">{decision.title}</h4>
                            </div>
                            <div className="p-4 space-y-3">
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                  Context
                                </p>
                                <p className="text-sm">{decision.context}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                  Decision
                                </p>
                                <p className="text-sm font-medium text-primary">
                                  {decision.decision}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                  Consequences
                                </p>
                                <ul className="text-sm space-y-1">
                                  {decision.consequences?.map((consequence, cIdx) => (
                                    <li key={cIdx} className="flex items-start gap-2">
                                      <span className="text-muted-foreground">•</span>
                                      <span>{consequence}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              {decision.alternatives && decision.alternatives.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                                    Alternatives Considered
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {decision.alternatives.map((alt, aIdx) => (
                                      <Badge key={aIdx} variant="outline" className="text-xs">
                                        {alt}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {decision.sources && decision.sources.length > 0 && (
                                <div className="pt-2 border-t mt-3">
                                  <div className="flex flex-wrap gap-2">
                                    {decision.sources.map((source, sIdx) => (
                                      <a
                                        key={sIdx}
                                        href={source}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        Source
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Highlights Tab */}
              <TabsContent value="highlights">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Technical Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {company.highlights?.map((highlight, idx) => (
                        <div
                          key={idx}
                          className="border-l-4 border-primary pl-4 py-2"
                        >
                          <h4 className="font-semibold">{highlight.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {highlight.description}
                          </p>
                          <p className="text-sm font-medium text-primary mt-2">
                            Impact: {highlight.impact}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {highlight.technologies?.map((tech) => (
                              <Badge key={tech} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Scale & Innovation Tab */}
              <TabsContent value="scale">
                <div className="space-y-6">
                  {/* Scale Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Scale
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {company.scaleInnovation?.scaleMetrics?.map((metric, idx) => (
                          <div
                            key={idx}
                            className="text-center p-4 bg-muted/30 rounded-lg"
                          >
                            <div className="text-2xl font-bold">{metric.value}</div>
                            <div className="text-sm text-muted-foreground">
                              {metric.label}
                            </div>
                            {metric.trend && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  'mt-1 text-xs',
                                  metric.trend === 'up' && 'text-green-600',
                                  metric.trend === 'down' && 'text-red-600'
                                )}
                              >
                                {metric.trend === 'up' ? 'Growing' : metric.trend === 'down' ? 'Declining' : 'Stable'}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Innovation Areas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Innovation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {company.scaleInnovation?.innovationAreas?.map((area, idx) => (
                          <div key={idx} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{area.name}</h4>
                              {area.yearStarted && (
                                <Badge variant="outline" className="text-xs">
                                  Since {area.yearStarted}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {area.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {area.technologies?.map((tech) => (
                                <Badge key={tech} variant="secondary" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Open Source Projects */}
                  {company.scaleInnovation.openSource && company.scaleInnovation.openSource.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GitBranch className="h-5 w-5" />
                          Open Source Projects
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {company.scaleInnovation.openSource.map((project, idx) => (
                            <a
                              key={idx}
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {project.name}
                                  <ExternalLink className="h-3 w-3" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {project.description}
                                </p>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                {project.language && (
                                  <Badge variant="outline">{project.language}</Badge>
                                )}
                                {project.stars && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    {project.stars.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </a>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Engineering Blog */}
                  {company.scaleInnovation.engineeringBlog && (
                    <Card>
                      <CardContent className="p-4">
                        <a
                          href={company.scaleInnovation.engineeringBlog}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 hover:underline"
                        >
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Engineering Blog</div>
                            <p className="text-sm text-muted-foreground">
                              {company.scaleInnovation.engineeringBlog}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 ml-auto" />
                        </a>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Full Tech Stack Tab */}
              <TabsContent value="techstack">
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Technology Stack</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(company.techStack).map(([layer, technologies]) => {
                        if (!technologies || technologies.length === 0) return null;
                        const IconComponent = layerIcons[layer] || Code;

                        return (
                          <div key={layer}>
                            <h4 className="font-semibold flex items-center gap-2 mb-3">
                              <IconComponent className="h-4 w-4" />
                              {layerNames[layer] || layer}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(technologies as TechLayer[]).map((tech: TechLayer) => (
                                <Badge
                                  key={tech.name}
                                  variant={tech.isPrimary ? 'default' : 'secondary'}
                                  className={cn(
                                    'text-sm',
                                    tech.usage === 'legacy' && 'opacity-60',
                                    tech.usage === 'experimental' && 'border-dashed'
                                  )}
                                >
                                  {tech.name}
                                  {tech.isPrimary && ' *'}
                                  {tech.usage === 'legacy' && ' (legacy)'}
                                  {tech.usage === 'experimental' && ' (experimental)'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-6">
                      * Primary technologies highlighted
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Related Companies */}
            {relatedCompanies.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Related Companies</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedCompanies.map((related) => (
                    <TechStackCard
                      key={related.slug}
                      company={related}
                      viewMode="grid"
                      showActions={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            {company.sources && company.sources.length > 0 && (
              <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Sources</h4>
                <div className="flex flex-wrap gap-2">
                  {company.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary hover:underline"
                    >
                      {source}
                    </a>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Last updated: {company.lastUpdated}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

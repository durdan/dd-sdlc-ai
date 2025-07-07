"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  BookOpen, 
  Users, 
  Plus, 
  TestTube, 
  GitBranch, 
  BarChart3, 
  Lightbulb,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PromptManagementGuidePage() {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const documentTypes = [
    {
      name: 'Business Analysis',
      variables: ['{{projectName}}', '{{requirements}}', '{{analysisType}}', '{{targetAudience}}'],
      description: 'Requirements gathering and business analysis',
      icon: '📊'
    },
    {
      name: 'Functional Specification',
      variables: ['{{projectName}}', '{{businessAnalysis}}', '{{features}}', '{{constraints}}'],
      description: 'Feature definitions and functional workflows',
      icon: '⚙️'
    },
    {
      name: 'Technical Specification',
      variables: ['{{projectName}}', '{{functionalSpec}}', '{{techStack}}', '{{architecture}}'],
      description: 'Architecture and technical implementation details',
      icon: '🔧'
    },
    {
      name: 'UX Specification',
      variables: ['{{projectName}}', '{{userPersonas}}', '{{functionalSpec}}', '{{designSystem}}'],
      description: 'User experience and interface design',
      icon: '🎨'
    },
    {
      name: 'Mermaid Diagrams',
      variables: ['{{projectName}}', '{{diagramType}}', '{{specifications}}', '{{relationships}}'],
      description: 'Visual representations and flowcharts',
      icon: '📈'
    }
  ];

  const examplePrompt = `Analyze the project "{{projectName}}" with the following requirements:
{{requirements}}

Focus on {{analysisType}} aspects and provide insights for {{targetAudience}}.

Please structure your analysis with the following sections:
1. Executive Summary
2. Business Requirements Analysis
3. Stakeholder Analysis
4. Risk Assessment
5. Recommendations

Ensure the analysis is comprehensive and actionable.`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Prompt Management Guide</h1>
                <p className="text-sm text-muted-foreground">
                  Complete guide to using the AI prompt management system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 max-w-4xl">
        <div className="space-y-8">
          
          {/* Overview Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The Prompt Management System allows administrators and managers to create, edit, test, and deploy AI prompts 
                that power the SDLC document generation. This system provides version control, A/B testing, analytics, 
                and role-based access control.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Key Features</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      Version control and deployment
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      A/B testing and experimentation
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      Usage analytics and monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      Role-based access control
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Getting Started</h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                      Access the admin panel at /admin/prompts
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                      Choose a document type to work with
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                      Create or edit prompts as needed
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                      Test thoroughly before deploying
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Roles Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Roles & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Administrator</h4>
                    <Badge className="bg-red-100 text-red-800">Full Access</Badge>
                  </div>
                  <ul className="space-y-1 text-sm">
                    <li>• Create, edit, delete, and deploy prompts</li>
                    <li>• Manage user roles and permissions</li>
                    <li>• Access all analytics and reports</li>
                    <li>• Configure system settings</li>
                    <li>• Manage A/B tests and experiments</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">Manager</h4>
                    <Badge className="bg-blue-100 text-blue-800">Limited Access</Badge>
                  </div>
                  <ul className="space-y-1 text-sm">
                    <li>• View and test all prompts</li>
                    <li>• Create new prompt versions</li>
                    <li>• Access usage analytics</li>
                    <li>• Cannot deploy or delete prompts</li>
                    <li>• Cannot manage user roles</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">User</h4>
                    <Badge className="bg-gray-100 text-gray-800">No Admin Access</Badge>
                  </div>
                  <ul className="space-y-1 text-sm">
                    <li>• No admin panel access</li>
                    <li>• Can use generation APIs</li>
                    <li>• Benefits from deployed prompts</li>
                    <li>• Cannot view or modify prompts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Types Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Document Types & Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Each document type has specific variables that can be used in prompts for dynamic content generation.
              </p>
              
              <div className="grid gap-4">
                {documentTypes.map((docType, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span>{docType.icon}</span>
                        {docType.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{docType.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Available Variables:</p>
                        <div className="flex flex-wrap gap-2">
                          {docType.variables.map((variable, vIndex) => (
                            <Badge key={vIndex} variant="secondary" className="font-mono text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Example Prompt Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Example Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Here's an example of a well-structured prompt with variables:
              </p>
              
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{examplePrompt}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(examplePrompt, 'example')}
                >
                  {copiedCode === 'example' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Golden Rule:</strong> Always test prompts thoroughly before deploying to production.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Prompt Writing</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Be specific and detailed in instructions</li>
                    <li>• Use clear structure and formatting</li>
                    <li>• Include examples when helpful</li>
                    <li>• Use meaningful variable names</li>
                    <li>• Balance detail with efficiency</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Version Management</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Use descriptive version names</li>
                    <li>• Document what changed and why</li>
                    <li>• Test with small traffic first</li>
                    <li>• Always have a rollback plan</li>
                    <li>• Monitor after deployment</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Development Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Deployment Process</h4>
                <div className="grid gap-3">
                  <div className="flex gap-3 p-3 bg-muted rounded-lg">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</span>
                    <div>
                      <p className="font-medium">Create Draft</p>
                      <p className="text-sm text-muted-foreground">Write and save your prompt as a draft</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-muted rounded-lg">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</span>
                    <div>
                      <p className="font-medium">Test Thoroughly</p>
                      <p className="text-sm text-muted-foreground">Use the testing interface with realistic data</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-muted rounded-lg">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</span>
                    <div>
                      <p className="font-medium">Review & Approve</p>
                      <p className="text-sm text-muted-foreground">Get team approval if required</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-muted rounded-lg">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</span>
                    <div>
                      <p className="font-medium">Deploy & Monitor</p>
                      <p className="text-sm text-muted-foreground">Activate and watch performance metrics</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Common Issues & Solutions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Prompt Not Deploying</h4>
                  <ul className="text-sm space-y-1 text-red-700">
                    <li>• Check for syntax errors in variables</li>
                    <li>• Verify user permissions</li>
                    <li>• Review error logs in browser console</li>
                  </ul>
                </div>

                <div className="p-4 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Poor Generation Quality</h4>
                  <ul className="text-sm space-y-1 text-yellow-700">
                    <li>• Review prompt clarity and specificity</li>
                    <li>• Check variable substitution</li>
                    <li>• Test with different input data</li>
                    <li>• Compare with previous working versions</li>
                  </ul>
                </div>

                <div className="p-4 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Slow Performance</h4>
                  <ul className="text-sm space-y-1 text-blue-700">
                    <li>• Monitor prompt length and complexity</li>
                    <li>• Check API rate limits</li>
                    <li>• Review system resource usage</li>
                    <li>• Consider prompt optimization</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Need More Help?</p>
                  <p className="text-sm text-muted-foreground">
                    Contact your system administrator or check the technical documentation
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/prompts')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Admin Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
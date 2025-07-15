"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Users, 
  Plus, 
  TestTube, 
  GitBranch, 
  BarChart3, 
  Lightbulb,
  AlertTriangle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface PromptGuideProps {
  userRole: 'admin' | 'manager' | 'user' | 'super_admin';
}

export function PromptGuide({ userRole }: PromptGuideProps) {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: BookOpen },
    { id: 'roles', title: 'User Roles', icon: Users },
    { id: 'creating', title: 'Creating Prompts', icon: Plus },
    { id: 'testing', title: 'Testing', icon: TestTube },
    { id: 'versions', title: 'Version Control', icon: GitBranch },
    { id: 'analytics', title: 'Analytics', icon: BarChart3 },
    { id: 'best-practices', title: 'Best Practices', icon: Lightbulb },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: AlertTriangle },
  ];

  const documentTypes = [
    {
      name: 'Business Analysis',
      variables: ['{{projectName}}', '{{requirements}}', '{{analysisType}}', '{{targetAudience}}'],
      description: 'Requirements gathering and business analysis'
    },
    {
      name: 'Functional Specification',
      variables: ['{{projectName}}', '{{businessAnalysis}}', '{{features}}', '{{constraints}}'],
      description: 'Feature definitions and functional workflows'
    },
    {
      name: 'Technical Specification',
      variables: ['{{projectName}}', '{{functionalSpec}}', '{{techStack}}', '{{architecture}}'],
      description: 'Architecture and technical implementation details'
    },
    {
      name: 'UX Specification',
      variables: ['{{projectName}}', '{{userPersonas}}', '{{functionalSpec}}', '{{designSystem}}'],
      description: 'User experience and interface design'
    },
    {
      name: 'Mermaid Diagrams',
      variables: ['{{projectName}}', '{{diagramType}}', '{{specifications}}', '{{relationships}}'],
      description: 'Visual representations and flowcharts'
    }
  ];

  const rolePermissions = {
    super_admin: {
      title: 'Super Administrator',
      color: 'bg-purple-100 text-purple-800',
      permissions: [
        'Full system access and control',
        'Manage all users and administrators',
        'Configure system-wide settings',
        'Access to all features and data',
        'Database and security management'
      ]
    },
    admin: {
      title: 'Administrator',
      color: 'bg-red-100 text-red-800',
      permissions: [
        'Create, edit, delete, and deploy prompts',
        'Manage user roles and permissions',
        'Access all analytics and reports',
        'Configure system settings',
        'Manage A/B tests and experiments'
      ]
    },
    manager: {
      title: 'Manager',
      color: 'bg-blue-100 text-blue-800',
      permissions: [
        'View and test all prompts',
        'Create new prompt versions',
        'Access usage analytics',
        'Cannot deploy or delete prompts',
        'Cannot manage user roles'
      ]
    },
    user: {
      title: 'User',
      color: 'bg-gray-100 text-gray-800',
      permissions: [
        'No admin panel access',
        'Can use generation APIs',
        'Benefits from deployed prompts',
        'Cannot view or modify prompts'
      ]
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompt Management Guide</h1>
          <p className="text-muted-foreground mt-2">
            Complete guide to using the AI prompt management system
          </p>
        </div>
        <Badge className={rolePermissions[userRole] ? rolePermissions[userRole].color : rolePermissions.user.color}>
          {rolePermissions[userRole] ? rolePermissions[userRole].title : rolePermissions.user.title}
        </Badge>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto p-1">
          {sections.map((section) => (
            <TabsTrigger
              key={section.id}
              value={section.id}
              className="flex flex-col items-center gap-1 p-3 text-xs"
            >
              <section.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{section.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                System Overview
              </CardTitle>
              <CardDescription>
                The Prompt Management System allows you to create, test, and deploy AI prompts for SDLC document generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Roles & Permissions
              </CardTitle>
              <CardDescription>
                Understanding what each role can do in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(rolePermissions).map(([role, info]) => (
                  <Card key={role} className={role === userRole ? 'ring-2 ring-primary' : ''}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{info.title}</CardTitle>
                        <Badge className={info.color}>
                          {role === userRole ? 'Your Role' : role.charAt(0).toUpperCase() + role.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {info.permissions.map((permission, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="creating" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Creating Prompts
              </CardTitle>
              <CardDescription>
                Step-by-step guide to creating effective prompts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Document Types & Variables</h4>
                <div className="grid gap-4">
                  {documentTypes.map((docType, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{docType.name}</CardTitle>
                        <CardDescription>{docType.description}</CardDescription>
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
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Prompt Creation Process</h4>
                <div className="grid gap-3">
                  <div className="flex gap-3 p-3 bg-muted rounded-lg">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">1</span>
                    <div>
                      <p className="font-medium">Choose Document Type</p>
                      <p className="text-sm text-muted-foreground">Select the type of document you want to create prompts for</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-muted rounded-lg">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">2</span>
                    <div>
                      <p className="font-medium">Fill Prompt Details</p>
                      <p className="text-sm text-muted-foreground">Add name, description, and the actual prompt content with variables</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-muted rounded-lg">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">3</span>
                    <div>
                      <p className="font-medium">Test Thoroughly</p>
                      <p className="text-sm text-muted-foreground">Use the testing interface to validate your prompt with sample data</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-muted rounded-lg">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">4</span>
                    <div>
                      <p className="font-medium">Deploy Safely</p>
                      <p className="text-sm text-muted-foreground">Deploy to production and monitor performance metrics</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Testing Prompts
              </CardTitle>
              <CardDescription>
                How to effectively test your prompts before deployment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  Always test prompts thoroughly before deploying to production. Use realistic data and test edge cases.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Testing Checklist</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Test with realistic project data
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Try different input lengths
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Test edge cases and empty values
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Verify output quality and format
                    </li>
                    <li className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Compare with previous versions
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Quality Criteria</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <strong>Accuracy:</strong> Meets requirements
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <strong>Completeness:</strong> All sections covered
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <strong>Clarity:</strong> Clear and actionable
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <strong>Consistency:</strong> Follows expected format
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Version Control
              </CardTitle>
              <CardDescription>
                Managing prompt versions and deployments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-green-600">Active Version</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Currently deployed and used by all API calls. Only one active version per document type.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-blue-600">Draft Versions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Work-in-progress versions that are not yet deployed. Can be tested and modified.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-gray-600">Archived Versions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Previous versions kept for reference and rollback purposes.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Deployment Workflow</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-muted rounded">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span className="text-sm">Create Draft → Test → Review → Deploy → Monitor</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics & Monitoring
              </CardTitle>
              <CardDescription>
                Understanding prompt performance and usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Key Metrics</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <strong>Usage Volume:</strong> Request frequency
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <strong>Response Time:</strong> Generation speed
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <strong>Success Rate:</strong> Completion percentage
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <strong>Error Patterns:</strong> Common failures
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Performance Targets</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <strong>Response Time:</strong> &lt; 30 seconds
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <strong>Success Rate:</strong> &gt; 95%
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="h-3 w-3" />
                      <strong>Error Rate:</strong> &lt; 5%
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Best Practices
              </CardTitle>
              <CardDescription>
                Tips for creating effective prompts and managing the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Troubleshooting
              </CardTitle>
              <CardDescription>
                Common issues and how to resolve them
              </CardDescription>
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

                <div className="p-4 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Access Denied Errors</h4>
                  <ul className="text-sm space-y-1 text-purple-700">
                    <li>• Verify user role assignments</li>
                    <li>• Check database permissions</li>
                    <li>• Confirm authentication status</li>
                    <li>• Review RLS policies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Need More Help?</p>
              <p className="text-sm text-muted-foreground">
                Check the full documentation or contact your system administrator
              </p>
            </div>
            <a
              href="/admin/prompts/guide"
              target="_blank"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Full Documentation
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
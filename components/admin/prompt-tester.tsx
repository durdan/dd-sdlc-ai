"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  X, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Copy,
  RotateCcw,
  Zap
} from 'lucide-react';
import { PromptTemplate, PromptService } from '@/lib/prompt-service';

interface PromptTesterProps {
  prompt: PromptTemplate;
  onClose: () => void;
}

interface TestResult {
  content: string;
  success: boolean;
  responseTime: number;
  inputTokens?: number;
  outputTokens?: number;
  errorMessage?: string;
  timestamp: string;
}

export function PromptTester({ prompt, onClose }: PromptTesterProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('variables');

  const promptService = new PromptService();

  // Initialize variables with default values
  React.useEffect(() => {
    const initialVariables: Record<string, string> = {};
    
    // Extract variables from prompt content
    const variableRegex = /\{([^}]+)\}/g;
    const matches = prompt.prompt_content.match(variableRegex) || [];
    const uniqueVariables = [...new Set(matches.map(match => match.slice(1, -1)))];
    
    uniqueVariables.forEach(variable => {
      initialVariables[variable] = getDefaultValueForVariable(variable);
    });
    
    setVariables(initialVariables);
  }, [prompt]);

  const getDefaultValueForVariable = (variable: string): string => {
    const defaults: Record<string, string> = {
      input: 'Create a task management application that allows teams to collaborate on projects, assign tasks, track progress, and generate reports.',
      context: 'Target audience: Small to medium businesses (10-50 employees). Budget: $50,000. Timeline: 6 months. Must integrate with existing tools like Slack and Google Workspace.',
      business_analysis: 'The business analysis identified key stakeholders including project managers, team members, and executives. Primary objectives include improving team productivity by 30% and reducing project delays by 50%.',
      functional_spec: 'The functional specification defines user roles (Admin, Manager, Member), core features (project creation, task assignment, progress tracking), and integration requirements with third-party APIs.',
      technical_spec: 'The technical specification outlines a React/Node.js architecture with PostgreSQL database, REST APIs, real-time updates via WebSockets, and deployment on AWS with auto-scaling capabilities.',
      previous_analysis: 'Previous analysis showed that current manual processes are causing 40% of project delays and team communication issues are the primary bottleneck.'
    };
    
    return defaults[variable] || `Sample ${variable} content for testing purposes`;
  };

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const generatePreview = () => {
    let preview = prompt.prompt_content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      preview = preview.replace(regex, value || `{${key}}`);
    });
    
    return preview;
  };

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startTime = Date.now();
      
      // Execute the prompt (this will be a mock for now)
      const result = await promptService.executePrompt(
        prompt.id,
        variables,
        'test-user-id', // TODO: Get actual user ID
        undefined // No project ID for testing
      );
      
      const endTime = Date.now();
      
      setTestResult({
        content: result.content,
        success: result.success,
        responseTime: endTime - startTime,
        inputTokens: result.input_tokens,
        outputTokens: result.output_tokens,
        errorMessage: result.error_message,
        timestamp: new Date().toISOString()
      });
      
      setActiveTab('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTestResult(null);
    setError(null);
    setActiveTab('variables');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const variableKeys = Object.keys(variables);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Test Prompt: {prompt.name}
          </DialogTitle>
          <DialogDescription>
            Test this prompt with different variable values to see how it performs
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="variables">Variables</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="result">Result</TabsTrigger>
          </TabsList>

          <TabsContent value="variables" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Variables</CardTitle>
                <CardDescription>
                  Provide values for the variables in this prompt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {variableKeys.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    This prompt doesn't use any variables
                  </p>
                ) : (
                  variableKeys.map((key) => (
                    <div key={key} className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Badge variant="outline">{`{${key}}`}</Badge>
                        <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                      </Label>
                      <Textarea
                        value={variables[key] || ''}
                        onChange={(e) => handleVariableChange(key, e.target.value)}
                        placeholder={`Enter ${key} value...`}
                        rows={4}
                        className="resize-none"
                      />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generated Prompt Preview</CardTitle>
                <CardDescription>
                  This is how the prompt will look with your variable values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                    {generatePreview()}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generatePreview())}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="result" className="space-y-4">
            {testResult ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      Test Result
                      <Badge variant={testResult.success ? "default" : "destructive"}>
                        {testResult.success ? 'Success' : 'Failed'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {testResult.responseTime}ms
                      </span>
                      {testResult.inputTokens && (
                        <span>Input: {testResult.inputTokens} tokens</span>
                      )}
                      {testResult.outputTokens && (
                        <span>Output: {testResult.outputTokens} tokens</span>
                      )}
                      <span className="text-xs">
                        {new Date(testResult.timestamp).toLocaleString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {testResult.success ? (
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="bg-muted p-4 rounded-md max-h-96 overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm">
                              {testResult.content}
                            </pre>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(testResult.content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          {testResult.errorMessage || 'Test failed with unknown error'}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <Zap className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Ready to Test</h3>
                    <p className="text-muted-foreground">
                      Configure your variables and run the test to see the AI response
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            {testResult && (
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Test
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button onClick={handleTest} disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Testing...' : 'Run Test'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
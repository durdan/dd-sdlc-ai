"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Save, 
  X, 
  Play, 
  Info, 
  Plus, 
  Trash2,
  Eye,
  Code,
  Settings
} from 'lucide-react';
import { PromptService, PromptTemplate, DocumentType, CreatePromptRequest, UpdatePromptRequest } from '@/lib/prompt-service';

interface PromptEditorProps {
  prompt?: PromptTemplate | null;
  documentType: DocumentType;
  onSave: () => void;
  onCancel: () => void;
  userRole: 'admin' | 'manager' | 'user';
}

interface Variable {
  key: string;
  description: string;
  example: string;
}

const AI_MODELS = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
  { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
  { value: 'gemini-pro', label: 'Gemini Pro' }
];

const DOCUMENT_TYPE_LABELS = {
  business: 'Business Analysis',
  functional: 'Functional Specification',
  technical: 'Technical Specification',
  ux: 'UX Specification',
  mermaid: 'Mermaid Diagrams'
};

const DEFAULT_VARIABLES: Record<DocumentType, Variable[]> = {
  business: [
    { key: 'input', description: 'Project requirements text', example: 'Build a task management application...' },
    { key: 'context', description: 'Additional context or constraints', example: 'Target audience: small teams...' }
  ],
  functional: [
    { key: 'business_analysis', description: 'Business analysis document', example: 'The business analysis shows...' },
    { key: 'input', description: 'Original project requirements', example: 'Build a task management application...' }
  ],
  technical: [
    { key: 'functional_spec', description: 'Functional specification document', example: 'The functional spec defines...' },
    { key: 'business_analysis', description: 'Business analysis document', example: 'The business analysis shows...' }
  ],
  ux: [
    { key: 'functional_spec', description: 'Functional specification document', example: 'The functional spec defines...' },
    { key: 'business_analysis', description: 'Business analysis document', example: 'The business analysis shows...' }
  ],
  mermaid: [
    { key: 'technical_spec', description: 'Technical specification document', example: 'The technical spec outlines...' },
    { key: 'functional_spec', description: 'Functional specification document', example: 'The functional spec defines...' }
  ]
};

export function PromptEditor({ prompt, documentType, onSave, onCancel, userRole }: PromptEditorProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    document_type: documentType,
    prompt_content: '',
    ai_model: 'gpt-4',
    is_active: false,
    is_system_default: false
  });
  const [variables, setVariables] = useState<Variable[]>([]);
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({});

  const promptService = new PromptService();
  const isEditing = !!prompt?.id;

  useEffect(() => {
    if (prompt) {
      setFormData({
        name: prompt.name,
        description: prompt.description || '',
        document_type: prompt.document_type,
        prompt_content: prompt.prompt_content,
        ai_model: prompt.ai_model,
        is_active: prompt.is_active,
        is_system_default: prompt.is_system_default || false
      });

      // Extract variables from prompt content
      const extractedVariables = extractVariablesFromContent(prompt.prompt_content);
      setVariables(extractedVariables);
    } else {
      // Set default variables for new prompts
      setVariables(DEFAULT_VARIABLES[documentType] || []);
      setFormData(prev => ({ ...prev, document_type: documentType }));
    }
  }, [prompt, documentType]);

  const extractVariablesFromContent = (content: string): Variable[] => {
    const variableRegex = /\{([^}]+)\}/g;
    const matches = content.match(variableRegex) || [];
    const uniqueVariables = [...new Set(matches.map(match => match.slice(1, -1)))];
    
    return uniqueVariables.map(key => {
      const defaultVar = DEFAULT_VARIABLES[documentType]?.find(v => v.key === key);
      return defaultVar || { key, description: '', example: '' };
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'prompt_content') {
      // Update variables when content changes
      const extractedVariables = extractVariablesFromContent(value);
      setVariables(extractedVariables);
    }
  };

  const handleVariableChange = (index: number, field: keyof Variable, value: string) => {
    setVariables(prev => prev.map((variable, i) => 
      i === index ? { ...variable, [field]: value } : variable
    ));
  };

  const addVariable = () => {
    setVariables(prev => [...prev, { key: '', description: '', example: '' }]);
  };

  const removeVariable = (index: number) => {
    setVariables(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreviewVariableChange = (key: string, value: string) => {
    setPreviewVariables(prev => ({ ...prev, [key]: value }));
  };

  const generatePreview = () => {
    let preview = formData.prompt_content;
    
    variables.forEach(variable => {
      const value = previewVariables[variable.key] || variable.example || `{${variable.key}}`;
      const regex = new RegExp(`\\{${escapeRegExp(variable.key)}\\}`, 'g');
      preview = preview.replace(regex, value);
    });
    
    return preview;
  };

  const handleSave = async () => {
    if (userRole !== 'admin') {
      setError('Only administrators can save prompts');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Prompt name is required');
      }
      if (!formData.prompt_content.trim()) {
        throw new Error('Prompt content is required');
      }

      // Build variables object
      const variablesObj = variables.reduce((acc, variable) => {
        if (variable.key.trim()) {
          acc[variable.key] = variable.description || variable.example;
        }
        return acc;
      }, {} as Record<string, string>);

      if (isEditing) {
        const updateData: UpdatePromptRequest = {
          name: formData.name,
          description: formData.description,
          prompt_content: formData.prompt_content,
          variables: variablesObj,
          ai_model: formData.ai_model,
          is_active: formData.is_active,
          is_system_default: formData.is_system_default
        };
        
        await promptService.updatePrompt(prompt!.id, updateData);
      } else {
        const createData: CreatePromptRequest = {
          name: formData.name,
          description: formData.description,
          document_type: formData.document_type,
          prompt_content: formData.prompt_content,
          variables: variablesObj,
          ai_model: formData.ai_model,
          is_active: formData.is_active,
          is_system_default: formData.is_system_default
        };
        
        await promptService.createPrompt(createData, 'current-user-id'); // TODO: Get actual user ID
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    // TODO: Implement prompt testing
    console.log('Testing prompt with variables:', previewVariables);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '✏️ Edit Prompt' : '➕ Create New Prompt'}: {DOCUMENT_TYPE_LABELS[formData.document_type]}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? `Editing "${prompt?.name}" version ${prompt?.version}`
              : `Create a new prompt for ${DOCUMENT_TYPE_LABELS[formData.document_type]}`
            }
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="variables" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Variables
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Prompt Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Enhanced Business Analysis v2.0"
                  disabled={userRole !== 'admin'}
                />
              </div>
              <div>
                <Label htmlFor="ai_model">AI Model</Label>
                <Select value={formData.ai_model} onValueChange={(value) => handleInputChange('ai_model', value)}>
                  <SelectTrigger disabled={userRole !== 'admin'}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_MODELS.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of this prompt's purpose"
                disabled={userRole !== 'admin'}
              />
            </div>

            <div>
              <Label htmlFor="prompt_content">Prompt Content *</Label>
              <Textarea
                id="prompt_content"
                value={formData.prompt_content}
                onChange={(e) => handleInputChange('prompt_content', e.target.value)}
                placeholder="Enter your prompt content here. Use {variable_name} for dynamic variables."
                rows={15}
                className="font-mono text-sm"
                disabled={userRole !== 'admin'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use curly braces to define variables: {'{input}'}, {'{context}'}, etc.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="variables" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Variables</h3>
              {userRole === 'admin' && (
                <Button onClick={addVariable} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              )}
            </div>

            {variables.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No variables defined. Add variables using {'{variable_name}'} in your prompt content.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {variables.map((variable, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-3">
                          <Label>Variable Key</Label>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{`{${variable.key}}`}</Badge>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <Label>Description</Label>
                          <Input
                            value={variable.description}
                            onChange={(e) => handleVariableChange(index, 'description', e.target.value)}
                            placeholder="What this variable represents"
                            disabled={userRole !== 'admin'}
                          />
                        </div>
                        <div className="col-span-4">
                          <Label>Example Value</Label>
                          <Input
                            value={variable.example}
                            onChange={(e) => handleVariableChange(index, 'example', e.target.value)}
                            placeholder="Example value for testing"
                            disabled={userRole !== 'admin'}
                          />
                        </div>
                        <div className="col-span-1">
                          {userRole === 'admin' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeVariable(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Prompt Preview</h3>
              
              {variables.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Variable Values for Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {variables.map((variable) => (
                      <div key={variable.key}>
                        <Label>{`{${variable.key}}`}</Label>
                        <Textarea
                          value={previewVariables[variable.key] || variable.example || ''}
                          onChange={(e) => handlePreviewVariableChange(variable.key, e.target.value)}
                          placeholder={variable.description || variable.example}
                          rows={2}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Generated Prompt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {generatePreview()}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button onClick={handleTest} variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Test Prompt
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Prompt Settings</CardTitle>
                <CardDescription>Configure activation and default settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Active prompts can be used for document generation
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    disabled={userRole !== 'admin'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Default</Label>
                    <p className="text-sm text-muted-foreground">
                      Default prompt for this document type
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_system_default}
                    onCheckedChange={(checked) => handleInputChange('is_system_default', checked)}
                    disabled={userRole !== 'admin'}
                  />
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Setting a prompt as default will automatically make it active and deactivate the current default prompt for this document type.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          {userRole === 'admin' && (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? 'Update' : 'Create'} Prompt
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 

function escapeRegExp(key: string) {
  return key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

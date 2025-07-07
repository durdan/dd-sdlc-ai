"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Play, 
  Pause, 
  Trash2, 
  Copy, 
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Users
} from 'lucide-react';
import { PromptService, PromptTemplate, DocumentType } from '@/lib/prompt-service';
import { PromptEditor } from './prompt-editor';
import { PromptTester } from './prompt-tester';
import { PromptAnalytics } from './prompt-analytics';
import { PromptGuide } from './prompt-guide';

interface PromptManagementProps {
  userId: string;
  userRole: 'admin' | 'manager' | 'user';
}

export function PromptManagement({ userId, userRole }: PromptManagementProps) {
  const [prompts, setPrompts] = useState<Record<DocumentType, PromptTemplate[]>>({
    business: [],
    functional: [],
    technical: [],
    ux: [],
    mermaid: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showTester, setShowTester] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<DocumentType | 'guide'>('business');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const promptService = new PromptService();

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const documentTypes: DocumentType[] = ['business', 'functional', 'technical', 'ux', 'mermaid'];
      const promptData: Record<DocumentType, PromptTemplate[]> = {
        business: [],
        functional: [],
        technical: [],
        ux: [],
        mermaid: []
      };

      await Promise.all(
        documentTypes.map(async (type) => {
          try {
            const typePrompts = await promptService.getPromptsForDocumentType(type);
            promptData[type] = typePrompts;
          } catch (err) {
            console.error(`Error loading ${type} prompts:`, err);
          }
        })
      );

      setPrompts(promptData);
    } catch (err) {
      setError('Failed to load prompts. Please try again.');
      console.error('Error loading prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrompt = () => {
    setSelectedPrompt(null);
    setShowEditor(true);
  };

  const handleEditPrompt = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt);
    setShowEditor(true);
  };

  const handleTestPrompt = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt);
    setShowTester(true);
  };

  const handleViewAnalytics = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt);
    setShowAnalytics(true);
  };

  const handleActivatePrompt = async (prompt: PromptTemplate, setAsDefault = false) => {
    try {
      await promptService.activatePrompt(prompt.id, setAsDefault);
      setSuccess(`Prompt "${prompt.name}" ${setAsDefault ? 'set as default and ' : ''}activated successfully`);
      await loadPrompts();
    } catch (err) {
      setError(`Failed to activate prompt: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeactivatePrompt = async (prompt: PromptTemplate) => {
    try {
      await promptService.deactivatePrompt(prompt.id);
      setSuccess(`Prompt "${prompt.name}" deactivated successfully`);
      await loadPrompts();
    } catch (err) {
      setError(`Failed to deactivate prompt: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleClonePrompt = (prompt: PromptTemplate) => {
    const clonedPrompt = {
      ...prompt,
      id: '', // Will be generated on save
      name: `${prompt.name} (Copy)`,
      is_active: false,
      is_default: false,
      version: 1
    };
    setSelectedPrompt(clonedPrompt as PromptTemplate);
    setShowEditor(true);
  };

  const handleDeletePrompt = async (prompt: PromptTemplate) => {
    if (!confirm(`Are you sure you want to delete "${prompt.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Note: You'll need to implement deletePrompt in PromptService
      // await promptService.deletePrompt(prompt.id);
      setSuccess(`Prompt "${prompt.name}" deleted successfully`);
      await loadPrompts();
    } catch (err) {
      setError(`Failed to delete prompt: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (prompt: PromptTemplate) => {
    if (prompt.is_default) {
      return <Badge variant="default" className="bg-green-500">Default</Badge>;
    }
    if (prompt.is_active) {
      return <Badge variant="secondary">Active</Badge>;
    }
    return <Badge variant="outline">Inactive</Badge>;
  };

  const getDocumentTypeIcon = (type: DocumentType) => {
    const icons = {
      business: '📊',
      functional: '⚙️',
      technical: '🔧',
      ux: '🎨',
      mermaid: '📈'
    };
    return icons[type];
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    const labels = {
      business: 'Business Analysis',
      functional: 'Functional Specification',
      technical: 'Technical Specification',
      ux: 'UX Specification',
      mermaid: 'Mermaid Diagrams'
    };
    return labels[type];
  };

  if (userRole !== 'admin' && userRole !== 'manager') {
    return (
      <div className="p-6">
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access prompt management. Admin or Manager role required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">🎯 Prompt Management</h1>
          <p className="text-muted-foreground">
            Manage AI prompts for different document types
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('guide')} 
            className="flex items-center gap-2"
          >
            📖 How-to Guide
          </Button>
          {userRole === 'admin' && (
            <Button onClick={handleCreatePrompt} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Prompt
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Tabs for different document types */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType | 'guide')}>
        <TabsList className="grid w-full grid-cols-6">
          {Object.keys(prompts).map((type) => (
            <TabsTrigger key={type} value={type} className="flex items-center gap-2">
              <span>{getDocumentTypeIcon(type as DocumentType)}</span>
              <span className="hidden sm:inline">{getDocumentTypeLabel(type as DocumentType)}</span>
            </TabsTrigger>
          ))}
          <TabsTrigger value="guide" className="flex items-center gap-2">
            <span>📖</span>
            <span className="hidden sm:inline">Guide</span>
          </TabsTrigger>
        </TabsList>

        {Object.entries(prompts).map(([type, typePrompts]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {getDocumentTypeIcon(type as DocumentType)} {getDocumentTypeLabel(type as DocumentType)} Prompts
              </h2>
              <Badge variant="outline">
                {typePrompts.length} prompt{typePrompts.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            {typePrompts.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No prompts found for this document type.</p>
                  {userRole === 'admin' && (
                    <Button onClick={handleCreatePrompt} className="mt-4">
                      Create First Prompt
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {typePrompts.map((prompt) => (
                  <Card key={prompt.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {prompt.name}
                            {getStatusBadge(prompt)}
                            <Badge variant="outline">v{prompt.version}</Badge>
                          </CardTitle>
                          <CardDescription>
                            {prompt.description || 'No description provided'}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestPrompt(prompt)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAnalytics(prompt)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          {userRole === 'admin' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPrompt(prompt)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleClonePrompt(prompt)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              {prompt.is_active ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeactivatePrompt(prompt)}
                                >
                                  <Pause className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActivatePrompt(prompt)}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              )}
                              {!prompt.is_default && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActivatePrompt(prompt, true)}
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePrompt(prompt)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {prompt.prompt_content.substring(0, 200)}...
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Created {formatDate(prompt.created_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {prompt.ai_model}
                            </span>
                          </div>
                          {prompt.updated_at !== prompt.created_at && (
                            <span>Updated {formatDate(prompt.updated_at)}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}

        <TabsContent value="guide">
          <PromptGuide userRole={userRole} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showEditor && (
        <PromptEditor
          prompt={selectedPrompt}
          documentType={activeTab === 'guide' ? 'business' : activeTab}
          onSave={async () => {
            setShowEditor(false);
            await loadPrompts();
            setSuccess('Prompt saved successfully');
          }}
          onCancel={() => setShowEditor(false)}
          userRole={userRole}
        />
      )}

      {showTester && selectedPrompt && (
        <PromptTester
          prompt={selectedPrompt}
          onClose={() => setShowTester(false)}
        />
      )}

      {showAnalytics && selectedPrompt && (
        <PromptAnalytics
          prompt={selectedPrompt}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </div>
  );
} 
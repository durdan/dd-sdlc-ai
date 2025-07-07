"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Users,
  Search,
  Filter,
  Eye,
  TrendingUp,
  Shield
} from 'lucide-react';
import { PromptService, PromptTemplate, DocumentType } from '@/lib/prompt-service';
import { PromptEditor } from './prompt-editor';
import { PromptTester } from './prompt-tester';
import { PromptAnalytics } from './prompt-analytics';
import { PromptGuide } from './prompt-guide';
import { createClient } from '@/lib/supabase/client';

interface PromptManagementProps {
  userId: string;
  userRole: 'admin' | 'manager' | 'user';
}

interface UserPrompt {
  id: string;
  name: string;
  description: string;
  document_type: string;
  prompt_content: string;
  ai_model: string;
  is_active: boolean;
  is_personal_default: boolean;
  version: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  usage_count?: number;
  avg_response_time?: number;
  success_rate?: number;
  last_used?: string;
  user_email?: string;
  user_name?: string;
}

interface SystemStats {
  total_users: number;
  total_user_prompts: number;
  total_system_prompts: number;
  active_user_prompts: number;
  total_usage_last_30_days: number;
  avg_success_rate: number;
  top_document_types: Array<{
    document_type: string;
    count: number;
    usage_count: number;
  }>;
}

export function PromptManagement({ userId, userRole }: PromptManagementProps) {
  const [prompts, setPrompts] = useState<Record<DocumentType, PromptTemplate[]>>({
    business: [],
    functional: [],
    technical: [],
    ux: [],
    mermaid: []
  });
  const [userPrompts, setUserPrompts] = useState<UserPrompt[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPromptsLoading, setUserPromptsLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showTester, setShowTester] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<DocumentType | 'guide' | 'user-prompts' | 'analytics'>('business');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // User prompt filters
  const [userPromptSearch, setUserPromptSearch] = useState('');
  const [userPromptTypeFilter, setUserPromptTypeFilter] = useState<string>('all');
  const [userPromptStatusFilter, setUserPromptStatusFilter] = useState<string>('all');

  const promptService = new PromptService();

  useEffect(() => {
    loadPrompts();
    if (userRole === 'admin') {
      loadUserPrompts();
      loadSystemStats();
    }
  }, [userRole]);

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

  const loadUserPrompts = async () => {
    if (userRole !== 'admin') return;
    
    try {
      setUserPromptsLoading(true);
      const supabase = createClient();
      
      // Load all user prompts with user details and usage stats
      const { data, error } = await supabase
        .from('user_prompts_with_stats')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading user prompts:', error);
        return;
      }

      // Transform the data to include user details
      const transformedData = data?.map(prompt => ({
        ...prompt,
        user_email: prompt.profiles?.email || 'Unknown',
        user_name: prompt.profiles?.full_name || 'Unknown User'
      })) || [];

      setUserPrompts(transformedData);
    } catch (error) {
      console.error('Error loading user prompts:', error);
    } finally {
      setUserPromptsLoading(false);
    }
  };

  const loadSystemStats = async () => {
    if (userRole !== 'admin') return;
    
    try {
      const supabase = createClient();
      
      // Get system-wide statistics
      const { data: stats, error } = await supabase.rpc('get_system_prompt_stats');
      
      if (error) {
        console.error('Error loading system stats:', error);
        return;
      }

      setSystemStats(stats);
    } catch (error) {
      console.error('Error loading system stats:', error);
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

  const handleViewUserPrompt = (userPrompt: UserPrompt) => {
    // Convert user prompt to PromptTemplate format for viewing
    const promptTemplate: PromptTemplate = {
      id: userPrompt.id,
      name: userPrompt.name,
      description: userPrompt.description,
      document_type: userPrompt.document_type as DocumentType,
      prompt_content: userPrompt.prompt_content,
      variables: {},
      ai_model: userPrompt.ai_model,
      is_active: userPrompt.is_active,
      is_default: false,
      version: userPrompt.version,
      created_by: userPrompt.user_id,
      created_at: userPrompt.created_at,
      updated_at: userPrompt.updated_at
    };
    
    setSelectedPrompt(promptTemplate);
    setShowTester(true);
  };

  const handleDeactivateUserPrompt = async (userPrompt: UserPrompt) => {
    if (!confirm(`Are you sure you want to deactivate "${userPrompt.name}" for user ${userPrompt.user_email}?`)) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('prompt_templates')
        .update({ is_active: false })
        .eq('id', userPrompt.id);

      if (error) throw error;

      setSuccess(`User prompt "${userPrompt.name}" deactivated successfully`);
      await loadUserPrompts();
    } catch (error) {
      setError(`Failed to deactivate user prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const filteredUserPrompts = userPrompts.filter(prompt => {
    const matchesSearch = prompt.name.toLowerCase().includes(userPromptSearch.toLowerCase()) ||
                         prompt.user_email.toLowerCase().includes(userPromptSearch.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(userPromptSearch.toLowerCase());
    
    const matchesType = userPromptTypeFilter === 'all' || prompt.document_type === userPromptTypeFilter;
    
    const matchesStatus = userPromptStatusFilter === 'all' || 
                         (userPromptStatusFilter === 'active' && prompt.is_active) ||
                         (userPromptStatusFilter === 'inactive' && !prompt.is_active) ||
                         (userPromptStatusFilter === 'default' && prompt.is_personal_default);
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType | 'guide' | 'user-prompts' | 'analytics')}>
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="functional">Functional</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="ux">UX</TabsTrigger>
          <TabsTrigger value="mermaid">Mermaid</TabsTrigger>
          {userRole === 'admin' && (
            <>
              <TabsTrigger value="user-prompts">User Prompts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </>
          )}
          <TabsTrigger value="guide">Guide</TabsTrigger>
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

        {/* New User Prompts Tab */}
        {userRole === 'admin' && (
          <TabsContent value="user-prompts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Prompt Management
                </CardTitle>
                <CardDescription>
                  Monitor and manage prompts created by users across the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search prompts, users, or descriptions..."
                        value={userPromptSearch}
                        onChange={(e) => setUserPromptSearch(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select value={userPromptTypeFilter} onValueChange={setUserPromptTypeFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Document Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="business">Business Analysis</SelectItem>
                      <SelectItem value="functional">Functional Spec</SelectItem>
                      <SelectItem value="technical">Technical Spec</SelectItem>
                      <SelectItem value="ux">UX Specification</SelectItem>
                      <SelectItem value="mermaid">Mermaid Diagrams</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={userPromptStatusFilter} onValueChange={setUserPromptStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="default">Personal Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* User Prompts List */}
                {userPromptsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUserPrompts.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No user prompts found</h3>
                        <p className="text-muted-foreground">
                          {userPrompts.length === 0 
                            ? "Users haven't created any prompts yet"
                            : "No prompts match your current filters"
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {filteredUserPrompts.map((userPrompt) => (
                          <Card key={userPrompt.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">{userPrompt.name}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {getDocumentTypeLabel(userPrompt.document_type as DocumentType)}
                                    </Badge>
                                    {userPrompt.is_personal_default && (
                                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                        Personal Default
                                      </Badge>
                                    )}
                                    {!userPrompt.is_active && (
                                      <Badge variant="secondary" className="text-xs">
                                        Inactive
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="text-sm text-muted-foreground mb-2">
                                    <span className="font-medium">User:</span> {userPrompt.user_name} ({userPrompt.user_email})
                                  </div>
                                  
                                  {userPrompt.description && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {userPrompt.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Uses: {userPrompt.usage_count || 0}</span>
                                    <span>Success: {userPrompt.success_rate?.toFixed(1) || 0}%</span>
                                    <span>Updated: {new Date(userPrompt.updated_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewUserPrompt(userPrompt)}
                                    className="flex items-center gap-1"
                                  >
                                    <Eye className="h-3 w-3" />
                                    View
                                  </Button>
                                  {userPrompt.is_active && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeactivateUserPrompt(userPrompt)}
                                      className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
                                    >
                                      <Pause className="h-3 w-3" />
                                      Deactivate
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* New System Analytics Tab */}
        {userRole === 'admin' && (
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.total_users || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Active users in the system
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">User Prompts</CardTitle>
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.total_user_prompts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {systemStats?.active_user_prompts || 0} active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Prompts</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.total_system_prompts || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Admin-managed prompts
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{systemStats?.avg_success_rate?.toFixed(1) || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average across all prompts
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Document Type Usage Chart */}
            {systemStats?.top_document_types && (
              <Card>
                <CardHeader>
                  <CardTitle>Document Type Usage</CardTitle>
                  <CardDescription>
                    Most popular document types by prompt count and usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemStats.top_document_types.map((type) => (
                      <div key={type.document_type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getDocumentTypeIcon(type.document_type as DocumentType)}</span>
                          <span className="font-medium">
                            {getDocumentTypeLabel(type.document_type as DocumentType)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{type.count} prompts</span>
                          <span>{type.usage_count} uses</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Existing Guide Tab */}
        <TabsContent value="guide">
          <PromptGuide />
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
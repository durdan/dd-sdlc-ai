"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle,
  Zap,
  Activity,
  Target,
  DollarSign
} from 'lucide-react';
import { PromptTemplate, PromptService } from '@/lib/prompt-service';

interface PromptAnalyticsProps {
  prompt: PromptTemplate;
  onClose: () => void;
}

interface AnalyticsData {
  totalUsage: number;
  successRate: number;
  avgResponseTime: number;
  totalTokens: number;
  rawData: any[];
}

interface MetricCard {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

export function PromptAnalytics({ prompt, onClose }: PromptAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30');

  const promptService = new PromptService();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await promptService.getPromptAnalytics(prompt.id, parseInt(timeRange));
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getMetricCards = (): MetricCard[] => {
    if (!analytics) return [];

    return [
      {
        title: 'Total Usage',
        value: formatNumber(analytics.totalUsage),
        icon: <Users className="h-4 w-4" />,
        color: 'text-blue-600'
      },
      {
        title: 'Success Rate',
        value: formatPercentage(analytics.successRate),
        icon: <CheckCircle className="h-4 w-4" />,
        color: analytics.successRate >= 95 ? 'text-green-600' : analytics.successRate >= 85 ? 'text-yellow-600' : 'text-red-600'
      },
      {
        title: 'Avg Response Time',
        value: formatDuration(analytics.avgResponseTime),
        icon: <Clock className="h-4 w-4" />,
        color: analytics.avgResponseTime < 2000 ? 'text-green-600' : analytics.avgResponseTime < 5000 ? 'text-yellow-600' : 'text-red-600'
      },
      {
        title: 'Total Tokens',
        value: formatNumber(analytics.totalTokens),
        icon: <Zap className="h-4 w-4" />,
        color: 'text-purple-600'
      }
    ];
  };

  const getUsageByDay = () => {
    if (!analytics?.rawData) return [];
    
    const dailyUsage: Record<string, number> = {};
    
    analytics.rawData.forEach(log => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      dailyUsage[date] = (dailyUsage[date] || 0) + 1;
    });
    
    return Object.entries(dailyUsage)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  };

  const getSuccessRateByDay = () => {
    if (!analytics?.rawData) return [];
    
    const dailyStats: Record<string, { total: number; success: number }> = {};
    
    analytics.rawData.forEach(log => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { total: 0, success: 0 };
      }
      dailyStats[date].total++;
      if (log.success) {
        dailyStats[date].success++;
      }
    });
    
    return Object.entries(dailyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stats]) => ({
        date,
        successRate: (stats.success / stats.total) * 100
      }));
  };

  const getRecentUsage = () => {
    if (!analytics?.rawData) return [];
    
    return analytics.rawData
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map(log => ({
        timestamp: new Date(log.created_at).toLocaleString(),
        success: log.success,
        responseTime: log.response_time_ms,
        tokens: (log.input_tokens || 0) + (log.output_tokens || 0),
        error: log.error_message
      }));
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics: {prompt.name}
          </DialogTitle>
          <DialogDescription>
            Performance metrics and usage statistics for this prompt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time Range Selector */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{prompt.document_type}</Badge>
              <Badge variant="outline">v{prompt.version}</Badge>
              <Badge variant={prompt.is_active ? "default" : "secondary"}>
                {prompt.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={loadAnalytics} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : !analytics ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
                <p className="text-muted-foreground">
                  No usage data available for the selected time period
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {getMetricCards().map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {metric.title}
                          </p>
                          <p className="text-2xl font-bold">{metric.value}</p>
                        </div>
                        <div className={`${metric.color}`}>
                          {metric.icon}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="usage">Usage Trends</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="recent">Recent Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Usage Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Executions</span>
                            <span className="font-semibold">{analytics.totalUsage}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Success Rate</span>
                            <span className="font-semibold">{formatPercentage(analytics.successRate)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Avg Response Time</span>
                            <span className="font-semibold">{formatDuration(analytics.avgResponseTime)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Total Tokens Used</span>
                            <span className="font-semibold">{formatNumber(analytics.totalTokens)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Grade</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center space-y-4">
                          <div className="text-4xl font-bold">
                            {analytics.successRate >= 95 ? 'A+' :
                             analytics.successRate >= 90 ? 'A' :
                             analytics.successRate >= 85 ? 'B+' :
                             analytics.successRate >= 80 ? 'B' :
                             analytics.successRate >= 75 ? 'C+' :
                             analytics.successRate >= 70 ? 'C' : 'D'}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Based on success rate and response time
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>Success Rate</span>
                              <span>{formatPercentage(analytics.successRate)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${analytics.successRate}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="usage" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Usage</CardTitle>
                      <CardDescription>
                        Number of times this prompt was executed per day
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-muted-foreground">
                          Chart visualization would go here (requires chart library)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Success Rate Over Time</CardTitle>
                      <CardDescription>
                        Daily success rate percentage
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-muted-foreground">
                          Performance chart would go here (requires chart library)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recent" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>
                        Last 10 prompt executions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {getRecentUsage().map((usage, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {usage.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{usage.timestamp}</p>
                                {usage.error && (
                                  <p className="text-xs text-red-600">{usage.error}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{formatDuration(usage.responseTime || 0)}</span>
                              <span>{usage.tokens} tokens</span>
                            </div>
                          </div>
                        ))}
                        {getRecentUsage().length === 0 && (
                          <p className="text-center text-muted-foreground py-8">
                            No recent activity
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
"use client"

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Crown, 
  Users, 
  Settings,
  Gift,
  Rocket,
  Star,
  Activity,
  Target,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Home,
  User,
  LogOut,
  Shield
} from 'lucide-react';
import { useFreemiumUsage } from '@/hooks/use-freemium-usage';
import EnhancedUsageDashboard from '@/components/enhanced-usage-dashboard';
import UpgradePromptEnhanced from '@/components/upgrade-prompt-enhanced';
import UsageAnalyticsChart from '@/components/usage-analytics-chart';
import SmartNotificationSystem from '@/components/smart-notification-system';
import BetaFeaturesIndicator from '@/components/beta-features-indicator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// User Header Component
interface UserHeaderProps {
  user: any;
  userRole: string;
  onSignOut: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ user, userRole, onSignOut }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <img 
              src="/img/SDLC.dev.logo.svg" 
              alt="SDLC.dev Logo" 
              className="h-8 w-auto filter contrast-125 brightness-110" 
            />
            <div className="ml-3 font-bold text-gray-900">
              <span className="text-lg">Usage & Upgrades</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Welcome,</span>
              <span className="font-medium">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </span>
            </div>
            
            {(userRole === 'admin' || userRole === 'manager') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/admin/prompts', '_blank')}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Admin Panel
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || 'User'} />
                    <AvatarFallback>
                      {user.user_metadata?.full_name
                        ? getInitials(user.user_metadata.full_name)
                        : user.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/dashboard'}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

function UsageDashboardPage({ user, userRole, onSignOut }: { user: any, userRole: string, onSignOut: () => void }) {
  const [activeTab, setActiveTab] = useState('overview')
  const { usage, loading, error } = useFreemiumUsage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* User Header */}
      <UserHeader user={user} userRole={userRole} onSignOut={onSignOut} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Usage & Upgrades</h1>
              <p className="text-gray-600 mt-1">Monitor your usage, explore upgrade options, and access beta features</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Back to SDLC Workspace</span>
                <span className="sm:hidden">Back to Dashboard</span>
              </Button>
              <Button
                onClick={() => setActiveTab('early-access')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Rocket className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Upgrade Now</span>
                <span className="sm:hidden">Upgrade</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="tabs-mobile-container tabs-scroll-container mb-4">
            <TabsList className="tabs-mobile-list">
              <TabsTrigger value="overview" className="tab-trigger-mobile">
                <Activity className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="tab-trigger-mobile">
                <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="early-access" className="tab-trigger-mobile">
                <Rocket className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Early Access</span>
                <span className="sm:hidden">Early Access</span>
              </TabsTrigger>
              <TabsTrigger value="beta-features" className="tab-trigger-mobile">
                <Sparkles className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Beta Features</span>
                <span className="sm:hidden">Beta</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Smart Notification System */}
            <SmartNotificationSystem 
              usage={usage || undefined}
              onUpgrade={() => setActiveTab('early-access')}
              onConfigureKeys={() => window.location.href = '/dashboard?config=true'}
              userActivity={{
                daysActive: 10,
                totalProjects: 25,
                averageDaily: 3.2
              }}
            />

            {/* Enhanced Usage Dashboard */}
            <EnhancedUsageDashboard 
              compact={false} 
              onConfigureKeys={() => window.location.href = '/dashboard?config=true'}
              onUpgrade={() => setActiveTab('early-access')}
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/dashboard'}
                    className="flex items-center gap-2 h-20 flex-col"
                  >
                    <Home className="h-6 w-6" />
                    <span>Back to SDLC Workspace</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('early-access')}
                    className="flex items-center gap-2 h-20 flex-col"
                  >
                    <Crown className="h-6 w-6" />
                    <span>Upgrade to Early Access</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/dashboard?config=true'}
                    className="flex items-center gap-2 h-20 flex-col"
                  >
                    <Settings className="h-6 w-6" />
                    <span>Configure API Keys</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <UsageAnalyticsChart 
              usage={usage || undefined}
              onUpgrade={() => setActiveTab('early-access')}
            />
          </TabsContent>

          {/* Early Access Tab */}
          <TabsContent value="early-access" className="space-y-6">
            <UpgradePromptEnhanced 
              usage={usage || undefined}
              onUpgrade={() => {
                // Handle upgrade flow
                alert('Early Access enrollment coming soon!')
              }}
              onConfigureKeys={() => window.location.href = '/dashboard?config=true'}
              variant="card"
              showDismiss={false}
            />
            
            {/* Early Access Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-blue-500" />
                  Early Access Benefits
                </CardTitle>
                <CardDescription>
                  Join our early access program to get exclusive access to beta features, priority support, and help shape the future of SDLC.dev
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-500" />
                        Premium Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Unlimited daily projects</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Priority processing queue</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Advanced AI integrations</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Premium SDLC templates</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Custom workflow automation</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="h-5 w-5 text-green-500" />
                        Exclusive Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Beta features before public release</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Direct feedback to development team</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Priority customer support</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Enterprise-grade security</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>Exclusive community access</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Beta Features Tab */}
          <TabsContent value="beta-features" className="space-y-6">
            <BetaFeaturesIndicator 
              user={user}
              compact={false}
              showEnrollment={true}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Auth wrapper component
function AuthenticatedUsageDashboard() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          window.location.href = '/signin';
          return;
        }
        
        setUser(user);
        
        // Check user role from database
        try {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .single()
          
          if (roleData?.role) {
            setUserRole(roleData.role)
          }
        } catch (error) {
          console.log('No specific role found, using default user role')
          setUserRole('user')
        }
        
      } catch (error) {
        window.location.href = '/signin';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UsageDashboardPage user={user} userRole={userRole} onSignOut={handleSignOut} />
    </div>
  );
}

export default AuthenticatedUsageDashboard; 
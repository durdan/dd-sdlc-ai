"use client";

import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Star, 
  Zap, 
  Shield, 
  Building, 
  Code, 
  Gift, 
  Target, 
  Rocket, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Loader2,
  Lock,
  Unlock,
  Crown,
  Diamond,
  Plus
} from 'lucide-react';
import { earlyAccessService, type BetaFeature, type EarlyAccessEnrollment } from '@/lib/early-access-service';
import EarlyAccessEnrollment from './early-access-enrollment';

interface BetaFeaturesIndicatorProps {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  compact?: boolean;
  showEnrollment?: boolean;
}

export default function BetaFeaturesIndicator({ 
  user, 
  compact = false, 
  showEnrollment = true 
}: BetaFeaturesIndicatorProps) {
  const [userFeatures, setUserFeatures] = useState<BetaFeature[]>([]);
  const [allFeatures, setAllFeatures] = useState<BetaFeature[]>([]);
  const [enrollment, setEnrollment] = useState<EarlyAccessEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('features');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Load user's beta features
        const { success: userSuccess, data: userData } = await earlyAccessService.getUserBetaFeatures(user.id);
        if (userSuccess && userData) {
          setUserFeatures(userData);
        }

        // Load all available features
        const { success: allSuccess, data: allData } = await earlyAccessService.getBetaFeatures();
        if (allSuccess && allData) {
          setAllFeatures(allData);
        }

        // Load enrollment status
        const { success: enrollmentSuccess, data: enrollmentData } = await earlyAccessService.getUserEnrollment(user.id);
        if (enrollmentSuccess && enrollmentData) {
          setEnrollment(enrollmentData);
        }
      } catch (error) {
        console.error('Error loading beta features data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  const getFeatureCategoryIcon = (category: string, size: string = 'h-4 w-4') => {
    switch (category) {
      case 'ai':
        return <Sparkles className={size} />;
      case 'integrations':
        return <Code className={size} />;
      case 'templates':
        return <Gift className={size} />;
      case 'analytics':
        return <Target className={size} />;
      case 'support':
        return <Shield className={size} />;
      case 'enterprise':
        return <Building className={size} />;
      default:
        return <Star className={size} />;
    }
  };

  const getAccessLevelIcon = (level: string, size: string = 'h-4 w-4') => {
    switch (level) {
      case 'alpha':
        return <Zap className={`${size} text-yellow-500`} />;
      case 'beta':
        return <Star className={`${size} text-blue-500`} />;
      case 'preview':
        return <Sparkles className={`${size} text-purple-500`} />;
      case 'enterprise':
        return <Crown className={`${size} text-gray-700`} />;
      default:
        return <Star className={`${size} text-gray-500`} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'waitlisted':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Waitlisted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getFeaturesByCategoryAndLevel = () => {
    const grouped = allFeatures.reduce((acc, feature) => {
      const key = `${feature.feature_category}-${feature.access_level}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(feature);
      return acc;
    }, {} as Record<string, BetaFeature[]>);

    return grouped;
  };

  const handleEnrollmentComplete = (newEnrollment: EarlyAccessEnrollment) => {
    setEnrollment(newEnrollment);
    setShowDialog(false);
    // Refresh user features after enrollment
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading features...
      </div>
    );
  }

  // Compact view for header/navbar
  if (compact) {
    const hasFeatures = userFeatures.length > 0;
    const isEnrolled = enrollment && enrollment.enrollment_status === 'approved';
    
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            {hasFeatures ? (
              <>
                <Diamond className="h-4 w-4 mr-2 text-blue-500" />
                <span className="hidden sm:inline">Beta Features</span>
                <span className="sm:hidden">Beta</span>
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {userFeatures.length}
                </Badge>
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Early Access</span>
                <span className="sm:hidden">Access</span>
                {enrollment && enrollment.enrollment_status === 'pending' && (
                  <Clock className="h-3 w-3 ml-1 text-yellow-500" />
                )}
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Diamond className="h-5 w-5 text-blue-500" />
              Early Access & Beta Features
            </DialogTitle>
            <DialogDescription>
              Manage your early access enrollment and explore available beta features
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="features">My Features</TabsTrigger>
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="mt-6">
              <BetaFeaturesContent 
                userFeatures={userFeatures}
                allFeatures={allFeatures}
                enrollment={enrollment}
                getFeatureCategoryIcon={getFeatureCategoryIcon}
                getAccessLevelIcon={getAccessLevelIcon}
              />
            </TabsContent>
            
            <TabsContent value="available" className="mt-6">
              <AvailableFeaturesContent 
                allFeatures={allFeatures}
                userFeatures={userFeatures}
                enrollment={enrollment}
                getFeatureCategoryIcon={getFeatureCategoryIcon}
                getAccessLevelIcon={getAccessLevelIcon}
              />
            </TabsContent>
            
            <TabsContent value="enrollment" className="mt-6">
              {enrollment ? (
                <EnrollmentStatusContent 
                  enrollment={enrollment}
                  getStatusBadge={getStatusBadge}
                  getFeatureCategoryIcon={getFeatureCategoryIcon}
                  allFeatures={allFeatures}
                />
              ) : (
                showEnrollment && (
                  <EarlyAccessEnrollment 
                    user={user} 
                    onEnrollmentComplete={handleEnrollmentComplete}
                  />
                )
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }

  // Full view for dedicated pages
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Diamond className="h-5 w-5 text-blue-500" />
            Beta Features Access
          </CardTitle>
          <CardDescription>
            Your current access to beta features and early access program status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BetaFeaturesContent 
            userFeatures={userFeatures}
            allFeatures={allFeatures}
            enrollment={enrollment}
            getFeatureCategoryIcon={getFeatureCategoryIcon}
            getAccessLevelIcon={getAccessLevelIcon}
          />
        </CardContent>
      </Card>

      {!enrollment && showEnrollment && (
        <EarlyAccessEnrollment 
          user={user} 
          onEnrollmentComplete={handleEnrollmentComplete}
        />
      )}
    </div>
  );
}

// Component for displaying user's beta features
function BetaFeaturesContent({ 
  userFeatures, 
  allFeatures, 
  enrollment, 
  getFeatureCategoryIcon, 
  getAccessLevelIcon 
}: {
  userFeatures: BetaFeature[];
  allFeatures: BetaFeature[];
  enrollment: EarlyAccessEnrollment | null;
  getFeatureCategoryIcon: (category: string, size?: string) => JSX.Element;
  getAccessLevelIcon: (level: string, size?: string) => JSX.Element;
}) {
  if (userFeatures.length === 0) {
    return (
      <div className="text-center py-8">
        <Lock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Beta Features Available</h3>
        <p className="text-gray-500 mb-4">
          You don't have access to any beta features yet. 
          {!enrollment && " Apply for early access to unlock exclusive features."}
        </p>
        {enrollment && enrollment.enrollment_status === 'pending' && (
          <Alert className="max-w-md mx-auto">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your early access enrollment is pending review. You'll be notified once approved.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  const featuresByCategory = userFeatures.reduce((acc, feature) => {
    if (!acc[feature.feature_category]) {
      acc[feature.feature_category] = [];
    }
    acc[feature.feature_category].push(feature);
    return acc;
  }, {} as Record<string, BetaFeature[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Unlock className="h-5 w-5 text-green-500" />
          <span className="font-medium">You have access to {userFeatures.length} beta feature{userFeatures.length > 1 ? 's' : ''}</span>
        </div>
        {enrollment && (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {enrollment.access_level.charAt(0).toUpperCase() + enrollment.access_level.slice(1)} Member
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {Object.entries(featuresByCategory).map(([category, features]) => (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
              {getFeatureCategoryIcon(category)}
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h4>
            <div className="grid gap-3">
              {features.map(feature => (
                <div key={feature.feature_key} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getAccessLevelIcon(feature.access_level)}
                    <div>
                      <h5 className="font-medium text-sm">{feature.feature_name}</h5>
                      <p className="text-xs text-gray-600">{feature.feature_description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {feature.access_level}
                    </Badge>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component for displaying available beta features
function AvailableFeaturesContent({ 
  allFeatures, 
  userFeatures, 
  enrollment, 
  getFeatureCategoryIcon, 
  getAccessLevelIcon 
}: {
  allFeatures: BetaFeature[];
  userFeatures: BetaFeature[];
  enrollment: EarlyAccessEnrollment | null;
  getFeatureCategoryIcon: (category: string, size?: string) => JSX.Element;
  getAccessLevelIcon: (level: string, size?: string) => JSX.Element;
}) {
  const userFeatureKeys = userFeatures.map(f => f.feature_key);
  const featuresByCategory = allFeatures.reduce((acc, feature) => {
    if (!acc[feature.feature_category]) {
      acc[feature.feature_category] = [];
    }
    acc[feature.feature_category].push(feature);
    return acc;
  }, {} as Record<string, BetaFeature[]>);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Available Beta Features</h3>
        <p className="text-gray-500">
          Explore all the beta features available through our early access program
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(featuresByCategory).map(([category, features]) => (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
              {getFeatureCategoryIcon(category)}
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </h4>
            <div className="grid gap-3">
              {features.map(feature => {
                const hasAccess = userFeatureKeys.includes(feature.feature_key);
                return (
                  <div 
                    key={feature.feature_key} 
                    className={`p-3 border rounded-lg ${
                      hasAccess 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getAccessLevelIcon(feature.access_level)}
                        <div>
                          <h5 className="font-medium text-sm">{feature.feature_name}</h5>
                          <p className="text-xs text-gray-600">{feature.feature_description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {feature.access_level}
                        </Badge>
                        {hasAccess ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component for displaying enrollment status
function EnrollmentStatusContent({ 
  enrollment, 
  getStatusBadge, 
  getFeatureCategoryIcon, 
  allFeatures 
}: {
  enrollment: EarlyAccessEnrollment;
  getStatusBadge: (status: string) => JSX.Element;
  getFeatureCategoryIcon: (category: string, size?: string) => JSX.Element;
  allFeatures: BetaFeature[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            {enrollment.access_level.charAt(0).toUpperCase() + enrollment.access_level.slice(1)} Access
          </h3>
          <p className="text-sm text-gray-600">
            Applied on {new Date(enrollment.created_at).toLocaleDateString()}
          </p>
        </div>
        {getStatusBadge(enrollment.enrollment_status)}
      </div>

      <Separator />

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Priority Score</Label>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={(enrollment.priority_score / 100) * 100} className="flex-1" />
            <span className="text-sm font-medium">{enrollment.priority_score}/100</span>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Requested Features</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {enrollment.requested_features.map(featureKey => {
              const feature = allFeatures.find(f => f.feature_key === featureKey);
              return (
                <Badge key={featureKey} variant="outline" className="flex items-center gap-1">
                  {feature ? getFeatureCategoryIcon(feature.feature_category, 'h-3 w-3') : <Star className="h-3 w-3" />}
                  {feature?.feature_name || featureKey}
                </Badge>
              );
            })}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Use Case</Label>
          <p className="text-sm text-gray-600 mt-1">{enrollment.use_case_description}</p>
        </div>

        {enrollment.admin_notes && (
          <div>
            <Label className="text-sm font-medium">Admin Notes</Label>
            <p className="text-sm text-gray-600 mt-1">{enrollment.admin_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Label component since it's used in multiple places
function Label({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <label className={`text-sm font-medium ${className}`} {...props}>
      {children}
    </label>
  );
} 
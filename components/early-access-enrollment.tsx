"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  Building, 
  Code, 
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowRight,
  Gift,
  Target,
  Rocket
} from 'lucide-react';
import { earlyAccessService, type EnrollmentFormData, type EarlyAccessEnrollment, type BetaFeature } from '@/lib/early-access-service';

interface EarlyAccessEnrollmentProps {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  onEnrollmentComplete?: (enrollment: EarlyAccessEnrollment) => void;
}

export default function EarlyAccessEnrollment({ user, onEnrollmentComplete }: EarlyAccessEnrollmentProps) {
  const [formData, setFormData] = useState<EnrollmentFormData>({
    access_level: 'beta',
    requested_features: [],
    use_case_description: '',
    company_name: '',
    company_size: undefined,
    technical_background: undefined,
    expected_usage: undefined,
    referral_source: ''
  });

  const [betaFeatures, setBetaFeatures] = useState<BetaFeature[]>([]);
  const [existingEnrollment, setExistingEnrollment] = useState<EarlyAccessEnrollment | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load beta features and existing enrollment
  useEffect(() => {
    const loadData = async () => {
      setLoadingFeatures(true);
      
      // Load beta features
      const { success: featuresSuccess, data: featuresData } = await earlyAccessService.getBetaFeatures();
      if (featuresSuccess && featuresData) {
        setBetaFeatures(featuresData);
      }

      // Check for existing enrollment
      const { success: enrollmentSuccess, data: enrollmentData } = await earlyAccessService.getUserEnrollment(user.id);
      if (enrollmentSuccess && enrollmentData) {
        setExistingEnrollment(enrollmentData);
      }

      setLoadingFeatures(false);
    };

    loadData();
  }, [user.id]);

  const handleFeatureToggle = (featureKey: string) => {
    setFormData(prev => ({
      ...prev,
      requested_features: prev.requested_features.includes(featureKey)
        ? prev.requested_features.filter(f => f !== featureKey)
        : [...prev.requested_features, featureKey]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { success, data, error } = await earlyAccessService.enrollUser(user.id, formData);
      
      if (success && data) {
        setSuccess(true);
        setExistingEnrollment(data);
        onEnrollmentComplete?.(data);
      } else {
        setError(error || 'Failed to submit enrollment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    const totalSteps = 3;
    return (step / totalSteps) * 100;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'waitlisted':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Review</Badge>;
      case 'waitlisted':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Waitlisted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getFeatureCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai':
        return <Sparkles className="h-4 w-4" />;
      case 'integrations':
        return <Code className="h-4 w-4" />;
      case 'templates':
        return <Gift className="h-4 w-4" />;
      case 'analytics':
        return <Target className="h-4 w-4" />;
      case 'support':
        return <Shield className="h-4 w-4" />;
      case 'enterprise':
        return <Building className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  if (loadingFeatures) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading early access information...</span>
      </div>
    );
  }

  // Show enrollment status if user is already enrolled
  if (existingEnrollment) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(existingEnrollment.enrollment_status)}
            Early Access Status
          </CardTitle>
          <CardDescription>
            Your current early access enrollment status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                {existingEnrollment.access_level.charAt(0).toUpperCase() + existingEnrollment.access_level.slice(1)} Access
              </h3>
              <p className="text-sm text-gray-600">
                Applied on {new Date(existingEnrollment.created_at).toLocaleDateString()}
              </p>
            </div>
            {getStatusBadge(existingEnrollment.enrollment_status)}
          </div>

          <Separator />

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Priority Score</Label>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={(existingEnrollment.priority_score / 100) * 100} className="flex-1" />
                <span className="text-sm font-medium">{existingEnrollment.priority_score}/100</span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Requested Features</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {existingEnrollment.requested_features.map(featureKey => {
                  const feature = betaFeatures.find(f => f.feature_key === featureKey);
                  return (
                    <Badge key={featureKey} variant="outline" className="flex items-center gap-1">
                      {feature ? getFeatureCategoryIcon(feature.feature_category) : <Star className="h-3 w-3" />}
                      {feature?.feature_name || featureKey}
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Use Case</Label>
              <p className="text-sm text-gray-600 mt-1">{existingEnrollment.use_case_description}</p>
            </div>

            {existingEnrollment.admin_notes && (
              <div>
                <Label className="text-sm font-medium">Admin Notes</Label>
                <p className="text-sm text-gray-600 mt-1">{existingEnrollment.admin_notes}</p>
              </div>
            )}
          </div>

          {existingEnrollment.enrollment_status === 'approved' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                🎉 Congratulations! Your early access has been approved. You now have access to beta features.
              </AlertDescription>
            </Alert>
          )}

          {existingEnrollment.enrollment_status === 'pending' && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your enrollment is being reviewed. We'll notify you once a decision is made.
              </AlertDescription>
            </Alert>
          )}

          {existingEnrollment.enrollment_status === 'waitlisted' && (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                You're on the waitlist! We'll invite you to early access based on capacity and priority.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Enrollment Submitted Successfully!
          </CardTitle>
          <CardDescription>
            Thank you for your interest in early access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Rocket className="h-4 w-4" />
            <AlertDescription>
              Your early access enrollment has been submitted and is being reviewed. 
              We'll notify you via email once a decision is made. Thank you for your patience!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-500" />
          Early Access Enrollment
        </CardTitle>
        <CardDescription>
          Join our early access program to get exclusive access to beta features and shape the future of SDLC.dev
        </CardDescription>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Step {step} of 3</span>
            <span>{Math.round(getProgressPercentage())}% Complete</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Access Level and Features */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="access_level" className="text-base font-medium">
                  Access Level
                </Label>
                <p className="text-sm text-gray-600 mb-3">
                  Choose the level of early access you're interested in
                </p>
                <Select 
                  value={formData.access_level} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, access_level: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beta">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium">Beta Access</div>
                          <div className="text-xs text-gray-500">Stable beta features</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="alpha">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <div>
                          <div className="font-medium">Alpha Access</div>
                          <div className="text-xs text-gray-500">Cutting-edge features</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="preview">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <div>
                          <div className="font-medium">Preview Access</div>
                          <div className="text-xs text-gray-500">Preview upcoming features</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="enterprise">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-700" />
                        <div>
                          <div className="font-medium">Enterprise Access</div>
                          <div className="text-xs text-gray-500">Enterprise-grade features</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium">
                  Requested Features
                </Label>
                <p className="text-sm text-gray-600 mb-3">
                  Select the beta features you're most interested in
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {betaFeatures.map(feature => (
                    <div
                      key={feature.feature_key}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.requested_features.includes(feature.feature_key)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleFeatureToggle(feature.feature_key)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getFeatureCategoryIcon(feature.feature_category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{feature.feature_name}</h4>
                            {formData.requested_features.includes(feature.feature_key) && (
                              <CheckCircle className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{feature.feature_description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {feature.feature_category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {feature.access_level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Company and Technical Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company_name">Company Name (Optional)</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <Label htmlFor="company_size">Company Size</Label>
                  <Select 
                    value={formData.company_size} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, company_size: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-1000">201-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="technical_background">Technical Background</Label>
                  <Select 
                    value={formData.technical_background} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, technical_background: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your technical level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expected_usage">Expected Usage</Label>
                  <Select 
                    value={formData.expected_usage} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, expected_usage: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select expected usage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light (1-5 projects/month)</SelectItem>
                      <SelectItem value="moderate">Moderate (5-20 projects/month)</SelectItem>
                      <SelectItem value="heavy">Heavy (20+ projects/month)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (Team usage)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="referral_source">How did you hear about us? (Optional)</Label>
                <Input
                  id="referral_source"
                  value={formData.referral_source}
                  onChange={(e) => setFormData(prev => ({ ...prev, referral_source: e.target.value }))}
                  placeholder="e.g., Twitter, LinkedIn, colleague, etc."
                />
              </div>
            </div>
          )}

          {/* Step 3: Use Case */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="use_case_description" className="text-base font-medium">
                  Use Case Description
                </Label>
                <p className="text-sm text-gray-600 mb-3">
                  Tell us about your specific use case and how you plan to use our early access features
                </p>
                <Textarea
                  id="use_case_description"
                  value={formData.use_case_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, use_case_description: e.target.value }))}
                  placeholder="Describe your use case, current challenges, and how early access features would help you..."
                  rows={6}
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• We'll review your enrollment within 2-3 business days</li>
                  <li>• Priority is given based on use case, company size, and technical background</li>
                  <li>• You'll receive an email notification with the decision</li>
                  <li>• If approved, you'll get immediate access to selected beta features</li>
                </ul>
              </div>
            </div>
          )}

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!formData.access_level || formData.requested_features.length === 0)) ||
                  (step === 2 && (!formData.company_size || !formData.technical_background || !formData.expected_usage))
                }
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || !formData.use_case_description.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Enrollment
                    <Rocket className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 
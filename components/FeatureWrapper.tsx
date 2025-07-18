import React from 'react';
import { isFeatureEnabled, FeatureFlags } from '@/lib/feature-flags';

interface FeatureWrapperProps {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showInDevelopment?: boolean;
  showInStaging?: boolean;
  showInProduction?: boolean;
}

/**
 * FeatureWrapper Component
 * 
 * Conditionally renders children based on feature flags and environment settings.
 * Useful for showing/hiding features based on deployment environment.
 */
export const FeatureWrapper: React.FC<FeatureWrapperProps> = ({
  feature,
  children,
  fallback = null,
  showInDevelopment = true,
  showInStaging = true,
  showInProduction = true,
}) => {
  const isEnabled = isFeatureEnabled(feature);
  const environment = process.env.NODE_ENV || 'development';
  
  // Check environment-specific visibility
  const isEnvironmentAllowed = 
    (environment === 'development' && showInDevelopment) ||
    (environment === 'staging' && showInStaging) ||
    (environment === 'production' && showInProduction);
  
  if (!isEnabled || !isEnvironmentAllowed) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

/**
 * FeatureFlag Component
 * 
 * Simple component for conditional rendering based on feature flags.
 */
export const FeatureFlag: React.FC<{
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ feature, children, fallback = null }) => {
  return (
    <FeatureWrapper feature={feature} fallback={fallback}>
      {children}
    </FeatureWrapper>
  );
};

/**
 * EnvironmentFeature Component
 * 
 * Shows content only in specific environments.
 */
export const EnvironmentFeature: React.FC<{
  environments: ('development' | 'staging' | 'production')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ environments, children, fallback = null }) => {
  const currentEnvironment = process.env.NODE_ENV || 'development';
  
  if (!environments.includes(currentEnvironment as any)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

/**
 * DevelopmentOnly Component
 * 
 * Shows content only in development environment.
 */
export const DevelopmentOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  return (
    <EnvironmentFeature environments={['development']} fallback={fallback}>
      {children}
    </EnvironmentFeature>
  );
};

/**
 * StagingOnly Component
 * 
 * Shows content only in staging environment.
 */
export const StagingOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  return (
    <EnvironmentFeature environments={['staging']} fallback={fallback}>
      {children}
    </EnvironmentFeature>
  );
};

/**
 * ProductionOnly Component
 * 
 * Shows content only in production environment.
 */
export const ProductionOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  return (
    <EnvironmentFeature environments={['production']} fallback={fallback}>
      {children}
    </EnvironmentFeature>
  );
};

/**
 * PreviewOnly Component
 * 
 * Shows content only in preview environments (staging, development).
 */
export const PreviewOnly: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  return (
    <EnvironmentFeature environments={['development', 'staging']} fallback={fallback}>
      {children}
    </EnvironmentFeature>
  );
};

export default FeatureWrapper; 
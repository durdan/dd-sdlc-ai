/**
 * Feature Flags System
 * 
 * This system allows us to enable/disable features based on:
 * - Environment (production, staging, preview)
 * - User roles (admin, user)
 * - Configuration settings
 * - A/B testing
 */

export interface FeatureFlags {
  // Core Features
  SDLC_GENERATION: boolean;
  PROMPT_MANAGEMENT: boolean;
  ADMIN_PANEL: boolean;
  
  // Integrations
  GITHUB_INTEGRATION: boolean;
  SLACK_INTEGRATION: boolean;
  JIRA_INTEGRATION: boolean;
  CONFLUENCE_INTEGRATION: boolean;
  CLICKUP_INTEGRATION: boolean;
  TRELLO_INTEGRATION: boolean;
  NOTION_INTEGRATION: boolean;
  LINEAR_INTEGRATION: boolean;
  
  // Advanced Features
  REAL_TIME_COLLABORATION: boolean;
  ADVANCED_ANALYTICS: boolean;
  CUSTOM_TEMPLATES: boolean;
  API_RATE_LIMITING: boolean;
  MULTI_LANGUAGE_SUPPORT: boolean;
  
  // Enterprise Features
  SSO_INTEGRATION: boolean;
  ADVANCED_SECURITY: boolean;
  AUDIT_LOGGING: boolean;
  CUSTOM_BRANDING: boolean;
  WHITE_LABEL_SOLUTIONS: boolean;
  
  // Experimental Features
  EXPERIMENTAL_FEATURES: boolean;
  BETA_FEATURES: boolean;
  
  // Development Features
  DEBUG_MODE: boolean;
  MOCK_AI_RESPONSES: boolean;
}

/**
 * Get feature flags based on environment and configuration
 */
export function getFeatureFlags(): FeatureFlags {
  const isProduction = process.env.NODE_ENV === 'production';
  const isStaging = process.env.NODE_ENV === 'staging';
  const isPreview = process.env.NODE_ENV === 'preview';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    // Core Features - Always enabled
    SDLC_GENERATION: true,
    PROMPT_MANAGEMENT: true,
    ADMIN_PANEL: true,
    
    // Integrations - Environment specific
    GITHUB_INTEGRATION: isProduction || isStaging || process.env.ENABLE_GITHUB === 'true',
    SLACK_INTEGRATION: isProduction || isStaging || process.env.ENABLE_SLACK === 'true',
    JIRA_INTEGRATION: isProduction || process.env.ENABLE_JIRA === 'true',
    CONFLUENCE_INTEGRATION: isProduction || process.env.ENABLE_CONFLUENCE === 'true',
    CLICKUP_INTEGRATION: isProduction || process.env.ENABLE_CLICKUP === 'true',
    TRELLO_INTEGRATION: isProduction || process.env.ENABLE_TRELLO === 'true',
    NOTION_INTEGRATION: isProduction || process.env.ENABLE_NOTION === 'true',
    LINEAR_INTEGRATION: isProduction || process.env.ENABLE_LINEAR === 'true',
    
    // Advanced Features - Production and staging
    REAL_TIME_COLLABORATION: isProduction || isStaging,
    ADVANCED_ANALYTICS: isProduction || isStaging,
    CUSTOM_TEMPLATES: isProduction || isStaging,
    API_RATE_LIMITING: isProduction,
    MULTI_LANGUAGE_SUPPORT: isProduction || isStaging,
    
    // Enterprise Features - Production only
    SSO_INTEGRATION: isProduction,
    ADVANCED_SECURITY: isProduction,
    AUDIT_LOGGING: isProduction,
    CUSTOM_BRANDING: isProduction,
    WHITE_LABEL_SOLUTIONS: isProduction,
    
    // Experimental Features - Preview and development
    EXPERIMENTAL_FEATURES: isPreview || isDevelopment,
    BETA_FEATURES: isStaging || isPreview || isDevelopment,
    
    // Development Features - Development and preview
    DEBUG_MODE: isDevelopment || isPreview || process.env.DEBUG === 'true',
    MOCK_AI_RESPONSES: isDevelopment || process.env.MOCK_AI_RESPONSES === 'true',
  };
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

/**
 * Get features for a specific environment
 */
export function getEnvironmentFeatures(): Record<string, boolean> {
  const flags = getFeatureFlags();
  const environment = process.env.NODE_ENV || 'development';
  
  return {
    environment,
    ...flags,
  };
}

/**
 * Feature wrapper component for conditional rendering
 */
export function withFeatureFlag<T extends object>(
  feature: keyof FeatureFlags,
  Component: React.ComponentType<T>,
  FallbackComponent?: React.ComponentType<T>
) {
  return function FeatureWrappedComponent(props: T) {
    if (!isFeatureEnabled(feature)) {
      return FallbackComponent ? React.createElement(FallbackComponent, props) : null;
    }
    
    return React.createElement(Component, props);
  };
}

/**
 * Hook for using feature flags in components
 */
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  return isFeatureEnabled(feature);
}

/**
 * Hook for using multiple feature flags
 */
export function useFeatureFlags(features: (keyof FeatureFlags)[]): Record<keyof FeatureFlags, boolean> {
  const flags = getFeatureFlags();
  const result: Partial<Record<keyof FeatureFlags, boolean>> = {};
  
  features.forEach(feature => {
    result[feature] = flags[feature];
  });
  
  return result as Record<keyof FeatureFlags, boolean>;
}

/**
 * Get feature status for admin panel
 */
export function getFeatureStatus(): Array<{
  name: string;
  enabled: boolean;
  environment: string;
  category: 'core' | 'integration' | 'advanced' | 'enterprise' | 'experimental' | 'development';
}> {
  const flags = getFeatureFlags();
  const environment = process.env.NODE_ENV || 'development';
  
  const featureCategories = {
    core: ['SDLC_GENERATION', 'PROMPT_MANAGEMENT', 'ADMIN_PANEL'],
    integration: ['GITHUB_INTEGRATION', 'SLACK_INTEGRATION', 'JIRA_INTEGRATION', 'CONFLUENCE_INTEGRATION', 'CLICKUP_INTEGRATION', 'TRELLO_INTEGRATION', 'NOTION_INTEGRATION', 'LINEAR_INTEGRATION'],
    advanced: ['REAL_TIME_COLLABORATION', 'ADVANCED_ANALYTICS', 'CUSTOM_TEMPLATES', 'API_RATE_LIMITING', 'MULTI_LANGUAGE_SUPPORT'],
    enterprise: ['SSO_INTEGRATION', 'ADVANCED_SECURITY', 'AUDIT_LOGGING', 'CUSTOM_BRANDING', 'WHITE_LABEL_SOLUTIONS'],
    experimental: ['EXPERIMENTAL_FEATURES', 'BETA_FEATURES'],
    development: ['DEBUG_MODE', 'MOCK_AI_RESPONSES'],
  };
  
  const result: Array<{
    name: string;
    enabled: boolean;
    environment: string;
    category: 'core' | 'integration' | 'advanced' | 'enterprise' | 'experimental' | 'development';
  }> = [];
  
  Object.entries(featureCategories).forEach(([category, features]) => {
    features.forEach(feature => {
      result.push({
        name: feature,
        enabled: flags[feature as keyof FeatureFlags],
        environment,
        category: category as any,
      });
    });
  });
  
  return result;
} 
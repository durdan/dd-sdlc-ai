/**
 * Wireframe Type Definitions
 * Core types for the wireframe generation feature
 */

// Layout types
export type LayoutType = 'web' | 'mobile' | 'tablet';
export type Orientation = 'portrait' | 'landscape';

// Component types following common UI patterns
export type ComponentType = 
  // Layout components
  | 'header' | 'nav' | 'footer' | 'sidebar' | 'main'
  // Container components
  | 'container' | 'section' | 'div' | 'article' | 'aside'
  // Content components
  | 'heading' | 'paragraph' | 'text' | 'list' | 'listItem'
  // Form components
  | 'form' | 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'button'
  // Media components
  | 'image' | 'video' | 'icon' | 'avatar'
  // Data display
  | 'table' | 'card' | 'badge' | 'alert' | 'toast'
  // Navigation
  | 'menu' | 'breadcrumb' | 'tabs' | 'pagination'
  // Interactive
  | 'modal' | 'dropdown' | 'accordion' | 'tooltip';

// Enhancement types for different focus areas
export type EnhancementType = 'full' | 'accessibility' | 'mobile' | 'interactions' | 'content';

// Annotation types for design documentation
export type AnnotationType = 'design' | 'interaction' | 'content' | 'technical' | 'accessibility';

// Main wireframe data structure
export interface WireframeData {
  id?: string;
  title: string;
  description: string;
  layout: WireframeLayout;
  components: WireframeComponent[];
  annotations?: WireframeAnnotation[];
  userFlow?: UserFlowStep[];
  styling?: StyleGuide;
  metadata?: WireframeMetadata;
  v0Component?: V0ComponentData;
}

// v0.dev component data
export interface V0ComponentData {
  code: string;
  componentName: string;
  preview?: string;
  framework?: 'react' | 'nextjs' | 'vue';
  styling?: 'tailwind' | 'css' | 'styled-components';
}

export interface WireframeLayout {
  type: LayoutType;
  orientation?: Orientation;
  dimensions: {
    width: number;
    height: number;
  };
  grid?: {
    columns: number;
    gap: number;
    padding: number;
  };
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface WireframeComponent {
  id: string;
  type: ComponentType;
  name?: string;
  position: Position;
  size: Size;
  content?: string;
  properties: ComponentProperties;
  style?: ComponentStyle;
  children?: WireframeComponent[];
  parentId?: string;
  interactions?: Interaction[];
}

export interface Position {
  x: number;
  y: number;
  z?: number; // For layering
}

export interface Size {
  width: number | string; // Can be pixels or percentages
  height: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;
}

export interface ComponentProperties {
  // Common properties
  placeholder?: string;
  label?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  
  // Type-specific properties
  href?: string; // For links
  src?: string; // For images
  alt?: string; // For images
  rows?: number; // For textarea
  columns?: string[]; // For tables
  items?: any[]; // For lists, selects
  
  // Additional custom properties
  [key: string]: any;
}

export interface ComponentStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number | string;
  margin?: number | string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: number;
  opacity?: number;
  boxShadow?: string;
}

export interface WireframeAnnotation {
  id: string;
  componentId?: string; // Reference to specific component
  type: AnnotationType;
  title: string;
  note: string;
  position?: Position; // For floating annotations
  priority?: 'low' | 'medium' | 'high';
  author?: string;
  createdAt?: Date;
}

export interface UserFlowStep {
  step: number;
  action: string;
  componentId?: string;
  result: string;
  alternativePaths?: string[];
  notes?: string;
}

export interface StyleGuide {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    border: string;
    error?: string;
    warning?: string;
    success?: string;
  };
  typography: {
    fontFamily: string;
    headingSizes: Record<string, string>;
    bodySize: string;
    lineHeight: string;
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
}

export interface WireframeMetadata {
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  aiModel: 'gpt-4' | 'claude-3-opus' | 'claude-3-sonnet';
  prompt: string;
  templateId?: string;
  parentId?: string; // For versioning
  tags?: string[];
  projectId?: string;
}

export interface Interaction {
  trigger: 'click' | 'hover' | 'focus' | 'submit' | 'change';
  action: string;
  targetId?: string;
  description: string;
}

// API Request/Response types
export interface GenerateWireframeRequest {
  prompt: string;
  model: 'gpt-4' | 'claude-3-opus' | 'claude-3-sonnet';
  projectId?: string;
  templateId?: string;
  layoutType?: LayoutType;
  includeAnnotations?: boolean;
  includeUserFlow?: boolean;
}

export interface GenerateWireframeResponse {
  success: boolean;
  wireframe?: WireframeData;
  error?: string;
  metadata?: {
    generationTime: number;
    tokensUsed: number;
    model: string;
    cost?: number;
  };
}

export interface RenderWireframeRequest {
  wireframe: WireframeData;
  format: 'svg' | 'html' | 'react';
  options?: RenderOptions;
}

export interface RenderOptions {
  theme?: 'light' | 'dark';
  showAnnotations?: boolean;
  showGrid?: boolean;
  interactive?: boolean;
  scale?: number;
}

export interface RenderWireframeResponse {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: {
    format: string;
    size: number;
    renderTime: number;
  };
}

export interface EnhanceWireframeRequest {
  wireframe: WireframeData;
  enhancementType: EnhancementType;
  model: 'gpt-4' | 'claude-3-opus' | 'claude-3-sonnet';
  specificRequirements?: string;
}

export interface WireframeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  promptTemplate: string;
  sampleData?: Partial<WireframeData>;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  popularity?: number;
}

// Helper type for component tree operations
export interface ComponentTreeNode extends WireframeComponent {
  children: ComponentTreeNode[];
  level: number;
  path: string;
}

// Export type guards
export const isContainerComponent = (type: ComponentType): boolean => {
  const containerTypes: ComponentType[] = [
    'header', 'nav', 'footer', 'sidebar', 'main',
    'container', 'section', 'div', 'article', 'aside',
    'form', 'card'
  ];
  return containerTypes.includes(type);
};

export const isFormComponent = (type: ComponentType): boolean => {
  const formTypes: ComponentType[] = [
    'form', 'input', 'textarea', 'select', 'checkbox', 'radio', 'button'
  ];
  return formTypes.includes(type);
};

export const isInteractiveComponent = (type: ComponentType): boolean => {
  const interactiveTypes: ComponentType[] = [
    'button', 'input', 'textarea', 'select', 'checkbox', 'radio',
    'modal', 'dropdown', 'accordion', 'tabs', 'menu'
  ];
  return interactiveTypes.includes(type);
};
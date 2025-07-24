# Wireframe Generation Technical Specification

## 1. Wireframe Service Architecture

### Core Service Structure
```typescript
// lib/services/wireframe-service.ts
export class WireframeService {
  constructor(
    private aiService: EnhancedClaudeService,
    private promptService: PromptService,
    private dbService: DatabaseService
  ) {}

  async generateWireframe(params: {
    prompt: string;
    model: 'gpt-4' | 'claude-3-opus' | 'claude-3-sonnet';
    userId: string;
    projectId?: string;
    template?: string;
  }): Promise<WireframeResult> {
    // Implementation
  }

  async enhanceWireframe(params: {
    wireframe: WireframeData;
    enhancementType: 'full' | 'accessibility' | 'mobile' | 'interactions';
    model: string;
  }): Promise<WireframeResult> {
    // Implementation
  }

  async renderWireframe(params: {
    wireframe: WireframeData;
    format: 'svg' | 'html' | 'react';
  }): Promise<RenderResult> {
    // Implementation
  }
}
```

### Data Types
```typescript
interface WireframeData {
  title: string;
  description: string;
  layout: {
    type: 'web' | 'mobile' | 'tablet';
    orientation?: 'portrait' | 'landscape';
    dimensions: { width: number; height: number };
  };
  components: WireframeComponent[];
  annotations: Annotation[];
  userFlow?: UserFlowStep[];
  styling?: StyleGuide;
}

interface WireframeComponent {
  id: string;
  type: ComponentType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: string;
  properties: Record<string, any>;
  children?: WireframeComponent[];
}

type ComponentType = 
  | 'header' | 'nav' | 'footer' | 'sidebar'
  | 'button' | 'input' | 'textarea' | 'select'
  | 'card' | 'list' | 'table' | 'image'
  | 'text' | 'heading' | 'paragraph'
  | 'container' | 'section' | 'div';
```

## 2. Prompt Templates

### Base Wireframe Generation Prompt
```typescript
const WIREFRAME_BASE_PROMPT = `
You are an expert UX designer creating detailed wireframes.

Input: {{user_prompt}}

Create a comprehensive wireframe specification with:
1. Layout structure and grid system
2. Component hierarchy and positioning
3. Content placeholders
4. Navigation elements
5. Interactive elements
6. Annotations for developers

Output as JSON following this structure:
{
  "title": "Page/Screen Title",
  "description": "Brief description",
  "layout": { ... },
  "components": [ ... ],
  "annotations": [ ... ]
}
`;
```

### Model-Specific Adaptations
```typescript
const MODEL_ADAPTATIONS = {
  'gpt-4': {
    temperature: 0.7,
    maxTokens: 4000,
    systemPrompt: 'You are a senior UX designer...'
  },
  'claude-3-opus': {
    temperature: 0.8,
    maxTokens: 4096,
    systemPrompt: 'As an expert in user experience design...'
  }
};
```

## 3. Rendering Engine

### SVG Renderer
```typescript
export class WireframeSVGRenderer {
  private readonly GRID_SIZE = 8;
  private readonly COLORS = {
    border: '#E5E7EB',
    fill: '#F9FAFB',
    text: '#374151',
    primary: '#3B82F6',
    secondary: '#6B7280'
  };

  render(wireframe: WireframeData): string {
    const svg = this.createSVGElement(wireframe.layout);
    const elements = this.renderComponents(wireframe.components);
    const annotations = this.renderAnnotations(wireframe.annotations);
    
    return this.assembleSVG(svg, elements, annotations);
  }

  private renderComponent(component: WireframeComponent): SVGElement {
    const renderer = this.componentRenderers[component.type];
    return renderer(component);
  }

  private componentRenderers = {
    button: (c: WireframeComponent) => this.renderButton(c),
    input: (c: WireframeComponent) => this.renderInput(c),
    card: (c: WireframeComponent) => this.renderCard(c),
    // ... more renderers
  };
}
```

### HTML Renderer
```typescript
export class WireframeHTMLRenderer {
  render(wireframe: WireframeData): string {
    const css = this.generateCSS(wireframe.styling);
    const html = this.generateHTML(wireframe.components);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }
}
```

## 4. API Implementation

### Generate Wireframe Endpoint
```typescript
// app/api/wireframe/generate/route.ts
export async function POST(req: NextRequest) {
  const { prompt, model, templateId, projectId } = await req.json();
  
  // Validate input
  const validation = validateWireframeRequest({ prompt, model });
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Get user
  const user = await getAuthenticatedUser(req);
  
  // Load template if provided
  const template = templateId 
    ? await loadWireframeTemplate(templateId)
    : null;

  // Generate wireframe
  const wireframeService = new WireframeService();
  const result = await wireframeService.generateWireframe({
    prompt,
    model,
    userId: user.id,
    projectId,
    template
  });

  // Save to database
  if (projectId) {
    await saveWireframeToProject(projectId, result);
  }

  return NextResponse.json({
    success: true,
    wireframe: result.wireframe,
    metadata: {
      model,
      generationTime: result.generationTime,
      tokensUsed: result.tokensUsed
    }
  });
}
```

### Render Wireframe Endpoint
```typescript
// app/api/wireframe/render/route.ts
export async function POST(req: NextRequest) {
  const { wireframe, format } = await req.json();
  
  const renderer = format === 'svg' 
    ? new WireframeSVGRenderer()
    : new WireframeHTMLRenderer();
    
  const rendered = renderer.render(wireframe);
  
  return NextResponse.json({
    success: true,
    [format]: rendered,
    metadata: {
      format,
      size: rendered.length
    }
  });
}
```

## 5. Frontend Components

### Wireframe Generator Component
```tsx
// components/wireframe-generator.tsx
export function WireframeGenerator({ 
  projectId,
  onGenerated 
}: WireframeGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<AIModel>('gpt-4');
  const [loading, setLoading] = useState(false);
  
  const { data: templates } = useWireframeTemplates();
  const { data: userConfig } = useUserConfiguration();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wireframe/generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          model,
          projectId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        onGenerated(data.wireframe);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Wireframe</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Describe the interface you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">OpenAI GPT-4</SelectItem>
              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleGenerate} 
            disabled={loading || !prompt}
          >
            {loading ? <Loader2 className="animate-spin" /> : <Wand2 />}
            Generate Wireframe
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Wireframe Viewer Component
```tsx
// components/wireframe-viewer.tsx
export function WireframeViewer({ 
  wireframe,
  onEnhance,
  onExport 
}: WireframeViewerProps) {
  const [activeTab, setActiveTab] = useState('visual');
  const [renderedSVG, setRenderedSVG] = useState<string>('');
  
  useEffect(() => {
    if (wireframe) {
      renderWireframe(wireframe, 'svg').then(setRenderedSVG);
    }
  }, [wireframe]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{wireframe.title}</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEnhance}>
              <Sparkles className="h-4 w-4" />
              Enhance
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onExport('svg')}>
                  Export as SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('html')}>
                  Export as HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="annotations">Annotations</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual">
            <div 
              className="border rounded-lg bg-white p-4"
              dangerouslySetInnerHTML={{ __html: renderedSVG }}
            />
          </TabsContent>
          
          <TabsContent value="components">
            <ComponentTree components={wireframe.components} />
          </TabsContent>
          
          <TabsContent value="annotations">
            <AnnotationList annotations={wireframe.annotations} />
          </TabsContent>
          
          <TabsContent value="code">
            <CodeBlock 
              language="json" 
              code={JSON.stringify(wireframe, null, 2)} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

## 6. Integration Points

### 1. Dashboard Integration
```tsx
// In dashboard/page.tsx
const documentTypes = [
  { id: 'business', label: 'Business Analysis' },
  { id: 'functional', label: 'Functional Spec' },
  { id: 'technical', label: 'Technical Spec' },
  { id: 'ux', label: 'UX Specification' },
  { id: 'wireframe', label: 'Wireframe', icon: Layout }, // NEW
];
```

### 2. Document Viewer Integration
```tsx
// In comprehensive-sdlc-viewer.tsx
{documentType === 'wireframe' ? (
  <WireframeViewer 
    wireframe={documentContent}
    onEnhance={handleEnhanceWireframe}
    onExport={handleExportWireframe}
  />
) : (
  <MarkdownRenderer content={documentContent} />
)}
```

### 3. Project Structure Update
```typescript
interface SDLCProject {
  // ... existing fields
  wireframes?: Wireframe[];
}
```

## 7. Testing Strategy

### Unit Tests
- Wireframe service methods
- Rendering engines
- Component renderers
- Prompt generation

### Integration Tests
- API endpoints
- Database operations
- AI service integration

### E2E Tests
- Full generation flow
- Export functionality
- Enhancement features

## 8. Performance Considerations

1. **Caching**
   - Cache rendered SVG/HTML
   - Cache AI responses for similar prompts
   - Use React Query for frontend caching

2. **Optimization**
   - Lazy load rendering engines
   - Stream AI responses
   - Compress SVG output

3. **Limits**
   - Max wireframe complexity
   - Rate limiting per user
   - Storage quotas

## 9. Security Considerations

1. **Input Validation**
   - Sanitize user prompts
   - Validate wireframe data structure
   - Prevent XSS in rendering

2. **Access Control**
   - User owns their wireframes
   - Project-level permissions
   - Admin override capabilities

3. **Data Privacy**
   - Encrypt sensitive wireframe data
   - Audit trail for access
   - GDPR compliance

## 10. Future Enhancements

1. **Collaboration**
   - Real-time editing
   - Comments and feedback
   - Version control

2. **Advanced Features**
   - Animation support
   - Responsive design modes
   - Component library

3. **Integrations**
   - Export to Figma
   - Export to Sketch
   - Generate React components
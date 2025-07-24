import type {
  WireframeData,
  WireframeComponent,
  ComponentType,
  RenderOptions,
  WireframeAnnotation
} from '@/lib/types/wireframe.types';

/**
 * SVG Renderer for wireframes
 */
export class WireframeSVGRenderer {
  private readonly GRID_SIZE = 8;
  private readonly COLORS = {
    background: '#FFFFFF',
    surface: '#F9FAFB',
    border: '#E5E7EB',
    borderDark: '#D1D5DB',
    text: '#374151',
    textLight: '#6B7280',
    primary: '#3B82F6',
    primaryLight: '#DBEAFE',
    secondary: '#6B7280',
    annotation: '#FEF3C7',
    grid: '#F3F4F6'
  };

  private svg: string[] = [];
  private annotations: WireframeAnnotation[] = [];
  private currentY = 0;

  /**
   * Render wireframe to SVG
   */
  render(wireframe: WireframeData, options: RenderOptions = {}): string {
    this.svg = [];
    this.annotations = wireframe.annotations || [];
    
    const { width, height } = wireframe.layout.dimensions;
    
    // Start SVG
    this.svg.push(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">`);
    
    // Add styles
    this.addStyles();
    
    // Add background
    this.svg.push(`<rect width="${width}" height="${height}" fill="${this.COLORS.background}" />`);
    
    // Add grid if requested
    if (options.showGrid) {
      this.renderGrid(width, height);
    }
    
    // Render components
    this.renderComponents(wireframe.components);
    
    // Render annotations if requested
    if (options.showAnnotations && this.annotations.length > 0) {
      this.renderAnnotations();
    }
    
    // Close SVG
    this.svg.push('</svg>');
    
    return this.svg.join('\n');
  }

  /**
   * Add CSS styles to SVG
   */
  private addStyles(): void {
    this.svg.push(`
      <style>
        .wireframe-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .wireframe-component { transition: all 0.2s ease; }
        .wireframe-component:hover { filter: brightness(0.95); }
        .annotation-marker { cursor: help; }
        .annotation-text { font-size: 12px; }
      </style>
    `);
  }

  /**
   * Render grid overlay
   */
  private renderGrid(width: number, height: number): void {
    this.svg.push(`<g class="grid" opacity="0.5">`);
    
    // Vertical lines
    for (let x = 0; x <= width; x += this.GRID_SIZE * 4) {
      this.svg.push(`<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${this.COLORS.grid}" stroke-width="0.5" />`);
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += this.GRID_SIZE * 4) {
      this.svg.push(`<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${this.COLORS.grid}" stroke-width="0.5" />`);
    }
    
    this.svg.push(`</g>`);
  }

  /**
   * Render components recursively
   */
  private renderComponents(components: WireframeComponent[], parentX = 0, parentY = 0): void {
    for (const component of components) {
      const x = parentX + (component.position.x || 0);
      const y = parentY + (component.position.y || 0);
      
      this.renderComponent(component, x, y);
      
      // Render children
      if (component.children && component.children.length > 0) {
        this.renderComponents(component.children, x, y);
      }
    }
  }

  /**
   * Render individual component based on type
   */
  private renderComponent(component: WireframeComponent, x: number, y: number): void {
    const renderer = this.componentRenderers[component.type];
    if (renderer) {
      renderer.call(this, component, x, y);
    } else {
      // Default rectangle for unknown components
      this.renderDefaultComponent(component, x, y);
    }
    
    // Check for annotations on this component
    const componentAnnotations = this.annotations.filter(a => a.componentId === component.id);
    if (componentAnnotations.length > 0) {
      this.renderAnnotationMarker(component, x, y, componentAnnotations.length);
    }
  }

  /**
   * Component-specific renderers
   */
  private componentRenderers: Record<string, (component: WireframeComponent, x: number, y: number) => void> = {
    header: (c, x, y) => this.renderHeader(c, x, y),
    nav: (c, x, y) => this.renderNav(c, x, y),
    button: (c, x, y) => this.renderButton(c, x, y),
    input: (c, x, y) => this.renderInput(c, x, y),
    textarea: (c, x, y) => this.renderTextarea(c, x, y),
    select: (c, x, y) => this.renderSelect(c, x, y),
    card: (c, x, y) => this.renderCard(c, x, y),
    image: (c, x, y) => this.renderImage(c, x, y),
    text: (c, x, y) => this.renderText(c, x, y),
    heading: (c, x, y) => this.renderHeading(c, x, y),
    paragraph: (c, x, y) => this.renderParagraph(c, x, y),
    list: (c, x, y) => this.renderList(c, x, y),
    table: (c, x, y) => this.renderTable(c, x, y),
    form: (c, x, y) => this.renderForm(c, x, y),
    container: (c, x, y) => this.renderContainer(c, x, y),
    section: (c, x, y) => this.renderContainer(c, x, y),
    div: (c, x, y) => this.renderContainer(c, x, y),
  };

  /**
   * Default component renderer
   */
  private renderDefaultComponent(component: WireframeComponent, x: number, y: number): void {
    const width = this.parseSize(component.size.width, 100);
    const height = this.parseSize(component.size.height, 50);
    
    this.svg.push(`
      <g class="wireframe-component" data-component-id="${component.id}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" 
              fill="${this.COLORS.surface}" stroke="${this.COLORS.border}" 
              stroke-width="1" rx="4" />
        <text x="${x + width/2}" y="${y + height/2}" 
              text-anchor="middle" dominant-baseline="middle" 
              fill="${this.COLORS.textLight}" class="wireframe-text" font-size="12">
          ${component.type}
        </text>
      </g>
    `);
  }

  /**
   * Render header component
   */
  private renderHeader(component: WireframeComponent, x: number, y: number): void {
    const width = this.parseSize(component.size.width, 1440);
    const height = this.parseSize(component.size.height, 80);
    
    this.svg.push(`
      <g class="wireframe-component header" data-component-id="${component.id}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" 
              fill="${this.COLORS.surface}" stroke="${this.COLORS.border}" stroke-width="1" />
        <line x1="${x}" y1="${y + height}" x2="${x + width}" y2="${y + height}" 
              stroke="${this.COLORS.borderDark}" stroke-width="2" />
      </g>
    `);
  }

  /**
   * Render navigation component
   */
  private renderNav(component: WireframeComponent, x: number, y: number): void {
    const width = this.parseSize(component.size.width, 600);
    const height = this.parseSize(component.size.height, 40);
    const items = component.properties.items || ['Home', 'About', 'Services', 'Contact'];
    
    this.svg.push(`<g class="wireframe-component nav" data-component-id="${component.id}">`);
    
    const itemWidth = width / items.length;
    items.forEach((item: string, index: number) => {
      const itemX = x + (index * itemWidth);
      this.svg.push(`
        <rect x="${itemX}" y="${y}" width="${itemWidth}" height="${height}" 
              fill="transparent" stroke="${this.COLORS.border}" stroke-width="1" />
        <text x="${itemX + itemWidth/2}" y="${y + height/2}" 
              text-anchor="middle" dominant-baseline="middle" 
              fill="${this.COLORS.text}" class="wireframe-text" font-size="14">
          ${item}
        </text>
      `);
    });
    
    this.svg.push(`</g>`);
  }

  /**
   * Render button component
   */
  private renderButton(component: WireframeComponent, x: number, y: number): void {
    const width = this.parseSize(component.size.width, 120);
    const height = this.parseSize(component.size.height, 40);
    const text = component.content || component.properties.label || 'Button';
    const isPrimary = component.properties.variant === 'primary';
    
    this.svg.push(`
      <g class="wireframe-component button" data-component-id="${component.id}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" 
              fill="${isPrimary ? this.COLORS.primary : this.COLORS.surface}" 
              stroke="${isPrimary ? this.COLORS.primary : this.COLORS.border}" 
              stroke-width="2" rx="6" />
        <text x="${x + width/2}" y="${y + height/2}" 
              text-anchor="middle" dominant-baseline="middle" 
              fill="${isPrimary ? 'white' : this.COLORS.text}" 
              class="wireframe-text" font-size="14" font-weight="500">
          ${text}
        </text>
      </g>
    `);
  }

  /**
   * Render input component
   */
  private renderInput(component: WireframeComponent, x: number, y: number): void {
    const width = this.parseSize(component.size.width, 300);
    const height = this.parseSize(component.size.height, 40);
    const placeholder = component.properties.placeholder || 'Enter text...';
    const label = component.properties.label;
    
    this.svg.push(`<g class="wireframe-component input" data-component-id="${component.id}">`);
    
    let inputY = y;
    if (label) {
      this.svg.push(`
        <text x="${x}" y="${y - 8}" fill="${this.COLORS.text}" 
              class="wireframe-text" font-size="14">
          ${label}
        </text>
      `);
      inputY = y + 20;
    }
    
    this.svg.push(`
      <rect x="${x}" y="${inputY}" width="${width}" height="${height}" 
            fill="white" stroke="${this.COLORS.border}" stroke-width="1" rx="4" />
      <text x="${x + 12}" y="${inputY + height/2}" 
            dominant-baseline="middle" fill="${this.COLORS.textLight}" 
            class="wireframe-text" font-size="14">
        ${placeholder}
      </text>
    `);
    
    this.svg.push(`</g>`);
  }

  /**
   * Render textarea component
   */
  private renderTextarea(component: WireframeComponent, x: number, y: number): void {
    const width = this.parseSize(component.size.width, 300);
    const height = this.parseSize(component.size.height, 120);
    const placeholder = component.properties.placeholder || 'Enter text...';
    const rows = component.properties.rows || 4;
    
    this.svg.push(`
      <g class="wireframe-component textarea" data-component-id="${component.id}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" 
              fill="white" stroke="${this.COLORS.border}" stroke-width="1" rx="4" />
        <text x="${x + 12}" y="${y + 20}" fill="${this.COLORS.textLight}" 
              class="wireframe-text" font-size="14">
          ${placeholder}
        </text>
      </g>
    `);
  }

  /**
   * Render select component
   */
  private renderSelect(component: WireframeComponent, x: number, y: number): void {
    const width = this.parseSize(component.size.width, 200);
    const height = this.parseSize(component.size.height, 40);
    const placeholder = component.properties.placeholder || 'Select option';
    
    this.svg.push(`
      <g class="wireframe-component select" data-component-id="${component.id}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" 
              fill="white" stroke="${this.COLORS.border}" stroke-width="1" rx="4" />
        <text x="${x + 12}" y="${y + height/2}" 
              dominant-baseline="middle" fill="${this.COLORS.textLight}" 
              class="wireframe-text" font-size="14">
          ${placeholder}
        </text>
        <path d="M ${x + width - 24} ${y + height/2 - 4} L ${x + width - 16} ${y + height/2 + 4} L ${x + width - 8} ${y + height/2 - 4}" 
              fill="none" stroke="${this.COLORS.textLight}" stroke-width="2" />
      </g>
    `);
  }

  /**
   * Render card component
   */
  private renderCard(component: WireframeComponent, x: number, y: number): void {
    const width = this.parseSize(component.size.width, 300);
    const height = this.parseSize(component.size.height, 200);
    
    this.svg.push(`
      <g class="wireframe-component card" data-component-id="${component.id}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" 
              fill="white" stroke="${this.COLORS.border}" stroke-width="1" rx="8" />
        <filter id="shadow-${component.id}">
          <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.1"/>
        </filter>
        <rect x="${x}" y="${y}" width="${width}" height="${height}" 
              fill="white" stroke="${this.COLORS.border}" stroke-width="1" rx="8"
              filter="url(#shadow-${component.id})" />
      </g>
    `);
  }

  /**
   * Render image component
   */
  private renderImage(component: WireframeComponent, x: number, y: number): void {
    const width = this.parseSize(component.size.width, 300);
    const height = this.parseSize(component.size.height, 200);
    const alt = component.properties.alt || 'Image';
    
    this.svg.push(`
      <g class="wireframe-component image" data-component-id="${component.id}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" 
              fill="${this.COLORS.surface}" stroke="${this.COLORS.border}" 
              stroke-width="1" rx="4" />
        <line x1="${x}" y1="${y}" x2="${x + width}" y2="${y + height}" 
              stroke="${this.COLORS.border}" stroke-width="1" />
        <line x1="${x + width}" y1="${y}" x2="${x}" y2="${y + height}" 
              stroke="${this.COLORS.border}" stroke-width="1" />
        <text x="${x + width/2}" y="${y + height - 10}" 
              text-anchor="middle" fill="${this.COLORS.textLight}" 
              class="wireframe-text" font-size="12">
          ${alt}
        </text>
      </g>
    `);
  }

  /**
   * Render text component
   */
  private renderText(component: WireframeComponent, x: number, y: number): void {
    const text = component.content || 'Lorem ipsum dolor sit amet';
    const fontSize = component.properties.fontSize || '14';
    
    this.svg.push(`
      <text x="${x}" y="${y}" fill="${this.COLORS.text}" 
            class="wireframe-text" font-size="${fontSize}" 
            data-component-id="${component.id}">
        ${text}
      </text>
    `);
  }

  /**
   * Render heading component
   */
  private renderHeading(component: WireframeComponent, x: number, y: number): void {
    const text = component.content || 'Heading';
    const level = component.properties.level || '1';
    const fontSizes: Record<string, string> = {
      '1': '32',
      '2': '24',
      '3': '20',
      '4': '18',
      '5': '16',
      '6': '14'
    };
    
    this.svg.push(`
      <text x="${x}" y="${y}" fill="${this.COLORS.text}" 
            class="wireframe-text" font-size="${fontSizes[level]}" 
            font-weight="bold" data-component-id="${component.id}">
        ${text}
      </text>
    `);
  }

  /**
   * Render paragraph component
   */
  private renderParagraph(component: WireframeComponent, x: number, y: number): void {
    const width = this.parseSize(component.size.width, 600);
    const text = component.content || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
    const lines = this.wrapText(text, width, 14);
    
    this.svg.push(`<g class="wireframe-component paragraph" data-component-id="${component.id}">`);
    
    lines.forEach((line, index) => {
      this.svg.push(`
        <text x="${x}" y="${y + (index * 20)}" fill="${this.COLORS.text}" 
              class="wireframe-text" font-size="14">
          ${line}
        </text>
      `);
    });
    
    this.svg.push(`</g>`);
  }

  /**
   * Render list component
   */
  private renderList(component: WireframeComponent, x: number, y: number): void {
    const items = component.properties.items || ['Item 1', 'Item 2', 'Item 3'];
    const isOrdered = component.properties.ordered || false;
    
    this.svg.push(`<g class="wireframe-component list" data-component-id="${component.id}">`);
    
    items.forEach((item: string, index: number) => {
      const itemY = y + (index * 24);
      const bullet = isOrdered ? `${index + 1}.` : '•';
      
      this.svg.push(`
        <text x="${x}" y="${itemY}" fill="${this.COLORS.text}" 
              class="wireframe-text" font-size="14">
          ${bullet} ${item}
        </text>
      `);
    });
    
    this.svg.push(`</g>`);
  }

  /**
   * Render table component
   */
  private renderTable(component: WireframeComponent, x: number, y: number): void {
    const width = this.parseSize(component.size.width, 600);
    const columns = component.properties.columns || ['Column 1', 'Column 2', 'Column 3'];
    const rows = component.properties.rows || 3;
    const cellWidth = width / columns.length;
    const cellHeight = 40;
    
    this.svg.push(`<g class="wireframe-component table" data-component-id="${component.id}">`);
    
    // Header
    columns.forEach((col: string, colIndex: number) => {
      const cellX = x + (colIndex * cellWidth);
      this.svg.push(`
        <rect x="${cellX}" y="${y}" width="${cellWidth}" height="${cellHeight}" 
              fill="${this.COLORS.surface}" stroke="${this.COLORS.border}" stroke-width="1" />
        <text x="${cellX + cellWidth/2}" y="${y + cellHeight/2}" 
              text-anchor="middle" dominant-baseline="middle" 
              fill="${this.COLORS.text}" class="wireframe-text" 
              font-size="14" font-weight="bold">
          ${col}
        </text>
      `);
    });
    
    // Rows
    for (let row = 0; row < rows; row++) {
      const rowY = y + ((row + 1) * cellHeight);
      columns.forEach((_, colIndex) => {
        const cellX = x + (colIndex * cellWidth);
        this.svg.push(`
          <rect x="${cellX}" y="${rowY}" width="${cellWidth}" height="${cellHeight}" 
                fill="white" stroke="${this.COLORS.border}" stroke-width="1" />
          <text x="${cellX + cellWidth/2}" y="${rowY + cellHeight/2}" 
                text-anchor="middle" dominant-baseline="middle" 
                fill="${this.COLORS.textLight}" class="wireframe-text" font-size="14">
            Data
          </text>
        `);
      });
    }
    
    this.svg.push(`</g>`);
  }

  /**
   * Render form component
   */
  private renderForm(component: WireframeComponent, x: number, y: number): void {
    const width = this.parseSize(component.size.width, 400);
    const height = this.parseSize(component.size.height, 300);
    
    this.svg.push(`
      <g class="wireframe-component form" data-component-id="${component.id}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" 
              fill="${this.COLORS.surface}" stroke="${this.COLORS.border}" 
              stroke-width="1" rx="8" stroke-dasharray="5,5" />
        <text x="${x + 12}" y="${y - 8}" fill="${this.COLORS.textLight}" 
              class="wireframe-text" font-size="12">
          Form Container
        </text>
      </g>
    `);
  }

  /**
   * Render container component
   */
  private renderContainer(component: WireframeComponent, x: number, y: number): void {
    const width = this.parseSize(component.size.width, 400);
    const height = this.parseSize(component.size.height, 200);
    
    this.svg.push(`
      <g class="wireframe-component container" data-component-id="${component.id}">
        <rect x="${x}" y="${y}" width="${width}" height="${height}" 
              fill="transparent" stroke="${this.COLORS.border}" 
              stroke-width="1" rx="4" stroke-dasharray="3,3" />
      </g>
    `);
  }

  /**
   * Render annotation marker
   */
  private renderAnnotationMarker(component: WireframeComponent, x: number, y: number, count: number): void {
    const markerX = x + this.parseSize(component.size.width, 0) - 20;
    const markerY = y - 10;
    
    this.svg.push(`
      <g class="annotation-marker">
        <circle cx="${markerX}" cy="${markerY}" r="12" 
                fill="${this.COLORS.annotation}" stroke="${this.COLORS.borderDark}" stroke-width="1" />
        <text x="${markerX}" y="${markerY}" 
              text-anchor="middle" dominant-baseline="middle" 
              fill="${this.COLORS.text}" class="annotation-text" font-weight="bold">
          ${count}
        </text>
      </g>
    `);
  }

  /**
   * Render all annotations
   */
  private renderAnnotations(): void {
    const annotationY = 50;
    let currentX = 50;
    
    this.svg.push(`<g class="annotations">`);
    
    this.annotations.forEach((annotation, index) => {
      this.svg.push(`
        <g>
          <rect x="${currentX}" y="${annotationY}" width="200" height="80" 
                fill="${this.COLORS.annotation}" stroke="${this.COLORS.borderDark}" 
                stroke-width="1" rx="4" />
          <text x="${currentX + 10}" y="${annotationY + 20}" 
                fill="${this.COLORS.text}" class="annotation-text" font-weight="bold">
            ${index + 1}. ${annotation.title}
          </text>
          <text x="${currentX + 10}" y="${annotationY + 40}" 
                fill="${this.COLORS.text}" class="annotation-text">
            ${this.truncateText(annotation.note, 25)}
          </text>
        </g>
      `);
      currentX += 220;
    });
    
    this.svg.push(`</g>`);
  }

  /**
   * Parse size value (handles numbers and strings)
   */
  private parseSize(size: number | string, defaultValue: number): number {
    if (typeof size === 'number') return size;
    if (typeof size === 'string') {
      if (size.includes('%')) {
        // For percentage, return default for now
        // TODO: Calculate based on parent size
        return defaultValue;
      }
      return parseInt(size) || defaultValue;
    }
    return defaultValue;
  }

  /**
   * Wrap text to fit within width
   */
  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    const charWidth = fontSize * 0.6; // Approximate character width
    const maxChars = Math.floor(maxWidth / charWidth);
    
    words.forEach(word => {
      if ((currentLine + word).length > maxChars) {
        if (currentLine) {
          lines.push(currentLine.trim());
          currentLine = word + ' ';
        } else {
          lines.push(word);
        }
      } else {
        currentLine += word + ' ';
      }
    });
    
    if (currentLine) {
      lines.push(currentLine.trim());
    }
    
    return lines;
  }

  /**
   * Truncate text to specified length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}

/**
 * HTML Renderer for wireframes
 */
export class WireframeHTMLRenderer {
  /**
   * Render wireframe to HTML
   */
  render(wireframe: WireframeData, options: RenderOptions = {}): string {
    const html: string[] = [];
    const { width, height } = wireframe.layout.dimensions;
    
    // Start HTML document
    html.push(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${wireframe.title}</title>
  <style>
    ${this.generateCSS(wireframe, options)}
  </style>
</head>
<body>
  <div class="wireframe-container" style="width: ${width}px; height: ${height}px;">
`);
    
    // Render components
    html.push(this.renderComponents(wireframe.components));
    
    // Render annotations if requested
    if (options.showAnnotations && wireframe.annotations?.length) {
      html.push(this.renderAnnotations(wireframe.annotations));
    }
    
    // Close HTML
    html.push(`
  </div>
</body>
</html>
`);
    
    return html.join('\n');
  }

  /**
   * Generate CSS for the wireframe
   */
  private generateCSS(wireframe: WireframeData, options: RenderOptions): string {
    return `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    
    .wireframe-container {
      background: white;
      position: relative;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .wireframe-component {
      position: absolute;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
    }
    
    .component-header {
      background: #f9fafb;
      border-bottom: 2px solid #d1d5db;
    }
    
    .component-button {
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .component-button:hover {
      background: #e5e7eb;
    }
    
    .component-button.primary {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }
    
    .component-button.primary:hover {
      background: #2563eb;
    }
    
    .component-input,
    .component-textarea,
    .component-select {
      background: white;
      padding: 8px 12px;
      border-radius: 4px;
    }
    
    .component-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 16px;
    }
    
    .component-image {
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      border-radius: 4px;
    }
    
    .annotations {
      position: absolute;
      top: 20px;
      right: 20px;
      background: #fef3c7;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      padding: 12px;
      max-width: 300px;
      font-size: 12px;
    }
    
    .annotation-item {
      margin-bottom: 8px;
    }
    
    .annotation-title {
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    ${options.showGrid ? `
    .wireframe-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        repeating-linear-gradient(0deg, #f3f4f6 0px, #f3f4f6 1px, transparent 1px, transparent 32px),
        repeating-linear-gradient(90deg, #f3f4f6 0px, #f3f4f6 1px, transparent 1px, transparent 32px);
      pointer-events: none;
      opacity: 0.5;
    }
    ` : ''}
    `;
  }

  /**
   * Render components as HTML
   */
  private renderComponents(components: WireframeComponent[]): string {
    return components.map(component => this.renderComponent(component)).join('\n');
  }

  /**
   * Render individual component
   */
  private renderComponent(component: WireframeComponent): string {
    const style = this.getComponentStyle(component);
    const className = `wireframe-component component-${component.type}`;
    
    const content = this.getComponentContent(component);
    const children = component.children ? this.renderComponents(component.children) : '';
    
    return `
      <div id="${component.id}" class="${className}" style="${style}">
        ${content}
        ${children}
      </div>
    `;
  }

  /**
   * Get component style string
   */
  private getComponentStyle(component: WireframeComponent): string {
    const styles: string[] = [];
    
    styles.push(`left: ${component.position.x}px`);
    styles.push(`top: ${component.position.y}px`);
    styles.push(`width: ${component.size.width}${typeof component.size.width === 'number' ? 'px' : ''}`);
    styles.push(`height: ${component.size.height}${typeof component.size.height === 'number' ? 'px' : ''}`);
    
    if (component.style) {
      Object.entries(component.style).forEach(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        styles.push(`${cssKey}: ${value}`);
      });
    }
    
    return styles.join('; ');
  }

  /**
   * Get component content based on type
   */
  private getComponentContent(component: WireframeComponent): string {
    switch (component.type) {
      case 'button':
        return component.content || component.properties.label || 'Button';
      
      case 'heading':
        const level = component.properties.level || '1';
        return `<h${level}>${component.content || 'Heading'}</h${level}>`;
      
      case 'paragraph':
        return `<p>${component.content || 'Lorem ipsum dolor sit amet.'}</p>`;
      
      case 'input':
        return `<input type="text" placeholder="${component.properties.placeholder || 'Enter text...'}" />`;
      
      case 'textarea':
        return `<textarea placeholder="${component.properties.placeholder || 'Enter text...'}" rows="${component.properties.rows || 4}"></textarea>`;
      
      case 'select':
        const options = component.properties.items || ['Option 1', 'Option 2', 'Option 3'];
        return `
          <select>
            <option>${component.properties.placeholder || 'Select option'}</option>
            ${options.map((opt: string) => `<option>${opt}</option>`).join('')}
          </select>
        `;
      
      case 'image':
        return `<div class="image-placeholder">${component.properties.alt || 'Image'}</div>`;
      
      case 'list':
        const items = component.properties.items || ['Item 1', 'Item 2', 'Item 3'];
        const listTag = component.properties.ordered ? 'ol' : 'ul';
        return `
          <${listTag}>
            ${items.map((item: string) => `<li>${item}</li>`).join('')}
          </${listTag}>
        `;
      
      case 'text':
      default:
        return component.content || '';
    }
  }

  /**
   * Render annotations
   */
  private renderAnnotations(annotations: WireframeAnnotation[]): string {
    return `
      <div class="annotations">
        <h4>Annotations</h4>
        ${annotations.map((annotation, index) => `
          <div class="annotation-item">
            <div class="annotation-title">${index + 1}. ${annotation.title}</div>
            <div>${annotation.note}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// Export renderer instances
export const svgRenderer = new WireframeSVGRenderer();
export const htmlRenderer = new WireframeHTMLRenderer();
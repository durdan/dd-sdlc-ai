"""
Wireframe Rendering Service

This service enhances the wireframe generation by creating visual representations
of the wireframe specifications, including SVG generation, HTML/CSS output,
and detailed styling that mimics professional UX designer output.
"""

import json
import xml.etree.ElementTree as ET
from typing import Dict, List, Any, Tuple
import re
from datetime import datetime

class WireframeRenderer:
    """Enhanced wireframe renderer that creates professional visual output."""
    
    def __init__(self):
        self.default_colors = {
            'background': '#ffffff',
            'border': '#cccccc',
            'text': '#333333',
            'primary': '#007bff',
            'secondary': '#6c757d',
            'success': '#28a745',
            'warning': '#ffc107',
            'danger': '#dc3545',
            'light': '#f8f9fa',
            'dark': '#343a40'
        }
        
        self.component_styles = {
            'header': {
                'backgroundColor': '#f8f9fa',
                'borderBottom': '2px solid #dee2e6',
                'padding': '16px 24px',
                'fontSize': '24px',
                'fontWeight': 'bold'
            },
            'navigation': {
                'backgroundColor': '#343a40',
                'color': '#ffffff',
                'padding': '12px 0',
                'fontSize': '16px'
            },
            'button': {
                'backgroundColor': '#007bff',
                'color': '#ffffff',
                'border': 'none',
                'borderRadius': '4px',
                'padding': '8px 16px',
                'fontSize': '14px',
                'cursor': 'pointer'
            },
            'input': {
                'border': '1px solid #ced4da',
                'borderRadius': '4px',
                'padding': '8px 12px',
                'fontSize': '14px',
                'backgroundColor': '#ffffff'
            },
            'card': {
                'backgroundColor': '#ffffff',
                'border': '1px solid #dee2e6',
                'borderRadius': '8px',
                'padding': '16px',
                'boxShadow': '0 2px 4px rgba(0,0,0,0.1)'
            },
            'sidebar': {
                'backgroundColor': '#f8f9fa',
                'borderRight': '1px solid #dee2e6',
                'padding': '16px'
            },
            'content': {
                'backgroundColor': '#ffffff',
                'padding': '24px'
            },
            'footer': {
                'backgroundColor': '#f8f9fa',
                'borderTop': '1px solid #dee2e6',
                'padding': '16px 24px',
                'fontSize': '14px',
                'color': '#6c757d'
            }
        }
    
    def render_svg_wireframe(self, wireframe_data: Dict[str, Any]) -> str:
        """Generate SVG representation of the wireframe."""
        
        # Create SVG root element
        svg = ET.Element('svg')
        svg.set('width', '1200')
        svg.set('height', '800')
        svg.set('viewBox', '0 0 1200 800')
        svg.set('xmlns', 'http://www.w3.org/2000/svg')
        
        # Add styles
        style_element = ET.SubElement(svg, 'style')
        style_element.text = self._generate_svg_styles()
        
        # Add background
        background = ET.SubElement(svg, 'rect')
        background.set('width', '100%')
        background.set('height', '100%')
        background.set('fill', '#ffffff')
        background.set('stroke', '#cccccc')
        background.set('stroke-width', '2')
        
        # Add title
        title_group = ET.SubElement(svg, 'g')
        title_text = ET.SubElement(title_group, 'text')
        title_text.set('x', '20')
        title_text.set('y', '30')
        title_text.set('class', 'wireframe-title')
        title_text.text = wireframe_data.get('title', 'Wireframe')
        
        # Add description
        if wireframe_data.get('description'):
            desc_text = ET.SubElement(title_group, 'text')
            desc_text.set('x', '20')
            desc_text.set('y', '50')
            desc_text.set('class', 'wireframe-description')
            desc_text.text = wireframe_data['description']
        
        # Render components
        components = wireframe_data.get('components', [])
        for component in components:
            self._render_svg_component(svg, component)
        
        # Add annotations
        annotations = wireframe_data.get('annotations', [])
        for i, annotation in enumerate(annotations):
            self._render_svg_annotation(svg, annotation, i)
        
        # Convert to string
        return ET.tostring(svg, encoding='unicode')
    
    def _generate_svg_styles(self) -> str:
        """Generate CSS styles for SVG elements."""
        return """
        .wireframe-title {
            font-family: Arial, sans-serif;
            font-size: 18px;
            font-weight: bold;
            fill: #333333;
        }
        .wireframe-description {
            font-family: Arial, sans-serif;
            font-size: 12px;
            fill: #666666;
        }
        .component-text {
            font-family: Arial, sans-serif;
            font-size: 12px;
            fill: #333333;
        }
        .component-label {
            font-family: Arial, sans-serif;
            font-size: 10px;
            fill: #666666;
        }
        .annotation-text {
            font-family: Arial, sans-serif;
            font-size: 10px;
            fill: #007bff;
        }
        """
    
    def _render_svg_component(self, svg: ET.Element, component: Dict[str, Any]) -> None:
        """Render a single component in SVG."""
        position = component.get('position', {})
        x = position.get('x', 0)
        y = position.get('y', 0) + 70  # Offset for title area
        width = position.get('width', 100)
        height = position.get('height', 50)
        
        component_type = component.get('type', 'generic')
        properties = component.get('properties', {})
        
        # Create component group
        group = ET.SubElement(svg, 'g')
        group.set('class', f'component-{component_type}')
        
        # Component background
        rect = ET.SubElement(group, 'rect')
        rect.set('x', str(x))
        rect.set('y', str(y))
        rect.set('width', str(width))
        rect.set('height', str(height))
        rect.set('fill', properties.get('backgroundColor', '#ffffff'))
        rect.set('stroke', '#cccccc')
        rect.set('stroke-width', '1')
        rect.set('rx', properties.get('borderRadius', '0').replace('px', ''))
        
        # Component label
        label = ET.SubElement(group, 'text')
        label.set('x', str(x + 4))
        label.set('y', str(y + 12))
        label.set('class', 'component-label')
        label.text = component_type.upper()
        
        # Component content
        content = component.get('content', '')
        if content and len(content) < 50:  # Only show short content
            content_text = ET.SubElement(group, 'text')
            content_text.set('x', str(x + 4))
            content_text.set('y', str(y + height - 8))
            content_text.set('class', 'component-text')
            content_text.text = content[:30] + ('...' if len(content) > 30 else '')
        
        # Special rendering for specific component types
        if component_type == 'button':
            rect.set('fill', '#007bff')
            if content_text is not None:
                content_text.set('fill', '#ffffff')
        elif component_type == 'image':
            # Add image placeholder
            line1 = ET.SubElement(group, 'line')
            line1.set('x1', str(x + 10))
            line1.set('y1', str(y + 20))
            line1.set('x2', str(x + width - 10))
            line1.set('y2', str(y + height - 10))
            line1.set('stroke', '#cccccc')
            line1.set('stroke-width', '2')
            
            line2 = ET.SubElement(group, 'line')
            line2.set('x1', str(x + width - 10))
            line2.set('y1', str(y + 20))
            line2.set('x2', str(x + 10))
            line2.set('y2', str(y + height - 10))
            line2.set('stroke', '#cccccc')
            line2.set('stroke-width', '2')
    
    def _render_svg_annotation(self, svg: ET.Element, annotation: Dict[str, Any], index: int) -> None:
        """Render annotation callouts in SVG."""
        # Find the component this annotation refers to
        component_id = annotation.get('componentId')
        if not component_id:
            return
        
        # Position annotation to the right of the wireframe
        x = 1000
        y = 100 + (index * 60)
        
        # Annotation background
        rect = ET.SubElement(svg, 'rect')
        rect.set('x', str(x))
        rect.set('y', str(y))
        rect.set('width', '180')
        rect.set('height', '50')
        rect.set('fill', '#f8f9fa')
        rect.set('stroke', '#007bff')
        rect.set('stroke-width', '1')
        rect.set('rx', '4')
        
        # Annotation number
        circle = ET.SubElement(svg, 'circle')
        circle.set('cx', str(x + 15))
        circle.set('cy', str(y + 15))
        circle.set('r', '8')
        circle.set('fill', '#007bff')
        
        number = ET.SubElement(svg, 'text')
        number.set('x', str(x + 15))
        number.set('y', str(y + 19))
        number.set('text-anchor', 'middle')
        number.set('class', 'annotation-text')
        number.set('fill', '#ffffff')
        number.text = str(index + 1)
        
        # Annotation text
        note_text = annotation.get('note', '')
        if len(note_text) > 40:
            note_text = note_text[:40] + '...'
        
        text = ET.SubElement(svg, 'text')
        text.set('x', str(x + 30))
        text.set('y', str(y + 20))
        text.set('class', 'annotation-text')
        text.text = note_text
        
        # Annotation type
        type_text = ET.SubElement(svg, 'text')
        type_text.set('x', str(x + 30))
        type_text.set('y', str(y + 35))
        type_text.set('class', 'annotation-text')
        type_text.set('font-size', '9')
        type_text.text = f"Type: {annotation.get('type', 'general')}"
    
    def render_html_wireframe(self, wireframe_data: Dict[str, Any]) -> str:
        """Generate HTML/CSS representation of the wireframe."""
        
        html_template = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{title}</title>
            <style>
                {styles}
            </style>
        </head>
        <body>
            <div class="wireframe-container">
                <div class="wireframe-header">
                    <h1>{title}</h1>
                    <p class="description">{description}</p>
                    <div class="metadata">
                        <span>Generated: {timestamp}</span>
                        <span>Components: {component_count}</span>
                    </div>
                </div>
                <div class="wireframe-content">
                    {components_html}
                </div>
                <div class="wireframe-annotations">
                    <h3>Design Annotations</h3>
                    {annotations_html}
                </div>
            </div>
        </body>
        </html>
        """
        
        # Generate CSS styles
        styles = self._generate_html_styles()
        
        # Generate components HTML
        components_html = self._generate_components_html(wireframe_data.get('components', []))
        
        # Generate annotations HTML
        annotations_html = self._generate_annotations_html(wireframe_data.get('annotations', []))
        
        # Fill template
        return html_template.format(
            title=wireframe_data.get('title', 'Wireframe'),
            description=wireframe_data.get('description', ''),
            timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            component_count=len(wireframe_data.get('components', [])),
            styles=styles,
            components_html=components_html,
            annotations_html=annotations_html
        )
    
    def _generate_html_styles(self) -> str:
        """Generate CSS styles for HTML wireframe."""
        return """
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .wireframe-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .wireframe-header {
            border-bottom: 2px solid #dee2e6;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .wireframe-header h1 {
            font-size: 2.5rem;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .description {
            font-size: 1.1rem;
            color: #6c757d;
            margin-bottom: 15px;
        }
        
        .metadata {
            display: flex;
            gap: 20px;
            font-size: 0.9rem;
            color: #6c757d;
        }
        
        .wireframe-content {
            position: relative;
            min-height: 600px;
            border: 2px dashed #dee2e6;
            margin-bottom: 30px;
            background: #fafafa;
        }
        
        .component {
            position: absolute;
            border: 1px solid #adb5bd;
            background: white;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .component-header {
            background: #e9ecef;
            padding: 4px 8px;
            font-size: 0.75rem;
            font-weight: bold;
            color: #495057;
            border-bottom: 1px solid #adb5bd;
        }
        
        .component-content {
            padding: 8px;
            flex: 1;
            font-size: 0.85rem;
            overflow: hidden;
        }
        
        .component-button {
            background: #007bff;
            color: white;
            border: none;
            cursor: pointer;
        }
        
        .component-button .component-header {
            background: #0056b3;
        }
        
        .component-input {
            background: white;
            border: 2px solid #ced4da;
        }
        
        .component-image {
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
        }
        
        .wireframe-annotations {
            border-top: 2px solid #dee2e6;
            padding-top: 20px;
        }
        
        .wireframe-annotations h3 {
            color: #2c3e50;
            margin-bottom: 15px;
        }
        
        .annotation {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 4px;
        }
        
        .annotation-header {
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 5px;
        }
        
        .annotation-type {
            font-size: 0.8rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        """
    
    def _generate_components_html(self, components: List[Dict[str, Any]]) -> str:
        """Generate HTML for wireframe components."""
        html_parts = []
        
        for component in components:
            position = component.get('position', {})
            properties = component.get('properties', {})
            component_type = component.get('type', 'generic')
            content = component.get('content', '')
            
            # Calculate styles
            styles = [
                f"left: {position.get('x', 0)}px",
                f"top: {position.get('y', 0)}px",
                f"width: {position.get('width', 100)}px",
                f"height: {position.get('height', 50)}px"
            ]
            
            # Add component-specific styles
            if properties.get('backgroundColor'):
                styles.append(f"background-color: {properties['backgroundColor']}")
            if properties.get('borderRadius'):
                styles.append(f"border-radius: {properties['borderRadius']}")
            
            style_attr = "; ".join(styles)
            
            # Generate component HTML
            component_html = f"""
            <div class="component component-{component_type}" style="{style_attr}">
                <div class="component-header">{component_type.upper()}</div>
                <div class="component-content">{content}</div>
            </div>
            """
            
            html_parts.append(component_html)
        
        return "\n".join(html_parts)
    
    def _generate_annotations_html(self, annotations: List[Dict[str, Any]]) -> str:
        """Generate HTML for wireframe annotations."""
        html_parts = []
        
        for i, annotation in enumerate(annotations):
            annotation_html = f"""
            <div class="annotation">
                <div class="annotation-header">
                    #{i + 1} - Component: {annotation.get('componentId', 'Unknown')}
                </div>
                <div class="annotation-content">
                    {annotation.get('note', 'No description provided')}
                </div>
                <div class="annotation-type">
                    {annotation.get('type', 'general')}
                </div>
            </div>
            """
            html_parts.append(annotation_html)
        
        return "\n".join(html_parts) if html_parts else "<p>No annotations available.</p>"
    
    def generate_design_specifications(self, wireframe_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed design specifications document."""
        
        specifications = {
            "project_info": {
                "title": wireframe_data.get('title', 'Untitled Wireframe'),
                "description": wireframe_data.get('description', ''),
                "created_date": datetime.now().isoformat(),
                "version": "1.0"
            },
            "layout_specifications": self._analyze_layout(wireframe_data),
            "component_specifications": self._analyze_components(wireframe_data.get('components', [])),
            "design_system": self._generate_design_system(wireframe_data),
            "user_flow": wireframe_data.get('userFlow', []),
            "accessibility_notes": self._generate_accessibility_notes(wireframe_data),
            "responsive_considerations": self._generate_responsive_notes(wireframe_data),
            "development_notes": self._generate_development_notes(wireframe_data)
        }
        
        return specifications
    
    def _analyze_layout(self, wireframe_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze and document layout specifications."""
        layout = wireframe_data.get('layout', {})
        
        return {
            "grid_system": layout.get('type', 'flexbox'),
            "columns": layout.get('columns', 12),
            "breakpoints": layout.get('breakpoints', ['mobile', 'tablet', 'desktop']),
            "spacing_system": "8px base unit",
            "max_width": "1200px",
            "margins": "24px"
        }
    
    def _analyze_components(self, components: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze and document component specifications."""
        component_specs = []
        
        for component in components:
            spec = {
                "id": component.get('id', 'unknown'),
                "type": component.get('type', 'generic'),
                "position": component.get('position', {}),
                "properties": component.get('properties', {}),
                "states": component.get('states', ['default']),
                "interactions": component.get('interactions', []),
                "content_requirements": self._analyze_content_requirements(component),
                "accessibility_requirements": self._analyze_accessibility_requirements(component)
            }
            component_specs.append(spec)
        
        return component_specs
    
    def _analyze_content_requirements(self, component: Dict[str, Any]) -> Dict[str, str]:
        """Analyze content requirements for a component."""
        component_type = component.get('type', 'generic')
        content = component.get('content', '')
        
        requirements = {
            "content_type": "text",
            "max_length": "unlimited",
            "format": "plain text"
        }
        
        if component_type == 'button':
            requirements.update({
                "content_type": "action text",
                "max_length": "25 characters",
                "format": "title case"
            })
        elif component_type == 'image':
            requirements.update({
                "content_type": "image",
                "format": "JPG, PNG, WebP",
                "aspect_ratio": "16:9 recommended"
            })
        elif component_type == 'input':
            requirements.update({
                "content_type": "user input",
                "placeholder": "required",
                "validation": "as needed"
            })
        
        return requirements
    
    def _analyze_accessibility_requirements(self, component: Dict[str, Any]) -> List[str]:
        """Analyze accessibility requirements for a component."""
        component_type = component.get('type', 'generic')
        requirements = []
        
        if component_type == 'button':
            requirements.extend([
                "Must have descriptive text or aria-label",
                "Keyboard accessible (Tab, Enter, Space)",
                "Focus indicator required",
                "Minimum 44px touch target"
            ])
        elif component_type == 'input':
            requirements.extend([
                "Associated label required",
                "Error states must be announced",
                "Placeholder text should not replace labels",
                "Keyboard navigation support"
            ])
        elif component_type == 'image':
            requirements.extend([
                "Alt text required for content images",
                "Decorative images should have empty alt",
                "Consider high contrast alternatives"
            ])
        
        return requirements
    
    def _generate_design_system(self, wireframe_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate design system specifications."""
        return {
            "colors": self.default_colors,
            "typography": {
                "primary_font": "system-ui, -apple-system, sans-serif",
                "heading_scale": "1.25 (Major Third)",
                "base_size": "16px",
                "line_height": "1.6"
            },
            "spacing": {
                "base_unit": "8px",
                "scale": [4, 8, 16, 24, 32, 48, 64, 96]
            },
            "borders": {
                "radius": [0, 4, 8, 16],
                "width": [1, 2, 4]
            },
            "shadows": {
                "small": "0 1px 3px rgba(0,0,0,0.12)",
                "medium": "0 4px 6px rgba(0,0,0,0.12)",
                "large": "0 10px 25px rgba(0,0,0,0.12)"
            }
        }
    
    def _generate_accessibility_notes(self, wireframe_data: Dict[str, Any]) -> List[str]:
        """Generate accessibility considerations."""
        return [
            "Ensure minimum 4.5:1 color contrast ratio for text",
            "All interactive elements must be keyboard accessible",
            "Provide alternative text for images and icons",
            "Use semantic HTML elements for proper structure",
            "Implement proper heading hierarchy (h1-h6)",
            "Ensure focus indicators are visible and clear",
            "Test with screen readers and keyboard navigation",
            "Provide skip links for main content areas"
        ]
    
    def _generate_responsive_notes(self, wireframe_data: Dict[str, Any]) -> Dict[str, List[str]]:
        """Generate responsive design considerations."""
        return {
            "mobile": [
                "Stack components vertically",
                "Increase touch target sizes to minimum 44px",
                "Simplify navigation to hamburger menu",
                "Optimize content hierarchy for small screens"
            ],
            "tablet": [
                "Adapt grid to 8-column layout",
                "Maintain readable text sizes",
                "Consider both portrait and landscape orientations",
                "Optimize for touch and mouse interactions"
            ],
            "desktop": [
                "Utilize full 12-column grid system",
                "Implement hover states for interactive elements",
                "Consider keyboard shortcuts for power users",
                "Optimize for larger screen real estate"
            ]
        }
    
    def _generate_development_notes(self, wireframe_data: Dict[str, Any]) -> List[str]:
        """Generate development implementation notes."""
        return [
            "Use semantic HTML5 elements for proper structure",
            "Implement CSS Grid or Flexbox for layout",
            "Consider component-based architecture (React, Vue, etc.)",
            "Implement proper error handling and loading states",
            "Optimize images and assets for web delivery",
            "Ensure cross-browser compatibility",
            "Implement proper form validation",
            "Consider performance optimization techniques",
            "Plan for internationalization if needed",
            "Implement proper SEO meta tags and structure"
        ]


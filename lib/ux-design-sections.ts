/**
 * UX Design Sections
 * Provides specialized prompts for different UX design focus areas
 */

export interface UXSection {
  id: string
  name: string
  icon: string
  description: string
  detailedDescription: string
  bestFor: string[]
  outputSections: string[]
  prompt: string
}

export const uxDesignSections: Record<string, UXSection> = {
  'user-personas': {
    id: 'user-personas',
    name: 'User Personas',
    icon: '👤',
    description: 'Target user profiles',
    detailedDescription: 'Detailed user personas including demographics, goals, pain points, behaviors, and journey mapping.',
    bestFor: [
      'User-centered design',
      'Market segmentation',
      'Feature prioritization',
      'Marketing strategy'
    ],
    outputSections: [
      'Primary Personas',
      'Secondary Personas',
      'User Goals & Needs',
      'Pain Points',
      'Behavioral Patterns'
    ],
    prompt: `As a Senior UX Designer, create comprehensive User Personas.

Project Description: {{input}}

Generate detailed User Personas including:

## 1. Primary Personas (2-3)
For each persona:

### Persona Name: [Memorable name]
#### Demographics
- **Age**: [Age range]
- **Occupation**: [Job title/Industry]
- **Location**: [Geographic location]
- **Education**: [Education level]
- **Tech Savviness**: [Low/Medium/High]
- **Income**: [Income bracket]

#### Background & Context
- Professional background
- Personal situation
- Lifestyle factors
- Technology usage

#### Goals & Motivations
- Primary goals (what they want to achieve)
- Secondary goals
- Underlying motivations
- Success metrics

#### Pain Points & Frustrations
- Current challenges
- Existing solution problems
- Unmet needs
- Workarounds they use

#### Behavioral Patterns
- Daily routines
- Decision-making process
- Information sources
- Communication preferences

#### Technology Profile
- Devices used
- Software/apps preferred
- Digital literacy level
- Online behavior

#### Quote
"[Representative quote that captures their perspective]"

#### Scenario
Brief narrative of how they would use the solution

## 2. Secondary Personas (1-2)
[Similar structure but less detailed]

## 3. Anti-Personas
Users we are NOT designing for:
- Who they are
- Why we're not targeting them
- How to avoid confusion

## 4. Persona Relationships
- How personas interact
- Shared touchpoints
- Conflicting needs
- Priority hierarchy

## 5. User Journey Overview
For primary personas:
- Awareness stage
- Consideration stage
- Decision stage
- Onboarding stage
- Usage stage
- Advocacy stage

## 6. Design Implications
- Feature priorities per persona
- UI/UX preferences
- Content strategy
- Communication tone

Format as professional UX documentation with visual persona cards.`
  },

  'journey-maps': {
    id: 'journey-maps',
    name: 'Journey Maps',
    icon: '🗺️',
    description: 'User journey and touchpoints',
    detailedDescription: 'Comprehensive user journey maps showing touchpoints, emotions, opportunities, and pain points across the entire user experience.',
    bestFor: [
      'Experience optimization',
      'Touchpoint analysis',
      'Service design',
      'Customer experience improvement'
    ],
    outputSections: [
      'Journey Stages',
      'Touchpoints',
      'Emotions & Thoughts',
      'Pain Points',
      'Opportunities'
    ],
    prompt: `As a Senior UX Designer, create comprehensive User Journey Maps.

Project Description: {{input}}

Generate detailed Journey Maps including:

## 1. Journey Overview
- **Journey Name**: [Descriptive title]
- **Persona**: [Which user persona]
- **Scenario**: [Context and goal]
- **Timeframe**: [Duration of journey]

## 2. Journey Stages
For each stage:

### Stage Name
#### Actions
- What the user does
- Steps taken
- Decisions made

#### Touchpoints
- **Digital**: [Websites, apps, emails]
- **Physical**: [Stores, products, documents]
- **Human**: [Support, sales, peers]

#### Thoughts & Questions
- What they're thinking
- Questions they have
- Concerns arising
- Information needed

#### Emotions
- Emotional state (scale: 😟 to 😊)
- Stress level
- Confidence level
- Satisfaction level

#### Pain Points
- Frustrations experienced
- Barriers encountered
- Confusion points
- Inefficiencies

#### Opportunities
- Improvement areas
- Feature ideas
- Service enhancements
- Quick wins

## 3. Detailed Journey Stages

### 1. Awareness
- How users discover the need
- Information sources
- Initial research
- First impressions

### 2. Consideration
- Evaluation process
- Comparison activities
- Decision criteria
- Information gathering

### 3. Acquisition/Onboarding
- Sign-up process
- Initial setup
- First-time experience
- Learning curve

### 4. Usage
- Regular interaction
- Feature discovery
- Task completion
- Problem-solving

### 5. Support
- Help-seeking behavior
- Support interactions
- Problem resolution
- Feedback provision

### 6. Retention/Advocacy
- Continued usage
- Renewal decision
- Recommendation behavior
- Community engagement

## 4. Emotional Journey
Graph showing emotional highs and lows throughout the journey

## 5. Moments of Truth
Critical moments that make or break the experience:
- First impression
- Onboarding completion
- First value realization
- Problem resolution
- Renewal decision

## 6. Channel Analysis
- Preferred channels by stage
- Channel transitions
- Cross-channel consistency
- Channel optimization

## 7. Improvement Recommendations
### Quick Wins
- Immediate improvements
- Low effort, high impact

### Strategic Initiatives
- Long-term improvements
- Systemic changes
- Innovation opportunities

## 8. Success Metrics
- Journey completion rate
- Time to value
- Satisfaction scores
- Drop-off points
- Support tickets

Format as a visual journey map with clear stage progression.`
  },

  'wireframes': {
    id: 'wireframes',
    name: 'Wireframes',
    icon: '📐',
    description: 'Low-fidelity mockups',
    detailedDescription: 'Detailed wireframe specifications including layout descriptions, component placement, interaction patterns, and responsive considerations.',
    bestFor: [
      'Visual communication',
      'Layout planning',
      'Functionality demonstration',
      'Development handoff'
    ],
    outputSections: [
      'Page Layouts',
      'Component Library',
      'Interaction Patterns',
      'Navigation Structure',
      'Responsive Behavior'
    ],
    prompt: `As a Senior UX Designer, create comprehensive Wireframe Specifications.

Project Description: {{input}}

Generate detailed Wireframe Specifications including:

## 1. Wireframe Overview
- **Purpose**: [What these wireframes demonstrate]
- **Fidelity Level**: [Low/Medium]
- **Scope**: [Pages/Features covered]
- **Device Types**: [Desktop/Tablet/Mobile]

## 2. Information Architecture
### Site Map
- Primary navigation structure
- Secondary navigation
- Footer links
- Utility navigation

### Page Hierarchy
- Homepage
- Main sections
- Sub-pages
- Special pages (login, error, etc.)

## 3. Layout Grid System
- **Grid Type**: [12-column, 8-column, etc.]
- **Breakpoints**: 
  - Mobile: 320-767px
  - Tablet: 768-1023px
  - Desktop: 1024px+
- **Margins**: [Spacing specifications]
- **Gutters**: [Column spacing]

## 4. Key Page Wireframes

### Homepage
#### Header Section
- Logo placement
- Navigation menu
- Search bar
- User account area
- CTA buttons

#### Hero Section
- Headline placement
- Subheadline
- Hero image/video area
- Primary CTA
- Secondary CTA

#### Content Sections
- Feature blocks
- Content cards
- Testimonials
- Statistics

#### Footer
- Link columns
- Social media
- Newsletter signup
- Legal links

### Product/Service Pages
- Product header
- Image gallery
- Description area
- Specifications
- CTA placement
- Related items

### User Dashboard
- Navigation sidebar
- Summary widgets
- Data tables
- Action buttons
- Filters and search

## 5. Component Specifications

### Navigation Components
- Main menu behavior
- Dropdown menus
- Breadcrumbs
- Pagination
- Tabs

### Form Components
- Input fields
- Dropdowns
- Radio buttons
- Checkboxes
- File uploads
- Validation messages

### Content Components
- Cards
- Lists
- Tables
- Accordions
- Modals
- Tooltips

## 6. Interaction Patterns
### User Actions
- Click behaviors
- Hover states
- Form submissions
- Drag and drop
- Swipe gestures (mobile)

### System Feedback
- Loading states
- Success messages
- Error handling
- Progress indicators
- Confirmations

## 7. Responsive Behavior
### Mobile Adaptations
- Navigation transformation
- Content stacking
- Touch targets
- Gesture support

### Tablet Adaptations
- Layout adjustments
- Navigation changes
- Content density

## 8. Accessibility Considerations
- Heading hierarchy
- Focus order
- Touch target sizes
- Color contrast notes
- Screen reader considerations

## 9. Annotations
### Functional Notes
- Dynamic content areas
- Conditional displays
- Data sources
- Interaction details

### Development Notes
- Technical constraints
- API dependencies
- Performance considerations
- Third-party integrations

Format as detailed wireframe documentation with layout descriptions.`
  },

  'design-system': {
    id: 'design-system',
    name: 'Design System',
    icon: '🎨',
    description: 'Colors, typography, components',
    detailedDescription: 'Comprehensive design system including visual language, component library, patterns, and usage guidelines.',
    bestFor: [
      'Brand consistency',
      'Design scalability',
      'Development efficiency',
      'Team collaboration'
    ],
    outputSections: [
      'Design Principles',
      'Visual Language',
      'Component Library',
      'Pattern Library',
      'Usage Guidelines'
    ],
    prompt: `As a Senior UX Designer, create a comprehensive Design System specification.

Project Description: {{input}}

Generate detailed Design System including:

## 1. Design Principles
### Core Principles
- **Principle 1**: [Name and description]
- **Principle 2**: [Name and description]
- **Principle 3**: [Name and description]
- **Principle 4**: [Name and description]

### Design Philosophy
- Visual approach
- User experience goals
- Brand alignment
- Differentiation strategy

## 2. Visual Language

### Color System
#### Primary Colors
- Primary: #[hex] - [Usage]
- Primary Dark: #[hex] - [Usage]
- Primary Light: #[hex] - [Usage]

#### Secondary Colors
- Secondary: #[hex] - [Usage]
- Accent: #[hex] - [Usage]

#### Semantic Colors
- Success: #[hex]
- Warning: #[hex]
- Error: #[hex]
- Info: #[hex]

#### Neutral Colors
- Black: #[hex]
- Grays (5-7 shades): #[hex]
- White: #[hex]

### Typography
#### Type Scale
- Display: [Size/Weight/Line-height]
- H1: [Size/Weight/Line-height]
- H2: [Size/Weight/Line-height]
- H3: [Size/Weight/Line-height]
- H4: [Size/Weight/Line-height]
- Body: [Size/Weight/Line-height]
- Small: [Size/Weight/Line-height]
- Caption: [Size/Weight/Line-height]

#### Font Families
- Primary font: [Font name]
- Secondary font: [Font name]
- Monospace: [Font name]

### Spacing System
- Base unit: [4px or 8px]
- Spacing scale: [4, 8, 12, 16, 24, 32, 48, 64]
- Component spacing
- Layout spacing

### Elevation System
- Shadow levels (0-5)
- Usage guidelines
- Interactive states

## 3. Component Library

### Buttons
#### Primary Button
- Default state
- Hover state
- Active state
- Disabled state
- Loading state

#### Secondary Button
#### Text Button
#### Icon Button

### Form Elements
#### Input Fields
- Text input
- Text area
- Select dropdown
- Checkbox
- Radio button
- Toggle switch

#### Validation States
- Default
- Focus
- Error
- Success
- Disabled

### Navigation
- Header/Navbar
- Sidebar
- Tabs
- Breadcrumbs
- Pagination

### Content Display
- Cards
- Lists
- Tables
- Accordions
- Tooltips
- Modals

### Feedback
- Alerts
- Toasts
- Progress bars
- Spinners
- Skeleton screens

## 4. Pattern Library

### Layout Patterns
- Grid systems
- Container widths
- Section spacing
- Content patterns

### Navigation Patterns
- Menu structures
- Search patterns
- Filtering patterns
- Sorting patterns

### Form Patterns
- Single-column forms
- Multi-step forms
- Inline editing
- Validation patterns

### Data Display Patterns
- Data tables
- Charts/Graphs
- Statistics
- Timelines

## 5. Iconography
### Icon Style
- Style: [Line/Filled/Duo-tone]
- Size system: [16px, 20px, 24px, 32px]
- Stroke width: [1.5px or 2px]

### Icon Categories
- Navigation icons
- Action icons
- Status icons
- Object icons

## 6. Motion & Animation
### Animation Principles
- Duration: [Fast: 200ms, Normal: 300ms, Slow: 500ms]
- Easing: [Curves to use]
- Purpose: [When to animate]

### Transitions
- Page transitions
- Component transitions
- Micro-interactions
- Loading animations

## 7. Responsive Design
### Breakpoints
- Mobile: 320-767px
- Tablet: 768-1023px
- Desktop: 1024-1439px
- Large: 1440px+

### Adaptive Strategies
- Flexible grids
- Scalable typography
- Touch targets
- Progressive disclosure

## 8. Accessibility Guidelines
- Color contrast ratios
- Focus indicators
- Keyboard navigation
- Screen reader support
- WCAG compliance level

## 9. Usage Guidelines
### Do's and Don'ts
- Component usage
- Color application
- Typography rules
- Spacing consistency

### Best Practices
- Implementation notes
- Performance considerations
- Cross-browser support
- Testing recommendations

Format as a comprehensive design system documentation.`
  },

  'accessibility': {
    id: 'accessibility',
    name: 'Accessibility',
    icon: '♿',
    description: 'WCAG compliance and a11y',
    detailedDescription: 'Comprehensive accessibility specifications including WCAG compliance, assistive technology support, and inclusive design practices.',
    bestFor: [
      'Compliance requirements',
      'Inclusive design',
      'Legal compliance',
      'User reach maximization'
    ],
    outputSections: [
      'WCAG Compliance',
      'Keyboard Navigation',
      'Screen Reader Support',
      'Visual Accessibility',
      'Testing Guidelines'
    ],
    prompt: `As a Senior UX Designer specializing in accessibility, create comprehensive Accessibility Specifications.

Project Description: {{input}}

Generate detailed Accessibility Specifications including:

## 1. Accessibility Overview
- **Compliance Target**: [WCAG 2.1 Level AA]
- **Legal Requirements**: [ADA, Section 508, etc.]
- **User Groups**: [Disabilities considered]
- **Testing Approach**: [Methods and tools]

## 2. WCAG Compliance

### Perceivable
#### 1.1 Text Alternatives
- All images have alt text
- Decorative images marked appropriately
- Complex images have long descriptions
- Video content has captions

#### 1.2 Time-based Media
- Video captions
- Audio descriptions
- Transcripts available
- Sign language (if Level AAA)

#### 1.3 Adaptable
- Semantic HTML structure
- Meaningful sequence
- Sensory characteristics
- Orientation support

#### 1.4 Distinguishable
- Color contrast ratios (4.5:1 normal, 3:1 large)
- Resize text to 200%
- Images of text avoided
- Background audio control

### Operable
#### 2.1 Keyboard Accessible
- All functionality keyboard accessible
- No keyboard traps
- Shortcut keys documented
- Skip navigation links

#### 2.2 Enough Time
- Adjustable time limits
- Pause, stop, hide moving content
- Session timeout warnings
- Re-authentication without data loss

#### 2.3 Seizures
- No flashing > 3 times/second
- Motion can be disabled
- Animation controls

#### 2.4 Navigable
- Page titles descriptive
- Focus order logical
- Link purpose clear
- Multiple navigation methods
- Headings and labels descriptive

### Understandable
#### 3.1 Readable
- Language declared
- Unusual words explained
- Abbreviations expanded
- Reading level appropriate

#### 3.2 Predictable
- Consistent navigation
- Consistent identification
- No unexpected context changes
- User-initiated changes only

#### 3.3 Input Assistance
- Error identification
- Labels and instructions
- Error suggestions
- Error prevention

### Robust
#### 4.1 Compatible
- Valid HTML/ARIA
- Name, role, value programmatic
- Status messages announced

## 3. Keyboard Navigation
### Tab Order
- Logical flow
- Interactive elements reachable
- Focus visible
- Skip links provided

### Keyboard Shortcuts
- Standard shortcuts respected
- Custom shortcuts documented
- Conflicts avoided
- Disable option available

## 4. Screen Reader Support
### ARIA Implementation
- Landmarks defined
- Live regions for updates
- Roles properly assigned
- States and properties maintained

### Content Structure
- Heading hierarchy
- Lists properly marked
- Tables with headers
- Form associations

## 5. Visual Accessibility
### Color & Contrast
- Contrast ratios meet standards
- Color not sole indicator
- Focus indicators visible
- High contrast mode support

### Typography
- Minimum font size
- Line height adequate
- Text spacing adjustable
- Font choices readable

## 6. Motor Accessibility
### Touch Targets
- Minimum 44x44px (mobile)
- Adequate spacing
- Gesture alternatives
- Drag alternatives

### Interaction Design
- Click targets adequate
- Hover alternatives
- Time limits adjustable
- Error recovery easy

## 7. Cognitive Accessibility
### Content Design
- Clear language
- Consistent patterns
- Progressive disclosure
- Help available

### Error Handling
- Clear error messages
- Recovery instructions
- Confirmation for destructive actions
- Undo capabilities

## 8. Testing Guidelines
### Manual Testing
- Keyboard navigation test
- Screen reader test
- Color contrast check
- Focus indicator check

### Automated Testing
- Tools to use (axe, WAVE, etc.)
- CI/CD integration
- Regular audit schedule
- Issue tracking

### User Testing
- Users with disabilities
- Assistive technology users
- Various disability types
- Feedback incorporation

## 9. Documentation
### Accessibility Statement
- Compliance level
- Known issues
- Contact information
- Feedback mechanism

### Implementation Notes
- Developer guidelines
- Testing procedures
- Issue remediation
- Training materials

Format as comprehensive accessibility documentation with testing checklists.`
  },

  'responsive': {
    id: 'responsive',
    name: 'Responsive Design',
    icon: '📱',
    description: 'Mobile and tablet layouts',
    detailedDescription: 'Comprehensive responsive design specifications including breakpoints, layout adaptations, touch interactions, and performance optimizations.',
    bestFor: [
      'Multi-device support',
      'Mobile-first design',
      'Progressive enhancement',
      'Cross-platform consistency'
    ],
    outputSections: [
      'Breakpoint Strategy',
      'Layout Adaptations',
      'Touch Interactions',
      'Performance Optimization',
      'Testing Guidelines'
    ],
    prompt: `As a Senior UX Designer, create comprehensive Responsive Design Specifications.

Project Description: {{input}}

Generate detailed Responsive Design Specifications including:

## 1. Responsive Strategy
- **Approach**: [Mobile-first/Desktop-first]
- **Device Coverage**: [Phones/Tablets/Desktop/TV]
- **Browser Support**: [Modern browsers + IE11?]
- **Performance Targets**: [Load times, Core Web Vitals]

## 2. Breakpoint System
### Standard Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

### Device-Specific Considerations
- iPhone SE: 375px
- iPhone Pro: 390px
- iPhone Pro Max: 428px
- iPad Mini: 768px
- iPad Pro: 1024px
- Common laptops: 1366px, 1440px
- Large monitors: 1920px+

## 3. Layout Adaptations

### Mobile Layout (320-767px)
#### Navigation
- Hamburger menu
- Bottom navigation bar
- Sticky header behavior
- Drawer navigation

#### Content
- Single column layout
- Card stacking
- Accordion for complex content
- Horizontal scrolling for tables

#### Forms
- Full-width inputs
- Stacked labels
- Native selects
- Touch-friendly spacing

### Tablet Layout (768-1023px)
#### Navigation
- Collapsed sidebar
- Tab navigation
- Split-screen capable

#### Content
- 2-column grid
- Side-by-side cards
- Floating sidebars
- Modal sizing

### Desktop Layout (1024px+)
#### Navigation
- Full horizontal menu
- Mega menus
- Sidebar navigation
- Breadcrumbs visible

#### Content
- Multi-column layouts
- Grid systems
- Fixed sidebars
- Advanced filters

## 4. Component Behavior

### Images & Media
- Responsive images (srcset)
- Art direction (picture element)
- Lazy loading strategy
- Video player adaptations

### Tables
- Mobile: Cards or accordion
- Tablet: Horizontal scroll
- Desktop: Full table
- Sticky headers

### Navigation
- Mobile: Bottom nav or hamburger
- Tablet: Condensed top nav
- Desktop: Full navigation

### Modals & Overlays
- Mobile: Full screen
- Tablet: Centered modal
- Desktop: Sized modal
- Escape areas

## 5. Touch Interactions
### Touch Targets
- Minimum size: 44x44px
- Spacing: 8px minimum
- Thumb-friendly zones
- Edge swipe areas

### Gestures
- Swipe navigation
- Pull to refresh
- Pinch to zoom
- Long press menus

### Mobile-Specific Features
- Click vs. hover states
- Touch feedback
- Momentum scrolling
- Viewport handling

## 6. Typography Scaling
### Font Sizes
\`\`\`css
/* Mobile */
h1: 24px
h2: 20px
h3: 18px
body: 16px

/* Tablet */
h1: 32px
h2: 24px
h3: 20px
body: 16px

/* Desktop */
h1: 48px
h2: 32px
h3: 24px
body: 18px
\`\`\`

### Line Length
- Mobile: 45-75 characters
- Tablet: 60-80 characters
- Desktop: 65-85 characters

## 7. Performance Optimization
### Mobile Performance
- Critical CSS inline
- Lazy load below fold
- Optimize images
- Reduce JavaScript

### Network Considerations
- Offline functionality
- Progressive enhancement
- Service workers
- Data saver mode

### Loading Strategy
- Above-fold priority
- Progressive image loading
- Code splitting
- Font loading optimization

## 8. Input Methods
### Touch Input
- Touch targets
- Swipe gestures
- Multi-touch support
- Haptic feedback

### Keyboard Input
- Tab navigation
- Keyboard shortcuts
- Focus management
- Virtual keyboard handling

### Voice Input
- Voice commands
- Dictation support
- Accessibility features

## 9. Testing Guidelines
### Device Testing
- Real device testing
- Emulator testing
- Browser DevTools
- Cross-browser testing

### Viewport Testing
- Orientation changes
- Zoom levels
- Font scaling
- High DPI screens

### Performance Testing
- Network throttling
- CPU throttling
- Memory constraints
- Battery usage

## 10. Progressive Enhancement
### Core Experience
- Basic HTML/CSS
- Essential functionality
- No JavaScript fallback

### Enhanced Experience
- Advanced interactions
- Rich animations
- Real-time features
- Offline capability

Format as comprehensive responsive design documentation with visual breakpoint examples.`
  }
}

export const defaultUXDesignPrompt = uxDesignSections['user-personas'].prompt

export function getUXSectionPrompt(sectionId: string): string {
  return uxDesignSections[sectionId]?.prompt || defaultUXDesignPrompt
}

export function getAllUXSections(): UXSection[] {
  return Object.values(uxDesignSections)
}

export function getUXSectionById(sectionId: string): UXSection | undefined {
  return uxDesignSections[sectionId]
}

export function generateCombinedUXDesign(selectedSections: string[], context: {
  input: string
  business_analysis?: string
  functional_spec?: string
}): string {
  if (selectedSections.length === 0) {
    return defaultUXDesignPrompt
  }

  const sections = selectedSections.map(id => uxDesignSections[id]).filter(Boolean)
  
  const combinedPrompt = `As a Senior UX Designer, create a comprehensive UX design specification covering multiple focus areas.

Project Description: {{input}}
${context.business_analysis ? `Business Analysis: {{business_analysis}}` : ''}
${context.functional_spec ? `Functional Requirements: {{functional_spec}}` : ''}

Generate a detailed UX design specification covering the following areas:

${sections.map((section, index) => `
## Part ${index + 1}: ${section.name}
${section.prompt.split('\n').slice(5).join('\n')}
`).join('\n\n')}

Ensure all sections are cohesive and reference each other where appropriate. Format as a professional UX design document.`

  return combinedPrompt
}
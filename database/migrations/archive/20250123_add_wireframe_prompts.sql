-- Add wireframe prompts table for managing wireframe generation prompts
BEGIN;

-- Drop table if exists to avoid conflicts
DROP TABLE IF EXISTS wireframe_prompts CASCADE;

-- Create the table without the deferred constraint first
CREATE TABLE wireframe_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    prompt_template TEXT NOT NULL,
    category VARCHAR(100),
    layout_type VARCHAR(50) DEFAULT 'web',
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_wireframe_prompts_active ON wireframe_prompts(is_active) WHERE is_active = true;
CREATE INDEX idx_wireframe_prompts_category ON wireframe_prompts(category);
CREATE INDEX idx_wireframe_prompts_layout_type ON wireframe_prompts(layout_type);

-- Create or replace the update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER update_wireframe_prompts_updated_at
    BEFORE UPDATE ON wireframe_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default wireframe prompts
INSERT INTO wireframe_prompts (name, description, prompt_template, category, layout_type, variables, is_default) VALUES
(
    'Default Wireframe Generator',
    'Main prompt for generating comprehensive wireframes from user descriptions',
    'You are an expert UX designer creating detailed wireframes.

User Request: {{user_prompt}}

Create a comprehensive wireframe specification for a {{layout_type}} interface with the following requirements:

1. **Layout Structure**:
   - Define the overall layout with appropriate dimensions for {{layout_type}}
   - Use a grid system with proper spacing
   - Include responsive breakpoints if applicable

2. **Components**:
   - Create a hierarchical component structure
   - Each component should have:
     - Unique ID
     - Type (from standard UI components)
     - Position and size
     - Content or placeholder text
     - Relevant properties
   - Use semantic component types

3. **Visual Hierarchy**:
   - Establish clear visual hierarchy
   - Group related components
   - Use appropriate spacing and alignment

4. **Annotations**{{#if include_annotations}}:
   - Add design annotations explaining key decisions
   - Include interaction notes
   - Specify content requirements
   - Note accessibility considerations{{else}} (skip this section){{/if}}

5. **User Flow**{{#if include_user_flow}}:
   - Document the primary user flow
   - Include step-by-step actions
   - Note expected results
   - Identify alternative paths{{else}} (skip this section){{/if}}

Output the wireframe specification as a valid JSON object following this structure:
{
  "title": "Page/Screen Title",
  "description": "Brief description of the interface",
  "layout": {
    "type": "{{layout_type}}",
    "dimensions": { "width": number, "height": number },
    "grid": { "columns": number, "gap": number, "padding": number }
  },
  "components": [...],
  "annotations": [...],
  "userFlow": [...]
}

Important guidelines:
- Use realistic dimensions (e.g., 1440x900 for desktop, 375x812 for mobile)
- Components should not overlap unless intentionally layered
- Use standard component types: header, nav, button, input, card, etc.
- Ensure proper parent-child relationships for nested components
- Make the design accessible and user-friendly

Return ONLY the JSON object without any additional text or markdown formatting.',
    'general',
    'web',
    '["user_prompt", "layout_type", "include_annotations", "include_user_flow"]'::jsonb,
    true
),
(
    'Landing Page Template',
    'Generate a professional landing page wireframe',
    'Create a landing page wireframe with the following sections:

{{user_prompt}}

Include these standard landing page elements:
1. Hero section with headline, subheadline, and CTA button
2. Feature grid showcasing 3-6 key features
3. Benefits section with visual elements
4. Testimonials or social proof section
5. Call-to-action section
6. Footer with links and contact info

Layout type: {{layout_type}}
Target audience: Professional/Business

Ensure the wireframe follows landing page best practices for conversion optimization.',
    'templates',
    'web',
    '["user_prompt", "layout_type"]'::jsonb,
    false
),
(
    'Admin Dashboard Template',
    'Generate an admin dashboard wireframe',
    'Design an admin dashboard wireframe with the following requirements:

{{user_prompt}}

Include these dashboard elements:
1. Sidebar navigation with collapsible menu
2. Top header with user profile and notifications
3. Main content area with:
   - Statistics widgets/cards
   - Charts and data visualizations
   - Recent activity feed
   - Quick actions section
4. Responsive layout for {{layout_type}}

Focus on data density and usability for power users.',
    'templates',
    'web',
    '["user_prompt", "layout_type"]'::jsonb,
    false
),
(
    'Mobile App Template',
    'Generate a mobile app wireframe',
    'Create a mobile app wireframe with the following specifications:

{{user_prompt}}

Standard mobile app structure:
1. Bottom tab navigation (5 tabs max)
2. Main screens for each tab
3. Consistent header/app bar
4. Touch-friendly interface elements
5. Proper spacing for mobile (min 44px touch targets)

Layout type: mobile ({{layout_type}})
Platform considerations: iOS and Android patterns',
    'templates',
    'mobile',
    '["user_prompt", "layout_type"]'::jsonb,
    false
),
(
    'E-commerce Product Page',
    'Generate an e-commerce product page wireframe',
    'Design an e-commerce product page wireframe:

{{user_prompt}}

Essential e-commerce elements:
1. Product image gallery with zoom functionality
2. Product title, price, and availability
3. Product options (size, color, etc.)
4. Add to cart and buy now buttons
5. Product description tabs
6. Customer reviews section
7. Related products
8. Trust badges and guarantees

Optimize for conversion and user trust.',
    'templates',
    'web',
    '["user_prompt", "layout_type"]'::jsonb,
    false
);

-- Enhancement prompts
INSERT INTO wireframe_prompts (name, description, prompt_template, category, is_default) VALUES
(
    'Full Enhancement',
    'Enhance wireframe with more details and polish',
    'Enhance this wireframe with more detailed components, interactions, and polish. Add missing UI elements, improve visual hierarchy, and ensure completeness.',
    'enhancement',
    false
),
(
    'Accessibility Enhancement',
    'Add comprehensive accessibility features',
    'Enhance this wireframe with comprehensive accessibility features including ARIA labels, keyboard navigation indicators, focus states, screen reader considerations, and WCAG compliance notes.',
    'enhancement',
    false
),
(
    'Mobile Optimization',
    'Optimize wireframe for mobile devices',
    'Optimize this wireframe for mobile devices with touch-friendly interactions, appropriate spacing (min 44px touch targets), swipe gestures, and mobile-specific UI patterns.',
    'enhancement',
    false
),
(
    'Interaction Enhancement',
    'Add detailed interaction specifications',
    'Add detailed interaction specifications including hover states, click behaviors, transitions, micro-interactions, loading states, and error states for all interactive elements.',
    'enhancement',
    false
),
(
    'Content Enhancement',
    'Improve content and information architecture',
    'Enhance with realistic content, proper information architecture, content hierarchy, readability improvements, and SEO-friendly structure.',
    'enhancement',
    false
);

-- Add RLS policies
ALTER TABLE wireframe_prompts ENABLE ROW LEVEL SECURITY;

-- Policy for viewing prompts (all authenticated users can view active prompts)
CREATE POLICY "Users can view active wireframe prompts" ON wireframe_prompts
    FOR SELECT
    USING (is_active = true OR created_by = auth.uid());

-- Policy for creating prompts (authenticated users can create their own)
CREATE POLICY "Users can create their own wireframe prompts" ON wireframe_prompts
    FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- Policy for updating prompts (users can update their own)
CREATE POLICY "Users can update their own wireframe prompts" ON wireframe_prompts
    FOR UPDATE
    USING (auth.uid() = created_by);

-- Policy for deleting prompts (users can delete their own)
CREATE POLICY "Users can delete their own wireframe prompts" ON wireframe_prompts
    FOR DELETE
    USING (auth.uid() = created_by);

-- Grant permissions
GRANT ALL ON wireframe_prompts TO authenticated;
GRANT SELECT ON wireframe_prompts TO anon;

-- Add a unique constraint to ensure only one default per category
-- We use a partial unique index to only enforce uniqueness when is_default = true
CREATE UNIQUE INDEX unique_default_per_category 
ON wireframe_prompts (category) 
WHERE is_default = true;

COMMIT;
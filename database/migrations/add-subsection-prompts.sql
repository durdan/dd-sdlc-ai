-- Add subsection support to prompt_templates table
-- This migration adds support for storing subsection-specific prompts

-- Add section_id column to identify which subsection a prompt belongs to
ALTER TABLE prompt_templates 
ADD COLUMN IF NOT EXISTS section_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS section_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS section_description TEXT,
ADD COLUMN IF NOT EXISTS parent_document_type VARCHAR(50);

-- Create index for faster section lookups
CREATE INDEX IF NOT EXISTS idx_prompt_templates_section 
ON prompt_templates(document_type, section_id);

-- Create index for parent document type
CREATE INDEX IF NOT EXISTS idx_prompt_templates_parent_type 
ON prompt_templates(parent_document_type);

-- Add comment to explain the new columns
COMMENT ON COLUMN prompt_templates.section_id IS 'Identifier for document subsection (e.g., system-architecture, user-personas)';
COMMENT ON COLUMN prompt_templates.section_name IS 'Human-readable name of the subsection';
COMMENT ON COLUMN prompt_templates.section_description IS 'Description of what this subsection covers';
COMMENT ON COLUMN prompt_templates.parent_document_type IS 'The main document type this section belongs to when section_id is set';

-- Create a new table specifically for subsection metadata
CREATE TABLE IF NOT EXISTS document_subsections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL,
    section_id VARCHAR(100) NOT NULL,
    section_name VARCHAR(255) NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    detailed_description TEXT,
    best_for TEXT[], -- Array of use cases
    output_sections TEXT[], -- Array of output sections
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique section IDs per document type
    UNIQUE(document_type, section_id)
);

-- Create indexes for the new table
CREATE INDEX IF NOT EXISTS idx_document_subsections_type 
ON document_subsections(document_type);

CREATE INDEX IF NOT EXISTS idx_document_subsections_active 
ON document_subsections(is_active);

-- Add RLS policies for the new table
ALTER TABLE document_subsections ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read subsections
CREATE POLICY "Allow authenticated users to read subsections" 
ON document_subsections FOR SELECT 
TO authenticated 
USING (true);

-- Only admins can modify subsections
CREATE POLICY "Only admins can insert subsections" 
ON document_subsections FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);

CREATE POLICY "Only admins can update subsections" 
ON document_subsections FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'manager')
    )
);

CREATE POLICY "Only admins can delete subsections" 
ON document_subsections FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Insert default subsections for each document type
-- Business Analysis Sections
INSERT INTO document_subsections (document_type, section_id, section_name, icon, description, detailed_description, best_for, output_sections, sort_order)
VALUES 
    ('business', 'executive-summary', 'Executive Summary', '📋', 'High-level overview for stakeholders', 
     'Comprehensive executive summary including business case, key objectives, expected outcomes, and strategic alignment.',
     ARRAY['C-level presentations', 'Board meetings', 'Investor pitches', 'Strategic planning sessions'],
     ARRAY['Business Case Overview', 'Strategic Alignment', 'Key Objectives', 'Expected ROI', 'Executive Recommendations'],
     1),
    ('business', 'requirements', 'Requirements Analysis', '📝', 'Detailed business requirements',
     'Comprehensive requirements documentation including functional, non-functional, and business rules.',
     ARRAY['Detailed project planning', 'Development team handoff', 'Vendor RFPs', 'Compliance documentation'],
     ARRAY['Functional Requirements', 'Non-functional Requirements', 'Business Rules', 'Acceptance Criteria', 'Requirements Traceability'],
     2),
    ('business', 'stakeholder-analysis', 'Stakeholder Analysis', '👥', 'Stakeholder mapping and concerns',
     'Comprehensive stakeholder analysis including identification, influence mapping, engagement strategies, and communication plans.',
     ARRAY['Change management planning', 'Communication strategy', 'Risk mitigation', 'Project governance'],
     ARRAY['Stakeholder Identification', 'Influence/Interest Matrix', 'Engagement Strategy', 'Communication Plan', 'RACI Matrix'],
     3),
    ('business', 'risk-assessment', 'Risk Assessment', '⚠️', 'Risk analysis and mitigation',
     'Comprehensive risk assessment including identification, analysis, mitigation strategies, and monitoring plans.',
     ARRAY['Risk management planning', 'Contingency planning', 'Budget planning', 'Executive decision-making'],
     ARRAY['Risk Identification', 'Risk Analysis Matrix', 'Mitigation Strategies', 'Contingency Plans', 'Risk Monitoring'],
     4),
    ('business', 'roi-analysis', 'ROI Analysis', '💰', 'Return on investment calculations',
     'Detailed financial analysis including ROI calculations, cost-benefit analysis, payback period, and financial projections.',
     ARRAY['Investment decisions', 'Budget approval', 'Business case development', 'Financial planning'],
     ARRAY['Financial Summary', 'Cost Analysis', 'Benefit Quantification', 'ROI Calculations', 'Sensitivity Analysis'],
     5),
    ('business', 'timeline', 'Timeline & Milestones', '📅', 'Project timeline and key dates',
     'Comprehensive project timeline including phases, milestones, dependencies, and critical path analysis.',
     ARRAY['Project planning', 'Resource allocation', 'Stakeholder communication', 'Progress tracking'],
     ARRAY['Project Phases', 'Key Milestones', 'Dependencies', 'Critical Path', 'Resource Timeline'],
     6);

-- Technical Specification Sections
INSERT INTO document_subsections (document_type, section_id, section_name, icon, description, detailed_description, best_for, output_sections, sort_order)
VALUES 
    ('technical', 'system-architecture', 'System Architecture', '🏗️', 'Overall system design and structure',
     'Comprehensive system architecture including components, layers, interactions, and deployment architecture.',
     ARRAY['System design', 'Architecture reviews', 'Technical documentation', 'Development planning'],
     ARRAY['Component Diagram', 'Layer Architecture', 'System Context', 'Deployment View', 'Technology Stack'],
     1),
    ('technical', 'data-design', 'Data Design', '💾', 'Database schema and data flow',
     'Detailed data architecture including database design, data models, relationships, and data flow diagrams.',
     ARRAY['Database design', 'Data modeling', 'ETL processes', 'Data migration planning'],
     ARRAY['Entity Relationships', 'Database Schema', 'Data Flow', 'Data Dictionary', 'Migration Strategy'],
     2),
    ('technical', 'api-specifications', 'API Specifications', '🔌', 'API design and contracts',
     'Complete API documentation including endpoints, request/response formats, authentication, and error handling.',
     ARRAY['API development', 'Integration planning', 'Third-party integrations', 'API documentation'],
     ARRAY['Endpoint Definitions', 'Request/Response Schemas', 'Authentication', 'Error Codes', 'Rate Limiting'],
     3),
    ('technical', 'security-architecture', 'Security Architecture', '🔒', 'Security measures and protocols',
     'Comprehensive security design including authentication, authorization, encryption, and compliance requirements.',
     ARRAY['Security planning', 'Compliance documentation', 'Threat modeling', 'Security audits'],
     ARRAY['Security Layers', 'Authentication/Authorization', 'Encryption Standards', 'Compliance Requirements', 'Threat Model'],
     4),
    ('technical', 'infrastructure-devops', 'Infrastructure & DevOps', '⚙️', 'Infrastructure and deployment',
     'Infrastructure design including cloud architecture, CI/CD pipelines, monitoring, and scalability planning.',
     ARRAY['Infrastructure planning', 'DevOps implementation', 'Cloud migration', 'Scalability planning'],
     ARRAY['Cloud Architecture', 'CI/CD Pipeline', 'Monitoring Strategy', 'Backup/Recovery', 'Scalability Plan'],
     5),
    ('technical', 'performance-scale', 'Performance & Scalability', '📊', 'Performance requirements and optimization',
     'Performance engineering specifications including benchmarks, optimization strategies, and scalability patterns.',
     ARRAY['Performance optimization', 'Load testing', 'Capacity planning', 'SLA definition'],
     ARRAY['Performance Benchmarks', 'Optimization Strategies', 'Caching Strategy', 'Load Balancing', 'Capacity Planning'],
     6);

-- UX Design Sections
INSERT INTO document_subsections (document_type, section_id, section_name, icon, description, detailed_description, best_for, output_sections, sort_order)
VALUES 
    ('ux', 'user-personas', 'User Personas', '👤', 'Target user profiles',
     'Detailed user personas including demographics, goals, pain points, behaviors, and journey mapping.',
     ARRAY['User-centered design', 'Market segmentation', 'Feature prioritization', 'Marketing strategy'],
     ARRAY['Primary Personas', 'Secondary Personas', 'User Goals & Needs', 'Pain Points', 'Behavioral Patterns'],
     1),
    ('ux', 'journey-maps', 'Journey Maps', '🗺️', 'User journey and touchpoints',
     'Comprehensive user journey maps showing touchpoints, emotions, opportunities, and pain points across the entire user experience.',
     ARRAY['Experience optimization', 'Touchpoint analysis', 'Service design', 'Customer experience improvement'],
     ARRAY['Journey Stages', 'Touchpoints', 'Emotions & Thoughts', 'Pain Points', 'Opportunities'],
     2),
    ('ux', 'wireframes', 'Wireframes', '📐', 'Low-fidelity mockups',
     'Detailed wireframe specifications including layout descriptions, component placement, interaction patterns, and responsive considerations.',
     ARRAY['Visual communication', 'Layout planning', 'Functionality demonstration', 'Development handoff'],
     ARRAY['Page Layouts', 'Component Library', 'Interaction Patterns', 'Navigation Structure', 'Responsive Behavior'],
     3),
    ('ux', 'design-system', 'Design System', '🎨', 'Colors, typography, components',
     'Comprehensive design system including visual language, component library, patterns, and usage guidelines.',
     ARRAY['Brand consistency', 'Design scalability', 'Development efficiency', 'Team collaboration'],
     ARRAY['Design Principles', 'Visual Language', 'Component Library', 'Pattern Library', 'Usage Guidelines'],
     4),
    ('ux', 'accessibility', 'Accessibility', '♿', 'WCAG compliance and a11y',
     'Comprehensive accessibility specifications including WCAG compliance, assistive technology support, and inclusive design practices.',
     ARRAY['Compliance requirements', 'Inclusive design', 'Legal compliance', 'User reach maximization'],
     ARRAY['WCAG Compliance', 'Keyboard Navigation', 'Screen Reader Support', 'Visual Accessibility', 'Testing Guidelines'],
     5),
    ('ux', 'responsive', 'Responsive Design', '📱', 'Mobile and tablet layouts',
     'Comprehensive responsive design specifications including breakpoints, layout adaptations, touch interactions, and performance optimizations.',
     ARRAY['Multi-device support', 'Mobile-first design', 'Progressive enhancement', 'Cross-platform consistency'],
     ARRAY['Breakpoint Strategy', 'Layout Adaptations', 'Touch Interactions', 'Performance Optimization', 'Testing Guidelines'],
     6);

-- Architecture Diagram Sections (Mermaid)
INSERT INTO document_subsections (document_type, section_id, section_name, icon, description, detailed_description, best_for, output_sections, sort_order)
VALUES 
    ('mermaid', 'system-overview', 'System Overview', '🏗️', 'High-level architecture',
     'Comprehensive system architecture diagram showing all major components, their relationships, and data flows.',
     ARRAY['Executive presentations', 'System documentation', 'Onboarding materials', 'Architecture reviews'],
     ARRAY['Component Architecture', 'Layer Diagram', 'System Context', 'Technology Stack', 'Deployment View'],
     1),
    ('mermaid', 'data-flow', 'Data Flow', '🔄', 'Data movement and processing',
     'Detailed data flow diagrams showing how data moves through the system, transformations, and storage points.',
     ARRAY['Data architecture', 'ETL processes', 'Analytics systems', 'Integration design'],
     ARRAY['Data Flow Overview', 'ETL Pipeline', 'Event Streaming', 'Data Transformation', 'Storage Architecture'],
     2),
    ('mermaid', 'sequence-diagrams', 'Sequence Diagrams', '📊', 'API and process sequences',
     'Detailed sequence diagrams showing API calls, process flows, and system interactions over time.',
     ARRAY['API documentation', 'Process documentation', 'Integration specs', 'Debugging guides'],
     ARRAY['User Flows', 'API Sequences', 'Authentication Flow', 'Error Handling', 'Integration Patterns'],
     3),
    ('mermaid', 'database-schema', 'Database Schema', '🗄️', 'Entity relationships and data models',
     'Comprehensive database schema diagrams showing entities, relationships, constraints, and data models.',
     ARRAY['Database design', 'Data modeling', 'Schema documentation', 'Migration planning'],
     ARRAY['Entity Relationships', 'Table Structures', 'Indexes & Constraints', 'Data Types', 'Normalization'],
     4),
    ('mermaid', 'network-topology', 'Network Topology', '🌐', 'Network and infrastructure layout',
     'Detailed network topology diagrams showing infrastructure, security zones, and communication paths.',
     ARRAY['Infrastructure planning', 'Security architecture', 'Network documentation', 'Disaster recovery'],
     ARRAY['Network Architecture', 'Security Zones', 'Load Balancing', 'Redundancy', 'Cloud Infrastructure'],
     5),
    ('mermaid', 'deployment-architecture', 'Deployment Architecture', '🚀', 'CI/CD and deployment pipelines',
     'Comprehensive deployment architecture diagrams showing CI/CD pipelines, environments, and deployment strategies.',
     ARRAY['DevOps documentation', 'Deployment planning', 'CI/CD design', 'Release management'],
     ARRAY['CI/CD Pipeline', 'Environment Architecture', 'Deployment Strategies', 'Container Orchestration', 'Release Process'],
     6);

-- Functional Specification Sections
INSERT INTO document_subsections (document_type, section_id, section_name, icon, description, detailed_description, best_for, output_sections, sort_order)
VALUES 
    ('functional', 'use-cases', 'Use Cases', '📋', 'Detailed user scenarios',
     'Comprehensive use case documentation including actors, preconditions, main flows, alternative flows, and postconditions.',
     ARRAY['Requirements documentation', 'User story development', 'Test case design', 'Training materials'],
     ARRAY['Use Case Overview', 'Actor Definitions', 'Main Flows', 'Alternative Flows', 'Exception Handling'],
     1),
    ('functional', 'user-stories', 'User Stories', '👤', 'Agile user stories and epics',
     'Complete user story specifications with acceptance criteria, story points, and implementation details for agile development.',
     ARRAY['Agile development', 'Sprint planning', 'Backlog grooming', 'Feature development'],
     ARRAY['Epic Definition', 'User Stories', 'Acceptance Criteria', 'Story Points', 'Dependencies'],
     2),
    ('functional', 'process-flows', 'Process Flows', '🔄', 'Business process workflows',
     'Detailed business process flows including steps, decision points, roles, and system interactions.',
     ARRAY['Process automation', 'Workflow design', 'Business analysis', 'System integration'],
     ARRAY['Process Overview', 'Workflow Steps', 'Decision Points', 'Role Assignments', 'System Touchpoints'],
     3),
    ('functional', 'data-models', 'Data Models', '🗂️', 'Data structures and relationships',
     'Comprehensive data modeling including entities, attributes, relationships, and data dictionaries.',
     ARRAY['Database design', 'API design', 'Data migration', 'System documentation'],
     ARRAY['Conceptual Model', 'Logical Model', 'Physical Model', 'Data Dictionary', 'Data Constraints'],
     4),
    ('functional', 'integration-specs', 'Integration Specs', '🔗', 'System integration requirements',
     'Detailed integration specifications including APIs, data flows, protocols, and error handling.',
     ARRAY['API development', 'System integration', 'Microservices design', 'Third-party connections'],
     ARRAY['Integration Overview', 'API Specifications', 'Data Mappings', 'Error Handling', 'Security Requirements'],
     5),
    ('functional', 'validation-rules', 'Validation Rules', '✅', 'Business rules and data validation',
     'Comprehensive validation rules including business logic, data constraints, and compliance requirements.',
     ARRAY['Data quality', 'Business logic', 'Compliance systems', 'Form validation'],
     ARRAY['Business Rules', 'Data Validation', 'Compliance Rules', 'Calculation Logic', 'State Transitions'],
     6);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_subsections_updated_at 
BEFORE UPDATE ON document_subsections 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table
COMMENT ON TABLE document_subsections IS 'Stores metadata about available subsections for each document type';
COMMENT ON COLUMN document_subsections.document_type IS 'The main document type (business, technical, ux, mermaid, functional)';
COMMENT ON COLUMN document_subsections.section_id IS 'Unique identifier for the subsection within its document type';
COMMENT ON COLUMN document_subsections.best_for IS 'Array of use cases where this subsection is most valuable';
COMMENT ON COLUMN document_subsections.output_sections IS 'Array of main sections that will be included in the output';
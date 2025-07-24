-- Enable RLS on project_generations table
ALTER TABLE project_generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_generations
CREATE POLICY "Users can view their own project generations"
    ON project_generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own project generations"
    ON project_generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project generations"
    ON project_generations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project generations"
    ON project_generations FOR DELETE
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON project_generations TO postgres;
GRANT ALL ON project_generations TO authenticated;
GRANT SELECT ON project_generations TO anon;
-- Create sdlc_user_roles table for Claude Code authentication
CREATE TABLE IF NOT EXISTS sdlc_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE sdlc_user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own role" ON sdlc_user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage all roles" ON sdlc_user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM sdlc_user_roles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Create indexes
CREATE INDEX idx_sdlc_user_roles_user_id ON sdlc_user_roles(user_id);
CREATE INDEX idx_sdlc_user_roles_role ON sdlc_user_roles(role);

-- Migrate existing roles if user_roles table exists
INSERT INTO sdlc_user_roles (user_id, role, created_at, updated_at)
SELECT user_id, role, created_at, updated_at 
FROM user_roles 
WHERE user_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Create function to automatically assign default role to new users
CREATE OR REPLACE FUNCTION handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO sdlc_user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user_role(); 
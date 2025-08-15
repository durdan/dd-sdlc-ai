-- Migration: Add VS Code Extension Support
-- Description: Adds tables for VS Code extension device tracking, usage limits, and authentication

-- Table for tracking VS Code extension devices
CREATE TABLE IF NOT EXISTS vscode_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  extension_version VARCHAR(50),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  authenticated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for temporary auth codes (OAuth flow)
CREATE TABLE IF NOT EXISTS vscode_auth_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  device_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes'),
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking VS Code extension usage
CREATE TABLE IF NOT EXISTS vscode_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id VARCHAR(255),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  count INTEGER DEFAULT 0,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure one record per device/user per day
  UNIQUE(device_id, date),
  UNIQUE(user_id, date),
  -- Check that either device_id or user_id is set
  CONSTRAINT vscode_usage_identifier_check CHECK (
    (device_id IS NOT NULL AND user_id IS NULL) OR 
    (device_id IS NULL AND user_id IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX idx_vscode_devices_device_id ON vscode_devices(device_id);
CREATE INDEX idx_vscode_devices_user_id ON vscode_devices(user_id);
CREATE INDEX idx_vscode_auth_codes_code ON vscode_auth_codes(code);
CREATE INDEX idx_vscode_auth_codes_device_id ON vscode_auth_codes(device_id);
CREATE INDEX idx_vscode_usage_device_id_date ON vscode_usage(device_id, date);
CREATE INDEX idx_vscode_usage_user_id_date ON vscode_usage(user_id, date);

-- RLS Policies for vscode_devices
ALTER TABLE vscode_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Devices are viewable by owner" ON vscode_devices
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own devices" ON vscode_devices
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for vscode_auth_codes
ALTER TABLE vscode_auth_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth codes are viewable by owner" ON vscode_auth_codes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create auth codes" ON vscode_auth_codes
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for vscode_usage
ALTER TABLE vscode_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usage is viewable by owner" ON vscode_usage
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own usage" ON vscode_usage
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anonymous usage can be inserted" ON vscode_usage
  FOR INSERT WITH CHECK (true);

-- Function to clean up expired auth codes
CREATE OR REPLACE FUNCTION cleanup_expired_vscode_auth_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM vscode_auth_codes 
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (if using pg_cron)
-- SELECT cron.schedule('cleanup-vscode-auth-codes', '*/10 * * * *', 'SELECT cleanup_expired_vscode_auth_codes();');

-- Add source column to documents table to track VS Code generated documents
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'web',
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create view for VS Code extension analytics
CREATE OR REPLACE VIEW vscode_extension_analytics AS
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN user_id::text ELSE device_id END) as unique_users,
  COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN user_id END) as authenticated_users,
  COUNT(DISTINCT CASE WHEN user_id IS NULL THEN device_id END) as anonymous_users,
  SUM(CASE WHEN user_id IS NOT NULL THEN count ELSE 0 END) as authenticated_documents,
  SUM(CASE WHEN user_id IS NULL THEN count ELSE 0 END) as anonymous_documents,
  SUM(count) as total_documents
FROM vscode_usage
GROUP BY DATE(created_at)
ORDER BY date DESC;
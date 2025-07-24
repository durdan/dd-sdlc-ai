-- Add v0_api_key column to user_configurations table
ALTER TABLE user_configurations 
ADD COLUMN IF NOT EXISTS v0_api_key TEXT;

-- Add comment for documentation
COMMENT ON COLUMN user_configurations.v0_api_key IS 'Encrypted v0.dev API key for generating UI components';
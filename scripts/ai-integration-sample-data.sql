-- AI Integration Sample Data for Testing
-- This script creates realistic sample data for AI code automation testing

-- Sample User AI Configurations (using test API keys)
INSERT INTO sdlc_user_ai_configurations (user_id, provider_id, encrypted_api_key, is_active, created_at, updated_at) VALUES
-- Test user configurations (replace with actual user IDs from your auth.users table)
('11111111-1111-1111-1111-111111111111', 1, 'encrypted_test_openai_key_123', true, NOW(), NOW()),
('11111111-1111-1111-1111-111111111111', 2, 'encrypted_test_claude_key_456', false, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 1, 'encrypted_test_openai_key_789', true, NOW(), NOW());

-- Sample GitHub Integrations
INSERT INTO sdlc_github_integrations (user_id, repository_url, installation_id, webhook_secret, is_active, permissions, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'https://github.com/testuser/sample-app', 12345, 'webhook_secret_123', true, '{"issues": "write", "pull_requests": "write", "contents": "write"}', NOW(), NOW()),
('11111111-1111-1111-1111-111111111111', 'https://github.com/testuser/api-service', 12346, 'webhook_secret_456', true, '{"issues": "write", "pull_requests": "write", "contents": "write"}', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'https://github.com/company/web-app', 12347, 'webhook_secret_789', true, '{"issues": "write", "pull_requests": "write", "contents": "write"}', NOW(), NOW());

-- Sample AI Tasks (Bug Fixes and Feature Development)
INSERT INTO sdlc_ai_tasks (user_id, provider_id, task_type, title, description, github_issue_url, repository_url, status, priority, created_at, updated_at) VALUES
-- Bug Fix Tasks
('11111111-1111-1111-1111-111111111111', 1, 'bug_fix', 'Fix login validation error', 'Users are unable to login when password contains special characters. Need to update regex validation in auth service.', 'https://github.com/testuser/sample-app/issues/123', 'https://github.com/testuser/sample-app', 'pending', 'high', NOW(), NOW()),

('11111111-1111-1111-1111-111111111111', 1, 'bug_fix', 'Memory leak in data processing', 'Large file uploads cause memory usage to spike and never release. Need to implement streaming for file processing.', 'https://github.com/testuser/api-service/issues/45', 'https://github.com/testuser/api-service', 'in_progress', 'critical', NOW(), NOW()),

('22222222-2222-2222-2222-222222222222', 1, 'bug_fix', 'CSS layout breaking on mobile', 'The sidebar navigation overlaps content on mobile devices. Need responsive design fixes.', 'https://github.com/company/web-app/issues/67', 'https://github.com/company/web-app', 'completed', 'medium', NOW() - INTERVAL '2 days', NOW()),

-- Feature Development Tasks
('11111111-1111-1111-1111-111111111111', 1, 'feature_development', 'Add user profile export', 'Allow users to export their profile data in JSON and CSV formats for GDPR compliance.', 'https://github.com/testuser/sample-app/issues/89', 'https://github.com/testuser/sample-app', 'pending', 'medium', NOW(), NOW()),

('22222222-2222-2222-2222-222222222222', 1, 'feature_development', 'Real-time notifications', 'Implement WebSocket-based real-time notifications for user activities and system alerts.', 'https://github.com/company/web-app/issues/101', 'https://github.com/company/web-app', 'in_progress', 'high', NOW(), NOW());

-- Sample Code Generations
INSERT INTO sdlc_code_generations (task_id, generated_code, file_path, change_type, confidence_score, ai_explanation, created_at) VALUES
-- Bug fix code generation
(3, 'export const validatePassword = (password: string): boolean => {
  // Updated regex to properly handle special characters
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// Update auth service to use new validation
export const authenticateUser = async (email: string, password: string) => {
  if (!validatePassword(password)) {
    throw new Error("Invalid password format");
  }
  // ... rest of auth logic
};', 'src/auth/validation.ts', 'modification', 0.92, 'Fixed password validation regex to properly handle special characters. The issue was with character escaping in the original regex pattern.', NOW()),

-- Feature development code generation
(5, 'import { WebSocket } from "ws";

export class NotificationService {
  private wss: WebSocket.Server;
  private clients: Map<string, WebSocket> = new Map();

  constructor(server: any) {
    this.wss = new WebSocket.Server({ server });
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.wss.on("connection", (ws: WebSocket, req: any) => {
      const userId = this.extractUserIdFromRequest(req);
      this.clients.set(userId, ws);

      ws.on("close", () => {
        this.clients.delete(userId);
      });
    });
  }

  public sendNotification(userId: string, notification: any) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  }
}', 'src/services/NotificationService.ts', 'new_file', 0.87, 'Created WebSocket-based notification service with user session management. Includes connection handling and message broadcasting capabilities.', NOW());

-- Sample Task Executions
INSERT INTO sdlc_task_executions (task_id, execution_step, status, step_output, started_at, completed_at) VALUES
-- Bug fix execution steps
(2, 'analyze_issue', 'completed', '{"analysis": "Memory leak detected in file upload handler", "files_identified": ["src/upload/FileProcessor.ts", "src/middleware/upload.ts"], "root_cause": "Large files not being streamed"}', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '50 minutes'),
(2, 'generate_code', 'completed', '{"generated_files": 1, "modified_files": 2, "confidence": 0.89, "estimated_fix_time": "30 minutes"}', NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '40 minutes'),
(2, 'create_tests', 'completed', '{"test_files_created": 2, "test_coverage": "85%", "test_types": ["unit", "integration"]}', NOW() - INTERVAL '40 minutes', NOW() - INTERVAL '30 minutes'),
(2, 'create_pr', 'completed', '{"pr_url": "https://github.com/testuser/api-service/pull/156", "pr_number": 156, "status": "open"}', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '25 minutes'),

-- Completed bug fix
(3, 'analyze_issue', 'completed', '{"analysis": "CSS flexbox layout issue on mobile viewports", "files_identified": ["src/styles/sidebar.css", "src/components/Sidebar.tsx"]}', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes'),
(3, 'generate_code', 'completed', '{"generated_files": 0, "modified_files": 2, "confidence": 0.94}', NOW() - INTERVAL '2 days' + INTERVAL '10 minutes', NOW() - INTERVAL '2 days' + INTERVAL '20 minutes'),
(3, 'create_pr', 'completed', '{"pr_url": "https://github.com/company/web-app/pull/89", "pr_number": 89, "status": "merged"}', NOW() - INTERVAL '2 days' + INTERVAL '20 minutes', NOW() - INTERVAL '2 days' + INTERVAL '25 minutes');

-- Sample Pull Requests
INSERT INTO sdlc_pull_requests (task_id, github_pr_number, pr_url, title, description, status, created_at, updated_at) VALUES
(2, 156, 'https://github.com/testuser/api-service/pull/156', 'Fix: Memory leak in file upload processing', 'This PR fixes the memory leak issue in the file upload handler by implementing streaming for large files.

## Changes
- Updated FileProcessor to use streaming
- Added memory monitoring middleware
- Increased test coverage for upload scenarios

## Testing
- ✅ Unit tests passing
- ✅ Memory usage tests added
- ✅ Large file upload tested (up to 500MB)

Fixes #45', 'open', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '25 minutes'),

(3, 89, 'https://github.com/company/web-app/pull/89', 'Fix: Mobile sidebar layout overlapping content', 'Resolves mobile layout issues where sidebar navigation overlaps main content on small screens.

## Changes
- Updated sidebar CSS for responsive design
- Added mobile-specific media queries
- Fixed z-index layering issues

## Testing
- ✅ Tested on iOS Safari
- ✅ Tested on Android Chrome
- ✅ Desktop layouts unaffected

Fixes #67', 'merged', NOW() - INTERVAL '2 days' + INTERVAL '20 minutes', NOW() - INTERVAL '1 day');

-- Sample API Key Rotations (for testing security features)
INSERT INTO sdlc_api_key_rotations (user_id, provider_id, old_key_hash, new_key_hash, rotation_reason, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 1, 'hash_of_old_openai_key', 'hash_of_new_openai_key', 'scheduled_rotation', NOW() - INTERVAL '30 days'),
('22222222-2222-2222-2222-222222222222', 1, 'hash_of_old_openai_key_2', 'hash_of_new_openai_key_2', 'security_concern', NOW() - INTERVAL '15 days');

-- Sample Provider Usage Logs
INSERT INTO sdlc_provider_usage_logs (user_id, provider_id, task_id, tokens_used, cost_usd, request_type, response_time_ms, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 1, 2, 15420, 0.45, 'code_generation', 2340, NOW() - INTERVAL '1 hour'),
('11111111-1111-1111-1111-111111111111', 1, 2, 8930, 0.28, 'code_review', 1820, NOW() - INTERVAL '45 minutes'),
('22222222-2222-2222-2222-222222222222', 1, 3, 12340, 0.38, 'bug_analysis', 1950, NOW() - INTERVAL '2 days'),
('22222222-2222-2222-2222-222222222222', 1, 3, 9850, 0.31, 'code_generation', 2100, NOW() - INTERVAL '2 days' + INTERVAL '15 minutes'),
('11111111-1111-1111-1111-111111111111', 1, 4, 18750, 0.52, 'feature_analysis', 2890, NOW() - INTERVAL '3 hours'),
('22222222-2222-2222-2222-222222222222', 1, 5, 21430, 0.67, 'code_generation', 3120, NOW() - INTERVAL '1 hour');

-- Sample Security Audit Logs
INSERT INTO sdlc_security_audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'api_key_created', 'ai_configuration', '1', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL '30 days'),
('11111111-1111-1111-1111-111111111111', 'task_created', 'ai_task', '2', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL '1 hour'),
('22222222-2222-2222-2222-222222222222', 'pr_created', 'pull_request', '1', '10.0.0.45', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '25 minutes'),
('11111111-1111-1111-1111-111111111111', 'api_key_rotated', 'ai_configuration', '1', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL '15 days');

-- Sample Task Dependencies
INSERT INTO sdlc_task_dependencies (parent_task_id, dependent_task_id, dependency_type, created_at) VALUES
(2, 4, 'blocks', NOW() - INTERVAL '1 hour'),  -- Memory leak fix blocks user export feature
(5, 2, 'related', NOW() - INTERVAL '3 hours'); -- Notifications related to memory fix

-- Sample Automation Rules
INSERT INTO sdlc_automation_rules (user_id, repository_url, rule_name, trigger_conditions, actions, is_active, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'https://github.com/testuser/sample-app', 'Auto-fix simple bugs', '{"labels": ["bug", "good-first-issue"], "priority": ["low", "medium"]}', '{"auto_assign": true, "create_pr": true, "run_tests": true}', true, NOW() - INTERVAL '7 days', NOW()),

('22222222-2222-2222-2222-222222222222', 'https://github.com/company/web-app', 'Security issue automation', '{"labels": ["security"], "priority": ["high", "critical"]}', '{"notify_team": true, "create_pr": false, "manual_review": true}', true, NOW() - INTERVAL '10 days', NOW()),

('11111111-1111-1111-1111-111111111111', 'https://github.com/testuser/api-service', 'Feature development assist', '{"labels": ["enhancement"], "assignee": "testuser"}', '{"auto_assign": true, "create_draft_pr": true, "add_tests": true}', true, NOW() - INTERVAL '5 days', NOW());

-- Sample Code Review Feedback
INSERT INTO sdlc_code_review_feedback (task_id, pr_number, reviewer_type, feedback_type, feedback_content, confidence_score, created_at) VALUES
(3, 89, 'human', 'approval', 'Looks good! The mobile layout fix works perfectly on my iPhone. Good use of CSS Grid for responsive design.', 0.95, NOW() - INTERVAL '1 day' + INTERVAL '2 hours'),

(2, 156, 'ai', 'suggestion', 'Consider adding error handling for edge cases where streaming might fail. Also, the memory monitoring could benefit from configurable thresholds.', 0.78, NOW() - INTERVAL '20 minutes'),

(2, 156, 'human', 'request_changes', 'The implementation looks solid, but please add integration tests for the streaming functionality. Also, consider documenting the memory usage improvements in the PR description.', 0.88, NOW() - INTERVAL '15 minutes');

-- Create some test data usage stats
-- This will help test the analytics views
SELECT 'Sample data inserted successfully!' as status; 
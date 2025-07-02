"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

export default function ProjectDetails({ params }: { params: { id: string } }) {
  const [project] = useState({
    id: params.id,
    title: 'User Authentication System',
    status: 'completed',
    createdAt: '2024-01-15',
    jiraEpic: 'AUTH-123',
    confluencePage: 'https://company.atlassian.net/wiki/spaces/DEV/pages/123456',
    documents: {
      businessAnalysis: `# Business Analysis: User Authentication System

## Executive Summary
This project aims to implement a comprehensive user authentication system that will serve as the foundation for secure user access across our platform. The system will support multiple authentication methods and provide robust security features.

## Business Objectives
1. Enhance platform security through robust authentication
2. Improve user experience with multiple login options
3. Ensure compliance with security standards
4. Reduce support tickets related to login issues

## Stakeholder Analysis
- **Primary**: Development Team, Security Team, Product Management
- **Secondary**: Customer Support, End Users, Compliance Team

## Success Criteria
- 99.9% authentication service uptime
- Support for 10,000+ concurrent users
- Sub-2-second login response time
- Zero security breaches in first 6 months

## Risk Assessment
- **High**: Security vulnerabilities in implementation
- **Medium**: Integration complexity with existing systems
- **Low**: User adoption of new authentication methods

## Timeline Estimates
- Planning & Design: 2 weeks
- Development: 6 weeks
- Testing & QA: 2 weeks
- Deployment: 1 week

## Resource Requirements
- 2 Senior Developers
- 1 Security Specialist
- 1 QA Engineer
- 1 DevOps Engineer`,

      functionalSpec: `# Functional Specification: User Authentication System

## 1. Functional Requirements

### FR-001: User Registration
- Users must be able to create accounts using email and password
- System must validate email format and password strength
- Email verification must be required before account activation

### FR-002: User Login
- Users must be able to login using email/password combination
- System must support "Remember Me" functionality
- Failed login attempts must be tracked and limited

### FR-003: Social Media Authentication
- Users must be able to login using Google OAuth
- Users must be able to login using Facebook OAuth
- Social accounts must be linkable to existing accounts

### FR-004: Password Management
- Users must be able to reset passwords via email
- Users must be able to change passwords when logged in
- Password history must be maintained (last 5 passwords)

### FR-005: Role-Based Access Control
- System must support multiple user roles (Admin, User, Guest)
- Permissions must be configurable per role
- Role assignments must be auditable

## 2. User Stories

### US-001: User Registration
**As a** new user
**I want to** create an account with my email and password
**So that** I can access the platform securely

**Acceptance Criteria:**
- Email format validation is performed
- Password meets complexity requirements
- Confirmation email is sent
- Account is inactive until email verification

### US-002: Social Login
**As a** user
**I want to** login using my Google account
**So that** I don't need to remember another password

**Acceptance Criteria:**
- Google OAuth integration works correctly
- User profile information is imported
- Existing accounts can be linked

## 3. Use Cases

### UC-001: Standard Login Flow
1. User navigates to login page
2. User enters email and password
3. System validates credentials
4. System creates session
5. User is redirected to dashboard

### UC-002: Password Reset Flow
1. User clicks "Forgot Password"
2. User enters email address
3. System sends reset email
4. User clicks reset link
5. User enters new password
6. System updates password

## 4. Data Requirements
- User profiles with encrypted passwords
- Session management data
- OAuth tokens and refresh tokens
- Audit logs for authentication events
- Role and permission definitions

## 5. Integration Requirements
- Integration with existing user database
- LDAP/Active Directory integration (future)
- Single Sign-On (SSO) capability
- API authentication for mobile apps

## 6. Performance Requirements
- Login response time: < 2 seconds
- Support for 10,000 concurrent users
- 99.9% uptime requirement
- Password reset emails delivered within 1 minute

## 7. Security Requirements
- Passwords must be hashed using bcrypt
- Session tokens must be cryptographically secure
- HTTPS required for all authentication endpoints
- Rate limiting on login attempts
- CSRF protection on all forms`,

      technicalSpec: `# Technical Specification: User Authentication System

## 1. System Architecture Overview

### High-Level Architecture
The authentication system will be built using a microservices architecture with the following components:
- Authentication Service (Node.js/Express)
- User Management Service
- Session Management Service
- Notification Service (for emails)
- API Gateway (for routing and rate limiting)

### Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Redis for sessions
- **Authentication**: JWT tokens with refresh token rotation
- **Email Service**: SendGrid or AWS SES
- **Caching**: Redis for session storage
- **Monitoring**: DataDog or New Relic

## 2. Database Design

### Users Table
\`\`\`sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    role_id UUID REFERENCES roles(id)
);
\`\`\`

### Sessions Table
\`\`\`sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);
\`\`\`

### OAuth Providers Table
\`\`\`sql
CREATE TABLE oauth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);
\`\`\`

## 3. API Specifications

### Authentication Endpoints

#### POST /api/auth/register
**Request:**
\`\`\`json
{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "firstName": "John",
    "lastName": "Doe"
}
\`\`\`

**Response:**
\`\`\`json
{
    "success": true,
    "message": "Registration successful. Please check your email for verification.",
    "userId": "uuid-here"
}
\`\`\`

#### POST /api/auth/login
**Request:**
\`\`\`json
{
    "email": "user@example.com",
    "password": "SecurePassword123!"
}
\`\`\`

**Response:**
\`\`\`json
{
    "success": true,
    "accessToken": "jwt-token-here",
    "refreshToken": "refresh-token-here",
    "user": {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user"
    }
}
\`\`\`

## 4. Security Implementation

### Password Security
- Use bcrypt with salt rounds of 12
- Implement password complexity requirements
- Store password history to prevent reuse

### JWT Implementation
- Use RS256 algorithm for signing
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days) with rotation
- Include user role and permissions in token payload

### Rate Limiting
- Login attempts: 5 per minute per IP
- Password reset: 3 per hour per email
- Registration: 10 per hour per IP

## 5. Deployment Strategy

### Infrastructure
- Docker containers deployed on AWS ECS
- Application Load Balancer for high availability
- RDS PostgreSQL with Multi-AZ deployment
- ElastiCache Redis cluster for sessions

### CI/CD Pipeline
1. Code commit triggers GitHub Actions
2. Run automated tests (unit, integration, security)
3. Build Docker images
4. Deploy to staging environment
5. Run end-to-end tests
6. Deploy to production with blue-green deployment

## 6. Testing Strategy

### Unit Tests
- Test all authentication functions
- Mock external dependencies
- Achieve 90%+ code coverage

### Integration Tests
- Test API endpoints
- Test database interactions
- Test OAuth flows

### Security Tests
- Penetration testing
- OWASP security scanning
- Dependency vulnerability scanning

## 7. Monitoring and Logging

### Metrics to Track
- Login success/failure rates
- Response times for authentication endpoints
- Active user sessions
- Failed login attempt patterns

### Logging Strategy
- Structured logging with JSON format
- Log all authentication events
- Implement log aggregation with ELK stack
- Set up alerts for suspicious activities`,

      uxSpec: `# UX Specification: User Authentication System

## 1. User Personas

### Primary Persona: Sarah - The Busy Professional
- **Age**: 32
- **Occupation**: Marketing Manager
- **Tech Savviness**: Medium
- **Goals**: Quick and secure access to work tools
- **Pain Points**: Forgetting passwords, slow login processes
- **Preferred Features**: Social login, password managers, "Remember Me"

### Secondary Persona: Mike - The Security-Conscious User
- **Age**: 45
- **Occupation**: IT Administrator
- **Tech Savviness**: High
- **Goals**: Maximum security with reasonable convenience
- **Pain Points**: Weak authentication systems, lack of audit trails
- **Preferred Features**: Two-factor authentication, detailed security logs

## 2. User Journey Maps

### New User Registration Journey
1. **Discovery**: User learns about the platform
2. **Registration**: User decides to create an account
3. **Form Completion**: User fills out registration form
4. **Email Verification**: User checks email and verifies account
5. **First Login**: User logs in for the first time
6. **Onboarding**: User completes profile setup

**Pain Points:**
- Complex password requirements
- Delayed verification emails
- Unclear error messages

**Opportunities:**
- Progressive disclosure of requirements
- Real-time validation feedback
- Clear success indicators

### Returning User Login Journey
1. **Access Need**: User needs to access the platform
2. **Login Page**: User navigates to login
3. **Credential Entry**: User enters email/password
4. **Authentication**: System validates credentials
5. **Dashboard Access**: User reaches main application

**Pain Points:**
- Forgotten passwords
- Slow authentication
- Session timeouts

**Opportunities:**
- Password strength indicators
- Biometric authentication
- Smart session management

## 3. Wireframe Descriptions

### Login Page Wireframe
- The login page should feature a clean and intuitive design.
- Include fields for email and password entry.
- Provide options for social media login (Google, Facebook).
- Implement a "Remember Me" checkbox.
- Display a password strength indicator.
- Include a "Forgot Password" link.
- Ensure the page is responsive and works well on various devices.
`
    }
  });

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
          <Badge>{project.status}</Badge>
        </CardHeader>
        <CardContent>
          <p>Created at: {project.createdAt}</p>
          <p>Jira Epic: {project.jiraEpic}</p>
          <p>
            Confluence Page:{" "}
            <a href={project.confluencePage} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="businessAnalysis">
        <TabsList>
          <TabsTrigger value="businessAnalysis">Business Analysis</TabsTrigger>
          <TabsTrigger value="functionalSpec">Functional Specification</TabsTrigger>
          <TabsTrigger value="technicalSpec">Technical Specification</TabsTrigger>
          <TabsTrigger value="uxSpec">UX Specification</TabsTrigger>
        </TabsList>
        <TabsContent value="businessAnalysis">
          <pre>{project.documents.businessAnalysis}</pre>
        </TabsContent>
        <TabsContent value="functionalSpec">
          <pre>{project.documents.functionalSpec}</pre>
        </TabsContent>
        <TabsContent value="technicalSpec">
          <pre>{project.documents.technicalSpec}</pre>
        </TabsContent>
        <TabsContent value="uxSpec">
          <pre>{project.documents.uxSpec}</pre>
        </TabsContent>
      </Tabs>
    </div>
  )
}

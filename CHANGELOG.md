# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-01-17

### Added
- **Meeting Transcript Processing**: New document type for converting meeting transcripts into structured documentation
  - Generates comprehensive meeting summaries with action items and decisions
  - Creates detailed Agile requirement stories in Jira-ready format
  - Supports transcripts up to 100,000 characters
  - Smart contextual UI that detects when transcript is present
  - Dedicated API endpoint `/api/generate-meeting-transcript`
  - Custom prompt template for meeting analysis
  - Rate limiting: 5 transcripts/day for anonymous users
- Quick action button for Meeting Transcript on landing page
- Admin panel support for managing meeting transcript prompts
- Sample meeting transcript for testing in `test-data/`

### Changed
- Enhanced document optimization configuration to support larger inputs
- Updated rate limiting service to handle document-type specific limits
- Improved UX with smart detection of meeting transcript content

### Technical
- Database migration: `add-meeting-transcript.sql`
- New document type enum: 'meeting'
- Higher token limits configured (50k chars for meeting transcripts)
- Support for both OpenAI and Anthropic AI providers

## [1.1.0] - 2024-12-21

### Added
- New Tools section in dashboard with SDLC, CodeYodha, GitDigest, and Early Access
- Mobile responsive design improvements
- Better navigation layout with Tools on left and Settings on right

### Changed
- Reorganized dashboard layout for better UX
- Renamed "Tools" menu to "Settings"
- Improved mobile responsiveness

### Fixed
- Resolved undefined function errors (handleGenerate, handleDocumentSelection)
- Removed duplicate usage counters and early access buttons

## [1.0.0] - 2024-12-21

### Added
- Initial release of SDLC Automation Platform
- Comprehensive SDLC generation capabilities
- GitHub integration with repository analysis
- Slack integration for team collaboration
- Early access and freemium system
- User authentication and role management
- Prompt management system
- GitDigest automation features
- Project management and visualization tools

### Features
- AI-powered SDLC document generation
- Real-time collaboration tools
- Integration with popular development platforms
- Advanced analytics and reporting
- Mobile-responsive design
- Comprehensive API documentation

## [0.9.0] - 2024-12-15

### Added
- Beta version with core functionality
- Basic SDLC generation
- User authentication
- GitHub integration

### Changed
- Improved UI/UX design
- Enhanced performance

### Fixed
- Various bug fixes and improvements

## [0.8.0] - 2024-12-01

### Added
- Alpha version with initial features
- Basic project structure
- Core API endpoints

### Changed
- Initial development phase

---

## Version History

- **1.0.0**: Production-ready release with full feature set
- **0.9.0**: Beta release with core functionality
- **0.8.0**: Alpha release with basic features

## Contributing

To add entries to this changelog:

1. Add your changes under the `[Unreleased]` section
2. Use the appropriate category (Added, Changed, Deprecated, Removed, Fixed, Security)
3. Provide a clear, concise description of the change
4. Reference any related issues or pull requests

## Release Process

1. Update version numbers in `package.json`
2. Move changes from `[Unreleased]` to a new version section
3. Update the release date
4. Tag the release in git
5. Create a GitHub release with release notes 
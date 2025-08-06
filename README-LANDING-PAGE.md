# Landing Page Configuration

This project now supports two landing page styles that can be switched via environment variable.

## Configuration

Add the following to your `.env.local` file:

```bash
# Landing Page Configuration
# Set to 'simple' for minimal Claude-style landing page or 'default' for existing landing page
NEXT_PUBLIC_LANDING_PAGE_STYLE=simple
```

## Landing Page Options

### 1. Default Landing Page (existing)
- Full-featured landing page with all sections
- Dark theme with gradient backgrounds
- Multiple feature sections, integrations, demo
- Set: `NEXT_PUBLIC_LANDING_PAGE_STYLE=default` or leave unset

### 2. Simple Landing Page (new)
- Minimal, Claude-inspired interface
- Clean, light design with focus on simplicity
- Single hero section with quick actions
- Set: `NEXT_PUBLIC_LANDING_PAGE_STYLE=simple`

## Features of Simple Landing Page

- Clean, minimal design similar to Claude's interface
- Time-based personalized greeting (Morning/Afternoon/Evening)
- SDLC logo in the greeting
- Sign in/Sign up buttons in the header
- Large chat-style input area with integrated tools
- Document type selection dropdown (via Plus button)
- Architecture diagram generation for non-logged in users
- Four main action buttons: Write, Learn, Code, Automate
- Informative message about platform capabilities

## Switching Between Landing Pages

1. Edit your `.env.local` file
2. Change `NEXT_PUBLIC_LANDING_PAGE_STYLE` to either `simple` or `default`
3. Restart your development server: `npm run dev`
4. The landing page will automatically switch based on your setting

## Customization

The simple landing page component is located at:
`/app/simple-landing-page.tsx`

You can customize:
- Colors (currently using orange as primary)
- Feature buttons and their descriptions
- Integration icons shown
- CTA text and behavior
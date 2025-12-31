import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Idea to Spec - Transform Ideas into Technical Specifications',
  description: 'Turn your project ideas into comprehensive technical specifications with AI-generated diagrams including mindmaps, user journeys, architecture diagrams, sequence diagrams, and database schemas.',
  keywords: [
    'idea to spec',
    'requirements gathering',
    'system design',
    'architecture diagrams',
    'user journey',
    'sequence diagrams',
    'ERD',
    'database schema',
    'AI specifications',
  ],
  openGraph: {
    title: 'Idea to Spec - AI-Powered Specification Generator',
    description: 'Transform ideas into complete technical specifications with interactive diagrams.',
    type: 'website',
  },
};

export default function IdeaToSpecLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

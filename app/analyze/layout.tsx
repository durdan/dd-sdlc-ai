import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GitHub Repository Analyzer - Extract Tech Stacks & Architecture',
  description: 'Analyze any GitHub repository to extract technology stacks, architecture patterns, dependencies, and project structure. Get instant insights into any open-source project.',
  keywords: [
    'GitHub analyzer',
    'repository analysis',
    'tech stack extractor',
    'code analysis',
    'dependency scanner',
    'architecture detection',
    'open source analysis',
    'project structure',
  ],
  openGraph: {
    title: 'GitHub Repository Analyzer - SDLC.dev',
    description: 'Analyze any GitHub repository to extract tech stacks, architecture patterns, and project insights.',
    url: 'https://sdlc.dev/analyze',
    images: [
      {
        url: '/img/og-analyzer.png',
        width: 1200,
        height: 630,
        alt: 'SDLC.dev GitHub Repository Analyzer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub Repository Analyzer - SDLC.dev',
    description: 'Analyze any GitHub repository to extract tech stacks and architecture patterns.',
    images: ['/img/og-analyzer.png'],
  },
  alternates: {
    canonical: 'https://sdlc.dev/analyze',
  },
};

export default function AnalyzeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

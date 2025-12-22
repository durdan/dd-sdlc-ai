import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company Tech Stacks - Architecture Diagrams & System Design',
  description: 'Explore real architecture diagrams and tech stacks from Netflix, Uber, Stripe, Instagram, and 15+ top tech companies. Learn how engineering teams build scalable systems.',
  keywords: [
    'tech stack',
    'architecture diagram',
    'system design',
    'Netflix architecture',
    'Uber architecture',
    'Stripe infrastructure',
    'microservices',
    'distributed systems',
    'scalable architecture',
    'engineering blog',
  ],
  openGraph: {
    title: 'Company Tech Stacks - Real Architecture from Top Companies',
    description: 'Explore architecture diagrams and tech stacks from Netflix, Uber, Stripe, and 15+ leading tech companies.',
    url: 'https://sdlc.dev/tech-stacks',
    images: [
      {
        url: '/img/og-tech-stacks.png',
        width: 1200,
        height: 630,
        alt: 'SDLC.dev Tech Stacks - Architecture Diagrams',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Company Tech Stacks - Real Architecture from Top Companies',
    description: 'Explore architecture diagrams from Netflix, Uber, Stripe, and more.',
    images: ['/img/og-tech-stacks.png'],
  },
  alternates: {
    canonical: 'https://sdlc.dev/tech-stacks',
  },
};

export default function TechStacksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

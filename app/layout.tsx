import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import CookieConsent from "@/components/cookie-consent"
import { SDLC_PRODUCT } from "@/lib/product"

const inter = Inter({ subsets: ["latin"] })

// While the product is off the site is the design-walkthrough library (see lib/product.ts).
const SITE_TITLE = SDLC_PRODUCT ? "SDLC.dev - AI-Powered Software Development Lifecycle Automation" : "Learn software design: patterns and real architectures | SDLC.dev"
const SITE_DESCRIPTION = SDLC_PRODUCT
  ? "Transform ideas into production-ready specifications with AI. Generate business analysis, technical specs, architecture diagrams, and coding prompts instantly. Explore tech stacks from Netflix, Uber, Stripe, and more."
  : "Learn how great software is designed and built: design patterns explained through the problems they solve (resilience, data consistency, scaling, event-driven systems) and how Netflix, Stripe, Uber and other digital companies built their systems, step by step."

export const metadata: Metadata = {
  metadataBase: new URL('https://sdlc.dev'),
  title: {
    default: SITE_TITLE,
    template: '%s | SDLC.dev',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'SDLC automation',
    'AI documentation',
    'software development lifecycle',
    'technical specifications',
    'architecture diagrams',
    'GitHub analyzer',
    'project documentation',
    'tech stack',
    'Netflix architecture',
    'Uber architecture',
    'microservices',
    'system design',
  ],
  authors: [{ name: 'SDLC.dev Team' }],
  creator: 'SDLC.dev',
  publisher: 'SDLC.dev',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sdlc.dev',
    siteName: 'SDLC.dev',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/img/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SDLC.dev - AI-Powered SDLC Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/img/og-image.png'],
    creator: '@sdlc_dev',
  },
  alternates: {
    canonical: 'https://sdlc.dev',
  },
  category: 'technology',
}

// JSON-LD structured data for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://sdlc.dev/#organization',
      name: 'SDLC.dev',
      url: 'https://sdlc.dev',
      logo: {
        '@type': 'ImageObject',
        url: 'https://sdlc.dev/favicon.png',
      },
      sameAs: [
        'https://twitter.com/sdlc_dev',
        'https://github.com/sdlc-dev',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://sdlc.dev/#website',
      url: 'https://sdlc.dev',
      name: 'SDLC.dev',
      description: 'AI-Powered Software Development Lifecycle Automation',
      publisher: {
        '@id': 'https://sdlc.dev/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://sdlc.dev/tech-stacks?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://sdlc.dev/#application',
      name: 'SDLC.dev',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'Transform ideas into production-ready specifications with AI. Generate business analysis, technical specs, architecture diagrams, and coding prompts.',
      featureList: [
        'Business Analysis Document Generation',
        'Technical Specification Generation',
        'Architecture Diagram Creation',
        'AI Coding Prompts',
        'GitHub Repository Analysis',
        'Tech Stack Explorer',
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  )
}

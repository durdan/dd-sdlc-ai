import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSpecByShareId, incrementViewCount } from '@/lib/spec-storage-service';
import { SpecViewerPage } from './SpecViewerPage';

interface PageProps {
  params: Promise<{ shareId: string }>;
}

// Generate metadata for SEO and Open Graph
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareId } = await params;
  const spec = await getSpecByShareId(shareId);

  if (!spec) {
    return {
      title: 'Specification Not Found - SDLC.dev',
    };
  }

  const title = `${spec.repo_name} - Project Specification`;
  const description = `Auto-generated project specification for ${spec.repo_owner}/${spec.repo_name}`;
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sdlc.dev'}/spec/${shareId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'SDLC.dev',
      type: 'article',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://sdlc.dev'}/api/og/${shareId}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${process.env.NEXT_PUBLIC_APP_URL || 'https://sdlc.dev'}/api/og/${shareId}`],
    },
  };
}

export default async function SpecPage({ params }: PageProps) {
  const { shareId } = await params;
  const spec = await getSpecByShareId(shareId);

  if (!spec) {
    notFound();
  }

  // Increment view count
  await incrementViewCount(shareId);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sdlc.dev';

  return (
    <SpecViewerPage
      markdown={spec.spec_markdown}
      metadata={{
        repoOwner: spec.repo_owner,
        repoName: spec.repo_name,
        repoUrl: spec.repo_url,
        generatedAt: spec.created_at,
        analysisVersion: '1.0',
      }}
      shareUrl={`${appUrl}/spec/${shareId}`}
      viewCount={spec.view_count}
    />
  );
}

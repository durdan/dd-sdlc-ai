import { MetadataRoute } from 'next';
import { companies } from '@/data/tech-stacks';
import { getCatalog, KIND_PREFIX } from '@/lib/learn/content';
import { SDLC_PRODUCT } from '@/lib/product';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sdlc.dev';

  // The learning library: home, tabs and every topic.
  const catalog = await getCatalog();
  const learnPages = [
    { url: `${baseUrl}/learn`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    ...['companies', 'paths'].map((tab) => ({ url: `${baseUrl}/learn/library/${tab}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...catalog.topics.map((t) => ({
      url: `${baseUrl}/learn/${KIND_PREFIX[t.meta?.kind ?? 'pattern']}/${t.id}`,
      lastModified: new Date(t.meta?.updated ?? Date.now()),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
  if (!SDLC_PRODUCT) {
    const legal = ['privacy', 'terms'].map((p) => ({ url: `${baseUrl}/${p}`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.3 }));
    return [{ url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1 }, ...learnPages, ...legal];
  }

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/tech-stacks`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/analyze`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];

  // Dynamic tech stack pages
  const techStackPages = companies.map((company) => ({
    url: `${baseUrl}/tech-stacks/${company.slug}`,
    lastModified: new Date(company.lastUpdated || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...techStackPages, ...learnPages];
}

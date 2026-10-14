import { readFileSync } from 'node:fs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // The old learning pages now live in the walkthrough library at /learn.
  async redirects() {
    // Every company that has a case study in the library gets its old tech-stack URL redirected to it.
    const catalog = JSON.parse(readFileSync(new URL('./public/learn/catalog.json', import.meta.url), 'utf8'))
    const caseStudies = catalog.topics.filter((t) => t.meta?.kind === 'company').map((t) => t.id)
    return [
      { source: '/learning-paths', destination: '/learn/library/paths', permanent: false },
      { source: '/system-design', destination: '/learn', permanent: false },
      ...caseStudies.map((slug) => ({ source: `/tech-stacks/${slug}`, destination: `/learn/c/${slug}`, permanent: false })),
      { source: '/tech-stacks/:path*', destination: '/learn/library/companies', permanent: false },
    ]
  },
  webpack: (config, { isServer }) => {
    // Handle Mermaid dynamic imports
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    // Optimize Mermaid bundle
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('mermaid');
    }
    
    return config;
  },
}

export default nextConfig

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
    const caseStudies = ['uber', 'stripe', 'discord', 'netflix', 'whatsapp', 'youtube']
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

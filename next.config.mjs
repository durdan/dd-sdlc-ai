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
  experimental: {
    esmExternals: 'loose',
  },
}

export default nextConfig

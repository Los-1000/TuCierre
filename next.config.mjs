/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aggressive tree-shaking for large icon/component libraries
  // lucide-react alone has 1000+ icons — this cuts bundle significantly
  experimental: {
    // Only packages that are explicitly barrel-file safe
    optimizePackageImports: ['lucide-react'],
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.in' },
    ],
    // Serve WebP/AVIF automatically for uploaded images
    formats: ['image/avif', 'image/webp'],
  },

  // Compress responses
  compress: true,

  // Don't expose server errors to client
  poweredByHeader: false,
}

export default nextConfig

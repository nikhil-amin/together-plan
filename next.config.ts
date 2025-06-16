
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Add this line for static site generation
  basePath: '/together-plan',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    // For static export, if you use next/image for anything other than fully static URLs,
    // you might need to set unoptimized: true.
    // However, placehold.co URLs should be fine.
    // unoptimized: true, 
  },
};

export default nextConfig;

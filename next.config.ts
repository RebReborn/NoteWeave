import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
  },
  devIndicators: {
    allowedDevOrigins: [
      'https://6000-firebase-studio-1751643380129.cluster-lqnxvk7thvfw4wbonsercicksm.cloudworkstations.dev',
      'https://9000-firebase-studio-1751643380129.cluster-lqnxvk7thvfw4wbonsercicksm.cloudworkstations.dev',
    ]
  }
};

export default nextConfig;

import type { NextConfig } from 'next';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:5199';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5199',
                pathname: '/**',
            },
            { protocol: 'https', hostname: '**' },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
            {
                source: '/mapi/:path*',
                destination: `${backendUrl}/mapi/:path*`,
            },
            {
                source: '/storage/:path*',
                destination: `${backendUrl}/storage/:path*`,
            },
        ];
    },
};

export default nextConfig;

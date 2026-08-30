/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: '*.public.blob.vercel-storage.com',
            },
        ],
    },
    experimental: {
        serverComponentsExternalPackages: ["mongoose"]
    },
    async rewrites() {
        return [
            {
                source: '/blob/:path*',
                destination: 'https://9vaqqf9s1c4ou0pk.public.blob.vercel-storage.com/:path*',
            },
        ];
    },
    async redirects() {
        return [
            {
                source: '/:path*',
                has: [
                    {
                        type: 'host',
                        value: 'amt-nfc-system.vercel.app',
                    },
                ],
                destination: 'https://amtsmartsystem.com/:path*',
                permanent: true,
            },
        ];
    }
};

module.exports = nextConfig;

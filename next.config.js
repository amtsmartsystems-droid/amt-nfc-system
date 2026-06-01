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
    }
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@cairn/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = nextConfig;

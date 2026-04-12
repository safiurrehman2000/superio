/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ['pdfkit'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('pdfkit');
    }
    return config;
  },
};

module.exports = nextConfig;

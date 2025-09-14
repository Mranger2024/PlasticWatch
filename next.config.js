/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['s3.amazonaws.com'],
  },
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    // Handle Leaflet marker icons
    config.module.rules.push({
      test: /node_modules\/leaflet\/dist\/images\/layer[\/\\]\*\*\/\*\.(png|jpg|jpeg|gif|webp|svg)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    });

    return config;
  },
  // Enable static exports for the output: 'export' option
  output: 'standalone',
  // Disable image optimization API route
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;

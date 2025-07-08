/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Exclude docs folder from build
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: [/\/docs\//],
    });
    return config;
  },
};

export default nextConfig;

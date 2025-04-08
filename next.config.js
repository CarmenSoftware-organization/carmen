/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Don't ignore build errors
    ignoreBuildErrors: false
  },
  // Add experimental flag to force SWC
  experimental: {
    forceSwcTransforms: true,
  },
  async redirects() {
    return [
      {
        source: '/procurement',
        destination: '/procurement/goods-received-note',
        permanent: true,
      }
    ]
  }
}

export default nextConfig

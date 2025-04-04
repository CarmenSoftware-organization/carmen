/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Don't ignore build errors
    ignoreBuildErrors: false
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

module.exports = nextConfig

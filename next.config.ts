import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  webpack(config) {
    return config
  },
}

export default nextConfig
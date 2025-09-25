/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.binance.com', 'bin.bnbstatic.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimizări pentru WebSocket connections și TensorFlow
    config.externals = [...config.externals, { canvas: 'canvas' }]
    return config
  },
  // Optimizări pentru producție
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Headers pentru securitate
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' ? 'https://profesorxtrader.vercel.app' : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Binance-Apikey',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
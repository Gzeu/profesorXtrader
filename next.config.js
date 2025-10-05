/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // ESLint configuration for CI/CD pipeline
  eslint: {
    // Don't fail build on ESLint warnings in CI
    ignoreDuringBuilds: false,
    // Only check specific directories to speed up builds
    dirs: ['pages', 'components', 'lib', 'src', 'app'],
  },

  // TypeScript configuration
  typescript: {
    // Handle TypeScript errors gracefully during build
    ignoreBuildErrors: false,
  },

  // Build optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Image configuration for trading charts and icons
  images: {
    domains: ['api.binance.com', 'bin.bnbstatic.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Performance optimizations
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      '@tensorflow/tfjs',
      'recharts'
    ],
    // Enable modern bundling
    esmExternals: true,
  },
  
  // Webpack configuration for TensorFlow and WebSocket support
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimizări pentru WebSocket connections și TensorFlow
    config.externals = [...config.externals, { canvas: 'canvas' }]
    
    // Handle ES modules properly for better compatibility
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    
    // Optimize for production builds
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          tensorflow: {
            test: /[\\/]node_modules[\\/]@tensorflow[\\/]/,
            name: 'tensorflow',
            priority: 20,
            chunks: 'all',
          },
        },
      };
    }
    
    return config
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  
  // Security and API headers
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
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Redirects for better routing
  async redirects() {
    return [];
  },

  // Rewrites for API optimization
  async rewrites() {
    return [];
  },
}

module.exports = nextConfig
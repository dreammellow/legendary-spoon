/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'cryptoairdrop-backend.onrender.com'],
  },
  
  // Optimize for production stability
  experimental: {
    // Reduce memory usage and improve stability
    memoryBasedWorkersCount: true,
  },
  
  // Optimize webpack for better performance and stability
  webpack: (config, { dev, isServer }) => {
    // Fix module resolution issues
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      },
    };

    // Fix exports is not defined error
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.m?js$/,
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    };

    // Only apply optimizations in development
    if (dev) {
      // Reduce recompilation frequency
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
      
      // Optimize chunk splitting to prevent memory issues
      config.optimization = {
        ...config.optimization,
        splitChunks: {
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
          },
        },
      };
      
      // Suppress TensorFlow.js console output during development
      process.env.TF_CPP_MIN_LOG_LEVEL = '3';
      process.env.TF_CPP_MIN_VLOG_LEVEL = '3';
      process.env.TF_CPP_MIN_ERROR_REPORTING = '1';
      
      // Suppress TensorFlow.js kernel registration messages
      config.plugins.push(
        new (require('webpack')).DefinePlugin({
          'process.env.TF_CPP_MIN_LOG_LEVEL': JSON.stringify('3'),
          'process.env.TF_CPP_MIN_VLOG_LEVEL': JSON.stringify('3'),
          'process.env.TF_CPP_MIN_ERROR_REPORTING': JSON.stringify('1'),
        })
      );

      // Override console methods globally during webpack compilation
      const originalConsoleLog = console.log;
      const originalConsoleWarn = console.warn;
      const originalConsoleError = console.error;

      console.log = (...args) => {
        const message = args.join(' ');
        if (
          !message.includes('Platform node has already been set') &&
          !message.includes('kernel') &&
          !message.includes('backend') &&
          !message.includes('already registered') &&
          !message.includes('wasm backend was already registered') &&
          !message.includes('cpu backend was already registered') &&
          !message.includes('The kernel') &&
          !message.includes('for backend') &&
          !message.includes('is already registered') &&
          !message.includes('AWS SDK for JavaScript (v2) is in maintenance mode') &&
          !message.includes('SDK releases are limited to address critical bug fixes') &&
          !message.includes('Please migrate your code to use AWS SDK for JavaScript (v3)')
        ) {
          originalConsoleLog(...args);
        }
      };

      console.warn = (...args) => {
        const message = args.join(' ');
        if (
          !message.includes('TensorFlow.js') &&
          !message.includes('backend') &&
          !message.includes('kernel') &&
          !message.includes('AWS SDK for JavaScript (v2) is in maintenance mode') &&
          !message.includes('SDK releases are limited to address critical bug fixes') &&
          !message.includes('Please migrate your code to use AWS SDK for JavaScript (v3)')
        ) {
          originalConsoleWarn(...args);
        }
      };

      console.error = (...args) => {
        const message = args.join(' ');
        if (
          !message.includes('TensorFlow.js') &&
          !message.includes('backend') &&
          !message.includes('kernel')
        ) {
          originalConsoleError(...args);
        }
      };
    }
    
    return config;
  },
  
  // Optimize for production
  swcMinify: true,
  
  // Production optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: true,
    },
    // Enable static optimization
    output: 'standalone',
    // Optimize images
    images: {
      domains: ['localhost', 'cryptoairdrop-backend.onrender.com'],
      unoptimized: false,
      formats: ['image/webp', 'image/avif'],
    },
  }),
  
  // Environment-specific configurations
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig

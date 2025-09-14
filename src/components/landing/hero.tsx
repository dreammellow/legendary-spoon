'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline'

export function Hero() {
  return (
    <div className="relative pt-20 pb-16 sm:pt-24 sm:pb-20">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 blur-3xl" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-2 mb-8">
              <SparklesIcon className="h-8 w-8 text-primary-500" />
              <span className="text-lg font-semibold text-primary-400">The Future of Crypto Airdrops</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Join the{' '}
              <span className="gradient-text">Revolution</span>
              <br />
              Earn Free Tokens
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
              Be part of the next generation cryptocurrency ecosystem. Complete tasks, refer friends, 
              and earn exclusive tokens through our innovative airdrop platform.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <Link
              href="/airdrop"
              className="group rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-8 py-4 text-sm font-semibold text-white shadow-lg hover:shadow-primary-500/25 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              <span>Start Earning Now</span>
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            
            <Link
              href="#features"
              className="text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors duration-200"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
          
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-primary-500/20 rounded-full blur-xl animate-float" />
      <div className="absolute top-1/3 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }} />
    </div>
  )
}

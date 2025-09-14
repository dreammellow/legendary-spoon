'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { SimpleFooter } from '@/components/layout/simple-footer'
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline'

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-crypto-dark">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <WrenchScrewdriverIcon className="h-16 w-16 text-yellow-500" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
              Under Maintenance
            </h1>
            
            <p className="text-lg leading-8 text-gray-300 mb-8">
              We're currently performing scheduled maintenance to improve your experience. 
              We'll be back online shortly.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  What's happening?
                </h3>
                <p className="text-gray-300 text-sm">
                  We're updating our systems to provide you with better performance and new features. 
                  This maintenance is expected to be completed within a few hours.
                </p>
              </div>
              
              <div className="text-xs text-gray-400">
                <p>Thank you for your patience. We appreciate your understanding.</p>
                <p>For urgent matters, please contact our support team.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      <SimpleFooter />
    </main>
  )
}

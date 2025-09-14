'use client'

import { motion } from 'framer-motion'
// import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export function WalletNotConnected() {
  return (
    <div className="pt-20 pb-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
            Wallet Not Connected
          </h1>
          
          <p className="text-lg leading-8 text-gray-300 mb-8">
            Please connect your wallet to access your dashboard and view your earnings, 
            referrals, and complete tasks.
          </p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Connect Wallet (Mock)
            </button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            <div className="glass-effect rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-primary-400 mb-2">Track</div>
              <div className="text-sm text-gray-300">Your earnings and referrals</div>
            </div>
            
            <div className="glass-effect rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-primary-400 mb-2">Share</div>
              <div className="text-sm text-gray-300">Your referral links</div>
            </div>
            
            <div className="glass-effect rounded-xl p-6 text-center">
              <div className="text-2xl font-bold text-primary-400 mb-2">Earn</div>
              <div className="text-sm text-gray-300">More tokens daily</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

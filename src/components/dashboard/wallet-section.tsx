'use client'

import { motion } from 'framer-motion'
import { WalletIcon, CreditCardIcon, BanknotesIcon, LockClosedIcon } from '@heroicons/react/24/outline'

interface WalletSectionProps {
  user: any // User prop is passed but not used yet
}

export function WalletSection({ user }: WalletSectionProps) {
  return (
    <div className="space-y-6">
      {/* Coming Soon Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-effect rounded-xl p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary-600/20 rounded-full">
            <WalletIcon className="h-16 w-16 text-primary-400" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">Wallet Coming Soon</h2>
        <p className="text-gray-300 text-lg mb-6">
          We're working on bringing you a comprehensive wallet experience with multiple features.
        </p>
        
        <div className="inline-flex items-center px-4 py-2 bg-primary-600/20 border border-primary-500/30 rounded-full">
          <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse mr-2"></div>
          <span className="text-primary-400 font-medium">In Development</span>
        </div>
      </motion.div>

      {/* Planned Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-6">Planned Features</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Crypto Wallet</h4>
                <p className="text-sm text-gray-400">Store and manage your cryptocurrencies securely</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Token Exchange</h4>
                <p className="text-sm text-gray-400">Convert mining points to various tokens</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
              <LockClosedIcon className="h-6 w-6 text-purple-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Secure Storage</h4>
                <p className="text-sm text-gray-400">Advanced security features for your assets</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-800/50 rounded-lg">
              <WalletIcon className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Multi-Chain Support</h4>
                <p className="text-sm text-gray-400">Support for multiple blockchain networks</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Current Balance Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-effect rounded-xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">Current Assets</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-600/20 to-primary-700/20 rounded-lg border border-primary-500/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">MP</span>
              </div>
              <div>
                <p className="font-semibold text-white">Mining Points</p>
                <p className="text-sm text-gray-400">Available for conversion</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-white">Coming Soon</p>
              <p className="text-xs text-gray-400">Conversion rate TBD</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">?</span>
              </div>
              <div>
                <p className="font-semibold text-white">Other Tokens</p>
                <p className="text-sm text-gray-400">More tokens coming soon</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-400">TBA</p>
              <p className="text-xs text-gray-500">Not available yet</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Notification */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6"
      >
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="font-semibold text-blue-400 mb-2">Wallet Development Update</h4>
            <p className="text-blue-300 text-sm">
              We're actively developing the wallet feature to provide you with a secure and user-friendly 
              experience. The wallet will support multiple cryptocurrencies and provide seamless integration 
              with our mining platform. Stay tuned for updates!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

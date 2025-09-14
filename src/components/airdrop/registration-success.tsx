'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircleIcon, ArrowRightIcon, ShareIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

export function RegistrationSuccess() {
  const [referralLink] = useState('https://cryptoairdrop.com/airdrop?ref=ABC123')
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  return (
    <div className="min-h-screen bg-crypto-dark flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6"
          >
            <CheckCircleIcon className="w-10 h-10 text-white" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Registration Successful! 🎉
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Welcome to CryptoAirdrop! You're now part of our exclusive community.
            </p>
            <div className="bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-lg p-4 border border-primary-500/30">
              <p className="text-primary-300 font-semibold">
                🎁 You've earned 100 free tokens just for registering!
              </p>
            </div>
          </motion.div>

          {/* Referral Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Start Earning More!</h2>
            <p className="text-gray-300 mb-6">
              Share your referral link and earn 50 tokens for each friend who joins!
            </p>
            
            {/* Referral Link */}
            <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 bg-transparent text-gray-300 text-sm font-mono"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center space-x-2"
                >
                  <ShareIcon className="w-4 h-4" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-400">
              Share this link on social media, forums, or with friends to start earning!
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
            >
              Go to Dashboard
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
            
            <Link
              href="/tasks"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors duration-200"
            >
              Complete Tasks
            </Link>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 pt-6 border-t border-gray-700"
          >
            <p className="text-sm text-gray-400">
              Check your email for verification instructions and more details about your account.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

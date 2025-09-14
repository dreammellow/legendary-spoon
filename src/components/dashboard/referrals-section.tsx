'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LinkIcon, UserGroupIcon, CurrencyDollarIcon, ShareIcon } from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  referral_code: string
  referred_by: string | null
  referral_earnings: number
  level1_referrals: number
  level2_referrals: number
  level3_referrals: number
}

interface ReferralsSectionProps {
  user: User | null
}

export function ReferralsSection({ user }: ReferralsSectionProps) {
  const [copied, setCopied] = useState(false)

  // Handle null user case
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="glass-effect rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-gray-600 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-600 rounded w-48 mb-6"></div>
          <div className="h-12 bg-gray-600 rounded w-full"></div>
        </div>
      </div>
    )
  }

  const referralLink = `${window.location.origin}/airdrop?ref=${user.referral_code}`
  const totalReferrals = user.level1_referrals + user.level2_referrals + user.level3_referrals

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = referralLink
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-effect rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <UserGroupIcon className="h-6 w-6 text-primary-500 mr-3" />
          <h3 className="text-lg font-semibold text-white">Referrals</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{totalReferrals}</p>
          <p className="text-sm text-gray-400">Total Referrals</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Referral Link */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Referral Link
          </label>
          <div className="flex">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <motion.button
              onClick={copyToClipboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-r-lg transition-colors duration-200 flex items-center"
            >
              {copied ? (
                <span className="text-sm">Copied!</span>
              ) : (
                <ShareIcon className="h-4 w-4" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Referral Code */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Referral Code
          </label>
          <div className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg">
            <span className="text-white font-mono text-lg">{user.referral_code}</span>
            <motion.button
              onClick={copyToClipboard}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <LinkIcon className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-400">{user.level1_referrals}</p>
            <p className="text-xs text-gray-400">Level 1</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{user.level2_referrals}</p>
            <p className="text-xs text-gray-400">Level 2</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{user.level3_referrals}</p>
            <p className="text-xs text-gray-400">Level 3</p>
          </div>
        </div>

        {/* Referral Earnings */}
        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-gray-300">Referral Earnings</span>
            </div>
            <span className="text-lg font-semibold text-green-400">
              {user.referral_earnings.toLocaleString()} tokens
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
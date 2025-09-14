'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClockIcon, BoltIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline'

interface User {
  id: string
  email: string
  referral_code: string
  level1_referrals: number
  level2_referrals: number
  level3_referrals: number
}

interface MiningStats {
  mining_points: number
  mining_speed: number
  is_mining: boolean
  last_mining_claim: string | null
  time_until_next_claim: number | null
  points_earned_since_last_claim: number
}

interface MiningSectionProps {
  user: User | null
}

export function MiningSection({ user }: MiningSectionProps) {
  const [miningStats, setMiningStats] = useState<MiningStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHitting, setIsHitting] = useState(false)

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

  useEffect(() => {
    fetchMiningStats()
  }, [])

  const fetchMiningStats = async () => {
    try {
      const token = localStorage.getItem('user_token')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/mining/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMiningStats(data)
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoading(false)
    }
  }

  const handleMiningAction = async () => {
    try {
      const token = localStorage.getItem('user_token')
      if (!token) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/mining/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMiningStats(data.mining_stats)
        setIsHitting(true)
        setTimeout(() => setIsHitting(false), 500)
      }
    } catch (error) {
      // Handle error silently
    }
  }

  const canClaim = miningStats?.is_mining && miningStats?.time_until_next_claim === null
  const isMining = miningStats?.is_mining && miningStats?.time_until_next_claim !== null

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect rounded-2xl p-6"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </motion.div>
    )
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
          <BoltIcon className="h-6 w-6 text-yellow-500 mr-3" />
          <h3 className="text-lg font-semibold text-white">Mining</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-yellow-400">
            {miningStats?.mining_points?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-400">Mining Points</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Mining Speed */}
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-blue-400 mr-3" />
            <div>
              <p className="text-sm text-gray-300">Mining Speed</p>
              <p className="text-lg font-semibold text-white">
                {miningStats?.mining_speed?.toFixed(1) || '0.0'} points/hour
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Base + Referrals</p>
            <p className="text-sm text-green-400">
              +{((user.level1_referrals * 2) + (user.level2_referrals * 1) + (user.level3_referrals * 0.5)).toFixed(1)} bonus
            </p>
          </div>
        </div>

        {/* Mining Status */}
        <div className="text-center">
          {isMining ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mr-3"></div>
                <span className="text-yellow-400 font-medium">Mining in progress...</span>
              </div>
              <p className="text-sm text-gray-400">
                Next claim in {Math.floor((miningStats?.time_until_next_claim || 0) / 3600)}h {Math.floor(((miningStats?.time_until_next_claim || 0) % 3600) / 60)}m
              </p>
            </div>
          ) : canClaim ? (
            <motion.button
              onClick={handleMiningAction}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 flex items-center justify-center"
            >
              <AnimatePresence>
                {isHitting && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="mr-2"
                  >
                    💎
                  </motion.div>
                )}
              </AnimatePresence>
              Claim Mining Rewards
            </motion.button>
          ) : (
            <motion.button
              onClick={handleMiningAction}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
            >
              Start Mining
            </motion.button>
          )}
        </div>

        {/* Referral Bonus Info */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center mb-2">
            <UserGroupIcon className="h-5 w-5 text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-400">Referral Mining Bonus</span>
          </div>
          <p className="text-xs text-gray-300">
            Level 1: +2.0 pts/hr • Level 2: +1.0 pts/hr • Level 3: +0.5 pts/hr
          </p>
        </div>
      </div>
    </motion.div>
  )
}
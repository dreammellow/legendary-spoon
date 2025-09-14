'use client'

import { motion } from 'framer-motion'
import { 
  UsersIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

interface User {
  id: number
  email: string
  wallet_address?: string
  referral_code: string
  referred_by?: string
  email_verified: boolean
  total_earnings: number
  referral_earnings: number
  task_earnings: number
  level1_referrals: number
  level2_referrals: number
  level3_referrals: number
  is_active: boolean
  is_verified: boolean
  kyc_completed: boolean
  mining_points: number
  mining_speed: number
  last_mining_claim?: string
  is_mining: boolean
  created_at: string
  updated_at?: string
  last_login?: string
}

interface AdminStatsProps {
  users: User[]
}

export function AdminStats({ users }: AdminStatsProps) {
  // Calculate stats from users array
  const totalUsers = users.length
  const totalTokensDistributed = users.reduce((sum, user) => sum + (user.total_earnings || 0), 0)
  const totalReferrals = users.reduce((sum, user) => sum + (user.level1_referrals || 0) + (user.level2_referrals || 0) + (user.level3_referrals || 0), 0)
  const averageEarnings = totalUsers > 0 ? totalTokensDistributed / totalUsers : 0
  
  // Additional stats
  const verifiedUsers = users.filter(user => user.email_verified).length
  const activeUsers = users.filter(user => user.is_active).length
  const miningUsers = users.filter(user => user.is_mining).length
  const totalMiningPoints = users.reduce((sum, user) => sum + (user.mining_points || 0), 0)
  const statCards = [
    {
      name: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: UsersIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Total Points',
      value: `${totalMiningPoints.toLocaleString()} points`,
      icon: ChartBarIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      change: '+15%',
      changeType: 'positive',
    },
    {
      name: 'Total Referrals',
      value: totalReferrals.toLocaleString(),
      icon: UserGroupIcon,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      change: '+15%',
      changeType: 'positive',
    },
    {
      name: 'Tokens Distributed',
      value: `${totalTokensDistributed.toLocaleString()} tokens`,
      icon: CurrencyDollarIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      change: '+8%',
      changeType: 'positive',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass-effect rounded-2xl p-6 hover:crypto-glow transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">{stat.name}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </div>
                <div className="text-xs text-gray-400">vs last month</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">User Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Verified Users</span>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                {verifiedUsers} / {totalUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Active Users</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                {activeUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Mining Users</span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                {miningUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Mining Points</span>
              <span className="text-purple-400 text-sm">{totalMiningPoints.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Earnings Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Total Earnings</span>
              <span className="text-green-400 font-semibold">
                {totalTokensDistributed.toLocaleString()} tokens
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Referral Earnings</span>
              <span className="text-blue-400">
                {users.reduce((sum, user) => sum + (user.referral_earnings || 0), 0).toLocaleString()} tokens
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Task Earnings</span>
              <span className="text-yellow-400">
                {users.reduce((sum, user) => sum + (user.task_earnings || 0), 0).toLocaleString()} tokens
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Mining Points</span>
              <span className="text-purple-400">
                {totalMiningPoints.toLocaleString()} points
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

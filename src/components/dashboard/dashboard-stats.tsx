'use client'

import { motion } from 'framer-motion'
import { User } from '@/types/airdrop'
import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  GiftIcon 
} from '@heroicons/react/24/outline'

interface DashboardStatsProps {
  user: User | null
}

export function DashboardStats({ user }: DashboardStatsProps) {
  // Handle null user case
  if (!user) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="glass-effect rounded-2xl p-6 animate-pulse"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gray-500/10">
                <div className="h-6 w-6 bg-gray-400 rounded"></div>
              </div>
              <div className="ml-4">
                <div className="h-4 bg-gray-400 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-400 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Earnings',
      value: (user.total_earnings || 0).toLocaleString(),
      icon: CurrencyDollarIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      name: 'Referral Earnings',
      value: (user.referral_earnings || 0).toLocaleString(),
      icon: UserGroupIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: 'Task Earnings',
      value: (user.task_earnings || 0).toLocaleString(),
      icon: ChartBarIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      name: 'Total Referrals',
      value: ((user.level1_referrals || 0) + (user.level2_referrals || 0) + (user.level3_referrals || 0)).toString(),
      icon: GiftIcon,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="glass-effect rounded-2xl p-6 hover:crypto-glow transition-all duration-300"
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">{stat.name}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

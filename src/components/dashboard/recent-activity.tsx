'use client'

import { motion } from 'framer-motion'
import { User } from '@/types/airdrop'
import { 
  UserPlusIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon,
  GiftIcon 
} from '@heroicons/react/24/outline'

interface RecentActivityProps {
  user: User
}

interface Activity {
  id: string
  type: 'referral' | 'earning' | 'task' | 'bonus'
  description: string
  amount?: number
  timestamp: string
  icon: any
  color: string
}

export function RecentActivity({ user }: RecentActivityProps) {
  // Real activity data - will be populated from API
  const activities: Activity[] = [
    // Activities will be loaded from the backend API
    // This is just a placeholder for when there's no activity
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors duration-200"
          >
            <div className={`p-2 rounded-lg bg-gray-700`}>
              <activity.icon className={`h-5 w-5 ${activity.color}`} />
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-white">{activity.description}</p>
              <p className="text-xs text-gray-400">{activity.timestamp}</p>
            </div>
            
            {activity.amount && (
              <div className="text-right">
                <div className="text-sm font-semibold text-green-400">
                  +{activity.amount} tokens
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <button className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors duration-200">
          View All Activity
        </button>
      </div>
    </motion.div>
  )
}

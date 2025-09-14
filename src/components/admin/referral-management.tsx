'use client'

import { motion } from 'framer-motion'
import { User } from '@/types/airdrop'
import { LinkIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline'

interface ReferralManagementProps {
  users: User[]
}

export function ReferralManagement({ users }: ReferralManagementProps) {
  // Calculate referral statistics
  const totalReferrals = users.reduce((sum, user) => 
    sum + (user.level1_referrals || 0) + (user.level2_referrals || 0) + (user.level3_referrals || 0), 0
  )
  
  const totalReferralEarnings = users.reduce((sum, user) => sum + (user.referral_earnings || 0), 0)
  
  const topReferrers = users
    .sort((a, b) => ((b.level1_referrals || 0) + (b.level2_referrals || 0) + (b.level3_referrals || 0)) - 
                   ((a.level1_referrals || 0) + (a.level2_referrals || 0) + (a.level3_referrals || 0)))
    .slice(0, 10)

  const referralStats = [
    {
      name: 'Total Referrals',
      value: totalReferrals.toLocaleString(),
      icon: UserGroupIcon,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: 'Total Referral Earnings',
      value: `${totalReferralEarnings.toLocaleString()} tokens`,
      icon: ChartBarIcon,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      name: 'Average per User',
      value: `${Math.round(totalReferrals / users.length)}`,
      icon: LinkIcon,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Referral Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {referralStats.map((stat, index) => (
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

      {/* Top Referrers */}
      <div className="glass-effect rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Top Referrers</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Rank</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Total Referrals</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Level 1</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Level 2</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Level 3</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {topReferrers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors duration-200"
                >
                  <td className="py-3 px-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-gray-500/20 text-gray-400' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gray-600/20 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-sm font-medium text-white">{user.email}</div>
                      <div className="text-xs text-gray-400 font-mono">
                        {user.wallet_address ? 
                          `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}` : 
                          'Not connected'
                        }
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-bold text-white">
                      {(user.level1_referrals || 0) + (user.level2_referrals || 0) + (user.level3_referrals || 0)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-green-400">{user.level1_referrals || 0}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-blue-400">{user.level2_referrals || 0}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-purple-400">{user.level3_referrals || 0}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-yellow-400">
                      {(user.referral_earnings || 0).toLocaleString()}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referral Tree Visualization */}
      <div className="glass-effect rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Referral Network Overview</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gray-800/50 rounded-lg">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {users.reduce((sum, user) => sum + (user.level1_referrals || 0), 0)}
            </div>
            <div className="text-sm text-gray-300">Level 1 Referrals</div>
            <div className="text-xs text-gray-400 mt-1">Direct referrals</div>
          </div>
          
          <div className="text-center p-6 bg-gray-800/50 rounded-lg">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {users.reduce((sum, user) => sum + (user.level2_referrals || 0), 0)}
            </div>
            <div className="text-sm text-gray-300">Level 2 Referrals</div>
            <div className="text-xs text-gray-400 mt-1">Second-level referrals</div>
          </div>
          
          <div className="text-center p-6 bg-gray-800/50 rounded-lg">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {users.reduce((sum, user) => sum + (user.level3_referrals || 0), 0)}
            </div>
            <div className="text-sm text-gray-300">Level 3 Referrals</div>
            <div className="text-xs text-gray-400 mt-1">Third-level referrals</div>
          </div>
        </div>
      </div>
    </div>
  )
}

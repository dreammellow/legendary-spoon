'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { SimpleFooter } from '@/components/layout/simple-footer'
import { MiningSection } from '@/components/dashboard/mining-section'
import { ReferralsSection } from '@/components/dashboard/referrals-section'
import { WalletSection } from '@/components/dashboard/wallet-section'
import { ProfileSection } from '@/components/dashboard/profile-section'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { EarningsChart } from '@/components/dashboard/earnings-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { 
  HomeIcon, 
  UserGroupIcon, 
  WalletIcon, 
  UserIcon,
  Cog6ToothIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { 
  HomeIcon as HomeIconSolid, 
  UserGroupIcon as UserGroupIconSolid, 
  WalletIcon as WalletIconSolid, 
  UserIcon as UserIconSolid
} from '@heroicons/react/24/solid'

interface User {
  id: string
  email: string
  username?: string
  wallet_address: string
  referral_code: string
  referred_by: string | null
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
  last_mining_claim: string | null
  is_mining: boolean
  created_at: string
  updated_at: string | null
  last_login: string | null
}

interface MiningStats {
  mining_points: number
  mining_speed: number
  is_mining: boolean
  last_mining_claim: string | null
  time_until_next_claim: number | null
  points_earned_since_last_claim: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [miningStats, setMiningStats] = useState<MiningStats | null>(null)
  const [activeTab, setActiveTab] = useState<'mining' | 'referrals' | 'tasks' | 'wallet' | 'profile'>('mining')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        // Check if user is in admin context - but don't auto-redirect
        // Let admin users choose which dashboard to use
        const authContext = localStorage.getItem('auth_context')
        const adminToken = localStorage.getItem('admin_token')
        
        // Only redirect if they explicitly came from admin login
        // Don't redirect if they're accessing user dashboard intentionally
        
        // Use user token for user dashboard
        const token = localStorage.getItem('user_token') || localStorage.getItem('token') // Fallback to legacy token
        console.log('Dashboard: Checking token:', token ? 'Token exists' : 'No token')
        if (!token) {
          console.log('Dashboard: No token found, redirecting to login')
          window.location.href = '/airdrop?mode=login'
          return
        }

        // Fetch user data
        console.log('Dashboard: Fetching user data with token:', token.substring(0, 20) + '...')
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('Dashboard: User API response status:', userResponse.status)
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            console.log('Dashboard: 401 Unauthorized, clearing tokens and redirecting')
            // Clear user authentication
            localStorage.removeItem('user_token')
            localStorage.removeItem('token') // Legacy
            localStorage.removeItem('auth_context')
            window.location.href = '/airdrop?mode=login'
            return
          }
          throw new Error('Failed to fetch user data')
        }

        const userData = await userResponse.json()
        setUser(userData)

        // Update mining speed based on current referral levels
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/mining/update-speed`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
        } catch (error) {
          // Mining speed update failed, but continue
        }
      } catch (error) {
        setError('Failed to load user data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-crypto-dark">
      <Header />
      
      <div className="flex pt-20">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
          <nav className="p-4">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400 text-sm">Welcome back, {user?.username || user?.email?.split('@')[0] || 'User'}!</p>
            </div>
            <ul className="space-y-2">
              {[
                { id: 'mining', label: 'Mining', icon: BoltIcon },
                { id: 'referrals', label: 'Referrals', icon: UserGroupIcon },
                { id: 'tasks', label: 'Tasks', icon: Cog6ToothIcon },
                { id: 'wallet', label: 'Wallet', icon: WalletIcon },
                { id: 'profile', label: 'Profile', icon: UserIcon },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                          : 'text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Header */}
          <div className="lg:hidden px-4 py-6">
            <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.username || user?.email?.split('@')[0] || 'User'}!</p>
          </div>

          {/* Content Area */}
          <div className="pb-20 lg:pb-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 lg:p-6"
            >
              {activeTab === 'mining' && (
                <div className="space-y-6">
                  <DashboardStats user={user} />
                  <MiningSection user={user} />
                </div>
              )}
              
              {activeTab === 'referrals' && (
                <div className="space-y-6">
                  <ReferralsSection user={user} />
                </div>
              )}
              
              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Tasks</h2>
                    <p className="text-gray-400">Task management coming soon...</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'wallet' && (
                <div className="space-y-6">
                  <WalletSection user={user} />
                </div>
              )}
              
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <ProfileSection user={user} />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
        <div className="grid grid-cols-5 h-16">
          <button
            onClick={() => setActiveTab('mining')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'mining' ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            <BoltIcon className="w-5 h-5" />
            <span className="text-xs">Mining</span>
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'referrals' ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            <UserGroupIcon className="w-5 h-5" />
            <span className="text-xs">Referrals</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'tasks' ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            <Cog6ToothIcon className="w-5 h-5" />
            <span className="text-xs">Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'wallet' ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            <WalletIcon className="w-5 h-5" />
            <span className="text-xs">Wallet</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'profile' ? 'text-primary-400' : 'text-gray-400'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
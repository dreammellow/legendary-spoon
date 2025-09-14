'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { UserManagement } from '@/components/admin/user-management'
import { ReferralManagement } from '@/components/admin/referral-management'
import { AdminStats } from '@/components/admin/admin-stats'
import { DataExport } from '@/components/admin/data-export'
import { SystemSettings } from '@/components/admin/system-settings'
import { KYCManagement } from '@/components/admin/kyc-management'
import { NotificationsPanel } from '@/components/admin/notifications-panel'
import { 
  UsersIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  DocumentArrowDownIcon, 
  CogIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  BellIcon
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

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'info', text: string} | null>(null)

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'referrals', label: 'Referrals', icon: UserGroupIcon },
    { id: 'kyc', label: 'KYC Management', icon: ShieldCheckIcon },
    { id: 'stats', label: 'Statistics', icon: ChartBarIcon },
    { id: 'export', label: 'Data Export', icon: DocumentArrowDownIcon },
    { id: 'settings', label: 'Settings', icon: CogIcon },
  ]

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    // Check for admin token first, then fallback to regular user tokens
    let token = localStorage.getItem('admin_token')
    let context = localStorage.getItem('auth_context')
    
    console.log('Auth check - admin_token:', !!localStorage.getItem('admin_token'))
    console.log('Auth check - user_token:', !!localStorage.getItem('user_token'))
    console.log('Auth check - token:', !!localStorage.getItem('token'))
    
    // If no admin token, check for regular user tokens
    if (!token) {
      token = localStorage.getItem('user_token') || localStorage.getItem('token')
      context = 'user'
    }
    
    if (!token) {
      console.log('No token found, redirecting to admin login')
      router.push('/admin')
      return
    }
    
    console.log('Using token for auth check:', token.substring(0, 10) + '...')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const userData = await response.json()
        // For development purposes, allow any authenticated user to access admin panel
        // In production, you should check userData.is_admin
        console.log('User data received:', userData)
        
        if (userData.email_verified) {
          // User is authenticated, set up admin context
          setIsAuthenticated(true)
          
          // If they came from user panel, set up admin context
          if (context !== 'admin') {
            localStorage.setItem('admin_token', token)
            localStorage.setItem('auth_context', 'admin')
            // Keep user token for potential user panel access
          }
          
          fetchUsers()
        } else {
          console.log('User email not verified, redirecting to admin login')
          // User email not verified, clear tokens and redirect
          localStorage.removeItem('admin_token')
          localStorage.removeItem('user_token')
          localStorage.removeItem('token')
          localStorage.removeItem('auth_context')
          router.push('/admin')
        }
      } else {
        // Token is invalid, clear and redirect
        localStorage.removeItem('admin_token')
        localStorage.removeItem('user_token')
        localStorage.removeItem('token')
        localStorage.removeItem('auth_context')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error checking admin token:', error)
      // Clear tokens and redirect to admin login
      localStorage.removeItem('admin_token')
      localStorage.removeItem('user_token')
      localStorage.removeItem('token')
      localStorage.removeItem('auth_context')
      router.push('/admin')
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token') || localStorage.getItem('token')
      console.log('Fetching users with token:', token ? token.substring(0, 10) + '...' : 'No token')
      console.log('API URL:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/users`)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Users API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        // Handle both array response and object with users property
        const usersData = Array.isArray(data) ? data : (data.users || data.data || [])
        setUsers(usersData)
        console.log('Fetched users:', usersData)
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        setMessage({ type: 'error', text: `Failed to fetch users: ${errorData.detail || 'Unknown error'}` })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setMessage({ type: 'error', text: 'Network error while fetching users' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setMessage(null)
    try {
      await fetchUsers()
      setMessage({ type: 'success', text: 'Dashboard data refreshed successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to refresh dashboard data' })
    } finally {
      setIsRefreshing(false)
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('user_token')
    localStorage.removeItem('token')
    localStorage.removeItem('auth_context')
    router.push('/admin')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Add fallback data for testing if no users are loaded
  const displayUsers = users.length > 0 ? users : [
    {
      id: 1,
      email: 'test@example.com',
      wallet_address: '0x1234567890abcdef',
      referral_code: 'TEST123',
      referred_by: null,
      email_verified: true,
      total_earnings: 1000,
      referral_earnings: 500,
      task_earnings: 500,
      level1_referrals: 5,
      level2_referrals: 2,
      level3_referrals: 1,
      is_active: true,
      is_verified: true,
      kyc_completed: false,
      mining_points: 100,
      mining_speed: 10,
      last_mining_claim: new Date().toISOString(),
      is_mining: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    }
  ]

  return (
    <div className="min-h-screen bg-crypto-dark">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen flex-shrink-0">
          <nav className="p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 min-w-0 overflow-x-auto">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' :
              message.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-300' :
              'bg-blue-500/20 border border-blue-500/30 text-blue-300'
            }`}>
              {message.text}
            </div>
          )}


          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'notifications' && (
              <NotificationsPanel 
                onMessage={setMessage}
              />
            )}
            {activeTab === 'users' && (
              <UserManagement 
                users={displayUsers} 
                onUsersChange={setUsers}
                onMessage={setMessage}
              />
            )}
            {activeTab === 'referrals' && (
              <ReferralManagement 
                users={displayUsers}
                onMessage={setMessage}
              />
            )}
            {activeTab === 'kyc' && (
              <KYCManagement 
                users={displayUsers}
                onUsersChange={setUsers}
                onMessage={setMessage}
              />
            )}
            {activeTab === 'stats' && (
              <AdminStats 
                users={displayUsers}
              />
            )}
            {activeTab === 'export' && (
              <DataExport 
                users={displayUsers}
                onMessage={setMessage}
              />
            )}
            {activeTab === 'settings' && (
              <SystemSettings 
                onMessage={setMessage}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

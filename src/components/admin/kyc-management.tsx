'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface KYCUser {
  id: number
  email: string
  kyc_completed: boolean
  is_active: boolean
  created_at: string
  updated_at?: string
}

interface KYCCacheStats {
  active_sessions: number
  user_attempts: number
  face_attempts: number
  banned_users: number
  banned_faces: number
  face_hash_storage: number
  duplicate_violations: number
}

interface KYCUserStatus {
  user: {
    id: number
    email: string
    kyc_completed: boolean
    is_active: boolean
    created_at: string
    updated_at?: string
  }
  cache_data: {
    has_attempts: boolean
    attempt_count: number
    is_banned: boolean
    face_hash?: string
    active_sessions: string[]
  }
}

interface KYCManagementProps {
  users: KYCUser[]
  onUsersChange: (users: KYCUser[]) => void
  onMessage: (message: { type: 'success' | 'error' | 'info', text: string }) => void
}

export function KYCManagement({ users, onUsersChange, onMessage }: KYCManagementProps) {
  const [cacheStats, setCacheStats] = useState<KYCCacheStats | null>(null)
  const [selectedUser, setSelectedUser] = useState<KYCUser | null>(null)
  const [userStatus, setUserStatus] = useState<KYCUserStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchCacheStats()
  }, [])

  const fetchCacheStats = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/kyc-cache-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCacheStats(data.cache_stats)
      }
    } catch (error) {
      console.error('Error fetching cache stats:', error)
    }
  }

  const fetchUserStatus = async (userId: number) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/user-kyc-status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUserStatus(data)
      } else {
        onMessage({ type: 'error', text: 'Failed to fetch user status' })
      }
    } catch (error) {
      console.error('Error fetching user status:', error)
      onMessage({ type: 'error', text: 'Failed to fetch user status' })
    } finally {
      setIsLoading(false)
    }
  }

  const clearUserCache = async (userId: number) => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/reset-user-kyc/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        onMessage({ type: 'success', text: 'User cache cleared successfully' })
        fetchCacheStats()
        if (selectedUser) {
          fetchUserStatus(selectedUser.id)
        }
      } else {
        onMessage({ type: 'error', text: 'Failed to clear user cache' })
      }
    } catch (error) {
      console.error('Error clearing user cache:', error)
      onMessage({ type: 'error', text: 'Failed to clear user cache' })
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'kyc_completed' && user.kyc_completed) ||
      (filterStatus === 'kyc_pending' && !user.kyc_completed) ||
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active)
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">KYC Management</h2>
        <p className="text-gray-400">
          Manage user KYC verification status and cache data
        </p>
      </div>

      {/* Cache Stats */}
      {cacheStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <ClockIcon className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-gray-300">Active Sessions</span>
            </div>
            <div className="text-2xl font-bold text-white">{cacheStats.active_sessions}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">User Attempts</span>
            </div>
            <div className="text-2xl font-bold text-white">{cacheStats.user_attempts}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Face Attempts</span>
            </div>
            <div className="text-2xl font-bold text-white">{cacheStats.face_attempts}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center space-x-2 mb-2">
              <XCircleIcon className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-gray-300">Banned Users</span>
            </div>
            <div className="text-2xl font-bold text-white">{cacheStats.banned_users}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Users</option>
          <option value="kyc_completed">KYC Completed</option>
          <option value="kyc_pending">KYC Pending</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  KYC Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Account Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/30">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{user.email}</div>
                    <div className="text-sm text-gray-400">ID: {user.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {user.kyc_completed ? (
                        <>
                          <CheckCircleIcon className="w-5 h-5 text-green-400" />
                          <span className="text-sm text-green-400">Completed</span>
                        </>
                      ) : (
                        <>
                          <ClockIcon className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm text-yellow-400">Pending</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {user.is_active ? (
                        <>
                          <CheckCircleIcon className="w-5 h-5 text-green-400" />
                          <span className="text-sm text-green-400">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircleIcon className="w-5 h-5 text-red-400" />
                          <span className="text-sm text-red-400">Inactive</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          fetchUserStatus(user.id)
                        }}
                        className="text-primary-400 hover:text-primary-300"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => clearUserCache(user.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

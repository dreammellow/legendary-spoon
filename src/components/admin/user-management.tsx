'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { User } from '@/types/airdrop'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  NoSymbolIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'

interface UserManagementProps {
  users: User[]
}

export function UserManagement({ users }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.wallet_address && user.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         user.referral_code.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    if (filterStatus === 'active') return matchesSearch && (user.total_earnings || 0) > 0
    if (filterStatus === 'inactive') return matchesSearch && (user.total_earnings || 0) === 0
    
    return matchesSearch
  })

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const resetUserKYC = async (userId: number) => {
    if (!confirm('Are you sure you want to reset this user\'s KYC status? This will allow them to go through verification again.')) {
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/reset-user-kyc/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        showMessage('success', data.message || 'User KYC status reset successfully!')
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        const errorData = await response.json()
        showMessage('error', errorData.detail || 'Failed to reset user KYC')
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const banUser = async (userId: number) => {
    if (!confirm('Are you sure you want to ban this user? They will not be able to access the platform.')) {
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        showMessage('success', data.message || 'User banned successfully!')
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        const errorData = await response.json()
        showMessage('error', errorData.detail || 'Failed to ban user')
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const unbanUser = async (userId: number) => {
    if (!confirm('Are you sure you want to unban this user? They will be able to access the platform again.')) {
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/users/${userId}/unban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        showMessage('success', data.message || 'User unbanned successfully!')
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        const errorData = await response.json()
        showMessage('error', errorData.detail || 'Failed to unban user')
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (userData: User) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/users/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          wallet_address: userData.wallet_address,
          total_earnings: userData.total_earnings,
          is_active: userData.is_active,
          email_verified: userData.email_verified
        })
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('success', 'User updated successfully!')
        setEditingUser(null)
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        showMessage('error', data.detail || 'Failed to update user')
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteUser = async (userId: number) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        showMessage('success', 'User deleted successfully!')
        setShowDeleteConfirm(null)
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        showMessage('error', data.detail || 'Failed to delete user')
      }
    } catch (error) {
      showMessage('error', 'Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by email, wallet, or referral code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-effect rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/4">
                  User
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/8">
                  Wallet
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/8">
                  Referrals
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/8">
                  Earnings
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/12">
                  Status
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/12">
                  KYC
                </th>
                <th className="px-2 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6 sticky right-0 bg-gray-800 z-10">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-800/50 transition-colors duration-200"
                >
                  <td className="px-4 py-4">
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <div className="text-sm font-medium text-white truncate">{user.email}</div>
                        {!user.is_active && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                            🚫 Banned
                          </span>
                        )}
                        {user.is_admin && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            👑 Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 truncate">Ref: {user.referral_code}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-xs text-gray-300 font-mono">
                      {user.wallet_address ? 
                        `${user.wallet_address.slice(0, 4)}...${user.wallet_address.slice(-4)}` : 
                        'Not connected'
                      }
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-white font-medium">
                      {(user.level1_referrals || 0) + (user.level2_referrals || 0) + (user.level3_referrals || 0)}
                    </div>
                    <div className="text-xs text-gray-400">
                      L1:{user.level1_referrals || 0} L2:{user.level2_referrals || 0} L3:{user.level3_referrals || 0}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-white">
                      {(user.total_earnings || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      R:{user.referral_earnings || 0} T:{user.task_earnings || 0}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      !user.is_active
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {!user.is_active ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.kyc_completed 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {user.kyc_completed ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium sticky right-0 bg-gray-900/95 backdrop-blur-sm z-10">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1 text-primary-400 hover:text-primary-300 hover:bg-primary-400/10 rounded transition-colors duration-200"
                        title="View user"
                      >
                        <EyeIcon className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded transition-colors duration-200"
                        title="Edit user"
                      >
                        <PencilIcon className="h-3 w-3" />
                      </button>
                      {user.kyc_completed && (
                        <button 
                          onClick={() => resetUserKYC(user.id)}
                          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors duration-200"
                          title="Reset KYC"
                          disabled={isLoading}
                        >
                          <ArrowPathIcon className="h-3 w-3" />
                        </button>
                      )}
                      {user.is_active ? (
                        <button 
                          onClick={() => banUser(user.id)}
                          className="p-1 text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 rounded transition-colors duration-200"
                          title="Ban user"
                          disabled={isLoading}
                        >
                          <NoSymbolIcon className="h-3 w-3" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => unbanUser(user.id)}
                          className="p-1 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded transition-colors duration-200"
                          title="Unban user"
                          disabled={isLoading}
                        >
                          <CheckBadgeIcon className="h-3 w-3" />
                        </button>
                      )}
                      <button 
                        onClick={() => setShowDeleteConfirm(user)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors duration-200"
                        title="Delete user"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <p className="text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Referral Code</label>
                  <p className="text-white font-mono">{selectedUser.referral_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Wallet Address</label>
                  <p className="text-white font-mono text-sm">{selectedUser.wallet_address || 'Not connected'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300">Joined</label>
                  <p className="text-white">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-semibold text-white mb-3">Earnings Breakdown</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{selectedUser.total_earnings || 0}</div>
                    <div className="text-sm text-gray-300">Total</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{selectedUser.referral_earnings || 0}</div>
                    <div className="text-sm text-gray-300">Referrals</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">{selectedUser.task_earnings || 0}</div>
                    <div className="text-sm text-gray-300">Tasks</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Edit User</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Address</label>
                <input
                  type="text"
                  value={editingUser.wallet_address || ''}
                  onChange={(e) => setEditingUser({...editingUser, wallet_address: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter wallet address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Total Earnings</label>
                <input
                  type="number"
                  value={editingUser.total_earnings || 0}
                  onChange={(e) => setEditingUser({...editingUser, total_earnings: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingUser.is_active || false}
                  onChange={(e) => setEditingUser({...editingUser, is_active: e.target.checked})}
                  className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-700 rounded focus:ring-primary-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-300">Active User</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="email_verified"
                  checked={editingUser.email_verified || false}
                  onChange={(e) => setEditingUser({...editingUser, email_verified: e.target.checked})}
                  className="w-4 h-4 text-primary-600 bg-gray-800 border-gray-700 rounded focus:ring-primary-500"
                />
                <label htmlFor="email_verified" className="text-sm text-gray-300">Email Verified</label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => updateUser(editingUser)}
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Delete User</h3>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-300">
                Are you sure you want to delete user <span className="text-white font-medium">{showDeleteConfirm.email}</span>?
              </p>
              <p className="text-sm text-red-400">
                This action cannot be undone. All user data, earnings, and referrals will be permanently deleted.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser(showDeleteConfirm.id)}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

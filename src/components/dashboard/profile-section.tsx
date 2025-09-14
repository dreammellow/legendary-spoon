'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserIcon, EnvelopeIcon, KeyIcon, ArrowRightOnRectangleIcon, PencilIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { KYCVerification } from '../kyc/kyc-verification'

interface User {
  id: string
  email: string
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
  is_admin: boolean
  kyc_completed: boolean
  mining_points: number
  mining_speed: number
  last_mining_claim: string | null
  is_mining: boolean
  created_at: string
  updated_at: string | null
  last_login: string | null
}

interface ProfileSectionProps {
  user: User | null
}

export function ProfileSection({ user }: ProfileSectionProps) {
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showKYC, setShowKYC] = useState(false)
  const isSubmittingRef = useRef(false)
  const [formData, setFormData] = useState({
    username: user?.email?.split('@')[0] || '', // Use email prefix as default username
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Handle null user case
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="glass-effect rounded-xl p-6 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-600 rounded-full"></div>
            <div>
              <div className="h-6 bg-gray-600 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Reset submission state when component mounts
  useEffect(() => {
    isSubmittingRef.current = false
    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    // Clear user authentication
    localStorage.removeItem('user_token')
    localStorage.removeItem('token') // Legacy token
    localStorage.removeItem('auth_context')
    window.location.href = '/airdrop?mode=login'
  }

  const handleKYC = () => {
    console.log('🔵 [ProfileSection] KYC button clicked, opening modal...')
    setShowKYC(true)
    console.log('✅ [ProfileSection] KYC modal state set to true')
  }

  const handleKYCComplete = (result: { success: boolean; confidence?: number; sessionId?: string }) => {
    console.log('🔵 [ProfileSection] KYC completion received:', result)
    setShowKYC(false)
    console.log('✅ [ProfileSection] KYC modal closed')
    
    if (result.success) {
      console.log('✅ [ProfileSection] KYC verification successful, showing success message')
      setMessage('✅ KYC verification completed successfully!')
      console.log('🔵 [ProfileSection] Refreshing page to update user data...')
      // Refresh user data or update local state
      window.location.reload() // Simple refresh for now
    } else {
      console.log('❌ [ProfileSection] KYC verification failed, showing error message')
      setMessage('❌ KYC verification failed. Please try again.')
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    
    try {
      const token = localStorage.getItem('user_token') || localStorage.getItem('token') // Fallback to legacy token
      
      const response = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Profile updated successfully!')
      } else {
        setMessage(data.detail || 'Failed to update profile')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }


  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match')
      return
    }

    setIsLoading(true)
    setMessage('')
    
    try {
      const token = localStorage.getItem('user_token') || localStorage.getItem('token') // Fallback to legacy token
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: formData.currentPassword,
          new_password: formData.newPassword
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Password changed successfully!')
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
      } else {
        setMessage(data.detail || 'Failed to change password')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-effect rounded-xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{formData.username}</h2>
              <p className="text-gray-400">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.kyc_completed 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {user.kyc_completed ? 'Verified' : 'Unverified'}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  Member since {formatDate(user.created_at)}
                </span>
                {user.is_admin && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
          {user.is_admin && (
            <motion.a
              href="/admin/dashboard"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Admin Panel</span>
            </motion.a>
          )}
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeTab === 'profile'
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeTab === 'security'
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Security
        </button>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* KYC Verification */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Identity Verification</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-8 w-8 text-primary-500" />
                    <div>
                      <p className="text-white font-medium">KYC Verification</p>
                      <p className="text-sm text-gray-400">
                        {user.kyc_completed 
                          ? 'Your identity has been verified' 
                          : 'Complete identity verification to access all features'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.kyc_completed 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.kyc_completed ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
                
                {!user.kyc_completed && (
                  <motion.button
                    onClick={handleKYC}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    <span>Start KYC Verification</span>
                  </motion.button>
                )}
                
                {user.kyc_completed && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-green-400 text-sm">Your identity has been successfully verified</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Profile Information</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>{isLoading ? 'Updating...' : 'Update Profile'}</span>
                </motion.button>
              </form>
            </div>

          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <KeyIcon className="h-4 w-4" />
                  <span>{isLoading ? 'Changing...' : 'Change Password'}</span>
                </motion.button>
              </form>
            </div>


            {/* Logout */}
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Account Actions</h3>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Message Display */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.includes('successfully') || message.includes('updated')
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          <p className={`text-sm ${
            message.includes('successfully') || message.includes('updated')
              ? 'text-green-400'
              : 'text-red-400'
          }`}>
            {message}
          </p>
        </motion.div>
      )}

      {/* KYC Verification Modal */}
      {showKYC && (
        <KYCVerification
          onComplete={handleKYCComplete}
          onClose={() => setShowKYC(false)}
          userId={user.id}
        />
      )}
    </div>
  )
}

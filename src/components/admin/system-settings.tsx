'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import React from 'react'
import { 
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline'

interface SystemSettingsProps {
  onMessage: (message: { type: 'success' | 'error' | 'info', text: string }) => void
}

export function SystemSettings({ onMessage }: SystemSettingsProps) {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    baseRewards: {
      airdropTokens: 1000,
      baseMiningSpeed: 10.0,
      baseMiningPoints: 0,
    },
    referralRewards: {
      level1SpeedBonus: 2.0,
      level1PointsBonus: 50.0,
      level2SpeedBonus: 1.0,
      level2PointsBonus: 25.0,
      level3SpeedBonus: 0.5,
      level3PointsBonus: 10.0,
    },
    taskRewards: {
      social: 100,
      verification: 200,
      engagement: 150,
    },
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    security: {
      kycRequired: false,
      maxReferralsPerDay: 10,
      minWalletBalance: 0,
    },
  })

  // Load current maintenance mode status
  const loadMaintenanceStatus = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token') // Fallback to legacy token
      if (!token) {
        onMessage({ type: 'error', text: 'No authentication token found' })
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/maintenance/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({
          ...prev,
          maintenanceMode: data.enabled || false
        }))
      }
    } catch (error) {
      console.error('Error loading maintenance status:', error)
      onMessage({ type: 'error', text: 'Failed to load maintenance status' })
    }
  }

  const updateMaintenanceMode = async (enabled: boolean) => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) {
        onMessage({ type: 'error', text: 'No authentication token found' })
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/maintenance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      })

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          maintenanceMode: enabled
        }))
        onMessage({ 
          type: 'success', 
          text: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully` 
        })
      } else {
        onMessage({ type: 'error', text: 'Failed to update maintenance mode' })
      }
    } catch (error) {
      console.error('Error updating maintenance mode:', error)
      onMessage({ type: 'error', text: 'Failed to update maintenance mode' })
    }
  }

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token')
      if (!token) {
        onMessage({ type: 'error', text: 'No authentication token found' })
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        onMessage({ type: 'success', text: 'Settings saved successfully' })
      } else {
        onMessage({ type: 'error', text: 'Failed to save settings' })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      onMessage({ type: 'error', text: 'Failed to save settings' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">System Settings</h2>
        <p className="text-gray-400">
          Configure platform settings and maintenance mode
        </p>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="w-6 h-6 text-primary-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">Maintenance Mode</h3>
              <p className="text-sm text-gray-400">Temporarily disable platform access</p>
            </div>
          </div>
          <button
            onClick={() => updateMaintenanceMode(!settings.maintenanceMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              settings.maintenanceMode
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {settings.maintenanceMode ? 'Disable' : 'Enable'}
          </button>
        </div>
        <div className={`p-3 rounded-lg ${
          settings.maintenanceMode 
            ? 'bg-red-500/20 border border-red-500/30 text-red-300' 
            : 'bg-green-500/20 border border-green-500/30 text-green-300'
        }`}>
          {settings.maintenanceMode 
            ? 'Platform is currently in maintenance mode. Users will see a maintenance page.' 
            : 'Platform is running normally. All users can access the platform.'
          }
        </div>
      </div>

      {/* Registration Settings */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <CogIcon className="w-5 h-5" />
          <span>Registration Settings</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Enable Registration</label>
              <p className="text-xs text-gray-400">Allow new users to register</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.registrationEnabled}
                onChange={(e) => handleSettingChange('', 'registrationEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Base Rewards */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <CurrencyDollarIcon className="w-5 h-5" />
          <span>Base Rewards</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Airdrop Tokens</label>
            <input
              type="number"
              value={settings.baseRewards.airdropTokens}
              onChange={(e) => handleSettingChange('baseRewards', 'airdropTokens', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Base Mining Speed</label>
            <input
              type="number"
              step="0.1"
              value={settings.baseRewards.baseMiningSpeed}
              onChange={(e) => handleSettingChange('baseRewards', 'baseMiningSpeed', parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Base Mining Points</label>
            <input
              type="number"
              step="0.1"
              value={settings.baseRewards.baseMiningPoints}
              onChange={(e) => handleSettingChange('baseRewards', 'baseMiningPoints', parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Referral Rewards */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Referral Rewards</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Level 1 Referrals</h4>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Speed Bonus</label>
              <input
                type="number"
                step="0.1"
                value={settings.referralRewards.level1SpeedBonus}
                onChange={(e) => handleSettingChange('referralRewards', 'level1SpeedBonus', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Points Bonus</label>
              <input
                type="number"
                step="0.1"
                value={settings.referralRewards.level1PointsBonus}
                onChange={(e) => handleSettingChange('referralRewards', 'level1PointsBonus', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Level 2 Referrals</h4>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Speed Bonus</label>
              <input
                type="number"
                step="0.1"
                value={settings.referralRewards.level2SpeedBonus}
                onChange={(e) => handleSettingChange('referralRewards', 'level2SpeedBonus', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Points Bonus</label>
              <input
                type="number"
                step="0.1"
                value={settings.referralRewards.level2PointsBonus}
                onChange={(e) => handleSettingChange('referralRewards', 'level2PointsBonus', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-300">Level 3 Referrals</h4>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Speed Bonus</label>
              <input
                type="number"
                step="0.1"
                value={settings.referralRewards.level3SpeedBonus}
                onChange={(e) => handleSettingChange('referralRewards', 'level3SpeedBonus', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Points Bonus</label>
              <input
                type="number"
                step="0.1"
                value={settings.referralRewards.level3PointsBonus}
                onChange={(e) => handleSettingChange('referralRewards', 'level3PointsBonus', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task Rewards */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Task Rewards</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Social Tasks</label>
            <input
              type="number"
              value={settings.taskRewards.social}
              onChange={(e) => handleSettingChange('taskRewards', 'social', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Verification Tasks</label>
            <input
              type="number"
              value={settings.taskRewards.verification}
              onChange={(e) => handleSettingChange('taskRewards', 'verification', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Engagement Tasks</label>
            <input
              type="number"
              value={settings.taskRewards.engagement}
              onChange={(e) => handleSettingChange('taskRewards', 'engagement', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Security Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-300">Require KYC</label>
              <p className="text-xs text-gray-400">Users must complete KYC verification</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.kycRequired}
                onChange={(e) => handleSettingChange('security', 'kycRequired', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Referrals Per Day</label>
              <input
                type="number"
                value={settings.security.maxReferralsPerDay}
                onChange={(e) => handleSettingChange('security', 'maxReferralsPerDay', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min Wallet Balance</label>
              <input
                type="number"
                value={settings.security.minWalletBalance}
                onChange={(e) => handleSettingChange('security', 'minWalletBalance', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <motion.button
          onClick={saveSettings}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200"
        >
          Save Settings
        </motion.button>
      </div>
    </div>
  )
}

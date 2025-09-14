'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { User, AirdropStats } from '@/types/airdrop'
import { 
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

interface DataExportProps {
  users: User[]
  stats: AirdropStats | null
}

export function DataExport({ users, stats }: DataExportProps) {
  const [exportFormat, setExportFormat] = useState('csv')
  const [exportType, setExportType] = useState('users')
  const [isExporting, setIsExporting] = useState(false)

  const exportOptions = [
    {
      id: 'users',
      name: 'User Data',
      description: 'Export all user information including earnings and referrals',
      icon: TableCellsIcon,
      count: users.length,
    },
    {
      id: 'referrals',
      name: 'Referral Data',
      description: 'Export referral relationships and earnings',
      icon: ChartBarIcon,
      count: users.reduce((sum, user) => sum + user.level1Referrals + user.level2Referrals + user.level3Referrals, 0),
    },
    {
      id: 'analytics',
      name: 'Analytics Report',
      description: 'Export platform statistics and performance metrics',
      icon: DocumentTextIcon,
      count: stats ? 1 : 0,
    },
  ]

  const formatOptions = [
    { id: 'csv', name: 'CSV', description: 'Comma-separated values' },
    { id: 'json', name: 'JSON', description: 'JavaScript Object Notation' },
    { id: 'xlsx', name: 'Excel', description: 'Microsoft Excel format' },
  ]

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real application, this would generate and download the file
      let data: any
      let filename: string
      
      switch (exportType) {
        case 'users':
          data = users
          filename = `users_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`
          break
        case 'referrals':
          data = users.map(user => ({
            email: user.email,
            walletAddress: user.walletAddress,
            referralCode: user.referralCode,
            level1Referrals: user.level1Referrals,
            level2Referrals: user.level2Referrals,
            level3Referrals: user.level3Referrals,
            referralEarnings: user.referralEarnings,
          }))
          filename = `referrals_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`
          break
        case 'analytics':
          data = stats
          filename = `analytics_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`
          break
        default:
          throw new Error('Invalid export type')
      }
      
      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      alert('Export completed successfully!')
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Data Export</h2>
        <p className="text-gray-400">
          Export user data, referrals, and analytics in various formats
        </p>
      </div>

      {/* Export Type Selection */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Select Data to Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exportOptions.map((option) => {
            const Icon = option.icon
            return (
              <motion.button
                key={option.id}
                onClick={() => setExportType(option.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  exportType === option.id
                    ? 'border-primary-500 bg-primary-500/20'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <Icon className="w-6 h-6 text-primary-400" />
                  <span className="font-medium text-white">{option.name}</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{option.description}</p>
                <div className="text-xs text-gray-500">
                  {option.count} {option.id === 'analytics' ? 'report' : 'records'}
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Format Selection */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Export Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {formatOptions.map((format) => (
            <motion.button
              key={format.id}
              onClick={() => setExportFormat(format.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                exportFormat === format.id
                  ? 'border-primary-500 bg-primary-500/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="font-medium text-white mb-1">{format.name}</div>
              <div className="text-sm text-gray-400">{format.description}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={handleExport}
          disabled={isExporting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Export Data</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Export Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <DocumentTextIcon className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-blue-300 font-medium mb-1">Export Information</h4>
            <p className="text-blue-200 text-sm">
              The exported data will include all available information for the selected type. 
              Large datasets may take longer to process and download.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

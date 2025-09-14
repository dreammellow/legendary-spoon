'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  BellIcon, 
  XMarkIcon, 
  CheckIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline'

interface Notification {
  id: number
  type: string
  title: string
  message: string
  user_id?: number
  user_email?: string
  is_read: boolean
  created_at: string
  metadata?: any
}

interface NotificationsPanelProps {
  onMessage: (message: { type: 'success' | 'error' | 'info', text: string }) => void
}

export function NotificationsPanel({ onMessage }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [showUnreadOnly])

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token') || localStorage.getItem('token')
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/notifications?unread_only=${showUnreadOnly}&limit=100`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else {
        onMessage({ type: 'error', text: 'Failed to fetch notifications' })
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Network error while fetching notifications' })
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        )
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to mark notification as read' })
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token') || localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        onMessage({ type: 'success', text: 'All notifications marked as read' })
      } else {
        onMessage({ type: 'error', text: 'Failed to mark all notifications as read' })
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Network error while marking notifications as read' })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'kyc_ban':
        return <ShieldExclamationIcon className="w-5 h-5 text-red-400" />
      case 'user_ban':
        return <UserMinusIcon className="w-5 h-5 text-orange-400" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
    }
  }

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'kyc_ban':
        return 'bg-red-500/20 border-red-500/30'
      case 'user_ban':
        return 'bg-orange-500/20 border-orange-500/30'
      default:
        return 'bg-yellow-500/20 border-yellow-500/30'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BellIcon className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Notifications</h2>
            <p className="text-gray-400">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showUnreadOnly 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </button>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckIcon className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 text-center">
              <BellIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-gray-800/50 rounded-lg border transition-all duration-200 ${
                  notification.is_read 
                    ? 'border-gray-700 opacity-75' 
                    : `${getNotificationBadgeColor(notification.type)} border-l-4`
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-gray-300 mb-3 whitespace-pre-line">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{formatTimestamp(notification.created_at)}</span>
                            {notification.user_email && (
                              <span>• {notification.user_email}</span>
                            )}
                          </div>
                          
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                            >
                              <CheckIcon className="w-4 h-4" />
                              <span>Mark Read</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

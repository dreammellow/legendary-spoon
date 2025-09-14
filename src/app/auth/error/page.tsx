'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { NoSymbolIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  // Define error messages
  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          message: 'Your account has been banned or suspended. Please contact support for assistance.',
          icon: NoSymbolIcon
        }
      case 'Configuration':
        return {
          title: 'Configuration Error',
          message: 'There is a problem with the server configuration. Please try again later.',
          icon: NoSymbolIcon
        }
      case 'Verification':
        return {
          title: 'Verification Failed',
          message: 'Email verification failed. Please check your email and try again.',
          icon: NoSymbolIcon
        }
      case 'Default':
      default:
        return {
          title: 'Authentication Error',
          message: 'An error occurred during authentication. Please try again.',
          icon: NoSymbolIcon
        }
    }
  }

  const errorInfo = getErrorMessage(error)
  const IconComponent = errorInfo.icon

  return (
    <div className="min-h-screen bg-crypto-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
          <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <IconComponent className="w-10 h-10 text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            {errorInfo.title}
          </h1>
          
          <p className="text-gray-300 mb-8 leading-relaxed">
            {errorInfo.message}
          </p>
          
          {error === 'AccessDenied' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm">
                If you believe this is an error, please contact our support team with your account details.
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <Link
              href="/airdrop"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-transparent border border-gray-600 text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-white/5 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-600">
            <p className="text-xs text-gray-500">
              Error Code: {error || 'Unknown'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Need help? Contact support
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

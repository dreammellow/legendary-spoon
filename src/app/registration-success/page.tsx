'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { SimpleFooter } from '@/components/layout/simple-footer'
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

export default function RegistrationSuccessPage() {
  const router = useRouter()
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [email, setEmail] = useState('')
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const emailParam = urlParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [])

  const handleResendVerification = async () => {
    setIsResending(true)
    setResendMessage('')
    
    try {
      if (!email) {
        setResendMessage('Please refresh the page to get your email address')
        return
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage('Verification email sent successfully!')
      } else {
        // Handle validation errors properly
        let errorMessage = 'Failed to resend verification email'
        if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail
          } else if (Array.isArray(data.detail)) {
            errorMessage = data.detail.map(err => err.msg || err.message || 'Validation error').join(', ')
          } else if (data.detail.msg) {
            errorMessage = data.detail.msg
          }
        }
        setResendMessage(errorMessage)
      }
    } catch (error) {
      setResendMessage('Network error. Please try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <main className="min-h-screen bg-crypto-dark">
      <Header />
      
      <div className="pt-20 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="flex items-center justify-center mb-8">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-16 w-16 text-green-500" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
              Registration Successful!
            </h1>
            
            <p className="text-lg leading-8 text-gray-300 mb-8">
              Welcome to CryptoAirdrop! We've sent a verification email to your inbox. 
              Please check your email and click the verification link to activate your account.
            </p>
            
            {email && (
              <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <p className="text-gray-300 text-sm">
                  <strong>Email sent to:</strong> <span className="text-primary-400">{email}</span>
                </p>
              </div>
            )}
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
              <p className="text-blue-400 text-sm">
                <strong>Note:</strong> If you don't receive the email, check your spam folder or use the resend option below.
              </p>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-gray-800/50 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4">
                  <EnvelopeIcon className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Check Your Email
                </h3>
                <p className="text-gray-300 text-sm">
                  We've sent a verification link to your email address. 
                  Click the link to verify your account and start earning tokens.
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
                
                {resendMessage && (
                  <p className={`text-sm ${resendMessage.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                    {resendMessage}
                  </p>
                )}
                
                <button
                  onClick={() => router.push('/airdrop?mode=login')}
                  className="w-full px-6 py-3 text-gray-300 hover:text-white transition-colors border border-gray-700 rounded-lg hover:border-gray-600"
                >
                  Go to Login
                </button>
              </div>
              
              <div className="text-xs text-gray-400">
                <p>Didn't receive the email? Check your spam folder or try resending.</p>
                <p>The verification link will expire in 24 hours.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      <SimpleFooter />
    </main>
  )
}

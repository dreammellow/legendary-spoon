'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { signIn } from 'next-auth/react'
import { Header } from '@/components/layout/header'
import { SimpleFooter } from '@/components/layout/simple-footer'
import { AirdropForm } from '@/components/airdrop/airdrop-form'
import { RegistrationSuccess } from '@/components/airdrop/registration-success'
import { GiftIcon, ShieldCheckIcon, UsersIcon } from '@heroicons/react/24/outline'
import { RegistrationForm, LoginForm as LoginFormType } from '@/types/airdrop'

export default function AirdropPage() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  const registrationForm = useForm<RegistrationForm>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      referralCode: '',
      agreeToTerms: false
    }
  })

  const loginForm = useForm<LoginFormType>({
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onRegistrationSubmit = async (data: RegistrationForm) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsRegistered(true)
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onLoginSubmit = async (data: LoginFormType) => {
    setIsLoading(true)
    try {
      console.log('Airdrop: Attempting login with:', data.email)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        }),
      })

      const responseData = await response.json()
      console.log('Airdrop: Login response status:', response.status)

      if (response.ok) {
        console.log('Airdrop: Login successful, storing token:', responseData.access_token)
        localStorage.setItem('user_token', responseData.access_token)
        localStorage.setItem('auth_context', 'user')
        localStorage.removeItem('admin_token')
        console.log('Airdrop: Redirecting to dashboard...')
        window.location.href = '/dashboard'
      } else {
        console.error('Airdrop: Login failed:', responseData)
        // Handle error - you might want to show an error message to the user
        alert(`Login failed: ${responseData.detail || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Airdrop: Login error:', error)
      alert('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async (type: 'login' | 'register') => {
    setIsLoading(true)
    try {
      await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: true 
      })
    } catch (error) {
      console.error('Google auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-crypto-dark">
        <Header />
        <RegistrationSuccess />
        <SimpleFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-crypto-dark">
      <Header />
      
      <main className="pt-20 pb-16">

        {/* Registration Form Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {showLogin ? 'Welcome Back' : 'Register for Airdrop'}
                </h2>
                <p className="text-gray-400">
                  {showLogin 
                    ? 'Sign in to your account to continue earning' 
                    : 'Fill out the form below to get started'
                  }
                </p>
              </div>

              {/* Google Auth Button */}
              <div className="mb-6">
                <button
                  onClick={() => handleGoogleAuth(showLogin ? 'login' : 'register')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Or continue with email</span>
                </div>
              </div>

              {/* Form */}
              {showLogin ? (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      {...loginForm.register('email')}
                      type="email"
                      id="login-email"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                    {loginForm.formState.errors.email && (
                      <p className="mt-1 text-sm text-red-400">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password *
                    </label>
                    <input
                      {...loginForm.register('password')}
                      type="password"
                      id="login-password"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your password"
                    />
                    {loginForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-red-400">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-700 rounded bg-gray-800"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                        Remember me
                      </label>
                    </div>
                    <a href="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300">
                      Forgot password?
                    </a>
                  </div>

                  <motion.button
                    type="button"
                    onClick={loginForm.handleSubmit(onLoginSubmit)}
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </motion.button>
                </div>
              ) : (
                <AirdropForm 
                  form={registrationForm} 
                  onSubmit={onRegistrationSubmit} 
                  isLoading={isLoading} 
                />
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowLogin(!showLogin)}
                  className="text-primary-400 hover:text-primary-300 text-sm underline"
                >
                  {showLogin 
                    ? "Don't have an account? Register here" 
                    : 'Already have an account? Sign in here'
                  }
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-4">Why Join Our Airdrop?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Get exclusive access to free tokens and earn more through our referral program
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <GiftIcon className="w-8 h-8 text-primary-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Free Tokens</h3>
                <p className="text-gray-400">
                  Get free tokens just for registering. No investment required!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <UsersIcon className="w-8 h-8 text-primary-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Referral Rewards</h3>
                <p className="text-gray-400">
                  Earn bonus tokens for every friend you refer to the platform.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <ShieldCheckIcon className="w-8 h-8 text-primary-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">Secure & Safe</h3>
                <p className="text-gray-400">
                  Your data and tokens are protected with enterprise-grade security.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <SimpleFooter />
    </div>
  )
}
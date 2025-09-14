'use client'

import { motion } from 'framer-motion'
import { UseFormReturn } from 'react-hook-form'
import { CheckIcon } from '@heroicons/react/24/outline'
import { RegistrationForm } from '@/types/airdrop'

interface AirdropFormProps {
  form: UseFormReturn<RegistrationForm>
  onSubmit: (data: RegistrationForm) => void
  isLoading: boolean
}

export function AirdropForm({ form, onSubmit, isLoading }: AirdropFormProps) {
  const { register, handleSubmit, formState: { errors } } = form

  return (
    <div className="max-w-md mx-auto">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            Username *
          </label>
          <input
            {...register('username')}
            type="text"
            id="username"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Choose a username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-400">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password *
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Create a strong password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password *
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-gray-300 mb-2">
            Referral Code (Optional)
          </label>
          <input
            {...register('referralCode')}
            type="text"
            id="referralCode"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter referral code if you have one"
          />
          <p className="mt-1 text-xs text-gray-400">
            Get bonus tokens when someone refers you
          </p>
        </div>
        
        <div className="flex items-start space-x-3">
          <input
            {...register('agreeToTerms')}
            type="checkbox"
            id="agreeToTerms"
            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-700 rounded bg-gray-800"
          />
          <label htmlFor="agreeToTerms" className="text-sm text-gray-300">
            I agree to the{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300 underline">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-400 hover:text-primary-300 underline">
              Privacy Policy
            </a>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-sm text-red-400">{errors.agreeToTerms.message}</p>
        )}
        
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Registering...</span>
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4" />
              <span>Register for Airdrop</span>
            </>
          )}
        </motion.button>
      </motion.form>
    </div>
  )
}
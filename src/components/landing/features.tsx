'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  LinkIcon,
  CogIcon
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Multi-Level Referrals',
    description: 'Earn from up to 3 levels of referrals with increasing rewards for each tier.',
    icon: UserGroupIcon,
  },
  {
    name: 'Task-Based Rewards',
    description: 'Complete various tasks to earn additional tokens and boost your rewards.',
    icon: ChartBarIcon,
  },
  {
    name: 'Secure Wallet Integration',
    description: 'Connect your wallet securely with support for multiple blockchain networks.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Real-Time Tracking',
    description: 'Monitor your earnings, referrals, and progress in real-time dashboard.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Easy Sharing',
    description: 'Generate and share your unique referral links with built-in tracking.',
    icon: LinkIcon,
  },
  {
    name: 'Admin Dashboard',
    description: 'Comprehensive admin tools for managing users, referrals, and platform settings.',
    icon: CogIcon,
  },
]

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div id="features" ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to maximize your earnings
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-300">
            Our platform provides all the tools and features you need to participate in the crypto revolution
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="flex flex-col"
              >
                <div className="glass-effect rounded-2xl p-8 h-full hover:crypto-glow transition-all duration-300">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <feature.icon className="h-5 w-5 flex-none text-primary-500" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
    </div>
  )
}

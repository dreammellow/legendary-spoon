'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const stats = [
  { name: 'Total Users', value: '0', change: '+0%', changeType: 'positive' },
  { name: 'Tokens Distributed', value: '0', change: '+0%', changeType: 'positive' },
  { name: 'Active Referrals', value: '0', change: '+0%', changeType: 'positive' },
  { name: 'Success Rate', value: '100%', change: '+0%', changeType: 'positive' },
]

export function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Join the Crypto Revolution
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-300">
            Be among the first to participate in our innovative airdrop platform
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="flex flex-col items-center text-center"
              >
                <div className="glass-effect rounded-2xl p-8 w-full">
                  <dt className="text-base font-semibold leading-7 text-gray-300">
                    {stat.name}
                  </dt>
                  <dd className="mt-2 flex items-baseline justify-center gap-x-2">
                    <div className="text-4xl font-bold tracking-tight text-white">
                      {stat.value}
                    </div>
                    <div className={`text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stat.change}
                    </div>
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

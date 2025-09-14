'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const tokenDistribution = [
  { name: 'Airdrop', value: 50, color: '#3b82f6' },
  { name: 'Liquidity', value: 20, color: '#8b5cf6' },
  { name: 'Team', value: 15, color: '#10b981' },
  { name: 'Marketing', value: 10, color: '#f59e0b' },
  { name: 'Reserve', value: 5, color: '#ef4444' },
]

const monthlyData = [
  { month: 'Launch', tokens: 0 },
  { month: 'Month 1', tokens: 0 },
  { month: 'Month 2', tokens: 0 },
  { month: 'Month 3', tokens: 0 },
  { month: 'Month 4', tokens: 0 },
  { month: 'Month 5', tokens: 0 },
]

export function Tokenomics() {
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
            Token Economics
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-300">
            Transparent and sustainable token distribution designed for long-term growth
          </p>
        </motion.div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-effect rounded-2xl p-8"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Token Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tokenDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tokenDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Percentage']}
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-2">
              {tokenDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass-effect rounded-2xl p-8"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Monthly Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${(value as number / 1000000).toFixed(1)}M tokens`, 'Tokens']}
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar 
                    dataKey="tokens" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="glass-effect rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-primary-400 mb-2">1B</div>
            <div className="text-sm text-gray-300">Total Supply</div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-primary-400 mb-2">400M</div>
            <div className="text-sm text-gray-300">Airdrop Pool</div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-primary-400 mb-2">$0.05</div>
            <div className="text-sm text-gray-300">Initial Price</div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 text-center">
            <div className="text-2xl font-bold text-primary-400 mb-2">ERC-20</div>
            <div className="text-sm text-gray-300">Token Standard</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

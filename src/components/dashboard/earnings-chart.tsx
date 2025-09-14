'use client'

import { motion } from 'framer-motion'
import { User } from '@/types/airdrop'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface EarningsChartProps {
  user: User
}

export function EarningsChart({ user }: EarningsChartProps) {
  // Mock data for the last 7 days
  const earningsData = [
    { day: 'Mon', earnings: 100 },
    { day: 'Tue', earnings: 150 },
    { day: 'Wed', earnings: 200 },
    { day: 'Thu', earnings: 180 },
    { day: 'Fri', earnings: 250 },
    { day: 'Sat', earnings: 300 },
    { day: 'Sun', earnings: 280 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="glass-effect rounded-2xl p-6"
    >
      <h2 className="text-xl font-semibold text-white mb-6">Earnings Trend</h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={earningsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="day" 
              stroke="#9ca3af"
              fontSize={12}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value) => [`${value} tokens`, 'Earnings']}
            />
            <Line 
              type="monotone" 
              dataKey="earnings" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-800/50 rounded-lg">
          <div className="text-2xl font-bold text-primary-400">
            {earningsData.reduce((sum, day) => sum + day.earnings, 0)}
          </div>
          <div className="text-sm text-gray-300">This Week</div>
        </div>
        
        <div className="text-center p-4 bg-gray-800/50 rounded-lg">
          <div className="text-2xl font-bold text-green-400">
            {Math.round(earningsData.reduce((sum, day) => sum + day.earnings, 0) / earningsData.length)}
          </div>
          <div className="text-sm text-gray-300">Daily Average</div>
        </div>
      </div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Task } from '@/types/airdrop'
import { 
  CheckCircleIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline'

interface TaskCardProps {
  task: Task
  onComplete: () => void
}

const taskTypeColors = {
  social: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  verification: 'bg-green-500/10 text-green-400 border-green-500/20',
  referral: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  engagement: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

const taskTypeIcons = {
  social: '📱',
  verification: '✅',
  referral: '👥',
  engagement: '🎯',
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const isCompleted = task.completed

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`glass-effect rounded-2xl p-6 h-full ${
        isCompleted ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{taskTypeIcons[task.type]}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${taskTypeColors[task.type]}`}>
            {task.type}
          </span>
        </div>
        
        {isCompleted ? (
          <div className="flex items-center space-x-1 text-green-400">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-gray-400">
            <ClockIcon className="h-5 w-5" />
            <span className="text-sm">Pending</span>
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
      <p className="text-gray-300 text-sm mb-4">{task.description}</p>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Requirements:</h4>
        <ul className="space-y-1">
          {task.requirements.map((requirement, index) => (
            <li key={index} className="text-xs text-gray-400 flex items-center">
              <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
              {requirement}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="h-4 w-4 text-primary-400" />
          <span className="text-lg font-bold text-primary-400">
            {task.reward} tokens
          </span>
        </div>
        
        {!isCompleted ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onComplete}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 flex items-center space-x-2"
          >
            <span>Complete</span>
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </motion.button>
        ) : (
          <div className="text-xs text-gray-400">
            Completed {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''}
          </div>
        )}
      </div>
    </motion.div>
  )
}

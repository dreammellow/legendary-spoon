'use client'

import { motion } from 'framer-motion'
import { 
  FunnelIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

interface TaskFiltersProps {
  selectedFilter: string
  onFilterChange: (filter: string) => void
}

const filters = [
  { id: 'all', name: 'All Tasks', icon: FunnelIcon },
  { id: 'social', name: 'Social Media', icon: UserGroupIcon },
  { id: 'verification', name: 'Verification', icon: ShieldCheckIcon },
  { id: 'referral', name: 'Referral', icon: UserGroupIcon },
  { id: 'engagement', name: 'Engagement', icon: ChartBarIcon },
]

export function TaskFilters({ selectedFilter, onFilterChange }: TaskFiltersProps) {
  return (
    <div className="glass-effect rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
        <FunnelIcon className="h-5 w-5 mr-2 text-primary-500" />
        Filter Tasks
      </h2>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange(filter.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedFilter === filter.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <filter.icon className="h-4 w-4" />
            <span>{filter.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

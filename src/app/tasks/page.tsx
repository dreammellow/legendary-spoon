'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
// import { useAccount } from 'wagmi'
import { Header } from '@/components/layout/header'
import { SimpleFooter } from '@/components/layout/simple-footer'
import { TaskCard } from '@/components/tasks/task-card'
import { TaskFilters } from '@/components/tasks/task-filters'
import { TaskStats } from '@/components/tasks/task-stats'
import { WalletNotConnected } from '@/components/dashboard/wallet-not-connected'
import { Task } from '@/types/airdrop'

export default function TasksPage() {
  // const { address, isConnected } = useAccount()
  const address = '0x1234567890123456789012345678901234567890' // Mock address for now
  const isConnected = true // Mock connection for now
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isConnected && address) {
      // Simulate API call to fetch tasks
      const fetchTasks = async () => {
        setIsLoading(true)
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock tasks data
          const mockTasks: Task[] = [
            {
              id: '1',
              title: 'Follow us on Twitter',
              description: 'Follow our official Twitter account and retweet our latest post about the airdrop.',
              reward: 100,
              type: 'social',
              completed: false,
              requirements: ['Follow @CryptoAirdrop', 'Retweet pinned post'],
            },
            {
              id: '2',
              title: 'Join our Telegram',
              description: 'Join our official Telegram group and stay active for at least 24 hours.',
              reward: 150,
              type: 'social',
              completed: true,
              completedAt: '2024-01-10T10:00:00Z',
              requirements: ['Join Telegram group', 'Stay active for 24h'],
            },
            {
              id: '3',
              title: 'Email Verification',
              description: 'Verify your email address to secure your account and earn bonus tokens.',
              reward: 200,
              type: 'verification',
              completed: false,
              requirements: ['Click verification link', 'Confirm email'],
            },
            {
              id: '4',
              title: 'Refer 3 Friends',
              description: 'Invite 3 friends to join the airdrop and earn bonus rewards.',
              reward: 500,
              type: 'referral',
              completed: false,
              requirements: ['Share referral link', '3 successful referrals'],
            },
            {
              id: '5',
              title: 'Daily Check-in',
              description: 'Visit the platform daily for 7 consecutive days to earn streak bonus.',
              reward: 300,
              type: 'engagement',
              completed: false,
              requirements: ['Visit daily for 7 days', 'Maintain streak'],
            },
            {
              id: '6',
              title: 'Social Media Share',
              description: 'Share our airdrop announcement on your social media platforms.',
              reward: 75,
              type: 'social',
              completed: false,
              requirements: ['Share on 2 platforms', 'Use hashtag #CryptoAirdrop'],
            },
          ]
          
          setTasks(mockTasks)
          setFilteredTasks(mockTasks)
        } catch (error) {
          }

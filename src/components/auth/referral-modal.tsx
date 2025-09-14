'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

interface ReferralModalProps {
  isOpen: boolean
  onClose: () => void
  onSkip: () => void
  onSubmit: (referralCode: string) => void
  userEmail?: string
}

export function ReferralModal({ isOpen, onClose, onSkip, onSubmit, userEmail }: ReferralModalProps) {
  const [referralCode, setReferralCode] = useState('')
  const [isAutoFilled, setIsAutoFilled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()

  // Auto-fill referral code from URL parameter
  useEffect(() => {
    if (isOpen) {
      const refCode = searchParams.get('ref')
      if (refCode) {
        }

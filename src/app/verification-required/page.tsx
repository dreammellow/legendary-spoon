'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { Header } from '@/components/layout/header'
import { SimpleFooter } from '@/components/layout/simple-footer'

export default function VerificationRequiredPage() {
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleResendVerification = async () => {
    if (!email) {
      setResendMessage('Please enter your email address')
      return
    }

    setIsResending(true)
    setResendMessage('')
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResendMessage(data.message || 'Verification email sent successfully!')
        // Log verification link to console for development
        if (data.verification_link) {
          }

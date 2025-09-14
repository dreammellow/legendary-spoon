'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CheckUserStatusPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isChecking, setIsChecking] = useState(true)
  const [hasProcessed, setHasProcessed] = useState(false)

  useEffect(() => {
    const checkUserStatus = async () => {
      if (status === 'loading') return
      if (hasProcessed) return // Prevent duplicate processing
      
      if (status === 'unauthenticated') {
        router.push('/airdrop')
        return
      }

      if (!session?.user?.email) {
        router.push('/airdrop')
        return
      }

      // Check if this is actually a Google OAuth flow by looking for oauth_success parameter
      const oauthSuccess = searchParams.get('oauth_success')
      if (oauthSuccess !== 'true') {
        // Not an OAuth flow, redirect to dashboard
        router.push('/dashboard')
        return
      }

      setHasProcessed(true) // Mark as processed to prevent duplicate calls

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        router.push('/dashboard')
      }, 8000) // 8 second timeout
      
      try {
        
        // Check if user exists in our backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/check-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: session.user.email,
            name: session.user.name,
            image: session.user.image
          }),
        })

        const data = await response.json()

        if (response.ok) {
          // User exists, check if they need to complete referral process
          if (data.access_token) {
            localStorage.setItem('user_token', data.access_token)
            localStorage.setItem('auth_context', 'user')
            localStorage.removeItem('admin_token')
          }
          
          // Check if user needs to complete referral process
          // If user has no referral code set and is coming from Google OAuth, send to referral
          if (data.user && !data.user.referred_by && data.user.email_verified) {
            clearTimeout(timeoutId)
            router.push('/referral?email=' + encodeURIComponent(session.user.email))
          } else {
            clearTimeout(timeoutId)
            router.push('/dashboard')
          }
        } else {
          // User doesn't exist, create user via Google OAuth endpoint
          try {
            const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/google-oauth`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: session.user.email,
                name: session.user.name,
                image: session.user.image
              }),
            })

            const createData = await createResponse.json()

            if (createResponse.ok && createData.access_token) {
              localStorage.setItem('user_token', createData.access_token)
              localStorage.setItem('auth_context', 'user')
              localStorage.removeItem('admin_token')
              
              // Check if this is a new user who needs to enter referral code
              if (createData.is_new_user === true) {
                clearTimeout(timeoutId)
                router.push('/referral?email=' + encodeURIComponent(session.user.email))
              } else {
                clearTimeout(timeoutId)
                router.push('/dashboard')
              }
            } else {
              clearTimeout(timeoutId)
              // Instead of redirecting to airdrop, try to redirect to referral page anyway
              // This ensures new users can still proceed even if backend fails
              router.push('/referral?email=' + encodeURIComponent(session.user.email))
            }
          } catch (createError) {
            clearTimeout(timeoutId)
            // Even if there's an error, treat as new user and redirect to referral
            router.push('/referral?email=' + encodeURIComponent(session.user.email))
          }
        }
      } catch (error) {
        clearTimeout(timeoutId)
        // On error, redirect to airdrop page
        router.push('/airdrop')
      } finally {
        setIsChecking(false)
      }
    }

    checkUserStatus()
  }, [session, status, router, searchParams, hasProcessed])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-crypto-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Checking your account...</h2>
          <p className="text-gray-400">Please wait while we verify your information.</p>
        </div>
      </div>
    )
  }

  return null
}
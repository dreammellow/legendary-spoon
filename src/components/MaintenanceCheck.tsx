'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function MaintenanceCheck() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const response = await fetch(`${apiUrl}/api/admin/maintenance/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.enabled) {
            setIsMaintenanceMode(true)
            router.push('/maintenance')
          }
        }
      } catch (error) {
        // If API fails, just continue normally
        console.error('Error checking maintenance mode:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkMaintenanceMode()
  }, [router])

  if (isLoading) {
    return null
  }

  if (isMaintenanceMode) {
    return null
  }

  // This should not be reached since we redirect to /maintenance
  return null
}

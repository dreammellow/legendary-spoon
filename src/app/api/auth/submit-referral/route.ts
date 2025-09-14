import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { referralCode, accessToken } = await request.json()
    
    if (!accessToken) {
      return NextResponse.json(
        { detail: 'Access token required' },
        { status: 401 }
      )
    }
    
    if (!referralCode) {
      // No referral code provided, just return success
      return NextResponse.json({
        message: 'No referral code provided, continuing to dashboard',
        success: true
      })
    }

    // Call backend API to submit referral code
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/auth/submit-referral`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        referral_code: referralCode
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to submit referral code' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    return NextResponse.json({
      message: data.message || 'Referral code submitted successfully!',
      success: true,
      data
    })

  } catch (error) {
    }
}
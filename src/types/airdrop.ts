export interface RegistrationForm {
  username: string
  email: string
  password: string
  confirmPassword: string
  referralCode?: string
  agreeToTerms: boolean
}

export interface LoginForm {
  email: string
  password: string
}

export interface User {
  id: string
  username: string
  email: string
  wallet_address?: string
  referral_code: string
  referred_by?: string
  email_verified: boolean
  total_earnings: number
  referral_earnings: number
  task_earnings: number
  level1_referrals: number
  level2_referrals: number
  level3_referrals: number
  is_active: boolean
  is_verified: boolean
  kyc_completed: boolean
  mining_points: number
  mining_speed: number
  last_mining_claim?: string
  is_mining: boolean
  created_at: string
  updated_at?: string
  last_login?: string
}

export interface ReferralStats {
  totalReferrals: number
  level1Referrals: number
  level2Referrals: number
  level3Referrals: number
  totalEarnings: number
  level1Earnings: number
  level2Earnings: number
  level3Earnings: number
}

export interface Task {
  id: string
  title: string
  description: string
  reward: number
  type: 'social' | 'verification' | 'referral' | 'engagement'
  completed: boolean
  completedAt?: string
  requirements: string[]
}

export interface AirdropStats {
  totalUsers: number
  totalTokensDistributed: number
  totalReferrals: number
  averageEarnings: number
}

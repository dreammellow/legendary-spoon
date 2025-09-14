// Application configuration
export const config = {
  // Domain configuration - update this with your actual domain
  domain: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // API configuration
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  
  // App configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'CryptoAirdrop',
  
  // Generate referral link
  getReferralLink: (referralCode: string) => {
    const baseUrl = config.domain.replace(/\/$/, '') // Remove trailing slash
    return `${baseUrl}/airdrop?ref=${referralCode}`
  },
  
  // Get full URL for any path
  getFullUrl: (path: string) => {
    const baseUrl = config.domain.replace(/\/$/, '') // Remove trailing slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${baseUrl}${cleanPath}`
  }
}

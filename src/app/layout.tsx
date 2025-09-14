import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'react-hot-toast'
import { MaintenanceCheck } from '@/components/MaintenanceCheck'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'CryptoAirdrop - Your Gateway to Free Tokens',
  description: 'Join the future of cryptocurrency with our exclusive airdrop platform. Earn tokens through referrals and tasks.',
  keywords: 'cryptocurrency, airdrop, tokens, blockchain, referral, rewards',
  authors: [{ name: 'CryptoAirdrop Team' }],
  openGraph: {
    title: 'CryptoAirdrop - Your Gateway to Free Tokens',
    description: 'Join the future of cryptocurrency with our exclusive airdrop platform.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoAirdrop - Your Gateway to Free Tokens',
    description: 'Join the future of cryptocurrency with our exclusive airdrop platform.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-crypto-dark text-white min-h-screen`}>
        <Providers>
          <MaintenanceCheck />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid #333',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}

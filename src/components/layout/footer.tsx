import Link from 'next/link'
import { 
  Twitter, 
  MessageCircle, 
  Send, 
  Github 
} from 'lucide-react'

const navigation = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Airdrop', href: '/airdrop' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Tasks', href: '/tasks' },
    { name: 'Admin', href: '/admin' },
  ],
  social: [
    {
      name: 'Twitter',
      href: '#',
      icon: Twitter,
    },
    {
      name: 'Discord',
      href: '#',
      icon: MessageCircle,
    },
    {
      name: 'Telegram',
      href: '#',
      icon: Send,
    },
    {
      name: 'GitHub',
      href: '#',
      icon: Github,
    },
  ],
}

export function Footer() {
  return (
    <footer className="bg-crypto-darker border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          {navigation.social.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </Link>
          ))}
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold gradient-text">CryptoAirdrop</span>
          </div>
          <p className="text-center text-xs leading-5 text-gray-400 mt-2">
            &copy; 2024 CryptoAirdrop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

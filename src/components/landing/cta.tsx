'use client'

import Link from 'next/link'

export function CTA() {
  return (
    <div className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl px-6 py-16 sm:px-16 sm:py-24 lg:py-32">
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Start Your Crypto Journey Today
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Join thousands of users already earning through our platform. 
              Don't miss out on the next big crypto opportunity.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/airdrop"
                className="rounded-full bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition-all duration-300"
              >
                Get Started Now
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-semibold leading-6 text-gray-300 hover:text-white transition-colors duration-200"
              >
                View Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
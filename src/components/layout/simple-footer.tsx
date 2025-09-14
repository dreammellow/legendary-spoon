export function SimpleFooter() {
  return (
    <footer className="bg-crypto-darker border-t border-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
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
    </footer>
  )
}

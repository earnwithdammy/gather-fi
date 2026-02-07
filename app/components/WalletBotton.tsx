'use client'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { Wallet, LogOut } from 'lucide-react'
import { useState } from 'react'

export default function WalletButton() {
  const { wallet, disconnect } = useWallet()
  const [isHovered, setIsHovered] = useState(false)

  if (!wallet) {
    return (
      <WalletMultiButton 
        style={{
          backgroundColor: '#8b5cf6',
          color: 'white',
          borderRadius: '0.5rem',
          padding: '0.75rem 1.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          height: 'auto',
        }}
      />
    )
  }

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition"
      >
        <Wallet className="w-5 h-5" />
        <span className="font-medium">
          {wallet.adapter.name}
        </span>
      </button>
      
      {isHovered && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            onClick={() => disconnect()}
            className="w-full flex items-center space-x-2 px-4 py-3 text-left hover:bg-gray-700 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        </div>
      )}
    </div>
  )
}
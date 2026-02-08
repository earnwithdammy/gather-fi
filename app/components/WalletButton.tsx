'use client'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { Wallet, LogOut, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import '@solana/wallet-adapter-react-ui/styles.css'

export default function WalletButton() {
  const { wallet, disconnect, connected, publicKey } = useWallet()
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="px-6 py-2 bg-gray-700 rounded-lg animate-pulse">
        Loading...
      </div>
    )
  }

  // Check if wallet is TRULY connected
  const isTrulyConnected = wallet && connected && publicKey

  // Only show disconnect button if TRULY connected
  if (isTrulyConnected) {
    return (
      <div className="relative">
        <button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:opacity-90 transition"
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
            <div className="p-3 border-b border-gray-700">
              <p className="text-xs text-gray-300 truncate">
                {publicKey.toString().slice(0, 16)}...
              </p>
            </div>
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

  // Show warning if wallet is detected but not fully connected
  if (wallet && !connected) {
    return (
      <button
        onClick={() => {
          // Try to connect the detected wallet
          if (wallet.adapter.connect) {
            wallet.adapter.connect().catch(console.error)
          }
        }}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg hover:opacity-90 transition"
      >
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium">
          Complete Connection
        </span>
      </button>
    )
  }

  // Show regular connect button if no wallet or not detected
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
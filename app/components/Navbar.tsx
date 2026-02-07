'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Ticket, PlusCircle, Home, User } from 'lucide-react'
import WalletButton from './WalletButton'
import { useWallet } from '@solana/wallet-adapter-react'

const Navbar = () => {
  const pathname = usePathname()
  const { connected } = useWallet()

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Create', href: '/create', icon: PlusCircle },
    { name: 'Dashboard', href: '/dashboard', icon: User },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/90 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                GatherFi
              </h1>
              <p className="text-xs text-gray-400">🇳🇬</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Wallet Button */}
          <div className="flex items-center space-x-4">
            {connected && (
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-400">Connected</span>
              </div>
            )}
            <WalletButton />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around py-3 border-t border-gray-800">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition ${
                  isActive
                    ? 'text-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
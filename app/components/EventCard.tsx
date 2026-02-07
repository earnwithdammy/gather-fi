'use client'

import { Calendar, MapPin, Users, Ticket } from 'lucide-react'
import { useGatherFiProgram } from '../lib/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'

interface EventCardProps {
  event: {
    id: string
    name: string
    organizer: string
    ticketPriceUsdc: number
    nairaPrice: number
    city: string
    category: string
    ticketsSold: number
    maxTickets: number
    totalRevenue: number
    date: string
  }
}

export default function EventCard({ event }: EventCardProps) {
  const program = useGatherFiProgram()
  const { publicKey, connected } = useWallet()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)
  
  const progress = (event.ticketsSold / event.maxTickets) * 100
  
  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage(null)
      setMessageType(null)
    }, 3000)
  }
  
  const handleBuyTicket = async () => {
    if (!connected || !publicKey) {
      showMessage('Please connect your wallet first', 'error')
      return
    }

    if (!program) {
      showMessage('Program not initialized', 'error')
      return
    }

    setLoading(true)
    setMessage('Processing transaction...')
    try {
      // TODO: Implement actual buy ticket transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      showMessage('Ticket purchased successfully!', 'success')
    } catch (error: any) {
      console.error('Error buying ticket:', error)
      showMessage(error.message || 'Failed to buy ticket', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-purple-500/30 transition">
      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {message}
        </div>
      )}
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
              {event.category}
            </span>
            <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
              {event.city}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-1">{event.name}</h3>
          <p className="text-gray-400 text-sm">By {event.organizer}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-400">${event.ticketPriceUsdc}</div>
          <div className="text-sm text-gray-400">≈ ₦{event.nairaPrice.toLocaleString()}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{event.city}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{event.ticketsSold}/{event.maxTickets} sold</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <button 
          onClick={handleBuyTicket}
          disabled={loading || event.ticketsSold >= event.maxTickets}
          className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${
            loading
              ? 'bg-gray-600 cursor-not-allowed'
              : event.ticketsSold >= event.maxTickets
              ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : event.ticketsSold >= event.maxTickets ? (
            <>
              <Ticket className="w-5 h-5" />
              <span>Sold Out</span>
            </>
          ) : (
            <>
              <Ticket className="w-5 h-5" />
              <span>Buy Ticket</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
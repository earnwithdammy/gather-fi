'use client'

import { Calendar, MapPin, Users, Ticket } from 'lucide-react'

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
  const progress = (event.ticketsSold / event.maxTickets) * 100
  
  const handleBuyTicket = () => {
    alert(`Buying ticket for ${event.name}`)
  }

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1">{event.name}</h3>
          <p className="text-gray-400 text-sm">By {event.organizer}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-400">{event.ticketPriceUsdc} USDC</div>
          <div className="text-sm text-gray-400">≈ ₦{event.nairaPrice.toLocaleString()}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{event.city}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Tickets: {event.ticketsSold}/{event.maxTickets}</span>
            <span>{Math.round(progress)}% sold</span>
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
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center space-x-2"
        >
          <Ticket className="w-5 h-5" />
          <span>Buy Ticket</span>
        </button>
      </div>
    </div>
  )
}
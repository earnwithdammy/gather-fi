'use client'

import { useState } from 'react'
import EventCard from './components/EventCard'
import { Ticket, Users, TrendingUp, MapPin } from 'lucide-react'
import { useEvents } from './context/EventContext'
import LoadingSpinner from './components/LoadingSpinner'
import Link from 'next/link'

export default function Home() {
  const [activeTab, setActiveTab] = useState('events')
  const { events, loading } = useEvents()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading events..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-bold mb-4">
          Fund. Create. <span className="text-purple-400">Profit.</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Nigeria&apos;s first decentralized event platform. Back events, earn profits, 
          attend with fraud-proof NFT tickets.
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            href="#events"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:opacity-90 transition"
          >
            Discover Events
          </Link>
          <Link 
            href="/create"
            className="px-8 py-3 border border-purple-500 text-purple-400 rounded-full font-semibold hover:bg-purple-500/10 transition"
          >
            Create Event
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Ticket className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Events</p>
              <p className="text-2xl font-bold">{events.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Tickets Sold</p>
              <p className="text-2xl font-bold">
                {events.reduce((sum, event) => sum + event.account.ticketsSold, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold">
                ${(events.reduce((sum, event) => sum + (event.account.totalRevenue / 1_000_000), 0)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Cities</p>
              <p className="text-2xl font-bold">
                {new Set(events.map(e => e.account.city)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div id="events">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Events</h2>
          <Link 
            href="/create"
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition"
          >
            Create Your Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
            <Ticket className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events yet</h3>
            <p className="text-gray-400 mb-6">Be the first to create an event!</p>
            <Link 
              href="/create"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Create First Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard 
                key={event.publicKey.toString()}
                event={{
                  id: event.publicKey.toString(),
                  name: event.account.name,
                  organizer: event.account.organizer.toString().slice(0, 8) + '...',
                  ticketPriceUsdc: event.account.ticketPriceUsdc / 1_000_000,
                  nairaPrice: event.account.nairaEquivalent / 100,
                  city: event.account.city,
                  category: event.account.category,
                  ticketsSold: event.account.ticketsSold,
                  maxTickets: event.account.maxTickets,
                  totalRevenue: event.account.totalRevenue / 1_000_000,
                  date: new Date(event.account.eventDate * 1000).toLocaleDateString(),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
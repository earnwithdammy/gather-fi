'use client'

import { useState } from 'react'
import EventCard from './components/EventCard'
import CreateEventForm from './components/CreateEventForm'
import { Ticket, Users, TrendingUp, MapPin } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('events')

  const mockEvents = [
    {
      id: '1',
      name: 'Lagos Afrobeat Festival',
      organizer: 'NaijaVibez Inc.',
      ticketPriceUsdc: 10,
      nairaPrice: 15000,
      city: 'Lagos',
      category: 'AfrobeatConcert',
      ticketsSold: 245,
      maxTickets: 1000,
      totalRevenue: 2450,
      date: '2024-12-25',
    },
    {
      id: '2',
      name: 'Abuja Tech Summit',
      organizer: 'TechNaija',
      ticketPriceUsdc: 5,
      nairaPrice: 7500,
      city: 'Abuja',
      category: 'TechMeetup',
      ticketsSold: 120,
      maxTickets: 300,
      totalRevenue: 600,
      date: '2024-11-15',
    },
  ]

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
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:opacity-90 transition">
            Discover Events
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className="px-8 py-3 border border-purple-500 text-purple-400 rounded-full font-semibold hover:bg-purple-500/10 transition"
          >
            Create Event
          </button>
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
              <p className="text-sm text-gray-400">NFT Tickets Sold</p>
              <p className="text-2xl font-bold">12,450</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Users className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Events</p>
              <p className="text-2xl font-bold">156</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Profits Distributed</p>
              <p className="text-2xl font-bold">₦245M</p>
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
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-8">
          {['events', 'create', 'dashboard', 'tickets'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 capitalize font-medium ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mt-8">
        {activeTab === 'events' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Featured Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'create' && <CreateEventForm />}
        
        {activeTab === 'dashboard' && (
          <div className="bg-gray-800/30 p-8 rounded-xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Your Dashboard</h2>
            <p className="text-gray-400">Connect your wallet to view your events, tickets, and earnings.</p>
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useEvents } from '../context/EventContext'
import { useWallet } from '@solana/wallet-adapter-react'
import { Ticket, TrendingUp, Users, DollarSign, Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DashboardPage() {
  const { myEvents, myTickets, loading } = useEvents()
  const { connected } = useWallet()

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8">
            Please connect your wallet to view your dashboard
          </p>
          <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
            <p className="text-lg">Connect your wallet to see:</p>
            <ul className="mt-4 space-y-2 text-gray-300">
              <li className="flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-purple-400" />
                <span>Your NFT tickets</span>
              </li>
              <li className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span>Events you created</span>
              </li>
              <li className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span>Your earnings</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }

  // Calculate stats
  const totalEarnings = myEvents.reduce((sum, event) => 
    sum + (event.account.organizerWithdrawn / 1_000_000), 0
  )
  const totalEvents = myEvents.length
  const totalTickets = myTickets.length
  const upcomingEvents = myEvents.filter(event => 
    event.account.eventDate > Date.now() / 1000
  ).length

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-gray-400">Manage your events, tickets, and earnings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">My Events</p>
              <p className="text-2xl font-bold">{totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Ticket className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">My Tickets</p>
              <p className="text-2xl font-bold">{totalTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Earnings</p>
              <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Upcoming</p>
              <p className="text-2xl font-bold">{upcomingEvents}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Events */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">My Events</h2>
            <Link
              href="/create"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition"
            >
              Create New
            </Link>
          </div>

          {myEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No events created yet</p>
              <Link
                href="/create"
                className="inline-block mt-4 text-purple-400 hover:text-purple-300"
              >
                Create your first event →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myEvents.slice(0, 3).map((event) => (
                <div
                  key={event.publicKey.toString()}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/30 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{event.account.name}</h3>
                      <div className="flex items-center space-x-2 mt-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{event.account.city}</span>
                        <span>•</span>
                        <span>{event.account.ticketsSold}/{event.account.maxTickets} tickets</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-400">
                        ${(event.account.ticketPriceUsdc / 1_000_000).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-400">
                        ≈ ₦{(event.account.nairaEquivalent / 100).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {myEvents.length > 3 && (
                <Link
                  href="/my-events"
                  className="block text-center py-3 text-purple-400 hover:text-purple-300 transition"
                >
                  View all events →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* My Tickets */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">My Tickets</h2>
            <Link
              href="/tickets"
              className="px-4 py-2 text-gray-300 hover:text-white transition"
            >
              View All
            </Link>
          </div>

          {myTickets.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No tickets purchased yet</p>
              <Link
                href="/"
                className="inline-block mt-4 text-purple-400 hover:text-purple-300"
              >
                Browse events →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/30 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{ticket.event}</h3>
                      <div className="flex items-center space-x-2 mt-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{ticket.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                        Confirmed
                      </span>
                      <p className="text-sm text-gray-400 mt-2">NFT Ticket</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gray-800/30 rounded-xl border border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/create"
            className="p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Create Event</h3>
            <p className="text-sm text-gray-400">Start funding your event</p>
          </Link>

          <Link
            href="/"
            className="p-6 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl border border-blue-500/30 hover:border-blue-500/50 transition text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Discover Events</h3>
            <p className="text-sm text-gray-400">Find events to attend</p>
          </Link>

          <Link
            href="/withdraw"
            className="p-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl border border-green-500/30 hover:border-green-500/50 transition text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Withdraw Earnings</h3>
            <p className="text-sm text-gray-400">Claim your profits</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
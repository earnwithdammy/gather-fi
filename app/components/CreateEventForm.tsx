'use client'

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'

export default function CreateEventForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ticketPriceUsdc: '',
    maxTickets: '',
    city: 'Lagos',
    category: 'AfrobeatConcert',
    eventDate: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Creating event: ${formData.name}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Create Your Event</h2>
        <p className="text-gray-400">Start your event funding journey</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Event Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            placeholder="e.g., Lagos Afrobeat Festival"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
            placeholder="Describe your event..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Ticket Price (USDC)</label>
            <input
              type="number"
              name="ticketPriceUsdc"
              value={formData.ticketPriceUsdc}
              onChange={handleChange}
              step="0.01"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              placeholder="10.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Max Tickets</label>
            <input
              type="number"
              name="maxTickets"
              value={formData.maxTickets}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              placeholder="1000"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-lg hover:opacity-90 transition flex items-center justify-center space-x-2"
        >
          <PlusCircle className="w-6 h-6" />
          <span>Create Event</span>
        </button>
      </form>
    </div>
  )
}
'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useGatherFiProgram } from '../lib/anchor'
import { PublicKey } from '@solana/web3.js'

interface Event {
  publicKey: PublicKey
  account: any
}

interface EventContextType {
  events: Event[]
  loading: boolean
  myEvents: Event[]
  myTickets: any[]
  refreshEvents: () => Promise<void>
  refreshMyEvents: () => Promise<void>
  refreshMyTickets: () => Promise<void>
  error: string | null
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: ReactNode }) {
  const program = useGatherFiProgram()
  const [events, setEvents] = useState<Event[]>([])
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [myTickets, setMyTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshEvents = async () => {
    if (!program) return
    
    setLoading(true)
    setError(null)
    try {
      const eventAccounts = await program.account.event.all()
      const activeEvents = eventAccounts.filter(event => 
        event.account.active === true
      )
      setEvents(activeEvents)
    } catch (error: any) {
      console.error('Error fetching events:', error)
      setError('Failed to load events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const refreshMyEvents = async () => {
    if (!program) return
    
    try {
      const eventAccounts = await program.account.event.all()
      setMyEvents(eventAccounts.slice(0, 3))
    } catch (error) {
      console.error('Error fetching my events:', error)
    }
  }

  const refreshMyTickets = async () => {
    setMyTickets([
      { id: 1, event: 'Lagos Afrobeat Festival', date: '2024-12-25' },
      { id: 2, event: 'Abuja Tech Summit', date: '2024-11-15' },
    ])
  }

  useEffect(() => {
    refreshEvents()
    refreshMyEvents()
    refreshMyTickets()
  }, [program])

  return (
    <EventContext.Provider value={{
      events,
      loading,
      myEvents,
      myTickets,
      error,
      refreshEvents,
      refreshMyEvents,
      refreshMyTickets
    }}>
      {children}
    </EventContext.Provider>
  )
}

export function useEvents() {
  const context = useContext(EventContext)
  if (!context) {
    throw new Error('useEvents must be used within EventProvider')
  }
  return context
}
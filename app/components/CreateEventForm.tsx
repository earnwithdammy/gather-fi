'use client'

import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { useGatherFiProgram } from '../lib/anchor'
import { BN } from '@coral-xyz/anchor'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'

export default function CreateEventForm() {
  const { publicKey, sendTransaction } = useWallet()
  const program = useGatherFiProgram()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ticketPriceUsdc: '',
    maxTickets: '',
    city: 'Lagos',
    category: 'AfrobeatConcert',
    eventDate: '',
    exchangeRate: '1500',
  })

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage(null)
      setMessageType(null)
    }, 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const calculateNairaPrice = () => {
    const usdc = parseFloat(formData.ticketPriceUsdc) || 0
    const rate = parseFloat(formData.exchangeRate) || 1500
    return (usdc * rate).toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!program || !publicKey) {
      showMessage('Please connect wallet first', 'error')
      return
    }

    setLoading(true)
    setMessage('Creating event on blockchain...')
    try {
      const eventPDA = PublicKey.findProgramAddressSync(
        [Buffer.from('event'), publicKey.toBuffer(), Buffer.from(formData.name.slice(0, 32))],
        program.programId
      )[0]

      const ticketPrice = new BN(parseFloat(formData.ticketPriceUsdc) * 1_000_000)
      const maxTickets = parseInt(formData.maxTickets)
      const exchangeRate = new BN(parseFloat(formData.exchangeRate) * 100)

      const tx = await program.methods
        .createEvent(
          formData.name,
          ticketPrice,
          maxTickets,
          exchangeRate,
          formData.city,
          formData.category
        )
        .accounts({
          event: eventPDA,
          organizer: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .transaction()

      const signature = await sendTransaction(tx, program.provider.connection)
      
      setMessage('Confirming transaction...')
      await program.provider.connection.confirmTransaction(signature)
      
      showMessage(`✅ Event created! Signature: ${signature.slice(0, 8)}...`, 'success')
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        ticketPriceUsdc: '',
        maxTickets: '',
        city: 'Lagos',
        category: 'AfrobeatConcert',
        eventDate: '',
        exchangeRate: '1500',
      })
    } catch (error: any) {
      console.error('Error creating event:', error)
      showMessage(`Error: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Create Your Naija Event</h2>
        <p className="text-gray-400">Fund your event with community support</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
            : 'bg-red-500/20 border border-red-500/30 text-red-400'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... rest of the form stays exactly the same ... */}
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-lg font-bold text-lg transition flex items-center justify-center space-x-2 ${
            loading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
          }`}
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Creating Event...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-6 h-6" />
              <span>Create Event on Blockchain</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
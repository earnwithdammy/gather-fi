import CreateEventForm from '@/components/CreateEventForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreatePage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link
        href="/"
        className="inline-flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Create Your Event</h1>
        <p className="text-gray-400">
          Launch your event in minutes. Backers will fund it, and you&apos;ll earn 35% of profits.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CreateEventForm />
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl border border-purple-500/30 p-6">
            <h3 className="font-bold text-lg mb-4">💰 How It Works</h3>
            <ol className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold">Create Your Event</p>
                  <p className="text-sm text-gray-400">Set ticket price, date, and details</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold">Get Funded</p>
                  <p className="text-sm text-gray-400">Backers purchase tickets upfront</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold">Host Event</p>
                  <p className="text-sm text-gray-400">Use funds to organize amazing event</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <p className="font-semibold">Earn Profits</p>
                  <p className="text-sm text-gray-400">Keep 35% of revenue, 60% to backers</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h3 className="font-bold text-lg mb-4">📊 Profit Distribution</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Backers (Ticket Holders)</span>
                  <span className="text-green-400 font-bold">60%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">You (Organizer)</span>
                  <span className="text-yellow-400 font-bold">35%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Platform Fee</span>
                  <span className="text-purple-400 font-bold">5%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h3 className="font-bold text-lg mb-4">🛡️ Protected by Blockchain</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                </div>
                <span>Fraud-proof NFT tickets</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                </div>
                <span>Transparent funding on Solana</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                </div>
                <span>Automatic profit distribution</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                </div>
                <span>No chargebacks or fraud</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
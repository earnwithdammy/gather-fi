import { Twitter, Github, MessageCircle, Heart } from 'lucide-react'
import Link from 'next/link'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-800 bg-gray-900/50 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">GF</span>
              </div>
              <h3 className="text-lg font-bold">GatherFi</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Empowering Nigerian event organizers with blockchain technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-purple-400 transition">
                  Discover Events
                </Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-purple-400 transition">
                  Create Event
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-purple-400 transition">
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link href="/tickets" className="hover:text-purple-400 transition">
                  My Tickets
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/docs" className="hover:text-purple-400 transition">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-purple-400 transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-purple-400 transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-purple-400 transition">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-purple-500/20 hover:text-purple-400 transition"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-purple-500/20 hover:text-purple-400 transition"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-lg hover:bg-purple-500/20 hover:text-purple-400 transition"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Have questions? Reach out to us at support@gatherfi.ng
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p>
              © {currentYear} GatherFi. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="hover:text-purple-400 transition">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-purple-400 transition">
                Terms of Service
              </Link>
              <div className="flex items-center space-x-1">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-current" />
                <span>in Nigeria</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
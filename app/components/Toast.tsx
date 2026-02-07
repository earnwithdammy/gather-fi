'use client'

import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose?: () => void
}

export default function Toast({ message, type, duration = 5000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }

  const colors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }

  const backgrounds = {
    success: 'bg-green-500/10 border-green-500/20',
    error: 'bg-red-500/10 border-red-500/20',
    warning: 'bg-yellow-500/10 border-yellow-500/20',
    info: 'bg-blue-500/10 border-blue-500/20'
  }

  const Icon = icons[type]

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slideIn">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border ${backgrounds[type]} backdrop-blur-sm`}>
        <Icon className={`w-5 h-5 ${colors[type]}`} />
        <p className="text-white">{message}</p>
      </div>
    </div>
  )
}
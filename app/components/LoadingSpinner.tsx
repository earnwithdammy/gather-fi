interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute top-0 left-0 w-full h-full border-2 border-gray-300 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-2 border-purple-500 rounded-full animate-spin border-t-transparent"></div>
      </div>
      {text && (
        <p className={`${textSizes[size]} text-gray-400`}>{text}</p>
      )}
    </div>
  )
}
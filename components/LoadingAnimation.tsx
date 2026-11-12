'use client'

import { useEffect, useState } from 'react'
import Logo from './Logo'

interface LoadingAnimationProps {
  onComplete?: () => void
  duration?: number
}

export default function LoadingAnimation({ onComplete, duration = 4000 }: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, duration / 50)

    // Stage transitions
    const stageTimers = [
      setTimeout(() => setStage(1), duration * 0.25),
      setTimeout(() => setStage(2), duration * 0.5),
      setTimeout(() => setStage(3), duration * 0.75),
    ]

    // Complete animation
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete()
    }, duration)

    return () => {
      clearInterval(progressInterval)
      stageTimers.forEach(timer => clearTimeout(timer))
      clearTimeout(completeTimer)
    }
  }, [duration, onComplete])

  const messages = [
    'Initializing HealthLens AI...',
    'Loading medical analysis engine...',
    'Preparing your dashboard...',
    'Almost ready...'
  ]

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4">
        {/* Logo */}
        <div className="animate-fade-in-up">
          <Logo size="lg" variant="light" />
        </div>

        {/* Loading message */}
        <div className="text-center space-y-2 animate-fade-in-up delay-300">
          <p className="text-xl font-semibold text-white">
            {messages[stage]}
          </p>
          <p className="text-sm text-cyan-300">
            Powered by Advanced AI
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-80 max-w-full animate-fade-in-up delay-500">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-cyan-300">
            <span>Loading...</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* DNA helix animation */}
        <div className="flex gap-2 animate-fade-in-up delay-700">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-12 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full animate-pulse"
              style={{ 
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.5s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom text */}
      <div className="absolute bottom-8 text-center text-sm text-white/60 animate-fade-in-up delay-1000">
        <p>Analyzing medical data with cutting-edge AI technology</p>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

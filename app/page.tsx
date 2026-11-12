'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import LandingPage from './landing/LandingPage'
import LoadingAnimation from '@/components/LoadingAnimation'

export default function Home() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setShowLoading(true)
    }
  }, [isLoaded, isSignedIn])

  const handleLoadingComplete = () => {
    router.push('/dashboard')
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060B18]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading HealthLens AI...</p>
        </div>
      </div>
    )
  }

  if (showLoading) {
    return <LoadingAnimation onComplete={handleLoadingComplete} duration={4000} />
  }

  return <LandingPage />
}

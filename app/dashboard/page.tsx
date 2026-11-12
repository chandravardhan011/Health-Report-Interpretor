'use client'

import { useState } from 'react'
import { Upload, FileText, TrendingUp, Shield, Moon, Sun, MessageSquarePlus } from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'
import { useTheme } from '@/components/ThemeProvider'
import UploadSection from '@/components/UploadSection'
import AnalysisResult from '@/components/AnalysisResult'
import MedicalHistory from '@/components/MedicalHistory'
import ReviewModal from '@/components/ReviewModal'
import Logo from '@/components/Logo'
import HealthInsights from '@/components/HealthInsights'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const { theme, toggleTheme } = useTheme()
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [refreshHistory, setRefreshHistory] = useState(0)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result)
    setRefreshHistory(prev => prev + 1)
  }

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Logo size="sm" />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowReviewModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-cyan-500/10 border border-blue-200 dark:border-cyan-500/30 rounded-lg hover:bg-blue-100 dark:hover:bg-cyan-500/20 transition-colors"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Write a Review
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Medical History */}
          <div className="lg:col-span-1 space-y-8">
            <MedicalHistory userId={user?.id} refresh={refreshHistory} />
            <HealthInsights userId={user?.id} refresh={refreshHistory} />
          </div>

          {/* Right: Upload & Analysis */}
          <div className="lg:col-span-2 space-y-8">
            <UploadSection onAnalysisComplete={handleAnalysisComplete} userId={user?.id} />
            
            {analysisResult && (
              <AnalysisResult result={analysisResult} />
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <footer className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 mt-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800">
            <strong>Medical Disclaimer:</strong> HealthLens AI is for educational purposes only. 
            This tool does not provide medical advice, diagnosis, or treatment. Always consult 
            qualified healthcare professionals for medical decisions.
          </p>
        </div>
      </footer>

      {/* Review Modal */}
      <ReviewModal 
        isOpen={showReviewModal} 
        onClose={() => setShowReviewModal(false)} 
      />
    </main>
  )
}

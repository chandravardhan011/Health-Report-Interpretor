'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  Star, X, Send, CheckCircle2, Stethoscope, User, 
  GraduationCap, Heart, BookOpen, Loader2 
} from 'lucide-react'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const roles = [
  { value: 'Doctor', label: 'Doctor / Physician', icon: <Stethoscope className="w-4 h-4" /> },
  { value: 'Patient', label: 'Patient', icon: <User className="w-4 h-4" /> },
  { value: 'Healthcare Professional', label: 'Healthcare Professional', icon: <Heart className="w-4 h-4" /> },
  { value: 'Caregiver', label: 'Caregiver', icon: <Heart className="w-4 h-4" /> },
  { value: 'Medical Student', label: 'Medical Student', icon: <GraduationCap className="w-4 h-4" /> },
]

export default function ReviewModal({ isOpen, onClose, onSuccess }: ReviewModalProps) {
  const { user } = useUser()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [role, setRole] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!rating) {
      setError('Please select a rating')
      return
    }
    if (!role) {
      setError('Please select your role')
      return
    }
    if (text.length < 20) {
      setError('Review must be at least 20 characters')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.fullName || user?.firstName || 'Anonymous User',
          role,
          specialty: role === 'Doctor' ? specialty : null,
          rating,
          title,
          text,
          userId: user?.id || null,
          userEmail: user?.primaryEmailAddress?.emailAddress || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        // Reload the page to show the new review
        window.location.reload()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-800 border-2 border-gray-600 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up my-8">
        {/* Header gradient line */}
        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />

        {/* Success state */}
        {success ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Thank You! 🎉</h3>
            <p className="text-gray-400">Your review has been submitted successfully.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">Write a Review</h2>
                <p className="text-sm text-gray-300 mt-1">Share your experience with HealthLens AI</p>
              </div>
              <button 
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Your Rating <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1.5 transition-transform hover:scale-125"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors ${
                          star <= (hoverRating || rating) 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-gray-500'
                        }`} 
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-3 text-sm font-medium text-gray-300">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  I am a <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        role === r.value
                          ? 'bg-cyan-500/30 border-2 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                          : 'bg-gray-700 border-2 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500 hover:text-white'
                      }`}
                    >
                      {r.icon}
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specialty (for doctors) */}
              {role === 'Doctor' && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Specialty
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Cardiology, Radiology"
                    className="w-full px-4 py-2.5 bg-gray-700 border-2 border-gray-600 rounded-xl text-white text-sm placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all"
                  />
                </div>
              )}

              {/* Review Title */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Review Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  maxLength={80}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white text-sm placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Your Review <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Tell us about your experience using HealthLens AI..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white text-sm placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-all resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right font-medium">{text.length}/500</p>
              </div>

              {/* Verified badge notice */}
              {user && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <p className="text-xs text-emerald-300">
                    Your review will be marked as <span className="font-semibold">Verified User</span> since you&apos;re signed in
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

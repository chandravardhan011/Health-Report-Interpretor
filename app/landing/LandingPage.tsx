'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  FileText, Brain, Shield, Zap, Upload, BarChart3, 
  Lock, Clock, CheckCircle2, ArrowRight, ChevronRight,
  Sparkles, Activity, HeartPulse, Microscope, Scan,
  Star, Users, TrendingUp, Menu, X, Heart, Globe, 
  Fingerprint, LineChart, Eye, Github, Linkedin, Mail, Twitter
} from 'lucide-react'
import ReviewsSection from '@/components/ReviewsSection'
import Logo from '@/components/Logo'
import LoadingAnimation from '@/components/LoadingAnimation'

/* ============================================
   LANDING PAGE — HealthLens AI
   Premium Redesign with Advanced Animations
   ============================================ */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ANIMATED COUNTER COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2000 }: {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          let start = 0
          const increment = target / (duration / 16)
          const timer = setInterval(() => {
            start += increment
            if (start >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <div ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPING ANIMATION COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function TypingText({ words, className = '' }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [blink, setBlink] = useState(true)

  useEffect(() => {
    const blinkTimer = setInterval(() => setBlink(prev => !prev), 530)
    return () => clearInterval(blinkTimer)
  }, [])

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !isDeleting) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000)
      return () => clearTimeout(timeout)
    }
    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false)
      setIndex((prev) => (prev + 1) % words.length)
      return
    }
    const timeout = setTimeout(
      () => setSubIndex((prev) => prev + (isDeleting ? -1 : 1)),
      isDeleting ? 40 : 80
    )
    return () => clearTimeout(timeout)
  }, [subIndex, index, isDeleting, words])

  return (
    <span className={className}>
      {words[index].substring(0, subIndex)}
      <span className={`inline-block w-[3px] h-[0.85em] ml-1 align-middle rounded-sm ${blink ? 'bg-cyan-400' : 'bg-transparent'} transition-colors duration-100`} />
    </span>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PARTICLE CANVAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particles: Array<{
      x: number; y: number; vx: number; vy: number; 
      size: number; opacity: number; color: string
    }> = []

    const colors = [
      'rgba(6,182,212,', // cyan
      'rgba(59,130,246,', // blue
      'rgba(139,92,246,', // purple
      'rgba(16,185,129,', // emerald
    ]

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    function initParticles() {
      particles = []
      const count = Math.min(60, Math.floor((canvas!.offsetWidth * canvas!.offsetHeight) / 15000))
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas!.offsetWidth,
          y: Math.random() * canvas!.offsetHeight,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }

    function animate() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas!.offsetWidth) p.vx *= -1
        if (p.y < 0 || p.y > canvas!.offsetHeight) p.vy *= -1

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `${p.color}${p.opacity})`
        ctx!.fill()

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x
          const dy = p.y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx!.beginPath()
            ctx!.moveTo(p.x, p.y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.strokeStyle = `${p.color}${(1 - dist / 150) * 0.12})`
            ctx!.lineWidth = 0.5
            ctx!.stroke()
          }
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    resize()
    initParticles()
    animate()

    window.addEventListener('resize', () => {
      resize()
      initParticles()
    })

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      style={{ opacity: 0.6 }}
    />
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN LANDING PAGE COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [showLoading, setShowLoading] = useState(false) // Temporarily disabled

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedLanding')
    if (!hasVisited) {
      setShowLoading(false) // Disabled for debugging
      sessionStorage.setItem('hasVisitedLanding', 'true')
    } else {
      setShowLoading(false)
    }
  }, [])

  const handleLoadingComplete = () => setShowLoading(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Intersection observer for scroll reveals
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => {
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  // Auto-cycle feature showcase
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  if (showLoading) {
    return <LoadingAnimation onComplete={handleLoadingComplete} duration={4000} />
  }

  // ─── DATA ───────────────────────────────────
  const features = [
    {
      icon: <Upload className="w-7 h-7" />,
      title: 'Smart Report Upload',
      description: 'Upload medical reports in any format — PDF, images, or scanned documents. Our AI instantly processes and extracts critical data.',
      gradient: 'from-cyan-500 to-blue-500',
      glow: 'shadow-cyan-500/20',
    },
    {
      icon: <Brain className="w-7 h-7" />,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms analyze your reports, identifying key biomarkers, abnormal values, and health patterns.',
      gradient: 'from-blue-500 to-purple-500',
      glow: 'shadow-blue-500/20',
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: 'Visual Health Insights',
      description: 'Beautiful, interactive charts and graphs that make complex medical data easy to understand at a glance.',
      gradient: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/20',
    },
    {
      icon: <HeartPulse className="w-7 h-7" />,
      title: 'Health Tracking',
      description: 'Track your health metrics over time. See trends, get alerts for concerning changes, and share with your doctor.',
      gradient: 'from-pink-500 to-rose-500',
      glow: 'shadow-pink-500/20',
    },
    {
      icon: <Lock className="w-7 h-7" />,
      title: 'Bank-Level Security',
      description: 'Your medical data is encrypted end-to-end. We follow HIPAA guidelines to ensure your information stays private.',
      gradient: 'from-emerald-500 to-cyan-500',
      glow: 'shadow-emerald-500/20',
    },
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: 'AI Health Chat',
      description: 'Chat with our AI assistant about your results. Get plain-language explanations of medical jargon and next-step recommendations.',
      gradient: 'from-amber-500 to-orange-500',
      glow: 'shadow-amber-500/20',
    },
  ]

  const motivation = {
    title: "Why We Built HealthLens AI",
    subtitle: "Our Mission & Purpose",
    story: [
      {
        icon: <HeartPulse className="w-6 h-6" />,
        title: "The Problem We Saw",
        description: "Medical reports are confusing. Patients receive complex lab results filled with medical jargon, leaving them anxious and uncertain about their health. Many people can't afford frequent doctor visits just to understand their reports.",
        gradient: 'from-rose-500 to-pink-600',
      },
      {
        icon: <Brain className="w-6 h-6" />,
        title: "Our Solution",
        description: "We created HealthLens AI to democratize healthcare understanding. Using advanced AI, we translate complex medical data into clear, actionable insights that anyone can understand — instantly and for free.",
        gradient: 'from-cyan-500 to-blue-600',
      },
      {
        icon: <Users className="w-6 h-6" />,
        title: "Who It's For",
        description: "Patients managing chronic conditions, caregivers tracking family health, students learning about health, and anyone who wants to understand their medical reports without waiting for a doctor's appointment.",
        gradient: 'from-purple-500 to-indigo-600',
      },
      {
        icon: <TrendingUp className="w-6 h-6" />,
        title: "What Makes Us Different",
        description: "We don't just read your reports — we remember them. Our AI analyzes patterns across multiple reports, predicts health risks, and provides personalized recommendations. It's like having a medical assistant that knows your complete health history.",
        gradient: 'from-emerald-500 to-teal-600',
      }
    ]
  }

  const impact = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Empowering Patients',
      description: 'Take control of your health'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Saving Time',
      description: 'Instant analysis, no waiting'
    },
    {
      icon: <Activity className="w-5 h-5" />,
      title: 'Early Detection',
      description: 'Predict risks before problems'
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: 'Peace of Mind',
      description: 'Understand your health status'
    },
  ]

  const stats = [
    { value: 10000, suffix: '+', label: 'Reports Analyzed', icon: <FileText className="w-5 h-5" /> },
    { value: 5000, suffix: '+', label: 'Active Users', icon: <Users className="w-5 h-5" /> },
    { value: 98, suffix: '%', label: 'Accuracy Rate', icon: <Activity className="w-5 h-5" /> },
    { value: 3, suffix: 's', label: 'Avg. Analysis Time', icon: <Zap className="w-5 h-5" /> },
  ]

  const howItWorks = [
    { step: '01', title: 'Upload Your Report', desc: 'Simply drag & drop or click to upload your medical report in PDF or image format.', icon: <Upload className="w-8 h-8" />, color: 'from-cyan-500 to-blue-500' },
    { step: '02', title: 'AI Analyzes It', desc: 'Our advanced AI reads, extracts, and processes every data point from your report.', icon: <Scan className="w-8 h-8" />, color: 'from-blue-500 to-purple-500' },
    { step: '03', title: 'Get Clear Insights', desc: 'Receive easy-to-understand visualizations, risk alerts, and actionable health advice.', icon: <Activity className="w-8 h-8" />, color: 'from-purple-500 to-pink-500' },
  ]

  // ─── RENDER ─────────────────────────────────
  return (
    <div className="min-h-screen bg-[#060B18] text-white overflow-x-hidden">

      {/* ==================== NAVBAR ==================== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-nav shadow-2xl' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="animate-fade-in-down">
              <Logo size="sm" variant="light" />
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8 animate-fade-in-down delay-200">
              {['Features', 'How It Works', 'Reviews'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`} 
                  className="relative text-sm text-gray-300 hover:text-cyan-400 transition-colors font-medium group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4 animate-fade-in-down delay-300">
              <a href="/sign-in" className="text-sm text-gray-300 hover:text-white transition-colors font-medium">
                Sign In
              </a>
              <a
                href="/sign-up"
                className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-full shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-[0.98] transition-all duration-300"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
              </a>
            </div>

            <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-white/10 animate-fade-in-down">
            <div className="px-4 py-6 space-y-4">
              {['Features', 'How It Works', 'Reviews'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMobileMenuOpen(false)} className="block text-gray-300 hover:text-cyan-400 font-medium">
                  {item}
                </a>
              ))}
              <a href="/sign-in" className="block w-full text-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full">
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Particle Background */}
        <div className="absolute inset-0">
          <ParticleField />
          
          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-1/6 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[150px] animate-float" />
          <div className="absolute bottom-1/4 right-1/6 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-purple-500/6 rounded-full blur-[100px] animate-float" style={{ animationDelay: '4s' }} />
          
          {/* Grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(6,182,212,0.04) 1px, transparent 0)`,
            backgroundSize: '48px 48px',
          }} />

          {/* Animated DNA helix lines */}
          <div className="absolute left-10 top-1/3 opacity-15 animate-helix">
            <svg width="60" height="200" viewBox="0 0 60 200">
              <path d="M10,0 Q30,50 50,50 Q30,50 10,100 Q30,150 50,150 Q30,150 10,200" fill="none" stroke="url(#helixGrad)" strokeWidth="2" />
              <path d="M50,0 Q30,50 10,50 Q30,50 50,100 Q30,150 10,150 Q30,150 50,200" fill="none" stroke="url(#helixGrad)" strokeWidth="2" />
              <defs>
                <linearGradient id="helixGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="absolute right-20 top-1/2 opacity-10 animate-helix" style={{ animationDelay: '3s' }}>
            <svg width="40" height="150" viewBox="0 0 40 150">
              <path d="M5,0 Q20,37 35,37 Q20,37 5,75 Q20,112 35,112 Q20,112 5,150" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
              <path d="M35,0 Q20,37 5,37 Q20,37 35,75 Q20,112 5,112 Q20,112 35,150" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="animate-fade-in-up mb-8">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-sm text-cyan-300 font-medium border border-cyan-500/20 hover:border-cyan-400/40 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              AI-Powered Medical Report Analysis
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>

          {/* Main heading */}
          <h1 className="animate-fade-in-up delay-200 text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold leading-[1.05] tracking-tight mb-8">
            <span className="text-white">Understand Your</span>
            <br />
            <TypingText 
              words={['Health', 'Disease', 'Reports', 'Body']} 
              className="gradient-text"
            />
            <br className="hidden sm:block" />
            <span className="text-white"> Through </span>
            <span className="gradient-text-warm">AI</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up delay-400 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Upload your medical reports and let our AI instantly decode complex results into {' '}
            <span className="text-cyan-300 font-medium">clear, actionable health insights</span> you can actually understand.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up delay-600 flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <a
              href="/sign-in"
              className="group relative inline-flex items-center gap-3 px-10 py-4.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              <Zap className="w-5 h-5" />
              Analyze Your Report Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-15 blur-2xl transition-opacity" />
            </a>
            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-2 px-10 py-4.5 glass text-white text-lg font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
            >
              See How It Works
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Our Impact */}
          <div className="animate-fade-in-up delay-800 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {impact.map((item, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl px-4 py-5 text-center cursor-default hover:scale-105 transition-transform"
              >
                <div className="flex items-center justify-center gap-2 mb-2 text-cyan-400">
                  {item.icon}
                </div>
                <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                <div className="text-xs text-gray-400">{item.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
          <div className="w-6 h-10 border-2 border-cyan-400/40 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-cyan-400 rounded-full mt-2 animate-[fadeInUp_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* ==================== REAL BENEFITS SECTION ==================== */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B18] via-[#0A1628] to-[#060B18]" />
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Real Benefits
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
              How <span className="gradient-text">HealthLens AI</span> Helps You
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Beyond just reading reports — we empower you to take meaningful action for your health.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Card 1: Empowering Patients */}
            <div className="reveal glass-card rounded-2xl p-8 text-center group hover:border-cyan-500/30 transition-all duration-500" style={{ transitionDelay: '0ms' }}>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-all duration-500">
                <Shield className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">Empowering Patients</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Take control of your health with clear, understandable insights</p>
            </div>

            {/* Card 2: Saving Time */}
            <div className="reveal glass-card rounded-2xl p-8 text-center group hover:border-blue-500/30 transition-all duration-500" style={{ transitionDelay: '100ms' }}>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-500">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">Saving Time</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Get instant analysis instead of waiting days for doctor appointments</p>
            </div>

            {/* Card 3: Early Detection */}
            <div className="reveal glass-card rounded-2xl p-8 text-center group hover:border-emerald-500/30 transition-all duration-500" style={{ transitionDelay: '200ms' }}>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all duration-500">
                <Activity className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">Early Detection</h3>
              <p className="text-gray-400 text-sm leading-relaxed">AI predicts health risks before they become serious problems</p>
            </div>

            {/* Card 4: Peace of Mind */}
            <div className="reveal glass-card rounded-2xl p-8 text-center group hover:border-rose-500/30 transition-all duration-500" style={{ transitionDelay: '300ms' }}>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-rose-500/30 group-hover:to-pink-500/30 transition-all duration-500">
                <Heart className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-rose-300 transition-colors">Peace of Mind</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Understand your health status and know when to seek medical help</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== OUR STORY SECTION ==================== */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060B18] via-slate-900/50 to-[#060B18]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[150px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-20 reveal">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-6">
              <HeartPulse className="w-4 h-4" />
              {motivation.subtitle}
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
              {motivation.title}
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              HealthLens AI was born from a simple belief: everyone deserves to understand their health, 
              regardless of medical knowledge or financial resources.
            </p>
          </div>

          {/* Story cards */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {motivation.story.map((item, i) => (
              <div
                key={i}
                className="reveal story-card glass-card rounded-2xl p-8 lg:p-10 group"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to action */}
          <div className="text-center mt-16 reveal">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <a
                href="/sign-up"
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-full shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-[0.98] transition-all duration-300"
              >
                Start Your Health Journey
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                Learn How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section id="features" className="relative py-24 lg:py-36">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-cyan-500/4 rounded-full blur-[180px]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 reveal">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-cyan-300 font-medium border border-cyan-500/20 mb-6">
              <Sparkles className="w-4 h-4" /> Features
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
              <span className="text-white">Powerful Features for </span>
              <span className="gradient-text">Better Health Understanding</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
              Everything you need to take control of your health
            </p>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="reveal feature-card glass-card rounded-2xl p-8 group"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-xl ${feature.glow} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="how-it-works" className="relative py-24 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-950/8 to-transparent" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 reveal">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-cyan-300 font-medium border border-cyan-500/20 mb-6">
              <Zap className="w-4 h-4" /> How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
              <span className="text-white">How It </span>
              <span className="gradient-text">Works</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              From upload to insight in under 3 seconds. It&apos;s that simple.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {howItWorks.map((item, i) => (
              <div
                key={i}
                className="reveal text-center group"
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <div className="relative mb-10">
                  <div className={`w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br ${item.color}/20 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-400/40 transition-all duration-500 relative overflow-hidden`}>
                    <div className="text-cyan-400 relative z-10">{item.icon}</div>
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-xl shadow-cyan-500/30">
                    {item.step}
                  </span>
                  {/* Connector line */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-[calc(50%+56px)] w-[calc(100%-112px)] h-[2px]">
                      <div className="w-full h-full bg-gradient-to-r from-cyan-500/30 via-cyan-500/10 to-transparent" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-cyan-500/30" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURE SHOWCASE (Animated) ==================== */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-purple-500/4 rounded-full blur-[150px] -translate-y-1/2" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="reveal-left">
              <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass text-sm text-cyan-300 font-medium border border-cyan-500/20 mb-6">
                <Brain className="w-4 h-4" /> Intelligent Analysis
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
                <span className="text-white">Your Reports,</span>
                <br />
                <span className="gradient-text">Decoded by AI</span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                Our AI doesn&apos;t just read numbers — it understands context. It compares your results against medical databases, identifies risk factors, and provides personalized health recommendations.
              </p>

              {/* Feature tabs */}
              <div className="space-y-3">
                {['Instant Blood Work Analysis', 'Abnormal Value Detection', 'Health Risk Scoring', 'Personalized Recommendations'].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl cursor-pointer transition-all duration-400 ${
                      activeFeature === i
                        ? 'bg-gradient-to-r from-cyan-500/15 to-blue-600/10 border border-cyan-500/30 shadow-lg shadow-cyan-500/5'
                        : 'glass-card border-transparent hover:bg-white/5'
                    }`}
                    onClick={() => setActiveFeature(i)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      activeFeature === i ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-white/5 text-gray-500'
                    }`}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className={`font-medium transition-colors ${
                      activeFeature === i ? 'text-white' : 'text-gray-400'
                    }`}>{item}</span>
                    {activeFeature === i && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Animated visual */}
            <div className="reveal-right">
              <div className="relative">
                {/* Main card */}
                <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-cyan-500/15 to-transparent rounded-bl-[120px]" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">Blood Test Report</div>
                        <div className="text-xs text-gray-500">Analyzed just now</div>
                      </div>
                      <div className="ml-auto px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                        Complete
                      </div>
                    </div>

                    {/* Animated bars */}
                    {[
                      { label: 'Hemoglobin', value: '14.2 g/dL', pct: 85, status: 'normal', color: 'bg-emerald-500' },
                      { label: 'Blood Sugar', value: '142 mg/dL', pct: 72, status: 'elevated', color: 'bg-amber-500' },
                      { label: 'Cholesterol', value: '180 mg/dL', pct: 60, status: 'normal', color: 'bg-emerald-500' },
                      { label: 'Vitamin D', value: '18 ng/mL', pct: 30, status: 'low', color: 'bg-red-500' },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{item.value}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                              item.status === 'normal' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                              item.status === 'elevated' ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
                              'bg-red-500/15 text-red-400 border-red-500/20'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                            style={{
                              width: `${item.pct}%`,
                              animation: `slideInLeft 1s ease-out ${i * 0.2 + 0.5}s forwards`,
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    {/* AI Insight card */}
                    <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-600/5 border border-cyan-500/20">
                      <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-semibold text-cyan-300 mb-1">AI Insight</div>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            Your Vitamin D levels are below optimal range. Consider supplementation and increased sun exposure. Blood sugar is slightly elevated — recommend follow-up fasting glucose test.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating decoration cards */}
                <div className="absolute -top-6 -right-6 w-24 h-16 glass-card rounded-xl flex items-center justify-center animate-float shadow-xl" style={{ animationDelay: '1s' }}>
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 glass-card rounded-xl flex flex-col items-center justify-center animate-float shadow-xl" style={{ animationDelay: '2.5s' }}>
                  <Shield className="w-5 h-5 text-cyan-400 mb-1" />
                  <span className="text-[10px] text-gray-400">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== REVIEWS SECTION ==================== */}
      <ReviewsSection />

      {/* ==================== CTA SECTION ==================== */}
      <section className="relative py-24 lg:py-36">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <div className="cta-card glass-card rounded-3xl p-12 lg:p-20 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-600/5" />
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] animate-float" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: '3s' }} />

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6">
                <span className="text-white">Ready to Understand</span>
                <br />
                <span className="gradient-text">Your Health?</span>
              </h2>
              <p className="text-gray-400 text-lg mb-12 max-w-lg mx-auto leading-relaxed">
                Join thousands of users who trust HealthLens AI to understand their medical reports.
              </p>
              <a
                href="/sign-in"
                className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
              >
                <Zap className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Microscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-white font-bold">Health</span>
                  <span className="text-cyan-400 font-bold">Lens</span>
                  <span className="text-emerald-400 font-extrabold ml-1">AI</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                AI-powered medical report analysis. Understand your disease through your reports.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><a href="#features" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">How It Works</a></li>
                <li><a href="#reviews" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">Reviews</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">HIPAA Compliance</a></li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="glass rounded-xl p-4 mb-8 flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="text-amber-400 font-semibold">Medical Disclaimer:</span> HealthLens AI is for educational and informational purposes only. This tool does not provide medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.
            </p>
          </div>

          {/* Social Media & Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-white/5">
            <div className="text-sm text-gray-600">
              © 2026 HealthLens AI. All rights reserved. Built with ❤️ for better health understanding.
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/akashsahu54" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-10 h-10 rounded-full glass border border-white/10 hover:border-cyan-400/40 hover:bg-cyan-500/10 transition-all duration-300"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
              </a>
              <a 
                href="https://www.linkedin.com/in/akashsahu001" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-10 h-10 rounded-full glass border border-white/10 hover:border-blue-400/40 hover:bg-blue-500/10 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </a>
              <a 
                href="https://twitter.com/akashsahu64158" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-10 h-10 rounded-full glass border border-white/10 hover:border-sky-400/40 hover:bg-sky-500/10 transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5 text-gray-400 group-hover:text-sky-400 transition-colors" />
              </a>
              <a 
                href="mailto:akashsahu64158@gmail.com" 
                className="group flex items-center justify-center w-10 h-10 rounded-full glass border border-white/10 hover:border-emerald-400/40 hover:bg-emerald-500/10 transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

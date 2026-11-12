import { Microscope } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
  variant?: 'light' | 'dark' | 'auto'
}

export default function Logo({ size = 'md', showIcon = true, className = '', variant = 'auto' }: LogoProps) {
  const sizes = {
    sm: {
      icon: 'w-8 h-8',
      iconInner: 'w-5 h-5',
      text: 'text-xl',
      container: 'gap-2'
    },
    md: {
      icon: 'w-12 h-12',
      iconInner: 'w-7 h-7',
      text: 'text-3xl',
      container: 'gap-3'
    },
    lg: {
      icon: 'w-16 h-16',
      iconInner: 'w-10 h-10',
      text: 'text-4xl',
      container: 'gap-4'
    }
  }

  const s = sizes[size]

  return (
    <div className={`flex items-center ${s.container} ${className}`}>
      {showIcon && (
        <div className={`${s.icon} bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg`}>
          <Microscope className={`${s.iconInner} text-white`} />
        </div>
      )}
      <div className={`${s.text} font-bold`}>
        <span className="text-yellow-400">Health</span>
        <span className="text-cyan-400">Lens</span>
        <span className="text-pink-400"> AI</span>
      </div>
    </div>
  )
}

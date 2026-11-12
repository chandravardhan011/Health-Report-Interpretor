'use client'

import { SignIn } from '@clerk/nextjs'
import Logo from '@/components/Logo'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-800 via-slate-700 to-pink-400">
      <div className="w-full max-w-6xl mx-auto my-auto flex rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Left Side - Medical Visual */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 to-blue-600 items-center justify-center p-12 relative">
          <div className="absolute top-8 left-8">
            <Logo size="sm" variant="light" />
          </div>
          
          {/* Medical Professional Illustration Placeholder */}
          <div className="relative">
            <div className="w-80 h-80 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full flex items-center justify-center">
              <div className="text-center text-white">
                <Logo size="lg" showIcon={false} className="justify-center mb-4" />
                <p className="text-lg font-semibold">Your Medical History</p>
                <p className="text-sm opacity-90">Powered by AI</p>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-8 left-8 right-8 text-center text-white text-sm opacity-75">
            Copyright © 2024, HealthLens AI. All rights reserved.
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-white shadow-none",
                  headerTitle: "text-2xl font-bold text-gray-800",
                  headerSubtitle: "text-gray-600",
                  socialButtonsBlockButton: "bg-white border-2 border-gray-200 hover:border-blue-500 text-gray-700",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3",
                  footerActionLink: "text-blue-600 hover:text-blue-700",
                  formFieldInput: "border-2 border-gray-200 focus:border-blue-500 rounded-lg",
                  dividerLine: "bg-gray-300",
                  dividerText: "text-gray-500",
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  ArrowLeft, 
  FileQuestion,
  Search,
  Code,
  FileText,
  Brain,
  Sparkles
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const popularPages = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/signin', label: 'Sign In', icon: FileText },
    { href: '/about', label: 'About', icon: Brain },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo and 404 Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className={`transition-all duration-1000 ${mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
              <img 
                src="/img/logo-sdlc-icon.png" 
                alt="SDLC.dev" 
                className="h-20 w-20 mx-auto mb-4 animate-pulse"
              />
            </div>
            <div className="absolute -bottom-2 -right-2">
              <FileQuestion className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          {/* 404 Text with Gradient */}
          <h1 className="text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 max-w-md mx-auto">
            Oops! It seems like the page you're looking for has wandered off into the digital void. 
            Let's get you back on track.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for pages..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  window.location.href = `/dashboard?search=${encodeURIComponent(e.currentTarget.value)}`
                }
              }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Press Enter to search in dashboard
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button 
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white group"
            asChild
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go to Homepage
              <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            className="group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Button>
        </div>

        {/* Popular Pages */}
        <div className="border-t pt-8">
          <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">
            Popular Pages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {popularPages.map((page) => {
              const Icon = page.icon
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="p-2 bg-white rounded-lg group-hover:bg-indigo-50 transition-colors">
                    <Icon className="h-5 w-5 text-gray-600 group-hover:text-indigo-600" />
                  </div>
                  <span className="font-medium text-gray-900">{page.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Fun Message */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <p>
              Don't worry, even the best developers get lost sometimes!
            </p>
            <Code className="h-4 w-4 text-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
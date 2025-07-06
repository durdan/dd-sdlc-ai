"use client"

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to SDLC Automation</h1>
        <p className="text-lg text-gray-600">
          A powerful tool for generating comprehensive SDLC documentation
        </p>
        <div className="flex gap-4">
          <Button onClick={() => router.push('/signin')}>Sign In</Button>
          <Button variant="outline" onClick={() => router.push('/learn-more')}>
            Learn More
          </Button>
        </div>
      </div>
    </div>
  )
}

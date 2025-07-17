'use client'

import { GoogleSignInDebug } from '@/components/auth/GoogleSignInDebug'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthTestPage() {
  const { user, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (user) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>✅ Authentication Successful</CardTitle>
            <CardDescription>
              You are successfully signed in!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>User ID:</strong> {user.id}
            </div>
            <div>
              <strong>Provider:</strong> {user.app_metadata.provider}
            </div>
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Sign-In Test Page</CardTitle>
          <CardDescription>
            This page helps test and debug Google authentication issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowAuthModal(true)}>
            Open Auth Modal
          </Button>
        </CardContent>
      </Card>

      <GoogleSignInDebug />

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
      />
    </div>
  )
}
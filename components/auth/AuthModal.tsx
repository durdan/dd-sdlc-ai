'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type AuthMode = 'signin' | 'signup'

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { handleGoogleSignIn, signInWithEmail, signUpWithEmail } = useAuth()

  const handleGoogleSignInWrapper = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('Google sign-in initiated')
      await handleGoogleSignIn()
      onOpenChange(false)
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google')
      console.error('Google sign-in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    console.log(`Starting ${mode} process for:`, email)

    try {
      if (mode === 'signin') {
        console.log('Calling signInWithEmail...')
        await signInWithEmail(email, password)
        console.log('Sign in successful, closing modal')
        onOpenChange(false)
      } else {
        console.log('Calling signUpWithEmail...')
        await signUpWithEmail(email, password, fullName)
        console.log('Sign up successful, closing modal')
        onOpenChange(false)
      }
    } catch (error: any) {
      console.error(`${mode} error:`, error)
      
      // Handle specific error cases
      let errorMessage = error.message || 'An error occurred'
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.'
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.'
      } else if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.'
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'Password must be at least 6 characters long.'
      } else if (error.message?.includes('confirmation link')) {
        errorMessage = error.message // Use the custom message from signUpWithEmail
      }
      
      setError(errorMessage)
    } finally {
      console.log(`${mode} process completed, setting loading to false`)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border border-gray-800 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === 'signin' ? 'Sign In' : 'Create an Account'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {mode === 'signin' 
              ? 'Enter your credentials to access your account.'
              : 'Create a new account to get started.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button 
            type="button"
            variant="outline"
            onClick={handleGoogleSignInWrapper}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700"
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.google className="mr-2 h-4 w-4" />
            )}
            Continue with Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-900 px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                  required={mode === 'signup'}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                {mode === 'signin' && (
                  <a
                    href="#"
                    className="text-sm font-medium text-blue-400 underline-offset-4 hover:underline"
                    onClick={(e) => {
                      e.preventDefault()
                      // TODO: Implement password reset
                    }}
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-900/30 p-3 text-sm text-red-300 border border-red-800">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700" disabled={isLoading}>
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </div>

        <DialogFooter className="flex flex-col space-y-2">
          <p className="text-center text-sm text-gray-400">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              className="font-medium text-blue-400 hover:underline"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              disabled={isLoading}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

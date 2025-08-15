"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  handleGoogleSignIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Check environment variables on initialization
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('🚨 SUPABASE CONFIGURATION MISSING!');
      console.error('Missing environment variables:');
      console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
      console.error('Please create a .env.local file with your Supabase credentials.');
    } else {
      console.log('✅ Supabase configuration loaded successfully');
    }
  }, []);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      console.log('🔍 Starting Google sign-in...');
      console.log('📱 User Agent:', navigator.userAgent);
      console.log('🌐 Current Origin:', window.location.origin);
      
      // Detect mobile device - improved detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      console.log('📱 Device Detection:', { isMobile, isIOS, isAndroid, isTouchDevice });
      
      // Create redirect URL - ensure it works on all environments
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/auth/callback`;
      console.log('🔄 Redirect URL:', redirectUrl);
      
      // Try different approaches based on device
      console.log('🚀 Attempting OAuth sign-in...');
      
      // For mobile, try with skipBrowserRedirect true and manual redirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: redirectUrl,
          // Try skipping browser redirect on mobile to handle manually
          skipBrowserRedirect: isMobile || isTouchDevice,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          }
        },
      });
      
      if (error) {
        console.error('❌ Google OAuth error:', error);
        alert(`OAuth Error: ${error.message}`); // Show alert on mobile for debugging
        throw error;
      }
      
      console.log('✅ Google OAuth response:', data);
      
      // Check if we got a URL back
      if (data?.url) {
        console.log('📍 OAuth URL received:', data.url);
        
        // For mobile/touch devices, handle redirect manually
        if (isMobile || isTouchDevice) {
          console.log('📱 Mobile/Touch detected - manual redirect');
          
          // Try immediate redirect without setTimeout for mobile
          try {
            // Method 1: Use location.assign which is more compatible
            window.location.assign(data.url);
          } catch (e1) {
            console.error('Method 1 failed:', e1);
            try {
              // Method 2: Direct href assignment
              window.location.href = data.url;
            } catch (e2) {
              console.error('Method 2 failed:', e2);
              try {
                // Method 3: window.open as fallback
                window.open(data.url, '_self');
              } catch (e3) {
                console.error('Method 3 failed:', e3);
                // Last resort: create a link and click it
                const link = document.createElement('a');
                link.href = data.url;
                link.target = '_self';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }
          }
        } else {
          console.log('💻 Desktop detected - standard flow');
          // Desktop should handle it automatically since skipBrowserRedirect is false
          // But ensure redirect happens
          if (!window.location.href.includes('accounts.google.com')) {
            window.location.href = data.url;
          }
        }
      } else {
        console.warn('⚠️ No URL returned from OAuth initiation');
        console.log('Full data object:', JSON.stringify(data, null, 2));
      }
      
    } catch (error) {
      console.error('💥 Google sign-in failed:', error);
      // Add more detailed error logging
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        // Show alert on mobile for debugging
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          alert(`Sign-in Error: ${error.message}`);
        }
      }
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    console.log('Starting email signin for:', email);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      console.log('Signin response:', { data, error });
      
      if (error) {
        console.error('Signin error:', error);
        throw error;
      }
      
      console.log('Signin successful for:', email);
      return data;
    } catch (error) {
      console.error('SignIn error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    console.log('Starting email signup for:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      
      console.log('Signup response:', { data, error });
      
      if (error) {
        console.error('Signup error:', error);
        throw error;
      }
      
      // Check if email confirmation is required
      if (data.user && !data.session) {
        console.log('Email confirmation required for:', email);
        throw new Error('Please check your email and click the confirmation link to complete your account setup.');
      }
      
      console.log('Signup successful for:', email);
      return data;
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, handleGoogleSignIn, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
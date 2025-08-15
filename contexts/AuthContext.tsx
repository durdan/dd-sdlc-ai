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
      
      console.log('📱 Device Detection:', { isMobile, isIOS, isAndroid });
      
      // Create redirect URL - ensure it works on all environments
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/auth/callback`;
      console.log('🔄 Redirect URL:', redirectUrl);
      
      // Different approach for mobile vs desktop
      if (isMobile) {
        // For mobile, use redirect approach
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { 
            redirectTo: redirectUrl,
            queryParams: {
              prompt: 'select_account',
              access_type: 'offline'
            }
          },
        });
        
        if (error) {
          console.error('❌ Google OAuth error:', error);
          throw error;
        }
        
        console.log('✅ Google OAuth initiated for mobile:', data);
        
        // For mobile, manually handle the redirect if URL is provided
        if (data?.url) {
          console.log('📱 Redirecting mobile to:', data.url);
          // Use location.replace for better mobile compatibility
          window.location.replace(data.url);
        }
      } else {
        // For desktop, use standard approach
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { 
            redirectTo: redirectUrl,
            queryParams: {
              prompt: 'select_account',
              access_type: 'offline'
            }
          },
        });
        
        if (error) {
          console.error('❌ Google OAuth error:', error);
          throw error;
        }
        
        console.log('✅ Google OAuth initiated for desktop:', data);
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
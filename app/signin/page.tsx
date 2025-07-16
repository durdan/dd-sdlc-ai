"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { Cpu, Badge } from "lucide-react"; // Add your logo/icon and badge if needed

export default function SignInPage() {
  const [open, setOpen] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && !user) {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="w-full border-b border-gray-800 bg-black/95">
        <div className="max-w-7xl mx-auto px-4 flex h-14 items-center space-x-3">
          <div className="relative">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Cpu className="h-4 w-4 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            SDLC.dev
          </span>
          <span className="ml-2 bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs px-2 py-1 rounded">
            AI Agent
          </span>
        </div>
      </header>
      {/* Centered Auth Modal */}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md p-8 rounded-xl bg-gray-900 border border-gray-800 shadow-lg">
          <AuthModal open={open} onOpenChange={handleOpenChange} />
        </div>
      </main>
    </div>
  );
}
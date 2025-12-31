'use client';

import { WizardProvider } from '@/lib/idea-to-spec/wizard-context';
import { WizardContainer } from '@/components/idea-to-spec/wizard-container';

// Animated Background Component (reused from simple-landing-page)
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Animated mesh gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-orange-600/40 to-transparent rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-bl from-amber-600/40 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-tr from-yellow-600/30 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: '-2s' }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
}

export default function IdeaToSpecPage() {
  return (
    <WizardProvider>
      <div className="min-h-screen text-white font-sans">
        <AnimatedBackground />

        {/* Header */}
        <header className="sticky top-0 z-50">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl border-b border-white/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <a href="/" className="flex items-center gap-2">
                <img src="/img/logo-sdlc-white.png" alt="SDLC.dev" className="h-12 w-auto" />
              </a>

              {/* Title */}
              <h1 className="text-lg font-semibold">
                <span className="text-orange-400">Idea</span> to Spec
              </h1>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <a
                  href="/"
                  className="px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 text-sm transition-all"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative">
          <WizardContainer />
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-white/40">
              Powered by DDflow &middot; SDLC.dev
            </p>
          </div>
        </footer>

        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          .animate-float {
            animation: float 10s ease-in-out infinite;
          }
        `}</style>
      </div>
    </WizardProvider>
  );
}

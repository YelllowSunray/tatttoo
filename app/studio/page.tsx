'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import { ArtistDashboard } from '@/components/ArtistDashboard';
import Link from 'next/link';

export default function StudioPage() {
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent mx-auto"></div>
          <p className="text-black/60 text-sm tracking-wide">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <header className="border-b border-black/10 bg-white">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-light tracking-tight text-black uppercase tracking-wider">
                Artist Studio
              </h1>
              <Link
                href="/"
                className="text-xs text-black/40 hover:text-black transition-colors uppercase tracking-wider"
              >
                ← Back to Gallery
              </Link>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-20">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="mb-6 text-5xl font-light tracking-tight text-black leading-tight uppercase tracking-wider">
              Artist Studio
            </h2>
            <p className="mb-12 text-sm text-black/60 leading-relaxed tracking-wide">
              Sign in to upload and manage your tattoos.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="rounded-full bg-black px-8 py-4 text-xs font-medium text-white transition-all hover:bg-black/90 tracking-wide uppercase"
            >
              Sign In
            </button>
          </div>
        </main>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-light tracking-tight text-black uppercase tracking-wider">
                Artist Studio
              </h1>
              {user.displayName && (
                <p className="mt-1 text-xs text-black/50 tracking-wide">
                  {user.displayName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-xs text-black/40 hover:text-black transition-colors uppercase tracking-wider"
              >
                ← Back to Gallery
              </Link>
              <button
                onClick={signOut}
                className="rounded-full border border-black px-4 py-2 text-xs font-medium text-black transition-all hover:bg-black hover:text-white uppercase tracking-wider"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-16">
        <ArtistDashboard />
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white">
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-xs text-black/40 uppercase tracking-wider">
            <Link href="/" className="hover:text-black transition-colors">
              Discover tattoo artists in the Netherlands
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}


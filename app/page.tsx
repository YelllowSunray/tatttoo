'use client';

import { useState } from 'react';
import { Gallery } from '@/components/Gallery';
import { TopArtists } from '@/components/TopArtists';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';
import Link from 'next/link';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'gallery' | 'top-artists'>('gallery');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading, signOut } = useAuth();

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

  // Show gallery for unauthenticated users, but with limited functionality

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-light tracking-tight text-black uppercase tracking-wider">
                Tattoo Discovery
              </h1>
              {user?.displayName && (
                <p className="mt-1 text-xs text-black/50 tracking-wide">
                  {user.displayName}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              {user && (
                <>
                  <nav className="flex gap-1 border-b border-black/10 sm:border-0 pb-2 sm:pb-0">
                    <button
                      onClick={() => setActiveTab('gallery')}
                      className={`px-3 sm:px-4 py-2 text-xs font-medium transition-all uppercase tracking-wider min-h-[44px] ${
                        activeTab === 'gallery'
                          ? 'text-black border-b-2 border-black'
                          : 'text-black/40 hover:text-black'
                      }`}
                    >
                      Gallery
                    </button>
                    <button
                      onClick={() => setActiveTab('top-artists')}
                      className={`px-3 sm:px-4 py-2 text-xs font-medium transition-all uppercase tracking-wider min-h-[44px] ${
                        activeTab === 'top-artists'
                          ? 'text-black border-b-2 border-black'
                          : 'text-black/40 hover:text-black'
                      }`}
                    >
                      Top 5 Artists
                    </button>
                  </nav>
                </>
              )}
              <div className="flex items-center gap-3 sm:gap-6">
                <Link
                  href="/studio"
                  className="text-xs text-black/40 hover:text-black transition-colors uppercase tracking-wider min-h-[44px] flex items-center"
                >
                  For artists
                </Link>
                {user ? (
                  <button
                    onClick={signOut}
                    className="rounded-full border border-black px-4 py-2.5 text-xs font-medium text-black transition-all hover:bg-black hover:text-white active:bg-black/90 active:text-white uppercase tracking-wider min-h-[44px] touch-manipulation"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="rounded-full bg-black px-4 py-2.5 text-xs font-medium text-white transition-all hover:bg-black/90 active:bg-black/80 uppercase tracking-wider min-h-[44px] touch-manipulation"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {user && activeTab === 'top-artists' ? (
          <div className="mx-auto max-w-4xl">
            <TopArtists />
          </div>
        ) : (
          <Gallery onRequireAuth={() => setShowAuthModal(true)} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/10 bg-white">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
          <p className="text-xs text-black/40 uppercase tracking-wider">
            Discover tattoo artists in the Netherlands
          </p>
        </div>
      </footer>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

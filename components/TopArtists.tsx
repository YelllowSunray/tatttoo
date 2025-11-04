'use client';

import { useState, useEffect } from 'react';
import { Artist, ArtistScore } from '@/types';
import { getArtist } from '@/lib/firestore';
import { getTop5Artists, getUserId } from '@/lib/recommendations';

interface TopArtistsProps {
  onRefresh?: () => void;
}

interface ContactModalProps {
  artist: Artist;
  onClose: () => void;
}

function ContactModal({ artist, onClose }: ContactModalProps) {
  const hasContactInfo = artist.email || artist.phone || artist.instagram || artist.website;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-black/20 bg-white p-6 sm:p-8 md:p-10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="mb-6 ml-auto block text-black/40 hover:text-black active:text-black/60 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="mb-8 sm:mb-10 text-2xl sm:text-3xl md:text-4xl font-light tracking-[-0.02em] text-black">
          Contact {artist.name}
        </h2>

        {hasContactInfo ? (
          <div className="space-y-8">
            {artist.email && (
              <div>
                <label className="mb-3 block text-xs font-medium text-black/50 uppercase tracking-[0.1em]">
                  Email
                </label>
                <a
                  href={`mailto:${artist.email}`}
                  className="text-base text-black hover:text-black/60 transition-colors duration-200 break-all"
                >
                  {artist.email}
                </a>
              </div>
            )}

            {artist.phone && (
              <div>
                <label className="mb-3 block text-xs font-medium text-black/50 uppercase tracking-[0.1em]">
                  Phone
                </label>
                <a
                  href={`tel:${artist.phone}`}
                  className="text-base text-black hover:text-black/60 transition-colors duration-200"
                >
                  {artist.phone}
                </a>
              </div>
            )}

            {artist.instagram && (
              <div>
                <label className="mb-3 block text-xs font-medium text-black/50 uppercase tracking-[0.1em]">
                  Instagram
                </label>
                <a
                  href={artist.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-black hover:text-black/60 transition-colors duration-200 break-all underline underline-offset-4"
                >
                  {artist.instagram}
                </a>
              </div>
            )}

            {artist.website && (
              <div>
                <label className="mb-3 block text-xs font-medium text-black/50 uppercase tracking-[0.1em]">
                  Website
                </label>
                <a
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-black hover:text-black/60 transition-colors duration-200 break-all underline underline-offset-4"
                >
                  {artist.website}
                </a>
              </div>
            )}

            {artist.location && (
              <div>
                <label className="mb-3 block text-xs font-medium text-black/50 uppercase tracking-[0.1em]">
                  Location
                </label>
                <p className="text-base text-black/60">
                  {artist.location}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-black/50 tracking-wide">
              Contact information not available for this artist.
            </p>
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-black/10">
          <button
            onClick={onClose}
            className="w-full rounded-full border border-black px-6 py-3.5 text-xs font-medium text-black transition-all duration-200 hover:bg-black hover:text-white active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function TopArtists({ onRefresh }: TopArtistsProps) {
  const [topArtists, setTopArtists] = useState<ArtistScore[]>([]);
  const [artistsData, setArtistsData] = useState<Map<string, Artist>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [contactModalArtist, setContactModalArtist] = useState<Artist | null>(null);

  const loadTopArtists = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const topScores = await getTop5Artists(userId);

      // Load full artist data
      const artistsMap = new Map<string, Artist>();
      for (const score of topScores) {
        const artist = await getArtist(score.artistId);
        if (artist) {
          artistsMap.set(artist.id, artist);
        }
      }

      setTopArtists(topScores);
      setArtistsData(artistsMap);
      setShowResults(true);
    } catch (err) {
      console.error('Error loading top artists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopArtists();
  }, []);

  if (!showResults && topArtists.length === 0 && !loading) {
    return (
      <div className="border border-black/10 bg-white p-6 sm:p-12 text-center">
        <p className="mb-6 text-sm text-black/60 tracking-wide">
          Start liking tattoos to discover your Top 5 artists
        </p>
        <button
          onClick={loadTopArtists}
          className="rounded-full border border-black px-6 py-3 text-xs font-medium text-black transition-all hover:bg-black hover:text-white active:bg-black/90 active:text-white uppercase tracking-wider min-h-[44px] touch-manipulation"
        >
          Refresh Results
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border border-black/10 bg-white p-6 sm:p-12 text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent mx-auto"></div>
        <p className="text-black/60 text-xs tracking-wide">Calculating your matches...</p>
      </div>
    );
  }

  if (topArtists.length === 0) {
    return (
      <div className="border border-black/10 bg-white p-6 sm:p-12 text-center">
        <p className="text-black/60 text-sm tracking-wide">
          Like some tattoos to see your personalized recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="border border-black bg-white p-6 sm:p-10 md:p-14">
      {/* Intentional header with refined spacing */}
      <div className="mb-10 sm:mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <h2 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-light tracking-[-0.02em] text-black">
            Your Top 5 Artists
          </h2>
          <p className="text-xs text-black/40 tracking-wide mt-1">
            Based on your preferences
          </p>
        </div>
        <button
          onClick={loadTopArtists}
          className="rounded-full border border-black px-5 py-2.5 text-xs font-medium text-black transition-all duration-200 hover:bg-black hover:text-white active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation self-start sm:self-auto"
        >
          Refresh
        </button>
      </div>

      {/* Intentional list spacing */}
      <div className="space-y-0.5">
        {topArtists.map((score, index) => {
          const artist = artistsData.get(score.artistId);
          if (!artist) return null;

          return (
            <div
              key={score.artistId}
              className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8 border-b border-black/10 pb-8 pt-8 transition-colors duration-200 first:pt-0 last:border-0 last:pb-0 hover:border-black/20"
            >
              {/* Intentional numbering */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-black text-sm font-light text-black">
                {index + 1}
              </div>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="mb-1 text-xl sm:text-2xl font-light tracking-tight text-black">
                    {artist.name}
                  </h3>
                  <p className="text-xs text-black/40 uppercase tracking-[0.1em]">
                    {artist.location}
                  </p>
                </div>
                {artist.bio && (
                  <p className="text-sm text-black/50 leading-relaxed max-w-2xl">
                    {artist.bio}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 pt-1">
                  {artist.instagram && (
                    <a
                      href={artist.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-black/40 hover:text-black transition-colors duration-200 uppercase tracking-[0.1em] underline underline-offset-4"
                    >
                      Instagram
                    </a>
                  )}
                  {artist.website && (
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-black/40 hover:text-black transition-colors duration-200 uppercase tracking-[0.1em] underline underline-offset-4"
                    >
                      Website
                    </a>
                  )}
                  <span className="text-xs text-black/30 uppercase tracking-[0.1em]">
                    {score.likedTattoos} {score.likedTattoos === 1 ? 'tattoo' : 'tattoos'} liked
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <button
                  onClick={() => setContactModalArtist(artist)}
                  className="rounded-full border border-black px-6 py-2.5 text-xs font-medium text-black transition-all duration-200 hover:bg-black hover:text-white active:bg-black/95 uppercase tracking-[0.1em] min-h-[44px] touch-manipulation whitespace-nowrap"
                >
                  Contact
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {contactModalArtist && (
        <ContactModal
          artist={contactModalArtist}
          onClose={() => setContactModalArtist(null)}
        />
      )}
    </div>
  );
}


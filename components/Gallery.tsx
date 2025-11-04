'use client';

import { useState, useEffect } from 'react';
import { Tattoo, Artist } from '@/types';
import { getTattoos, getArtists } from '@/lib/firestore';
import { TattooCard } from './TattooCard';

interface GalleryProps {
  onRequireAuth?: () => void;
}

export function Gallery({ onRequireAuth }: GalleryProps) {
  const [tattoos, setTattoos] = useState<Tattoo[]>([]);
  const [artists, setArtists] = useState<Map<string, Artist>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tattoosData, artistsData] = await Promise.all([
          getTattoos(),
          getArtists()
        ]);

        // Create a map for quick artist lookup
        const artistsMap = new Map<string, Artist>();
        artistsData.forEach(artist => {
          artistsMap.set(artist.id, artist);
        });

        setTattoos(tattoosData);
        setArtists(artistsMap);
        setError(null);
      } catch (err) {
        setError('Failed to load tattoos. Please try again later.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent mx-auto"></div>
          <p className="text-black/60 text-sm tracking-wide">Loading beautiful tattoos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-black/60 mb-6 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full border border-black px-6 py-3 text-xs font-medium text-black transition-all hover:bg-black hover:text-white active:bg-black/90 active:text-white uppercase tracking-wider min-h-[44px] touch-manipulation"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (tattoos.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-black/60 text-sm mb-2 tracking-wide">No tattoos found</p>
          <p className="text-black/40 text-xs tracking-wide">Check back soon for new artwork</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6">
      <div className="mx-auto max-w-7xl">
        {/* Intentional header with refined spacing */}
        <div className="mb-12 sm:mb-20 md:mb-24 text-center">
          <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-[-0.02em] text-black leading-[1.1] px-4">
            Discover Dutch Tattoo Artistry
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-black/50 leading-relaxed tracking-wide px-4">
            Explore curated tattoos from talented artists across the Netherlands. 
            Like the ones that resonate with you, and we'll find your perfect match.
          </p>
        </div>

        {/* Intentional grid with refined spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0.5 sm:gap-1">
          {tattoos.map((tattoo) => {
            const artist = artists.get(tattoo.artistId);
            return (
              <TattooCard
                key={tattoo.id}
                tattoo={tattoo}
                artistName={artist?.name}
                artistLocation={artist?.location}
                artistId={artist?.id}
                onRequireAuth={onRequireAuth}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}


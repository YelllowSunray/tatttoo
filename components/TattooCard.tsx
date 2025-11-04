'use client';

import { useState, useEffect } from 'react';
import { Tattoo } from '@/types';
import { toggleLike, isTattooLiked } from '@/lib/firestore';
import { getUserId } from '@/lib/recommendations';
import Image from 'next/image';

interface TattooCardProps {
  tattoo: Tattoo;
  artistName?: string;
  artistLocation?: string;
}

export function TattooCard({ tattoo, artistName, artistLocation }: TattooCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const checkLiked = async () => {
      const userId = getUserId();
      const liked = await isTattooLiked(userId, tattoo.id);
      setIsLiked(liked);
      setIsLoading(false);
    };
    checkLiked();
  }, [tattoo.id]);

  const handleLike = async () => {
    if (isToggling) return;
    setIsToggling(true);
    const userId = getUserId();
    const newLikedState = await toggleLike(userId, tattoo.id);
    setIsLiked(newLikedState);
    setIsToggling(false);
  };

  // Handle overlay visibility - show on hover/touch, hide when clicking outside
  const handleCardClick = () => {
    if (showOverlay) {
      // If overlay is already shown, clicking again will toggle it
      setShowOverlay(false);
    } else {
      setShowOverlay(true);
    }
  };

  return (
    <div 
      className="group relative aspect-square overflow-hidden bg-black transition-all duration-500 hover:opacity-95 touch-manipulation"
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
      onClick={handleCardClick}
    >
      <Image
        src={tattoo.imageUrl}
        alt={tattoo.description || `Tattoo by ${artistName || 'artist'}`}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* Overlay with tattoo info and like button */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 transition-opacity duration-500 ${showOverlay ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          {/* Tattoo name/description */}
          {tattoo.description && (
            <p className="mb-2 text-sm sm:text-base font-medium text-white break-words">
              {tattoo.description}
            </p>
          )}
          
          {/* Artist name */}
          {artistName && (
            <p className="mb-2 text-xs sm:text-sm font-medium text-white/90 uppercase tracking-wider">
              {artistName}
            </p>
          )}
          
          {/* Price and Location */}
          <div className="mb-3 flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-white/80">
            {tattoo.price && (
              <span className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3 w-3"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                €{tattoo.price.toLocaleString()}
              </span>
            )}
            {(tattoo.location || artistLocation) && (
              <span className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-3 w-3"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {tattoo.location || artistLocation}
              </span>
            )}
          </div>
          
          {/* Like button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLike();
            }}
            disabled={isToggling}
            className={`flex items-center gap-2 rounded-full px-4 sm:px-5 py-2.5 text-xs font-medium transition-all duration-300 uppercase tracking-wider min-h-[44px] touch-manipulation ${
              isLiked
                ? 'bg-white text-black hover:bg-white/90 active:bg-white/80'
                : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 active:bg-white/30'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={isLiked ? 'Unlike this tattoo' : 'Like this tattoo'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {isLiked ? 'Liked' : 'Like'}
          </button>
        </div>
      </div>

      {/* Like indicator when liked but not hovering - clickable */}
      {isLiked && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
          disabled={isToggling}
          className={`absolute top-4 right-4 rounded-full bg-white p-2 shadow-lg transition-all hover:scale-110 active:scale-95 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Unlike this tattoo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-4 w-4 text-black"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      )}
    </div>
  );
}


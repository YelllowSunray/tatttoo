export interface Artist {
  id: string;
  name: string;
  location: string;
  bio?: string;
  instagram?: string;
  website?: string;
  userId?: string; // Link to Firebase Auth user ID for verification
  email?: string;
  phone?: string;
}

export interface Tattoo {
  id: string;
  artistId: string;
  imageUrl: string;
  description?: string;
  price?: number;
  location?: string; // Location where tattoo was done (can differ from artist location)
  style?: string;
  tags?: string[];
  bodyPart?: string; // e.g., "Arm", "Back", "Leg", "Chest"
  color?: boolean; // true for color, false for black & white
  size?: string; // e.g., "Small", "Medium", "Large" or dimensions
  createdAt?: number;
  updatedAt?: number;
}

export interface UserLike {
  tattooId: string;
  timestamp: number;
}

export interface ArtistScore {
  artistId: string;
  score: number;
  likedTattoos: number;
}


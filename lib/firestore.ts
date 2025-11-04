import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { Artist, Tattoo, UserLike } from '@/types';

// Collection names
const ARTISTS_COLLECTION = 'artists';
const TATTOOS_COLLECTION = 'tattoos';
const LIKES_COLLECTION = 'likes';

// Get all artists
export async function getArtists(): Promise<Artist[]> {
  const snapshot = await getDocs(collection(db, ARTISTS_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artist));
}

// Get artist by ID
export async function getArtist(artistId: string): Promise<Artist | null> {
  const docRef = doc(db, ARTISTS_COLLECTION, artistId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Artist;
  }
  return null;
}

// Get all tattoos
export async function getTattoos(): Promise<Tattoo[]> {
  const snapshot = await getDocs(collection(db, TATTOOS_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tattoo));
}

// Get tattoos by artist
export async function getTattoosByArtist(artistId: string): Promise<Tattoo[]> {
  const q = query(collection(db, TATTOOS_COLLECTION), where('artistId', '==', artistId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tattoo));
}

// Get user likes (using localStorage user ID for simplicity)
export async function getUserLikes(userId: string): Promise<UserLike[]> {
  const docRef = doc(db, LIKES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data().likes || [];
  }
  return [];
}

// Add or remove a like
export async function toggleLike(userId: string, tattooId: string): Promise<boolean> {
  const docRef = doc(db, LIKES_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  
  const currentLikes: UserLike[] = docSnap.exists() ? docSnap.data().likes || [] : [];
  const isLiked = currentLikes.some(like => like.tattooId === tattooId);
  
  let updatedLikes: UserLike[];
  if (isLiked) {
    // Remove like
    updatedLikes = currentLikes.filter(like => like.tattooId !== tattooId);
  } else {
    // Add like
    updatedLikes = [...currentLikes, { tattooId, timestamp: Date.now() }];
  }
  
  await setDoc(docRef, {
    likes: updatedLikes,
    updatedAt: serverTimestamp()
  }, { merge: true });
  
  return !isLiked;
}

// Check if a tattoo is liked
export async function isTattooLiked(userId: string, tattooId: string): Promise<boolean> {
  const likes = await getUserLikes(userId);
  return likes.some(like => like.tattooId === tattooId);
}


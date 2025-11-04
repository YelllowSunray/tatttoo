import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Artist, Tattoo } from '@/types';

// Collection names
const ARTISTS_COLLECTION = 'artists';
const TATTOOS_COLLECTION = 'tattoos';

/**
 * Remove undefined values from object (Firestore doesn't accept undefined)
 */
function removeUndefined(obj: any): any {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

/**
 * Get artist by Firebase Auth user ID
 */
export async function getArtistByUserId(userId: string): Promise<Artist | null> {
  const q = query(collection(db, ARTISTS_COLLECTION), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Artist;
}

/**
 * Create or update artist profile
 */
export async function createOrUpdateArtist(artist: Omit<Artist, 'id'>, userId: string): Promise<string> {
  // Check if artist already exists
  const existingArtist = await getArtistByUserId(userId);
  
  if (existingArtist) {
    // Update existing artist
    const docRef = doc(db, ARTISTS_COLLECTION, existingArtist.id);
    await updateDoc(docRef, removeUndefined({
      ...artist,
      userId,
      updatedAt: serverTimestamp()
    }));
    return existingArtist.id;
  } else {
    // Create new artist
    const docRef = doc(collection(db, ARTISTS_COLLECTION));
    await setDoc(docRef, removeUndefined({
      ...artist,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));
    return docRef.id;
  }
}

/**
 * Upload a new tattoo
 */
export async function uploadTattoo(tattoo: Omit<Tattoo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = doc(collection(db, TATTOOS_COLLECTION));
  await setDoc(docRef, removeUndefined({
    ...tattoo,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }));
  return docRef.id;
}

/**
 * Update an existing tattoo (only if user owns it)
 */
export async function updateTattoo(tattooId: string, updates: Partial<Tattoo>, userId: string): Promise<void> {
  // Verify ownership
  const tattooDoc = await getDoc(doc(db, TATTOOS_COLLECTION, tattooId));
  if (!tattooDoc.exists()) {
    throw new Error('Tattoo not found');
  }
  
  const tattoo = tattooDoc.data() as Tattoo;
  const artist = await getArtistByUserId(userId);
  
  if (!artist || tattoo.artistId !== artist.id) {
    throw new Error('You do not have permission to update this tattoo');
  }
  
  const docRef = doc(db, TATTOOS_COLLECTION, tattooId);
  await updateDoc(docRef, removeUndefined({
    ...updates,
    updatedAt: serverTimestamp()
  }));
}

/**
 * Delete a tattoo (only if user owns it)
 */
export async function deleteTattoo(tattooId: string, userId: string): Promise<void> {
  // Verify ownership
  const tattooDoc = await getDoc(doc(db, TATTOOS_COLLECTION, tattooId));
  if (!tattooDoc.exists()) {
    throw new Error('Tattoo not found');
  }
  
  const tattoo = tattooDoc.data() as Tattoo;
  const artist = await getArtistByUserId(userId);
  
  if (!artist || tattoo.artistId !== artist.id) {
    throw new Error('You do not have permission to delete this tattoo');
  }
  
  await deleteDoc(doc(db, TATTOOS_COLLECTION, tattooId));
}

/**
 * Get tattoos by artist (for artist dashboard)
 */
export async function getMyTattoos(userId: string): Promise<Tattoo[]> {
  const artist = await getArtistByUserId(userId);
  if (!artist) {
    return [];
  }
  
  const q = query(collection(db, TATTOOS_COLLECTION), where('artistId', '==', artist.id));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tattoo));
}


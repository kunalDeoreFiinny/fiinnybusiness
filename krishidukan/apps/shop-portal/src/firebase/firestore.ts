import {
  collection,
  doc,
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore';
import { db } from './config';

/** Get a typed collection reference. Throws if Firestore not initialized. */
export function getCollection(name: string): CollectionReference {
  if (!db) throw new Error('Firestore not initialized');
  return collection(db, name);
}

/** Get a typed document reference. Throws if Firestore not initialized. */
export function getDocRef(collectionName: string, docId: string): DocumentReference {
  if (!db) throw new Error('Firestore not initialized');
  return doc(db, collectionName, docId);
}

export { db };

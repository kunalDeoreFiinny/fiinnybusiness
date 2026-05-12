import { useState, useEffect } from 'react';
import { onSnapshot, DocumentReference, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Hook that subscribes to a single Firestore document in real-time.
 * Returns { data, loading, error }.
 */
export function useFirestoreDoc<T>(collectionName: string, docId: string | null | undefined) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !docId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, collectionName, docId) as DocumentReference;

    const unsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          setData(snap.data() as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, loading, error };
}

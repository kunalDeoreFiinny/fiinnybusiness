import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, QueryConstraint } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Hook that subscribes to a Firestore collection query in real-time.
 * Returns { data, loading, error }.
 */
export function useFirestoreQuery<T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  enabled = true,
) {
  const [data, setData] = useState<Array<{ id: string } & T>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, collectionName), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const results = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as T),
        }));
        setData(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, enabled]);

  return { data, loading, error };
}

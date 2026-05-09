import {
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { getCollection } from '../firebase/firestore';
import { COLLECTIONS, ReviewDoc } from '../types/firebase';

/** Get reviews for a retailer, most recent first */
export async function getReviewsByRetailer(
  retailerId: string,
  maxCount = 50,
): Promise<Array<{ id: string } & ReviewDoc>> {
  const q = query(
    getCollection(COLLECTIONS.REVIEWS),
    where('retailerId', '==', retailerId),
    orderBy('createdAt', 'desc'),
    limit(maxCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as ReviewDoc) }));
}

/** Calculate average rating */
export function calcAverageRating(reviews: Array<{ rating: number }>): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/** Render star string: "★★★★☆" */
export function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
}

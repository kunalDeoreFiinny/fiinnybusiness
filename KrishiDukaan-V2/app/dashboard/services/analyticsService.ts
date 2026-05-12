import {
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { getDocRef, getCollection } from '../firebase/firestore';
import { COLLECTIONS, AnalyticsDoc } from '../types/firebase';

/** Get analytics for a retailer over the last N days */
export async function getAnalytics(
  retailerId: string,
  days = 30,
): Promise<AnalyticsDoc[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startStr = startDate.toISOString().split('T')[0]!;

  const collPath = `${COLLECTIONS.ANALYTICS}/${retailerId}/daily`;
  const q = query(
    getCollection(collPath),
    where('date', '>=', startStr),
    orderBy('date', 'asc'),
    limit(days),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as AnalyticsDoc);
}

/** Aggregate totals from analytics array */
export function aggregateAnalytics(data: AnalyticsDoc[]): {
  totalViews: number;
  totalCalls: number;
  totalDirections: number;
  totalSearches: number;
  totalInquiries: number;
} {
  return data.reduce(
    (acc, d) => ({
      totalViews: acc.totalViews + d.views,
      totalCalls: acc.totalCalls + d.calls,
      totalDirections: acc.totalDirections + d.directions,
      totalSearches: acc.totalSearches + d.searches,
      totalInquiries: acc.totalInquiries + d.inquiries,
    }),
    { totalViews: 0, totalCalls: 0, totalDirections: 0, totalSearches: 0, totalInquiries: 0 },
  );
}

/** Write today's analytics snapshot */
export async function writeAnalyticsSnapshot(
  retailerId: string,
  data: Omit<AnalyticsDoc, 'retailerId' | 'date'>,
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]!;
  const docPath = `${COLLECTIONS.ANALYTICS}/${retailerId}/daily`;
  await setDoc(getDocRef(docPath, today), {
    retailerId,
    date: today,
    ...data,
  });
}

/** Calculate week-over-week trend */
export function calculateTrend(
  data: AnalyticsDoc[],
  field: keyof Pick<AnalyticsDoc, 'views' | 'calls' | 'directions' | 'searches' | 'inquiries'>,
): { value: string; positive: boolean } {
  if (data.length < 14) return { value: '—', positive: true };
  const thisWeek = data.slice(-7).reduce((sum, d) => sum + (d[field] as number), 0);
  const lastWeek = data.slice(-14, -7).reduce((sum, d) => sum + (d[field] as number), 0);
  if (lastWeek === 0) return { value: '+100%', positive: true };
  const pctChange = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  return {
    value: `${pctChange > 0 ? '+' : ''}${pctChange}%`,
    positive: pctChange >= 0,
  };
}

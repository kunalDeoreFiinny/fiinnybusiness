import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

export type SearchAppearanceStats = {
  impressions: string;
  ctr: string;
  avgPosition: string;
};

export async function fetchRetailerAnalytics(retailerId: string) {
  try {
    const q = query(collection(db, "products"), where("retailerId", "==", retailerId));
    const snapshot = await getDocs(q);
    
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalPositionSum = 0;
    let productsWithImpressions = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const impressions = Number(data.impressions || 0);
      const clicks = Number(data.clicks || 0);
      const positionSum = Number(data.positionSum || 0);

      totalImpressions += impressions;
      totalClicks += clicks;
      totalPositionSum += positionSum;
      if (impressions > 0) {
        productsWithImpressions++;
      }
    });

    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgPosition = totalImpressions > 0 ? totalPositionSum / totalImpressions : 0;

    // Formatting
    const impressionsFormatted = totalImpressions >= 1000 
      ? (totalImpressions / 1000).toFixed(1) + 'k' 
      : totalImpressions.toString();

    return {
      totalImpressions,
      totalClicks,
      productCount: snapshot.docs.length,
      searchAppearance: {
        impressions: impressionsFormatted,
        ctr: ctr.toFixed(1) + '%',
        avgPosition: avgPosition > 0 ? avgPosition.toFixed(1) : '—'
      },
      // For now, these remain empty or we could derive from orders if we had them
      viewsOverTime: [
        { label: "Mon", value: 0 },
        { label: "Tue", value: 0 },
        { label: "Wed", value: 0 },
        { label: "Thu", value: 0 },
        { label: "Fri", value: 0 },
        { label: "Sat", value: 0 },
        { label: "Sun", value: 0 },
      ],
      callsOverTime: [
        { label: "Mon", value: 0 },
        { label: "Tue", value: 0 },
        { label: "Wed", value: 0 },
        { label: "Thu", value: 0 },
        { label: "Fri", value: 0 },
        { label: "Sat", value: 0 },
        { label: "Sun", value: 0 },
      ],
      directionRequests: [
        { label: "Mon", value: 0 },
        { label: "Tue", value: 0 },
        { label: "Wed", value: 0 },
        { label: "Thu", value: 0 },
        { label: "Fri", value: 0 },
        { label: "Sat", value: 0 },
        { label: "Sun", value: 0 },
      ]
    };
  } catch (error) {
    console.error("Error fetching retailer analytics:", error);
    throw error;
  }
}

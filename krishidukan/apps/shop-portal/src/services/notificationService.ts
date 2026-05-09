import {
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { getDocRef, getCollection } from '../firebase/firestore';
import { COLLECTIONS, NotificationDoc, NotificationType } from '../types/firebase';

/** Get notifications for a user, most recent first */
export async function getNotifications(
  userId: string,
  maxCount = 50,
): Promise<Array<{ id: string } & NotificationDoc>> {
  const q = query(
    getCollection(COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(maxCount),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as NotificationDoc) }));
}

/** Get unread count for badge display */
export async function getUnreadCount(userId: string): Promise<number> {
  const q = query(
    getCollection(COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    where('read', '==', false),
  );
  const snap = await getDocs(q);
  return snap.size;
}

/** Mark a notification as read */
export async function markAsRead(notifId: string): Promise<void> {
  await updateDoc(getDocRef(COLLECTIONS.NOTIFICATIONS, notifId), { read: true });
}

/** Mark all notifications as read for a user */
export async function markAllAsRead(userId: string): Promise<void> {
  const q = query(
    getCollection(COLLECTIONS.NOTIFICATIONS),
    where('userId', '==', userId),
    where('read', '==', false),
  );
  const snap = await getDocs(q);
  const promises = snap.docs.map((d) => updateDoc(d.ref, { read: true }));
  await Promise.all(promises);
}

/** Create a new notification */
export async function createNotification(data: {
  userId: string;
  retailerId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}): Promise<void> {
  await addDoc(getCollection(COLLECTIONS.NOTIFICATIONS), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/** Generate low-stock notifications for a retailer */
export async function checkLowStock(
  retailerId: string,
  userId: string,
): Promise<void> {
  const invQ = query(
    getCollection(COLLECTIONS.INVENTORY),
    where('retailerId', '==', retailerId),
  );
  const snap = await getDocs(invQ);
  for (const d of snap.docs) {
    const inv = d.data();
    const threshold = inv.lowStockThreshold ?? 5;
    if (inv.stock <= threshold && inv.stock > 0) {
      await createNotification({
        userId,
        retailerId,
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `Product ${d.id} has only ${inv.stock} units remaining`,
        actionUrl: '/inventory',
      });
    }
  }
}

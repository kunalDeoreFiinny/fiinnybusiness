import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { UserProfile } from "@/lib/models/UserProfile";

export class AuthService {
    static async getUserProfile(phoneNumber: string): Promise<UserProfile | null> {
        const docRef = doc(db, "users", phoneNumber);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            const data = snap.data();
            
            let parsedDate: Date | undefined;
            if (data.createdAt?.toDate) {
                parsedDate = data.createdAt.toDate();
            } else if (data.createdAt) {
                parsedDate = new Date(data.createdAt);
            }

            return {
                phoneNumber: snap.id,
                ...data,
                displayName: data.displayName || data.name,
                createdAt: parsedDate
            } as UserProfile;
        }
        return null;
    }

    static async createUserProfile(uid: string, data: Partial<UserProfile>) {
        if (!data.phoneNumber) throw new Error("Phone number required");
        const ref = doc(db, "users", data.phoneNumber);
        await setDoc(ref, {
            ...data,
            createdAt: Timestamp.fromDate(new Date())
        } as any, { merge: true });
    }
}

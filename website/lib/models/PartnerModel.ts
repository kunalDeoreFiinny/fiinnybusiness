import { DocumentSnapshot, Timestamp } from "firebase/firestore";

export type PartnerStatus = 'pending' | 'active' | 'rejected' | 'cancelled' | 'revoked';

export interface PartnerModel {
    id: string; // usually same as partnerId (phone)
    userId: string; // The user who holds this record
    partnerId: string; // The other user's phone
    partnerName?: string;
    partnerEmail?: string;
    avatar?: string;

    relation?: string;
    status: PartnerStatus;
    permissions: Record<string, boolean>; // { 'tx': true, 'goals': false }

    addedOn: Date;

    // Stats (not stored, but enriched at runtime)
    todayCredit?: number;
    todayDebit?: number;
    todayTxCount?: number;
    todayTxAmount?: number;
}

export const partnerConverter = {
    toFirestore: (data: PartnerModel) => {
        const { id, addedOn, todayCredit, todayDebit, todayTxCount, todayTxAmount, ...rest } = data;
        return {
            ...rest,
            addedOn: Timestamp.fromDate(addedOn),
        };
    },
    fromFirestore: (snap: DocumentSnapshot) => {
        const data = snap.data() as any;
        // addedOn may be absent on legacy or newly-written docs — guard defensively
        const rawAddedOn = data.addedOn;
        const addedOn: Date =
            rawAddedOn && typeof rawAddedOn.toDate === 'function'
                ? rawAddedOn.toDate()
                : rawAddedOn instanceof Date
                    ? rawAddedOn
                    : new Date(); // fallback to now

        return {
            ...data,
            id: snap.id,
            addedOn,
            permissions: data.permissions || {},
            // Runtime fields initialized to zero/null
            todayCredit: 0,
            todayDebit: 0,
            todayTxCount: 0,
            todayTxAmount: 0,
        } as PartnerModel;
    }
};

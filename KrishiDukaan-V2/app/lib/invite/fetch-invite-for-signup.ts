import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../../firebase";

const COLLECTION = "manufacturerRetailers";

export type SignupInviteDetails = {
  found: boolean;
  claimable: boolean;
  inviteCode: string;
  status: string;
  retailerEmail: string;
  retailerId: string;
  manufacturerId: string;
  manufacturerName: string | null;
};

export async function fetchInviteDetailsForSignup(
  inviteCode: string,
): Promise<SignupInviteDetails | null> {
  const code = inviteCode.trim();
  if (!code) return null;

  const q = query(collection(db, COLLECTION), where("inviteCode", "==", code), limit(1));
  const snap = await getDocs(q);

  if (snap.empty) {
    return {
      found: false,
      claimable: false,
      inviteCode: code,
      status: "",
      retailerEmail: "",
      retailerId: "",
      manufacturerId: "",
      manufacturerName: null,
    };
  }

  const d = snap.docs[0]!;
  const data = d.data() as Record<string, unknown>;
  const status = String(data.status ?? "");
  const claimable = status === "invited" && data.claimable === true;
  const manufacturerId = String(data.manufacturerId ?? "");
  const retailerEmail = String(data.retailerEmail ?? "");
  const retailerId = String(data.retailerId ?? "");

  let manufacturerName: string | null = null;
  if (manufacturerId) {
    try {
      const userSnap = await getDoc(doc(db, "users", manufacturerId));
      if (userSnap.exists()) {
        const u = userSnap.data() as Record<string, unknown>;
        manufacturerName =
          (u.shopName as string) || (u.name as string) || (u.displayName as string) || null;
      }
    } catch {
      manufacturerName = null;
    }
  }

  return {
    found: true,
    claimable,
    inviteCode: String(data.inviteCode ?? code),
    status,
    retailerEmail,
    retailerId,
    manufacturerId,
    manufacturerName,
  };
}

/**
 * Firestore rules (suggested):
 *
 * - **Manufacturer dashboard:** `list`/`get` on `manufacturerRetailers` where `manufacturerId == request.auth.uid`.
 * - **Signup invite read:** allow query `where('inviteCode','==', code)` for authenticated users only if
 *   acceptable for your threat model; otherwise use a callable Cloud Function to validate and claim.
 * - **Claim update:** allow when `resource.data.status == 'invited'`, `resource.data.claimable == true`,
 *   `resource.data.retailerId` is empty, and after update `status` is `active`, `retailerId` is uid, `claimable` is `false`.
 */

import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  mapInviteAcceptanceError,
  mapInviteSnapshot,
  precheckInviteForAcceptance,
  type ManufacturerRetailerInviteSnapshot,
} from "./invite-validation";

const COLLECTION = "manufacturerRetailers";

export async function findInviteByCode(
  inviteCode: string,
): Promise<ManufacturerRetailerInviteSnapshot | null> {
  const normalized = inviteCode.trim();
  if (!normalized) return null;

  const q = query(
    collection(db, COLLECTION),
    where("inviteCode", "==", normalized),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0]!;
  return mapInviteSnapshot(d.id, d.data() as Record<string, unknown>);
}

export type AcceptInviteResult =
  | { ok: true; alreadyActive: boolean }
  | { ok: false; message: string };

/**
 * Activates manufacturer–retailer relationship when invite is pending and unclaimed.
 * Idempotent if the same user already claimed the invite.
 */
export async function acceptManufacturerInvite(params: {
  uid: string;
  inviteCode: string;
}): Promise<AcceptInviteResult> {
  const code = params.inviteCode.trim();
  if (!code) {
    return { ok: false, message: "Missing invite code." };
  }

  const initial = await findInviteByCode(code);
  const pre = precheckInviteForAcceptance(initial, params.uid);
  if (!pre.ok) {
    return { ok: false, message: mapInviteAcceptanceError(pre.reason) };
  }

  const ref = doc(db, COLLECTION, pre.docId);
  const wasAlreadyActive = initial?.status === "active" && initial.retailerId.trim() === params.uid;

  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists()) {
        throw new Error("invalid_code");
      }
      const row = mapInviteSnapshot(snap.id, snap.data() as Record<string, unknown>);
      const check = precheckInviteForAcceptance(row, params.uid);
      if (!check.ok) {
        throw new Error(check.reason);
      }

      if (row.status === "active" && row.retailerId.trim() === params.uid) {
        return;
      }

      if (row.status !== "invited") {
        throw new Error("not_invited");
      }
      if (!row.claimable) {
        throw new Error("not_invited");
      }
      const rid = row.retailerId.trim();
      if (rid && rid !== params.uid) {
        throw new Error("already_used");
      }

      transaction.update(ref, {
        status: "active",
        retailerId: params.uid,
        claimable: false,
        updatedAt: serverTimestamp(),
      });
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    const reasons = ["invalid_code", "already_used", "expired", "not_invited"] as const;
    if (reasons.includes(err as (typeof reasons)[number])) {
      return { ok: false, message: mapInviteAcceptanceError(err as (typeof reasons)[number]) };
    }
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not accept invite. Try again.",
    };
  }

  return { ok: true, alreadyActive: wasAlreadyActive };
}

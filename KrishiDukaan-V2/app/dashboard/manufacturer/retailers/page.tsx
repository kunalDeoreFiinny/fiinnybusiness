"use client";

import { useCallback, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, getUserProfile } from "../../../firebase";
import { PageHeader } from "../../_components/page-header";
import { RetailerTable } from "../../_components/manufacturer/retailer-table";
import { AddRetailerForm } from "../../_components/manufacturer/add-retailer-form";
import { InviteCard } from "../../_components/manufacturer/invite-card";
import { fetchManufacturerRetailers } from "../../_lib/manufacturer-retailers-firestore";
import type { ManufacturerRetailerRow } from "../../_types/manufacturer-retailers";

type AccessState = "checking" | "allowed" | "denied";

export default function ManufacturerRetailersPage() {
  const router = useRouter();
  const [access, setAccess] = useState<AccessState>("checking");
  const [manufacturerId, setManufacturerId] = useState<string | null>(null);
  const [rows, setRows] = useState<ManufacturerRetailerRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ inviteCode: string; retailerEmail: string } | null>(null);

  const loadRows = useCallback(async (uid: string) => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await fetchManufacturerRetailers(uid);
      setRows(data);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Failed to load retailers.");
      setRows([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAccess("denied");
        router.replace("/");
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.role === "manufacturer") {
          setManufacturerId(user.uid);
          setAccess("allowed");
          await loadRows(user.uid);
        } else {
          setAccess("denied");
          router.replace("/dashboard");
        }
      } catch {
        setAccess("denied");
        router.replace("/dashboard");
      }
    });
    return () => unsub();
  }, [router, loadRows]);

  const handleInviteCreated = async (payload: { inviteCode: string; retailerEmail: string }) => {
    if (manufacturerId) await loadRows(manufacturerId);
    setToast(payload);
  };

  if (access === "checking") {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-on-surface-variant">Checking access…</p>
      </div>
    );
  }

  if (access === "denied" || !manufacturerId) {
    return null;
  }

  return (
    <>
      <PageHeader
        title="Connected Retailers"
        description="Manage retailer invites for your manufacturer account. Relationships are stored separately from retailer profiles."
      />

      {listError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {listError}
        </div>
      ) : null}

      {toast ? (
        <div className="mb-6">
          <InviteCard
            inviteCode={toast.inviteCode}
            retailerEmail={toast.retailerEmail}
            onDismiss={() => setToast(null)}
          />
        </div>
      ) : null}

      <section className="mb-8" aria-label="Retailer list">
        <RetailerTable rows={rows} loading={listLoading} />
      </section>

      <section aria-label="Invite retailer">
        <AddRetailerForm
          manufacturerId={manufacturerId}
          disabled={listLoading}
          onInviteCreated={handleInviteCreated}
        />
      </section>
    </>
  );
}

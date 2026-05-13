"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { createManufacturerRetailerInvite } from "../../_lib/manufacturer-retailers-firestore";

type AddRetailerFormProps = {
  manufacturerId: string;
  disabled?: boolean;
  onInviteCreated: (payload: { inviteCode: string; retailerEmail: string }) => Promise<void>;
};

export function AddRetailerForm({
  manufacturerId,
  disabled,
  onInviteCreated,
}: AddRetailerFormProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const retailerEmail = email.trim().toLowerCase();
    const retailerPhone = phone.trim();
    if (!retailerEmail || !retailerPhone) {
      setError("Email and phone are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(retailerEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const { inviteCode } = await createManufacturerRetailerInvite({
        manufacturerId,
        retailerEmail,
        retailerPhone,
      });
      setEmail("");
      setPhone("");
      await onInviteCreated({ inviteCode, retailerEmail });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invite.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-ambient md:p-6">
      <h2 className="text-base font-semibold text-on-surface">Invite retailer</h2>
      <p className="mt-1 text-sm text-on-surface-variant">
        A unique invite code is generated automatically. Share it with the retailer when they join
        your network.
      </p>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5 text-sm sm:col-span-1">
          <span className="font-medium text-on-surface">Retailer email</span>
          <input
            type="email"
            required
            autoComplete="email"
            disabled={disabled || submitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            placeholder="retailer@example.com"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm sm:col-span-1">
          <span className="font-medium text-on-surface">Retailer phone</span>
          <input
            type="tel"
            required
            autoComplete="tel"
            disabled={disabled || submitting}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-on-surface outline-none ring-primary/30 focus:ring-2"
            placeholder="+91 ..."
          />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={disabled || submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitting ? "Sending invite…" : "Create invite"}
          </button>
        </div>
      </form>
    </div>
  );
}

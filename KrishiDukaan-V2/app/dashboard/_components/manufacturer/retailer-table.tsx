"use client";

import { useState } from "react";
import { Check, Copy, Mail, MessageCircle } from "lucide-react";
import type { ManufacturerRetailerRow } from "../../_types/manufacturer-retailers";
import { cn } from "../../_lib/cn";
import {
  buildInviteShareMessage,
  buildMailtoInviteUrl,
  buildSignupInviteUrl,
  buildWhatsAppShareUrl,
} from "../../../lib/invite/invite-utils";

type RetailerTableProps = {
  rows: ManufacturerRetailerRow[];
  loading?: boolean;
};

function statusBadge(status: ManufacturerRetailerRow["status"]) {
  switch (status) {
    case "active":
      return { label: "Active", className: "bg-primary/15 text-primary" };
    case "revoked":
      return { label: "Revoked", className: "bg-on-surface/10 text-on-surface-variant" };
    default:
      return { label: "Invited", className: "bg-harvest/15 text-harvest" };
  }
}

function RowInviteActions({ row }: { row: ManufacturerRetailerRow }) {
  const [copied, setCopied] = useState(false);
  const link = buildSignupInviteUrl(row.inviteCode);
  const message = buildInviteShareMessage(link);
  const whatsappHref = buildWhatsAppShareUrl(message);
  const mailtoHref = buildMailtoInviteUrl({
    to: row.retailerEmail,
    subject: "Your KrishiDukan retailer invite",
    body: message,
  });

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (!row.inviteCode) {
    return <span className="text-xs text-on-surface-variant">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/40 bg-surface-container-low px-2 py-1 text-xs font-medium text-on-surface hover:bg-surface-container"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        Copy link
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/40 bg-surface-container-low px-2 py-1 text-xs font-medium text-on-surface hover:bg-surface-container"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        WhatsApp
      </a>
      <a
        href={mailtoHref}
        className="inline-flex items-center gap-1 rounded-lg border border-outline-variant/40 bg-surface-container-low px-2 py-1 text-xs font-medium text-on-surface hover:bg-surface-container"
      >
        <Mail className="h-3.5 w-3.5" />
        Email
      </a>
    </div>
  );
}

export function RetailerTable({ rows, loading }: RetailerTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-low/40 px-6 py-14 text-center">
        <p className="text-base font-semibold text-on-surface">No retailers yet</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-on-surface-variant">
          Invite a retailer with their email and phone. They will open your signup link to create a
          retailer account and connect to your network.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-outline-variant/30 bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Retailer email</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Phone</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Status</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Added</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Invite actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20">
            {rows.map((row) => {
              const badge = statusBadge(row.status);
              return (
                <tr key={row.id} className="hover:bg-surface-container/50">
                  <td className="px-4 py-3 font-medium text-on-surface">{row.retailerEmail}</td>
                  <td className="px-4 py-3 tabular-nums text-on-surface-variant">{row.retailerPhone}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        badge.className,
                      )}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">{row.addedAtLabel}</td>
                  <td className="px-4 py-3">
                    <RowInviteActions row={row} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

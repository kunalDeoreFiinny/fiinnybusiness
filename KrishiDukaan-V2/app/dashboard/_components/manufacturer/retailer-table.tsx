"use client";

import type { ManufacturerRetailerRow } from "../../_types/manufacturer-retailers";
import { cn } from "../../_lib/cn";

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
          Invite a retailer with their email and phone. They will use the invite code to connect to
          your network when onboarding is ready.
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
              <th className="whitespace-nowrap px-4 py-3 font-medium">Invite code</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Added</th>
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
                  <td className="px-4 py-3">
                    <code className="rounded-md bg-surface-container px-2 py-1 text-xs font-mono text-on-surface">
                      {row.inviteCode}
                    </code>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-on-surface-variant">{row.addedAtLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

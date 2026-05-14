"use client";

import { useState } from "react";
import { Menu, ShieldCheck } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex-1 bg-surface relative overflow-y-auto h-[calc(100vh-64px)]">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-outline-variant/30 bg-surface-container-lowest/90 px-4 backdrop-blur md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-outline-variant/40 bg-surface-container-low p-2 text-on-surface hover:bg-surface-container"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-on-surface">Admin Panel</span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 pb-24 md:p-8 md:pb-8">{children}</main>
      </div>
    </div>
  );
}

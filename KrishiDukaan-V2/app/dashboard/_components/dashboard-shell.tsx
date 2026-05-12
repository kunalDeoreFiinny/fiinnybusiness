"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />

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
          <span className="text-sm font-semibold text-on-surface">Dashboard</span>
        </header>

        <main className="mx-auto w-full max-w-7xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

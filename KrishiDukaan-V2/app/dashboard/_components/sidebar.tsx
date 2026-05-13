"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Package,
  Settings,
  Star,
  UserCircle2,
  X,
} from "lucide-react";
import { cn } from "../_lib/cn";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

type SidebarProps = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

export function Sidebar({ mobileOpen, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 top-16 z-40 bg-on-surface/40 backdrop-blur-sm md:hidden"
          onClick={() => onMobileOpenChange(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed left-0 top-16 z-50 flex h-[calc(100vh-64px)] w-64 flex-col border-r border-outline-variant/30 bg-surface-container-lowest shadow-ambient transition-transform duration-200 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-outline-variant/30 px-4 md:h-16">
          <Link
            href="/dashboard"
            className="font-semibold text-primary"
            onClick={() => onMobileOpenChange(false)}
          >
            Shop Dashboard
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container md:hidden"
            aria-label="Close sidebar"
            onClick={() => onMobileOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => onMobileOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container",
                )}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-outline-variant/30 p-4 text-xs text-on-surface-variant">
          Mock data · KrishiDukaan
        </div>
      </aside>
    </>
  );
}

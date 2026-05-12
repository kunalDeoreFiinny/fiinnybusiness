import type { Metadata } from "next";
import { DashboardShell } from "./_components/dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your KrishiDukaan shop",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardShell>{children}</DashboardShell>;
}

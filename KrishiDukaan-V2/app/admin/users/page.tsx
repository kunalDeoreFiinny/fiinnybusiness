"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Search, Users } from "lucide-react";
import { fetchAllUsers, promoteToAdmin } from "../../firebase";

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-red-100 text-red-700 border border-red-200",
  manufacturer: "bg-blue-100 text-blue-700 border border-blue-200",
  retailer: "bg-green-100 text-green-700 border border-green-200",
  customer: "bg-gray-100 text-gray-600 border border-gray-200",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState("all");

  const load = () => {
    setLoading(true);
    fetchAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handlePromote = async (uid: string, name: string) => {
    if (!confirm(`Promote "${name}" to admin? This grants full platform access.`)) return;
    setPromoting(uid);
    try {
      await promoteToAdmin(uid);
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, role: "admin", isPaid: true } : u));
    } catch (e) {
      alert("Failed to promote user. Check console.");
      console.error(e);
    } finally {
      setPromoting(null);
    }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || [u.name, u.email, u.role, u.id].join(" ").toLowerCase().includes(q);
    const matchRole = filterRole === "all" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const counts = {
    all: users.length,
    retailer: users.filter(u => u.role === "retailer").length,
    manufacturer: users.filter(u => u.role === "manufacturer").length,
    admin: users.filter(u => u.role === "admin").length,
    customer: users.filter(u => !u.role || u.role === "customer").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-black text-on-surface">Users & Roles</h1>
        </div>
        <p className="text-sm text-on-surface-variant ml-9">Manage all platform users. Promote to admin, view connections and subscription status.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["all", "retailer", "manufacturer", "admin", "customer"] as const).map(role => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterRole === role ? "bg-primary text-white shadow-sm" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
          >
            {role === "all" ? "All" : role.charAt(0).toUpperCase() + role.slice(1)} ({counts[role as keyof typeof counts]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-surface-container-low border border-outline-variant rounded-2xl px-4 py-2.5">
        <Search className="h-4 w-4 text-outline shrink-0" />
        <input
          type="text"
          placeholder="Search by name, email or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder-on-surface-variant"
        />
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden">
          <div className="px-5 py-3 border-b border-outline-variant/20 bg-surface-container-low">
            <span className="text-xs font-bold text-on-surface-variant">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-on-surface-variant">User</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Role</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Subscription</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Products</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Seats</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-on-surface">{u.name || "—"}</p>
                      <p className="text-xs text-on-surface-variant truncate max-w-[200px]">{u.email || u.id}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${ROLE_BADGE[u.role] || ROLE_BADGE.customer}`}>
                        {u.role || "customer"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1 text-xs font-bold ${u.isPaid ? "text-green-600" : "text-on-surface-variant"}`}>
                        <span className={`w-2 h-2 rounded-full ${u.isPaid ? "bg-green-500" : "bg-gray-300"}`} />
                        {u.isPaid ? "Active" : "Free"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-on-surface">{u.productCount ?? "—"}</td>
                    <td className="px-5 py-3 text-sm text-on-surface">{u.totalSeats ?? "—"}</td>
                    <td className="px-5 py-3">
                      {u.role !== "admin" ? (
                        <button
                          onClick={() => handlePromote(u.id, u.name || u.email || u.id)}
                          disabled={promoting === u.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-colors disabled:opacity-50"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
                          {promoting === u.id ? "Promoting…" : "Make Admin"}
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant italic">Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-on-surface-variant">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

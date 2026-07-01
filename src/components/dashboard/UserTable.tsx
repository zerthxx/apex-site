"use client";

import { useState, useMemo } from "react";
import { Search, ChevronUp, ChevronDown, User, Ban, CheckCircle } from "lucide-react";
import { RoleBadge } from "./RoleBadge";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  email: string | undefined;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string;
  is_suspended: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  provider: string;
}

const ROLE_OPTIONS_OWNER = ["customer", "employee", "admin", "owner"];
const ROLE_OPTIONS_ADMIN = ["customer", "employee", "admin"];

interface UserTableProps {
  users: AdminUser[];
  currentUserId: string;
  callerRole: string;
}

export function UserTable({ users: initial, currentUserId, callerRole }: UserTableProps) {
  const [users, setUsers] = useState(initial);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"created_at" | "email" | "role">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [pending, setPending] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<{ id: string; msg: string } | null>(null);

  const isOwner = callerRole === "owner";
  const roleOptions = isOwner ? ROLE_OPTIONS_OWNER : ROLE_OPTIONS_ADMIN;

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = users.filter((u) => {
      if (!q) return true;
      return (
        (u.email ?? "").toLowerCase().includes(q) ||
        (u.first_name ?? "").toLowerCase().includes(q) ||
        (u.last_name ?? "").toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) => {
      let av = a[sortKey] ?? "";
      let bv = b[sortKey] ?? "";
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [users, search, sortKey, sortDir]);

  async function patchUser(userId: string, action: string, role?: string) {
    setRoleError(null);
    setPending(userId + action);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, role }),
    });
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          if (action === "suspend") return { ...u, is_suspended: true };
          if (action === "unsuspend") return { ...u, is_suspended: false };
          if (action === "role" && role) return { ...u, role };
          return u;
        })
      );
    } else if (action === "role") {
      const body = await res.json().catch(() => ({}));
      setRoleError({ id: userId, msg: body?.error ?? "Virhe" });
    }
    setPending(null);
  }

  function isRoleChangeable(u: AdminUser) {
    if (u.id === currentUserId) return false;
    if (!isOwner && u.role === "owner") return false;
    return true;
  }

  function SortIcon({ k }: { k: typeof sortKey }) {
    if (sortKey !== k) return <ChevronDown size={13} className="opacity-30" />;
    return sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-ghost" />
        <input
          type="text"
          placeholder="Hae nimellä tai sähköpostilla..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-10 rounded-lg bg-elevated border border-wire text-sm text-ink placeholder:text-ink-ghost focus:outline-none focus:border-copper/50 transition-colors"
        />
      </div>

      {/* Count */}
      <p className="text-xs text-ink-ghost">{filtered.length} käyttäjää</p>

      {/* Table */}
      <div className="rounded-xl border border-wire overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wire bg-surface/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wide">
                  Käyttäjä
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wide cursor-pointer select-none hover:text-ink transition-colors"
                  onClick={() => toggleSort("role")}
                >
                  <span className="flex items-center gap-1">Rooli <SortIcon k="role" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wide">
                  Tila
                </th>
                <th
                  className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wide cursor-pointer select-none hover:text-ink transition-colors"
                  onClick={() => toggleSort("created_at")}
                >
                  <span className="flex items-center gap-1">Rekisteröityi <SortIcon k="created_at" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-ghost uppercase tracking-wide">
                  Toiminnot
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wire bg-elevated">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface/30 transition-colors">
                  {/* User */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-copper/10 border border-copper/20 flex items-center justify-center shrink-0">
                        <span className="text-copper text-xs font-bold">
                          {(u.first_name?.[0] ?? u.email?.[0] ?? "?").toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-ink leading-none">
                          {u.first_name && u.last_name
                            ? `${u.first_name} ${u.last_name}`
                            : u.email ?? "—"}
                        </p>
                        <p className="text-xs text-ink-ghost mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <select
                        value={u.role}
                        onChange={(e) => patchUser(u.id, "role", e.target.value)}
                        disabled={!isRoleChangeable(u) || pending === u.id + "role"}
                        className="text-xs bg-elevated border border-wire rounded-lg px-2 py-1 text-ink focus:outline-none focus:border-copper/50 transition-colors disabled:opacity-50"
                        title={
                          u.id === currentUserId
                            ? "Et voi muuttaa omaa rooliasi"
                            : !isOwner && u.role === "owner"
                            ? "Vain owner voi muuttaa ownerin roolia"
                            : undefined
                        }
                      >
                        {roleOptions.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                        {/* Show current role even if not in roleOptions (e.g. admin sees an owner) */}
                        {!roleOptions.includes(u.role) && (
                          <option value={u.role}>{u.role}</option>
                        )}
                      </select>
                      {roleError?.id === u.id && (
                        <p className="text-[10px] text-bad">{roleError.msg}</p>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {u.is_suspended ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bad/10 text-bad border border-bad/20">
                        <Ban size={10} /> Jäädytetty
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-ok/10 text-ok border border-ok/20">
                        <CheckCircle size={10} /> Aktiivinen
                      </span>
                    )}
                  </td>

                  {/* Registered */}
                  <td className="px-4 py-3 text-xs text-ink-ghost whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString("fi-FI", { day: "numeric", month: "short", year: "numeric" })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => patchUser(u.id, u.is_suspended ? "unsuspend" : "suspend")}
                      disabled={pending !== null}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40",
                        u.is_suspended
                          ? "text-ok border-ok/20 hover:bg-ok/5"
                          : "text-bad border-bad/20 hover:bg-bad/5"
                      )}
                    >
                      {u.is_suspended ? "Palauta" : "Jäädytä"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-12 text-ink-ghost text-sm bg-elevated">
            Ei tuloksia.
          </div>
        )}
      </div>
    </div>
  );
}

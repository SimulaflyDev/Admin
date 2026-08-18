"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Download, Users as UsersIcon, Loader2 } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { listUsers, reactivateUser, suspendUser } from "@/lib/api/admin"
import type { UserListItem } from "@/lib/api/types"
import { ApiError } from "@/lib/api/types"

const PAGE_SIZE = 25

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

export default function UserDirectory() {
  const [users, setUsers] = useState<UserListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listUsers({
        page,
        page_size: PAGE_SIZE,
        search: debounced || undefined,
        sort: "-created_at",
      })
      setUsers(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load users from the server."
      )
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [page, debounced])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  async function toggleStatus(user: UserListItem) {
    setBusyId(user.id)
    try {
      if (user.is_active) await suspendUser(user.id)
      else await reactivateUser(user.id)
      await fetchUsers()
    } catch {
      // surfaced via a full refetch / error banner on next load
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Directory</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage platform consumers · {total.toLocaleString()} total
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search name or email…"
              className="pl-9 bg-slate-50 border-slate-200 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error ? (
          <div className="p-6 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading users…</span>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            description="No users match your current search criteria."
            actionLabel="Clear Search"
            onAction={() => setSearch("")}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>User &amp; Contact</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead>Acquisition</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="font-bold text-slate-900">{user.full_name || "—"}</div>
                      <div className="text-xs font-medium text-slate-500">{user.email}</div>
                      <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                        ID: {user.id.slice(0, 8)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold tracking-wider uppercase ${
                          user.is_active
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {user.is_active ? "Active" : "Suspended"}
                      </Badge>
                      <div className="text-xs text-slate-400 mt-1">
                        Joined: {formatDate(user.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-slate-700 capitalize">
                        {user.attribution?.acquisition_source ?? "organic"}
                      </div>
                      {user.attribution?.referring_merchant_name ? (
                        <div className="text-xs text-slate-400">
                          via {user.attribution.referring_merchant_name}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/users/${user.id}`}
                          className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-bold hover:bg-indigo-100 text-indigo-600 bg-indigo-50 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => toggleStatus(user)}
                          disabled={busyId === user.id}
                          className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-bold transition-colors disabled:opacity-50 ${
                            user.is_active
                              ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
                              : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                          }`}
                        >
                          {busyId === user.id
                            ? "…"
                            : user.is_active
                            ? "Suspend"
                            : "Reactivate"}
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
            <span>
              Page {page} of {totalPages} · {total.toLocaleString()} users
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                &lt;
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

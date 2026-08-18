"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Store, Loader2 } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import { listMerchants, suspendMerchant, activateMerchant } from "@/lib/api/directory"
import type { MerchantListItem } from "@/lib/api/types"
import { ApiError } from "@/lib/api/types"

// NOTE: In this product each *merchant row is a storefront (shop)* — it carries
// its own shop_id/address. The legacy `stores` table is never populated, so the
// Store Directory is sourced from the merchants endpoint and presents each
// merchant as a shop. Opening a shop links to its merchant detail (where all
// shops run by the same owner are grouped).

const PAGE_SIZE = 25

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 border-emerald-200",
  suspended: "bg-red-100 text-red-800 border-red-200",
  trial: "bg-amber-100 text-amber-800 border-amber-200",
}

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

export default function StoreDirectory() {
  const [shops, setShops] = useState<MerchantListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [status, setStatus] = useState("all")
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

  const fetchShops = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listMerchants({
        page,
        page_size: PAGE_SIZE,
        search: debounced || undefined,
        status: status === "all" ? undefined : status,
        sort: "-created_at",
      })
      setShops(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load shops from the server."
      )
      setShops([])
    } finally {
      setLoading(false)
    }
  }, [page, debounced, status])

  useEffect(() => {
    void fetchShops()
  }, [fetchShops])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  async function toggleStatus(shop: MerchantListItem) {
    setBusyId(shop.id)
    try {
      if (shop.status === "suspended") await activateMerchant(shop.id)
      else await suspendMerchant(shop.id)
      await fetchShops()
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Store Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Every shop / storefront on the platform · {total.toLocaleString()} total
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search shop name…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v ?? "all"); setPage(1) }}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <div className="p-6 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading shops…</span>
          </div>
        ) : shops.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No shops found"
            description="No shops match your current search criteria."
            actionLabel="Clear Filters"
            onAction={() => { setSearch(""); setStatus("all") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Shop</TableHead>
                  <TableHead>Shop ID</TableHead>
                  <TableHead>Legal Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map((shop) => (
                  <TableRow key={shop.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="font-medium text-slate-900">{shop.display_name || "—"}</div>
                      <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
                        ID: {shop.id.slice(0, 8)}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="font-bold text-slate-700">{shop.shop_id || "—"}</div>
                      <div className="text-slate-400 mt-0.5">{shop.partner_id || ""}</div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">{shop.legal_name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-slate-500">{formatDate(shop.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs capitalize ${statusStyles[shop.status] ?? ""}`}>
                        {shop.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(shop)}
                          disabled={busyId === shop.id}
                          className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-bold transition-colors disabled:opacity-50 ${
                            shop.status === "suspended"
                              ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                              : "text-rose-600 bg-rose-50 hover:bg-rose-100"
                          }`}
                        >
                          {busyId === shop.id ? "…" : shop.status === "suspended" ? "Activate" : "Suspend"}
                        </button>
                        <Link
                          href={`/merchants/${shop.id}`}
                          className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-bold hover:bg-indigo-100 text-indigo-600 bg-indigo-50 transition-colors"
                        >
                          Manage →
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && shops.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
            <span>Page {page} of {totalPages} · {total.toLocaleString()} shops</span>
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

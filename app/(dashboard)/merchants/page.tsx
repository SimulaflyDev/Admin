"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Building2, Search, ShieldCheck, ShieldAlert, ArrowRight, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"
import { activateMerchant, listMerchants, suspendMerchant } from "@/lib/api/directory"
import type { MerchantListItem } from "@/lib/api/types"
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

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  suspended: "bg-red-50 text-red-700",
  trial: "bg-amber-50 text-amber-700",
}

export default function MerchantDirectory() {
  const [merchants, setMerchants] = useState<MerchantListItem[]>([])
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

  const fetchMerchants = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listMerchants({
        page,
        page_size: PAGE_SIZE,
        search: debounced || undefined,
        status: status === "all" ? undefined : status,
        sort: "-created_at",
        primary_only: true,
      })
      setMerchants(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load merchants from the server."
      )
      setMerchants([])
    } finally {
      setLoading(false)
    }
  }, [page, debounced, status])

  useEffect(() => {
    void fetchMerchants()
  }, [fetchMerchants])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  async function toggleStatus(merchant: MerchantListItem) {
    setBusyId(merchant.id)
    try {
      if (merchant.status === "suspended") await activateMerchant(merchant.id)
      else await suspendMerchant(merchant.id)
      await fetchMerchants()
    } catch {
      // surfaced via a full refetch / error banner on next load
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Merchant Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Each row is a shop; open a shop to see all shops run by the same owner · {total.toLocaleString()} total
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search by merchant name…"
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v ?? "all"); setPage(1) }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <div className="p-6 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading merchants…</span>
          </div>
        ) : merchants.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No merchants found"
            description="No merchants match your current search criteria."
            actionLabel="Clear Search"
            onAction={() => { setSearch(""); setStatus("all") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-slate-50/80 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Merchant</th>
                  <th className="px-6 py-4">Shop ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">KYC</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {merchants.map((merchant) => (
                  <tr key={merchant.id} className="bg-white hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{merchant.display_name || "—"}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{merchant.legal_name}</div>
                          <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
                            ID: {merchant.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {merchant.shop_id || merchant.partner_id ? (
                        <div className="font-mono text-xs">
                          <div className="font-bold text-slate-700">{merchant.shop_id || "—"}</div>
                          <div className="text-slate-400 mt-0.5">{merchant.partner_id || ""}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                        statusStyles[merchant.status] ?? "bg-slate-100 text-slate-600"
                      }`}>
                        {merchant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {merchant.is_kyc_completed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                          <ShieldAlert className="h-3.5 w-3.5" /> Pending KYC
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(merchant.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(merchant)}
                          disabled={busyId === merchant.id}
                          className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-bold transition-colors disabled:opacity-50 ${
                            merchant.status === "suspended"
                              ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                              : "text-rose-600 bg-rose-50 hover:bg-rose-100"
                          }`}
                        >
                          {busyId === merchant.id
                            ? "…"
                            : merchant.status === "suspended"
                            ? "Activate"
                            : "Suspend"}
                        </button>
                        <Link
                          href={`/merchants/${merchant.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && merchants.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
            <span>Page {page} of {totalPages} · {total.toLocaleString()} merchants</span>
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

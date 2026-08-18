"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Wallet,
  Search,
  Loader2,
  AlertTriangle,
  X,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import {
  listWallets,
  adjustWallet,
  formatINR,
  toNumber,
  type WalletListItem,
  type AdjustmentDirection,
} from "@/lib/api/finance"
import { ApiError } from "@/lib/api/types"

const PAGE_SIZE = 25

function walletStatusBadge(status: string): string {
  const s = status.toLowerCase()
  if (s === "active" || s === "healthy")
    return "bg-emerald-100 text-emerald-800 border-emerald-200"
  if (s.includes("frozen") || s.includes("suspend") || s.includes("exhaust"))
    return "bg-rose-100 text-rose-800 border-rose-200"
  return "bg-slate-100 text-slate-700 border-slate-200"
}

function isLowBalance(w: WalletListItem): boolean {
  return toNumber(w.balance) < toNumber(w.low_balance_threshold)
}

export default function WalletDirectory() {
  const [wallets, setWallets] = useState<WalletListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [belowThreshold, setBelowThreshold] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Adjust modal state.
  const [adjustTarget, setAdjustTarget] = useState<WalletListItem | null>(null)
  const [direction, setDirection] = useState<AdjustmentDirection>("credit")
  const [amount, setAmount] = useState("")
  const [adjusting, setAdjusting] = useState(false)
  const [adjustError, setAdjustError] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchWallets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listWallets({
        page,
        page_size: PAGE_SIZE,
        search: debounced || undefined,
        below_threshold: belowThreshold || undefined,
        sort: "-created_at",
      })
      setWallets(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load wallets from the server."
      )
      setWallets([])
    } finally {
      setLoading(false)
    }
  }, [page, debounced, belowThreshold])

  useEffect(() => {
    void fetchWallets()
  }, [fetchWallets])

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
    [total]
  )

  function openAdjust(w: WalletListItem) {
    setAdjustTarget(w)
    setDirection("credit")
    setAmount("")
    setAdjustError(null)
  }

  function closeAdjust() {
    setAdjustTarget(null)
    setAdjustError(null)
    setAmount("")
  }

  async function submitAdjust() {
    if (!adjustTarget) return
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setAdjustError("Enter a positive amount.")
      return
    }
    setAdjusting(true)
    setAdjustError(null)
    try {
      await adjustWallet(adjustTarget.id, { direction, amount: value })
      closeAdjust()
      await fetchWallets()
    } catch (err) {
      if (err instanceof ApiError) {
        // 422 → over-debit / validation: surface the backend message gracefully.
        setAdjustError(
          err.status === 422
            ? err.message ||
                "Adjustment rejected: insufficient balance for this debit."
            : err.message
        )
      } else {
        setAdjustError("Adjustment failed. Please try again.")
      }
    } finally {
      setAdjusting(false)
    }
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-indigo-600" />
            Merchant Wallets
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Platform-wide wallet balances (INR) · {total.toLocaleString("en-IN")}{" "}
            total
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search merchant…"
              className="pl-9 bg-slate-50 border-slate-200 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setBelowThreshold((v) => !v)
              setPage(1)
            }}
            className={`inline-flex h-9 items-center gap-2 px-4 rounded-lg text-sm font-semibold border transition-colors ${
              belowThreshold
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            Low balance only
          </button>
        </div>

        {error ? (
          <div className="p-6 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading wallets…</span>
          </div>
        ) : wallets.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No wallets found"
            description="No merchant wallets match your current filters."
            actionLabel={belowThreshold || search ? "Clear filters" : undefined}
            onAction={
              belowThreshold || search
                ? () => {
                    setSearch("")
                    setBelowThreshold(false)
                  }
                : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wallets.map((w) => {
                  const low = isLowBalance(w)
                  return (
                    <TableRow key={w.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="font-bold text-slate-900">
                          {w.merchant_name || "—"}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                          ID: {w.merchant_id.slice(0, 8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`font-bold ${
                            low ? "text-rose-600" : "text-emerald-700"
                          }`}
                        >
                          {formatINR(w.balance)}
                        </span>
                        {low ? (
                          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">
                            Low balance
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold tracking-wider uppercase ${walletStatusBadge(
                            w.status
                          )}`}
                        >
                          {w.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {formatINR(w.low_balance_threshold)}
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          onClick={() => openAdjust(w)}
                          className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-bold hover:bg-indigo-100 text-indigo-600 bg-indigo-50 transition-colors"
                        >
                          Adjust
                        </button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && wallets.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
            <span>
              Page {page} of {totalPages} · {total.toLocaleString("en-IN")} wallets
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

      {/* ── Adjust Modal ── */}
      {adjustTarget && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Adjust Wallet</h3>
              <button
                onClick={closeAdjust}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {adjustTarget.merchant_name || "—"}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Current balance:{" "}
                  <span className="font-bold text-slate-700">
                    {formatINR(adjustTarget.balance)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                  Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDirection("credit")}
                    className={`inline-flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold border transition-colors ${
                      direction === "credit"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <ArrowDownLeft className="h-4 w-4" /> Credit
                  </button>
                  <button
                    onClick={() => setDirection("debit")}
                    className={`inline-flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-semibold border transition-colors ${
                      direction === "debit"
                        ? "bg-rose-50 text-rose-700 border-rose-300"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4" /> Debit
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                  Amount (₹)
                </label>
                <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                  <div className="bg-slate-50 px-3 py-2 border-r border-slate-300 text-slate-500 text-sm font-bold">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              {adjustError ? (
                <div className="p-3 rounded-lg text-sm text-rose-700 bg-rose-50 border border-rose-200 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{adjustError}</span>
                </div>
              ) : null}
            </div>
            <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={closeAdjust}
                disabled={adjusting}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitAdjust}
                disabled={adjusting}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-70 inline-flex items-center gap-2"
              >
                {adjusting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {adjusting ? "Applying…" : "Apply Adjustment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

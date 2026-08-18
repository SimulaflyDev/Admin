"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Box, Loader2 } from "lucide-react"
import { EmptyState } from "@/components/ui/empty-state"
import {
  listProducts,
  updateProductStatus,
  type ProductListItem,
  type ProductStatus,
} from "@/lib/api/directory"
import { ApiError } from "@/lib/api/types"

const PAGE_SIZE = 25

const PRODUCT_STATUSES: ProductStatus[] = [
  "draft",
  "published",
  "paused_insufficient_funds",
  "archived",
]

const statusLabels: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  paused_insufficient_funds: "Paused (Funds)",
  archived: "Archived",
}

const statusStyles: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-800 border-emerald-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  paused_insufficient_funds: "bg-amber-100 text-amber-800 border-amber-200",
  archived: "bg-red-100 text-red-800 border-red-200",
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

function formatPrice(price?: number | string | null): string {
  if (price === null || price === undefined || price === "") return "—"
  const n = typeof price === "string" ? Number(price) : price
  if (Number.isNaN(n)) return "—"
  return `₹${n.toLocaleString()}`
}

export default function ProductDirectory() {
  const [products, setProducts] = useState<ProductListItem[]>([])
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

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listProducts({
        page,
        page_size: PAGE_SIZE,
        search: debounced || undefined,
        status: status === "all" ? undefined : status,
        sort: "-created_at",
      })
      setProducts(res.items)
      setTotal(res.total)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load products from the server."
      )
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [page, debounced, status])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  async function changeStatus(product: ProductListItem, next: ProductStatus) {
    if (next === product.status) return
    setBusyId(product.id)
    try {
      await updateProductStatus(product.id, next)
      await fetchProducts()
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Product Directory</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Products across all merchants · {total.toLocaleString()} total
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
              placeholder="Search product title…"
              className="pl-9 bg-slate-50 border-slate-200 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v ?? "all"); setPage(1) }}>
            <SelectTrigger className="w-[200px] text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {PRODUCT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <div className="p-6 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading products…</span>
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Box}
            title="No products found"
            description="No products match your current search criteria."
            actionLabel="Clear Filters"
            onAction={() => { setSearch(""); setStatus("all") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <div className="font-bold text-slate-900">{product.title}</div>
                      <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-mono">
                        ID: {product.id.slice(0, 8)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">{product.merchant_name ?? "—"}</TableCell>
                    <TableCell className="text-sm font-bold text-slate-900">{formatPrice(product.price)}</TableCell>
                    <TableCell className="text-sm text-slate-500">{formatDate(product.created_at)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase tracking-wider ${statusStyles[product.status] ?? ""}`}
                      >
                        {statusLabels[product.status] ?? product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={product.status}
                        onValueChange={(v) => changeStatus(product, v as ProductStatus)}
                        disabled={busyId === product.id}
                      >
                        <SelectTrigger className="w-[170px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PRODUCT_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/products/${product.id}`}
                        className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-bold hover:bg-indigo-100 text-indigo-600 bg-indigo-50 transition-colors"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
            <span>Page {page} of {totalPages} · {total.toLocaleString()} products</span>
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

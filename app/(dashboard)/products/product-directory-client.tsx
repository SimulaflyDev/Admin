"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Box, Eye, Grid3X3, List, Loader2, Package, Plus, Search, Trash2, Upload, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import {
  archiveProduct,
  bulkCreateProducts,
  createProduct,
  listMerchants,
  listProducts,
  updateProductStatus,
  type ProductListItem,
  type ProductMutationPayload,
  type ProductStatus,
} from "@/lib/api/directory"
import type { MerchantListItem } from "@/lib/api/types"
import { ApiError } from "@/lib/api/types"

const PAGE_SIZE = 25
const PRODUCT_STATUSES: ProductStatus[] = ["draft", "published", "paused_insufficient_funds", "archived"]
const statusLabels: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  paused_insufficient_funds: "Paused (Funds)",
  archived: "Archived / Hidden",
}
const statusStyles: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-800 border-emerald-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  paused_insufficient_funds: "bg-amber-100 text-amber-800 border-amber-200",
  archived: "bg-red-100 text-red-800 border-red-200",
}

type ProductForm = {
  merchant_id: string
  sku: string
  title: string
  description: string
  category: string
  subcategory: string
  brand: string
  status: ProductStatus
  primary_image_url: string
  price: string
  in_app_stock: string
}

const emptyForm: ProductForm = {
  merchant_id: "", sku: "", title: "", description: "", category: "",
  subcategory: "", brand: "", status: "draft", primary_image_url: "", price: "", in_app_stock: "",
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) }
  catch { return iso }
}

function formatPrice(price?: number | string | null): string {
  if (price === null || price === undefined || price === "") return "-"
  const value = typeof price === "string" ? Number(price) : price
  return Number.isNaN(value) ? "-" : `₹${value.toLocaleString("en-IN")}`
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let value = ""
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"') {
      if (quoted && line[index + 1] === '"') { value += '"'; index += 1 }
      else quoted = !quoted
    } else if (char === "," && !quoted) { values.push(value.trim()); value = "" }
    else value += char
  }
  values.push(value.trim())
  return values
}

function parseBulkProducts(csv: string, merchantId: string): ProductMutationPayload[] {
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  if (lines[0]?.toLowerCase().startsWith("sku,")) lines.shift()
  return lines.map((line, index) => {
    const [sku, title, price, stock, category, brand, imageUrl, rawStatus] = parseCsvLine(line)
    if (!sku || !title) throw new Error(`Row ${index + 1}: SKU and title are required.`)
    const status = (rawStatus || "draft") as ProductStatus
    if (!PRODUCT_STATUSES.includes(status)) throw new Error(`Row ${index + 1}: invalid status '${status}'.`)
    const parsedPrice = price ? Number(price) : undefined
    const parsedStock = stock ? Number(stock) : undefined
    if (parsedPrice !== undefined && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) throw new Error(`Row ${index + 1}: invalid price.`)
    if (parsedStock !== undefined && (!Number.isInteger(parsedStock) || parsedStock < 0)) throw new Error(`Row ${index + 1}: invalid stock.`)
    return {
      merchant_id: merchantId, sku, title, status, price: parsedPrice, in_app_stock: parsedStock,
      category: category || undefined, brand: brand || undefined, primary_image_url: imageUrl || undefined,
    }
  })
}

export default function ProductDirectoryClient() {
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [merchants, setMerchants] = useState<MerchantListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")
  const [status, setStatus] = useState("all")
  const [sort, setSort] = useState("-created_at")
  const [view, setView] = useState<"table" | "preview">("table")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [addMode, setAddMode] = useState<"single" | "bulk">("single")
  const [form, setForm] = useState<ProductForm>(emptyForm)
  const [bulkMerchantId, setBulkMerchantId] = useState("")
  const [bulkCsv, setBulkCsv] = useState("sku,title,price,stock,category,brand,image_url,status\n")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => { setDebounced(search); setPage(1) }, 350)
    return () => clearTimeout(timer)
  }, [search])

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const response = await listProducts({
        page, page_size: PAGE_SIZE, search: debounced || undefined,
        status: status === "all" ? undefined : status, sort,
      })
      setProducts(response.items); setTotal(response.total)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load products."); setProducts([])
    } finally { setLoading(false) }
  }, [page, debounced, status, sort])

  useEffect(() => { void fetchProducts() }, [fetchProducts])
  useEffect(() => {
    if (!addOpen || merchants.length > 0) return
    listMerchants({ page: 1, page_size: 100, sort: "display_name" })
      .then((response) => setMerchants(response.items)).catch(() => setMerchants([]))
  }, [addOpen, merchants.length])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total])

  async function changeStatus(product: ProductListItem, next: ProductStatus) {
    if (next === product.status) return
    setBusyId(product.id)
    try { await updateProductStatus(product.id, next); await fetchProducts() }
    catch (err) { setError(err instanceof ApiError ? err.message : "Failed to update visibility.") }
    finally { setBusyId(null) }
  }

  async function hideProduct(product: ProductListItem) {
    if (product.status === "archived") return
    if (!window.confirm(`Hide '${product.title}' from the app? The database record will be kept.`)) return
    setBusyId(product.id)
    try { await archiveProduct(product.id); await fetchProducts() }
    catch (err) { setError(err instanceof ApiError ? err.message : "Failed to hide product.") }
    finally { setBusyId(null) }
  }

  async function submitProducts() {
    setFormError(null); setSubmitting(true)
    try {
      if (addMode === "single") {
        if (!form.merchant_id || !form.sku.trim() || !form.title.trim()) throw new Error("Merchant, SKU, and title are required.")
        await createProduct({
          merchant_id: form.merchant_id, sku: form.sku.trim(), title: form.title.trim(), status: form.status,
          description: form.description.trim() || undefined, category: form.category.trim() || undefined,
          subcategory: form.subcategory.trim() || undefined, brand: form.brand.trim() || undefined,
          primary_image_url: form.primary_image_url.trim() || undefined,
          price: form.price ? Number(form.price) : undefined,
          in_app_stock: form.in_app_stock ? Number(form.in_app_stock) : undefined,
        })
      } else {
        if (!bulkMerchantId) throw new Error("Select the shop that owns these products.")
        const items = parseBulkProducts(bulkCsv, bulkMerchantId)
        if (!items.length) throw new Error("Add at least one CSV product row.")
        await bulkCreateProducts(items)
      }
      setAddOpen(false); setForm(emptyForm); setBulkMerchantId("")
      setBulkCsv("sku,title,price,stock,category,brand,image_url,status\n"); setPage(1)
      await fetchProducts()
    } catch (err) { setFormError(err instanceof Error ? err.message : "Failed to add products.") }
    finally { setSubmitting(false) }
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Product Directory</h1><p className="text-sm font-medium text-slate-500 mt-1">Products across all merchants · {total.toLocaleString()} total</p></div>
        <button onClick={() => setAddOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-indigo-700"><Plus className="h-4 w-4" /> Add Products</button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-3 p-4 border-b border-slate-100">
          <div className="relative flex-1 min-w-[220px]"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" /><Input type="search" placeholder="Search product title…" className="pl-9 bg-slate-50" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <Select value={status} onValueChange={(value) => { setStatus(value ?? "all"); setPage(1) }}><SelectTrigger className="w-full lg:w-[190px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem>{PRODUCT_STATUSES.map((item) => <SelectItem key={item} value={item}>{statusLabels[item]}</SelectItem>)}</SelectContent></Select>
          <Select value={sort} onValueChange={(value) => { setSort(value ?? "-created_at"); setPage(1) }}><SelectTrigger className="w-full lg:w-[190px]"><SelectValue placeholder="Sort by" /></SelectTrigger><SelectContent><SelectItem value="-created_at">Newest first</SelectItem><SelectItem value="created_at">Oldest first</SelectItem><SelectItem value="title">Name A–Z</SelectItem><SelectItem value="-price">Price high–low</SelectItem><SelectItem value="price">Price low–high</SelectItem></SelectContent></Select>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1"><button aria-label="Table view" onClick={() => setView("table")} className={`flex-1 rounded-md p-2 ${view === "table" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}><List className="h-4 w-4" /></button><button aria-label="Product preview" onClick={() => setView("preview")} className={`flex-1 rounded-md p-2 ${view === "preview" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}><Grid3X3 className="h-4 w-4" /></button></div>
        </div>
        {error && <div className="p-4 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>}
        {loading ? <Loading /> : products.length === 0 ? (
          <EmptyState icon={Box} title="No products found" description="No products match your current filters." actionLabel="Clear Filters" onAction={() => { setSearch(""); setStatus("all"); setSort("-created_at") }} />
        ) : view === "preview" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-4 bg-slate-50/50">
            {products.map((product) => <ProductCard key={product.id} product={product} busy={busyId === product.id} onHide={hideProduct} />)}
          </div>
        ) : (
          <div className="overflow-x-auto"><Table><TableHeader className="bg-slate-50"><TableRow><TableHead>Product</TableHead><TableHead>Merchant</TableHead><TableHead>Price / Stock</TableHead><TableHead>Created</TableHead><TableHead>Visibility</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{products.map((product) => (
            <TableRow key={product.id} className="hover:bg-slate-50">
              <TableCell><div className="flex items-center gap-3"><ProductImage product={product} small /><div><div className="font-bold text-slate-900">{product.title}</div><div className="text-[10px] text-slate-400 mt-1 font-mono">{product.sku} · {product.category || "Uncategorised"}</div></div></div></TableCell>
              <TableCell className="text-sm text-slate-700">{product.merchant_name ?? "-"}</TableCell><TableCell><div className="text-sm font-bold text-slate-900">{formatPrice(product.price)}</div><div className="text-xs text-slate-400">{product.in_app_stock ?? "-"} in stock</div></TableCell><TableCell className="text-sm text-slate-500">{formatDate(product.created_at)}</TableCell>
              <TableCell><Select value={product.status} onValueChange={(value) => void changeStatus(product, value as ProductStatus)} disabled={busyId === product.id}><SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{PRODUCT_STATUSES.map((item) => <SelectItem key={item} value={item}>{statusLabels[item]}</SelectItem>)}</SelectContent></Select></TableCell>
              <TableCell className="text-right"><div className="inline-flex gap-2"><Link href={`/products/${product.id}`} className="inline-flex h-8 items-center rounded-lg bg-indigo-50 px-3 text-xs font-bold text-indigo-600 hover:bg-indigo-100">Preview / Edit</Link><button title="Hide from app" disabled={product.status === "archived" || busyId === product.id} onClick={() => void hideProduct(product)} className="inline-flex h-8 items-center rounded-lg bg-rose-50 px-2 text-rose-600 hover:bg-rose-100 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button></div></TableCell>
            </TableRow>
          ))}</TableBody></Table></div>
        )}
        {!loading && products.length > 0 && <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50"><span>Page {page} of {totalPages} · {total.toLocaleString()} products</span><div className="flex gap-1"><button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page <= 1} className="px-3 py-1 bg-white border rounded disabled:opacity-40">&lt;</button><button onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page >= totalPages} className="px-3 py-1 bg-white border rounded disabled:opacity-40">&gt;</button></div></div>}
      </div>
      {addOpen && <AddProductDialog mode={addMode} setMode={setAddMode} form={form} setForm={setForm} merchants={merchants} bulkMerchantId={bulkMerchantId} setBulkMerchantId={setBulkMerchantId} bulkCsv={bulkCsv} setBulkCsv={setBulkCsv} submitting={submitting} error={formError} onClose={() => setAddOpen(false)} onSubmit={submitProducts} />}
    </div>
  )
}

function Loading() { return <div className="flex items-center justify-center gap-2 py-16 text-slate-400"><Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm font-medium">Loading products…</span></div> }

function ProductImage({ product, small = false }: { product: ProductListItem; small?: boolean }) {
  return <div className={`${small ? "h-11 w-11 rounded-lg" : "aspect-[4/3] w-full"} bg-slate-100 overflow-hidden flex items-center justify-center shrink-0`}>{product.primary_image_url ? <img src={product.primary_image_url} alt={small ? "" : product.title} className="h-full w-full object-cover" /> : <Package className={`${small ? "h-5 w-5" : "h-10 w-10"} text-slate-300`} />}</div>
}

function ProductCard({ product, busy, onHide }: { product: ProductListItem; busy: boolean; onHide: (product: ProductListItem) => Promise<void> }) {
  return <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"><ProductImage product={product} /><div className="p-4 space-y-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-bold text-slate-900 truncate">{product.title}</h2><p className="text-xs text-slate-500 truncate">{product.merchant_name ?? "Unknown merchant"}</p></div><Badge variant="outline" className={`text-[9px] shrink-0 ${statusStyles[product.status] ?? ""}`}>{statusLabels[product.status] ?? product.status}</Badge></div><div className="flex items-end justify-between"><span className="text-lg font-black text-slate-900">{formatPrice(product.price)}</span><span className="text-xs text-slate-500">Stock {product.in_app_stock ?? "-"}</span></div><div className="flex gap-2"><Link href={`/products/${product.id}`} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"><Eye className="h-3.5 w-3.5" /> Preview / Edit</Link><button aria-label="Hide product" disabled={product.status === "archived" || busy} onClick={() => void onHide(product)} className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button></div></div></article>
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) { return <label className={className}><span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</span>{children}</label> }
function MerchantSelect({ value, merchants, onChange }: { value: string; merchants: MerchantListItem[]; onChange: (value: string) => void }) { return <Select value={value} onValueChange={(next) => onChange(next ?? "")}><SelectTrigger><SelectValue placeholder="Select merchant shop" /></SelectTrigger><SelectContent>{merchants.map((merchant) => <SelectItem key={merchant.id} value={merchant.id}>{merchant.display_name} · {merchant.shop_id ?? merchant.id.slice(0, 8)}</SelectItem>)}</SelectContent></Select> }

type DialogProps = {
  mode: "single" | "bulk"; setMode: (mode: "single" | "bulk") => void
  form: ProductForm; setForm: React.Dispatch<React.SetStateAction<ProductForm>>
  merchants: MerchantListItem[]; bulkMerchantId: string; setBulkMerchantId: (value: string) => void
  bulkCsv: string; setBulkCsv: (value: string) => void; submitting: boolean; error: string | null
  onClose: () => void; onSubmit: () => Promise<void>
}

function AddProductDialog(props: DialogProps) {
  const { mode, setMode, form, setForm, merchants, bulkMerchantId, setBulkMerchantId, bulkCsv, setBulkCsv, submitting, error, onClose, onSubmit } = props
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Add products"><div className="bg-white rounded-2xl shadow-2xl border w-full max-w-3xl max-h-[92vh] overflow-y-auto"><div className="sticky top-0 z-10 bg-white p-5 border-b flex items-center justify-between"><div><h2 className="text-lg font-bold">Add Products</h2><p className="text-xs text-slate-500 mt-1">Create one product or import up to 100 rows.</p></div><button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="p-5 space-y-5"><div className="inline-flex rounded-xl bg-slate-100 p-1"><button onClick={() => setMode("single")} className={`rounded-lg px-4 py-2 text-sm font-bold ${mode === "single" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}><Plus className="inline h-4 w-4 mr-1.5" />Single</button><button onClick={() => setMode("bulk")} className={`rounded-lg px-4 py-2 text-sm font-bold ${mode === "bulk" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}><Upload className="inline h-4 w-4 mr-1.5" />Bulk CSV</button></div>{error && <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>}{mode === "single" ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Field label="Merchant shop" className="sm:col-span-2"><MerchantSelect value={form.merchant_id} merchants={merchants} onChange={(value) => setForm((current) => ({ ...current, merchant_id: value }))} /></Field><Field label="SKU"><Input value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} /></Field><Field label="Title"><Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></Field><Field label="Category"><Input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} /></Field><Field label="Subcategory"><Input value={form.subcategory} onChange={(event) => setForm((current) => ({ ...current, subcategory: event.target.value }))} /></Field><Field label="Brand"><Input value={form.brand} onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))} /></Field><Field label="Status"><Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value as ProductStatus }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRODUCT_STATUSES.map((item) => <SelectItem key={item} value={item}>{statusLabels[item]}</SelectItem>)}</SelectContent></Select></Field><Field label="Price (₹)"><Input type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} /></Field><Field label="Stock"><Input type="number" min="0" step="1" value={form.in_app_stock} onChange={(event) => setForm((current) => ({ ...current, in_app_stock: event.target.value }))} /></Field><Field label="Primary image URL" className="sm:col-span-2"><Input type="url" value={form.primary_image_url} onChange={(event) => setForm((current) => ({ ...current, primary_image_url: event.target.value }))} /></Field><Field label="Description" className="sm:col-span-2"><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-md border px-3 py-2 text-sm" /></Field></div> : <div className="space-y-4"><Field label="Merchant shop"><MerchantSelect value={bulkMerchantId} merchants={merchants} onChange={setBulkMerchantId} /></Field><Field label="CSV rows"><textarea value={bulkCsv} onChange={(event) => setBulkCsv(event.target.value)} rows={10} spellCheck={false} className="w-full rounded-xl border bg-slate-950 px-4 py-3 font-mono text-xs text-slate-100" /></Field><p className="text-xs leading-5 text-slate-500">Columns: <code>sku,title,price,stock,category,brand,image_url,status</code>. Quoted CSV values are supported.</p></div>}</div><div className="sticky bottom-0 bg-slate-50 p-5 border-t flex justify-end gap-3"><button onClick={onClose} disabled={submitting} className="px-4 py-2 text-sm font-bold text-slate-600">Cancel</button><button onClick={() => void onSubmit()} disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{submitting && <Loader2 className="h-4 w-4 animate-spin" />}{mode === "single" ? "Add Product" : "Import Products"}</button></div></div></div>
}

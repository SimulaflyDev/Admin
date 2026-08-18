"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Package, Eye, BarChart3, Star, AlertCircle, CheckCircle2, Upload, EyeOff, Store, Bot, Tag, ShoppingCart, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { EmptyState } from "@/components/ui/empty-state"
import { getProduct, updateProductStatus, type ProductDetail, type ProductStatus } from "@/lib/api/directory"
import { ApiError } from "@/lib/api/types"

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

function formatDate(iso?: string | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
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

export default function CatalogProfile() {
  const params = useParams<{ id: string }>()
  const catalogId = params?.id ?? ""

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  const fetchProduct = useCallback(async () => {
    if (!catalogId) return
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const res = await getProduct(catalogId)
      setProduct(res)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true)
      } else {
        setError(err instanceof ApiError ? err.message : "Failed to load product from the server.")
      }
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [catalogId])

  useEffect(() => {
    void fetchProduct()
  }, [fetchProduct])

  async function changeStatus(next: ProductStatus) {
    if (!product || next === product.status) return
    setStatusBusy(true)
    setStatusError(null)
    try {
      const res = await updateProductStatus(product.id, next)
      setProduct({ ...product, status: res.status })
    } catch (err) {
      setStatusError(err instanceof ApiError ? err.message : "Failed to update product status.")
    } finally {
      setStatusBusy(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-24">
        <div className="flex items-center justify-center gap-2 py-24 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading product…</span>
        </div>
      </div>
    )
  }

  // ── 404 ──────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-24">
        <Link href="/products" className="inline-flex h-9 items-center gap-2 px-4 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-sm transition-colors text-sm font-bold">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <EmptyState
          icon={Package}
          title="Product not found"
          description={`No product exists for ID ${catalogId}. It may have been removed or the link is incorrect.`}
        />
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-24">
        <Link href="/products" className="inline-flex h-9 items-center gap-2 px-4 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shadow-sm transition-colors text-sm font-bold">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load product"
          description={error ?? "Something went wrong while loading this product."}
          actionLabel="Retry"
          onAction={() => void fetchProduct()}
        />
      </div>
    )
  }

  const isPublished = product.status === "published"

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <Link href="/products" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shrink-0 shadow-sm transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{product.title}</h1>
            <Badge variant="outline" className={`font-bold tracking-wider uppercase text-[10px] ${statusStyles[product.status] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>{statusLabels[product.status] ?? product.status}</Badge>
            {product.has_simulafly_listing ? (
              <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200 font-bold tracking-wider uppercase text-[10px]">SimulaFly Listing</Badge>
            ) : null}
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">Global ID: {product.id} · Category: {product.category ?? "—"}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => changeStatus(isPublished ? "archived" : "published")}
            disabled={statusBusy}
            className={`inline-flex h-9 items-center gap-2 px-4 rounded-lg border text-sm font-bold transition-colors shadow-sm disabled:opacity-50 ${isPublished ? "border-slate-200 text-slate-700 bg-white hover:bg-slate-50" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
          >
            {statusBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : isPublished ? <><EyeOff className="h-4 w-4" /> Hide Globally</> : <><Eye className="h-4 w-4" /> Publish Globally</>}
          </button>
        </div>
      </div>

      {statusError ? (
        <div className="p-3 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl">{statusError}</div>
      ) : null}

      {/* Product Fact Strip (real product attributes) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Listed Price", val: formatPrice(product.price), icon: Tag },
          { label: "In-App Stock", val: product.in_app_stock !== null && product.in_app_stock !== undefined ? `${product.in_app_stock.toLocaleString()}` : "—", icon: ShoppingCart },
          { label: "Health Score", val: product.health_score || "—", icon: Star },
          { label: "SimulaFly Listing", val: product.has_simulafly_listing ? "Yes" : "No", icon: Bot },
          { label: "Status", val: statusLabels[product.status] ?? product.status, icon: FileText },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{k.label}</div>
              <div className="text-2xl font-black text-slate-900">{k.val}</div>
            </div>
            <div className="w-10 h-10 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0">
              <k.icon className="h-4 w-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex h-auto bg-slate-100/50 border border-slate-200 rounded-xl p-1 gap-1 mb-6 max-w-fit flex-wrap">
          {["offers", "overview", "media", "performance"].map(tab => (
            <TabsTrigger key={tab} value={tab} className="capitalize rounded-lg text-sm font-semibold px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all">
              {tab === "offers" ? "Merchant Offers" : tab === "overview" ? "Master Details" : tab === "media" ? "Global Assets & AI" : "Demand Performance"}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* MERCHANT OFFERS — no multi-merchant offer source in backend; honest empty state. */}
        <TabsContent value="offers" className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Store className="h-5 w-5 text-indigo-500" />
                  Merchant Offer
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">The merchant that owns this product listing.</p>
              </div>
            </div>

            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Listed Price</TableHead>
                  <TableHead>In-App Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-slate-50 transition-colors">
                  <TableCell>
                    <Link href={`/merchants/${product.merchant_id}`} className="font-bold text-indigo-600 hover:underline">{product.merchant_name ?? product.merchant_id}</Link>
                    <div className="text-[10px] font-bold text-slate-400 mt-1 tracking-wider uppercase">{product.sku}</div>
                  </TableCell>
                  <TableCell className="font-black text-slate-900">{formatPrice(product.price)}</TableCell>
                  <TableCell className={`font-bold ${product.in_app_stock === 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {product.in_app_stock !== null && product.in_app_stock !== undefined ? `${product.in_app_stock} Units` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] font-bold tracking-wider uppercase ${statusStyles[product.status] ?? "bg-slate-100 text-slate-700 border-slate-200"}`}>
                      {statusLabels[product.status] ?? product.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900">Global Product Identity</h3>
              <div className="grid grid-cols-2 gap-6 text-sm">
                {[
                  { label: "Global Catalog Name", val: product.title || "—" },
                  { label: "Master SKU / Barcode", val: product.sku || "—" },
                  { label: "Primary Category", val: product.category ?? "—" },
                  { label: "Subcategory", val: product.subcategory ?? "—" },
                  { label: "Brand", val: product.brand ?? "—" },
                  { label: "Owning Merchant", val: product.merchant_name ?? product.merchant_id, link: `/merchants/${product.merchant_id}` },
                  { label: "Date Added to Catalog", val: formatDate(product.created_at) },
                  { label: "Last Master Update", val: formatDate(product.updated_at) },
                ].map(f => (
                  <div key={f.label}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{f.label}</div>
                    {f.link ? (
                      <Link href={f.link} className="font-bold text-indigo-600 hover:underline">{f.val}</Link>
                    ) : (
                      <div className="font-bold text-slate-900">{f.val}</div>
                    )}
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Global Description</div>
                {product.description ? (
                  <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-sm font-medium text-slate-400 italic leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    No description provided for this product.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900">Listing Health</h3>
              <div className={`flex items-center gap-4 p-4 rounded-xl border ${product.health_reason ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                {product.health_reason ? <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" /> : <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />}
                <div>
                  <div className={`text-sm font-bold ${product.health_reason ? "text-amber-800" : "text-emerald-800"}`}>Health Score: {product.health_score || "—"}</div>
                  <div className={`text-xs font-medium mt-0.5 ${product.health_reason ? "text-amber-600" : "text-emerald-600"}`}>{product.health_reason ?? "No issues reported for this listing."}</div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {[
                  { label: "Listing Status", note: statusLabels[product.status] ?? product.status },
                  { label: "SimulaFly Listing", note: product.has_simulafly_listing ? "Active on SimulaFly" : "Not listed on SimulaFly" },
                  { label: "In-App Stock", note: product.in_app_stock !== null && product.in_app_stock !== undefined ? `${product.in_app_stock} units` : "Not tracked" },
                  { label: "Listed Price", note: formatPrice(product.price) },
                ].map(check => (
                  <div key={check.label} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-700">{check.label}</span>
                    <span className="text-slate-500 text-xs font-medium">— {check.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* MEDIA & AI */}
        <TabsContent value="media">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Global Master Imagery</h3>
                <button className="inline-flex h-8 items-center gap-2 px-4 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors">
                  <Upload className="h-3.5 w-3.5" /> Upload Master Image
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.primary_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.primary_image_url}
                    alt={`${product.title} primary render`}
                    className="aspect-square w-full object-cover bg-slate-50 border border-slate-200 rounded-2xl"
                  />
                ) : (
                  <div className="aspect-square bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Package className="h-8 w-8 text-slate-300" />
                    <span className="text-xs font-bold">No Image</span>
                  </div>
                )}
                {["Side Angle", "Detail Shot", "In-Context"].map((label) => (
                  <div key={label} className="aspect-square bg-slate-50 border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2">
                    <Package className="h-8 w-8 text-slate-300" />
                    <span className="text-xs font-bold">{label}</span>
                    <span className="text-[10px] font-medium text-slate-400">No asset</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                AI Generation Readiness
              </h3>
              <EmptyState
                icon={Bot}
                title="No AI asset data"
                description="3D / AR readiness data is not available from the backend for this product yet."
              />
            </div>
          </div>
        </TabsContent>

        {/* PERFORMANCE — no demand analytics source in backend; honest empty state. */}
        <TabsContent value="performance">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Aggregated Demand Funnel
            </h3>
            <EmptyState
              icon={BarChart3}
              title="No demand data available"
              description="Demand and performance analytics are not yet provided by the backend for this product."
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

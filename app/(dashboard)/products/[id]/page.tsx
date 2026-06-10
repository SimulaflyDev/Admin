"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Package, Eye, TrendingUp, BarChart3, Star, Tag, AlertCircle, CheckCircle2, Upload, EyeOff, Store, Bot, Plus, ShoppingCart, FileText } from "lucide-react"
import Link from "next/link"

const offers = [
  { id: "OFF-112", merchant: "SneakerHead India", store: "Bandra West Outlet", price: 12500, stock: 44, status: "Active", link: "/merchants/MER-4421" },
  { id: "OFF-113", merchant: "FootLocker", store: "Andheri East Hub", price: 12999, stock: 12, status: "Active", link: "/merchants/MER-4422" },
  { id: "OFF-114", merchant: "Urban Style", store: "Powai Hub", price: 13500, stock: 0, status: "Out of Stock", link: "/merchants/MER-4423" },
]

export default function CatalogProfile({ params }: { params: { id: string } }) {
  const catalogId = params.id || "CAT-0891"
  const [status, setStatus] = useState<"Active" | "Hidden">("Active")

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <Link href="/products" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shrink-0 shadow-sm transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Nike Air Max 90</h1>
            <Badge variant="outline" className={status === "Active" ? "bg-emerald-100 text-emerald-800 border-emerald-200 font-bold tracking-wider uppercase text-[10px]" : "bg-slate-100 text-slate-700 border-slate-200 font-bold tracking-wider uppercase text-[10px]"}>{status}</Badge>
            <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 font-bold tracking-wider uppercase text-[10px]">Master Catalog Entity</Badge>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">Global ID: {catalogId} · Category: Sneakers</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setStatus(s => s === "Active" ? "Hidden" : "Active")}
            className={`inline-flex h-9 items-center gap-2 px-4 rounded-lg border text-sm font-bold transition-colors shadow-sm ${status === "Active" ? "border-slate-200 text-slate-700 bg-white hover:bg-slate-50" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
          >
            {status === "Active" ? <><EyeOff className="h-4 w-4" /> Hide Globally</> : <><Eye className="h-4 w-4" /> Publish Globally</>}
          </button>
        </div>
      </div>

      {/* Global Demand Metric Strip (Clean UI) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Global Views (7d)", val: "32,400", icon: Eye },
          { label: "AI Room Placements", val: "8,920", icon: Bot },
          { label: "Total Saved Intent", val: "3,100", icon: Star },
          { label: "Active Cart Additions", val: "1,240", icon: ShoppingCart },
          { label: "Booking Requests", val: "488", icon: FileText },
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

      <Tabs defaultValue="offers" className="w-full">
        <TabsList className="flex h-auto bg-slate-100/50 border border-slate-200 rounded-xl p-1 gap-1 mb-6 max-w-fit flex-wrap">
          {["offers", "overview", "media", "performance"].map(tab => (
            <TabsTrigger key={tab} value={tab} className="capitalize rounded-lg text-sm font-semibold px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all">
              {tab === "offers" ? "Merchant Offers (3)" : tab === "overview" ? "Master Details" : tab === "media" ? "Global Assets & AI" : "Demand Performance"}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* MERCHANT OFFERS (1:N Pivot) */}
        <TabsContent value="offers" className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Store className="h-5 w-5 text-indigo-500" />
                  Active Merchant Offers
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-1">All merchants currently selling this exact catalog item.</p>
              </div>
              <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg border border-slate-200 text-slate-700 text-sm font-bold bg-white shadow-sm hover:bg-slate-50 transition-colors">
                <Plus className="h-4 w-4" /> Link Merchant
              </button>
            </div>
            
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Fulfilling Store</TableHead>
                  <TableHead>Listed Price</TableHead>
                  <TableHead>Available Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map(offer => (
                  <TableRow key={offer.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell>
                      <Link href={offer.link} className="font-bold text-indigo-600 hover:underline">{offer.merchant}</Link>
                      <div className="text-[10px] font-bold text-slate-400 mt-1 tracking-wider uppercase">{offer.id}</div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">{offer.store}</TableCell>
                    <TableCell className="font-black text-slate-900">₹{offer.price.toLocaleString()}</TableCell>
                    <TableCell className={`font-bold ${offer.stock === 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {offer.stock} Units
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold tracking-wider uppercase ${offer.status === "Active" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                        {offer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
                        Edit Offer
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
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
                  { label: "Global Catalog Name", val: "Nike Air Max 90" },
                  { label: "Master SKU / Barcode", val: "NK-AM90-UK10-WHT" },
                  { label: "Primary Category", val: "Sneakers" },
                  { label: "Search Tags", val: "Nike, Air Max, White" },
                  { label: "Date Added to Catalog", val: "14 Jan 2024" },
                  { label: "Last Master Update", val: "2 Jun 2024" },
                ].map(f => (
                  <div key={f.label}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{f.label}</div>
                    <div className="font-bold text-slate-900">{f.val}</div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Global Description</div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  The Nike Air Max 90 stays true to its OG running roots with the iconic Waffle sole, stitched overlays and classic design lines. The Max Air cushioning and padded collar lock in comfort for all-day wear.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900">Master Moderation Status</h3>
              <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-emerald-800">Global Assets Approved & Live</div>
                  <div className="text-xs font-medium text-emerald-600 mt-0.5">Last reviewed: 2 Jun 2024 by Ops Team.</div>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                {[
                  { label: "Master Images", ok: true, note: "4 high-res assets verified" },
                  { label: "Description Quality", ok: true, note: "AI-reviewed for platform standards" },
                  { label: "3D Room Asset", ok: true, note: "AR/VR Try-on model verified" },
                  { label: "Merchant Mapping", ok: true, note: "3 active sellers mapped correctly" },
                ].map(check => (
                  <div key={check.label} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-700">{check.label}</span>
                    <span className="text-slate-500 text-xs font-medium">— {check.note}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button className="w-full inline-flex h-9 items-center justify-center rounded-lg border border-amber-200 text-amber-700 bg-amber-50 text-sm font-bold hover:bg-amber-100 transition-colors">
                  <AlertCircle className="h-4 w-4 mr-2" /> Flag Master Catalog Item
                </button>
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
                {["Primary Render", "Side Angle", "Detail Shot", "In-Context"].map((label) => (
                  <div key={label} className="aspect-square bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer">
                    <Package className="h-8 w-8 text-slate-300" />
                    <span className="text-xs font-bold">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-500" />
                AI Generation Readiness
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 border border-purple-100 bg-purple-50/50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                    <span className="font-bold text-slate-900">3D Asset Registered</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600">This catalog item has a verified `.glb` / `.obj` file attached. It is fully ready for AR Try-on and AI Room Visualizations.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* PERFORMANCE */}
        <TabsContent value="performance">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Aggregated Demand Funnel (All Merchants)
            </h3>
            <div className="space-y-4">
              {[
                { label: "Global Views", val: 32400, pct: 100, color: "bg-slate-800" },
                { label: "AI Visualizations", val: 8920, pct: 27.5, color: "bg-purple-500" },
                { label: "Saved Intent / Carts", val: 3100, pct: 9.5, color: "bg-amber-500" },
                { label: "Booking Requests", val: 488, pct: 1.5, color: "bg-emerald-500" },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl">
                  <div className="w-32 text-xs font-bold text-slate-700 shrink-0">{r.label}</div>
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }}></div>
                  </div>
                  <div className="w-24 text-xs font-black text-slate-900 text-right shrink-0">{r.val.toLocaleString()}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
              * Metrics are aggregated across all 3 active merchants selling this catalog item.
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

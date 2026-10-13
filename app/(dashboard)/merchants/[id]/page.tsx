"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Building2, ShieldCheck, ShieldAlert, Wallet, Store, MapPin, Mail, Phone, Calendar, FileText, AlertTriangle, Headset, Package, ExternalLink, Download, IndianRupee, Loader2, Plus, Ban, PlayCircle, X } from "lucide-react"
import { activateMerchant, createMerchantShop, getMerchant, listMerchants, suspendMerchant } from "@/lib/api/directory"
import type { MerchantDetail } from "@/lib/api/directory"
import type { MerchantListItem } from "@/lib/api/types"
import { adjustWallet, getWalletTransactions, listInvoices, formatINR, toNumber } from "@/lib/api/finance"
import type { WalletTransactionItem, InvoiceListItem } from "@/lib/api/finance"
import { listTickets } from "@/lib/api/ops"
import type { SupportTicketListItem } from "@/lib/api/ops"
import { ApiError } from "@/lib/api/types"

const PAGE_SIZE = 25

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
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

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  suspended: "bg-rose-50 text-rose-700 border-rose-200",
  trial: "bg-amber-50 text-amber-700 border-amber-200",
}

export default function MerchantProfile() {
  const params = useParams<{ id: string }>()
  const id = params?.id ?? ""

  const [activeTab, setActiveTab] = useState("overview")
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null)
  const [storeCount, setStoreCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  const fetchMerchant = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    setNotFound(false)
    try {
      const data = await getMerchant(id)
      setMerchant(data)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true)
      } else {
        setError(
          err instanceof ApiError ? err.message : "Failed to load merchant from the server."
        )
      }
      setMerchant(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void fetchMerchant()
  }, [fetchMerchant])

  async function toggleMerchantStatus() {
    if (!merchant) return
    if (merchant.status !== "suspended" && !window.confirm(`Suspend ${merchant.display_name}? It will stop appearing in the app.`)) return
    setStatusBusy(true)
    setStatusError(null)
    try {
      const response = merchant.status === "suspended"
        ? await activateMerchant(merchant.id)
        : await suspendMerchant(merchant.id)
      setMerchant({ ...merchant, status: response.status })
    } catch (err) {
      setStatusError(err instanceof ApiError ? err.message : "Failed to update merchant status.")
    } finally {
      setStatusBusy(false)
    }
  }

  // Shops owned by this account = the "stores" for this merchant. Each merchant
  // row is a shop; they're linked by their owner (a member with role "owner").
  const ownerUserId = useMemo(
    () => merchant?.members.find((m) => m.role === "owner")?.user_id ?? null,
    [merchant]
  )

  // Shop count for the header/overview (page 1 is enough to read total).
  useEffect(() => {
    if (!ownerUserId) { setStoreCount(null); return }
    let cancelled = false
    listMerchants({ owner_user_id: ownerUserId, page: 1, page_size: 1 })
      .then((res) => {
        if (!cancelled) setStoreCount(res.total)
      })
      .catch(() => {
        if (!cancelled) setStoreCount(null)
      })
    return () => {
      cancelled = true
    }
  }, [ownerUserId])

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "stores", label: "Stores" },
    { id: "wallet", label: "Wallet" },
    { id: "orders", label: "Orders" },
    { id: "support", label: "Support" },
    { id: "invoices", label: "Invoices" },
    { id: "risk", label: "Risk" },
  ]

  if (loading) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto pb-24">
        <div className="flex items-center justify-center gap-2 py-32 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading merchant…</span>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto pb-24">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-20 text-center text-slate-500 flex flex-col items-center">
          <Building2 className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Merchant not found</h3>
          <p className="max-w-md">No merchant exists for ID <span className="font-mono">{id}</span>.</p>
        </div>
      </div>
    )
  }

  if (error || !merchant) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto pb-24">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-20 text-center text-slate-500 flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-rose-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Couldn&apos;t load merchant</h3>
          <p className="max-w-md mb-4">{error ?? "Something went wrong."}</p>
          <button
            onClick={() => void fetchMerchant()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const isVerified = merchant.is_kyc_completed
  const riskLow = merchant.status === "active"

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500">

      {/* ── Header Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

          {/* Identity Section */}
          <div className="flex gap-5">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Building2 className="h-10 w-10 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">{merchant.display_name || merchant.legal_name || "—"}</h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                    <ShieldAlert className="h-3.5 w-3.5" /> Pending
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border capitalize ${statusStyles[merchant.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {merchant.status}
                </span>
              </div>
              <div className="text-slate-500 text-sm font-mono mt-1 mb-3">
                {merchant.slug || merchant.id}
                {merchant.shop_id && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-bold not-italic">Shop {merchant.shop_id}</span>
                )}
                {merchant.partner_id && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-bold">Partner {merchant.partner_id}</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-slate-400" /> {merchant.support_email || "—"}</div>
                <div className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-slate-400" /> {merchant.support_phone || "—"}</div>
                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" /> {merchant.country || "—"}</div>
                <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-400" /> Joined {formatDate(merchant.created_at)}</div>
              </div>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="flex flex-wrap lg:justify-end gap-3 lg:w-1/2">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex-1 min-w-[120px]">
              <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> Balance</div>
              <div className="text-lg font-bold text-slate-900">{merchant.wallet ? formatINR(merchant.wallet.balance) : "No wallet"}</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex-1 min-w-[120px]">
              <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><Store className="h-3.5 w-3.5" /> Stores</div>
              <div className="text-lg font-bold text-slate-900">{storeCount === null ? "—" : storeCount}</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex-1 min-w-[120px]">
              <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><Headset className="h-3.5 w-3.5" /> Members</div>
              <div className="text-lg font-bold text-slate-900">{merchant.members.length}</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex-1 min-w-[120px]">
              <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> Risk Status</div>
              <div className={`text-lg font-bold ${riskLow ? "text-emerald-600" : "text-rose-600"}`}>{riskLow ? "Low" : "High"}</div>
            </div>
          </div>

        </div>
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-slate-900">Merchant controls</div>
            <div className="text-xs text-slate-500">Suspension is managed here from the merchant overview.</div>
          </div>
          <button onClick={() => void toggleMerchantStatus()} disabled={statusBusy} className={`inline-flex h-9 items-center justify-center gap-2 px-4 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 ${merchant.status === "suspended" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-rose-50 text-rose-700 hover:bg-rose-100"}`}>
            {statusBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : merchant.status === "suspended" ? <PlayCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
            {merchant.status === "suspended" ? "Activate Merchant" : "Suspend Merchant"}
          </button>
        </div>
        {statusError ? <div className="mt-3 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-sm text-rose-600">{statusError}</div> : null}
      </div>

      {/* ── Tabs Engine ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
        <div className="flex overflow-x-auto border-b border-slate-200 scrollbar-hide bg-slate-50/50 px-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-0">
          {activeTab === "overview" && <TabOverview merchant={merchant} storeCount={storeCount} />}
          {activeTab === "stores" && <TabStores ownerUserId={ownerUserId} currentId={id} />}
          {activeTab === "wallet" && <TabWallet merchant={merchant} />}
          {activeTab === "orders" && <TabOrders />}
          {activeTab === "support" && <TabSupport merchant={merchant} />}
          {activeTab === "invoices" && <TabInvoices merchantId={id} />}
          {activeTab === "risk" && <TabRisk merchant={merchant} />}
        </div>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function TabOverview({ merchant, storeCount }: { merchant: MerchantDetail; storeCount: number | null }) {
  const stats = [
    { label: "Status", value: merchant.status, icon: ShieldCheck, color: "emerald", capitalize: true },
    { label: "KYC Verified", value: merchant.is_kyc_completed ? "Yes" : "No", icon: ShieldAlert, color: "indigo" },
    { label: "Wallet Balance", value: merchant.wallet ? formatINR(merchant.wallet.balance) : "No wallet", icon: IndianRupee, color: "purple" },
    { label: "Stores", value: storeCount === null ? "—" : String(storeCount), icon: Store, color: "blue" },
  ]

  // Sibling shops: every merchant row owned by the same user. Each merchant
  // row is a "shop"; one owner can run several (shop1, shop2, …). Shops are
  // linked by their OWNER (a MerchantMember with role "owner"), not by
  // partner_id (which is unique per shop).
  const ownerUserId = useMemo(
    () => merchant.members.find((m) => m.role === "owner")?.user_id ?? null,
    [merchant.members]
  )
  const ownerEmail = useMemo(
    () => merchant.members.find((m) => m.role === "owner")?.email ?? null,
    [merchant.members]
  )
  const [partnerShops, setPartnerShops] = useState<MerchantListItem[] | null>(null)
  useEffect(() => {
    if (!ownerUserId) { setPartnerShops([]); return }
    let cancelled = false
    listMerchants({ owner_user_id: ownerUserId, page_size: 50, sort: "created_at" })
      .then((res) => { if (!cancelled) setPartnerShops(res.items) })
      .catch(() => { if (!cancelled) setPartnerShops([]) })
    return () => { cancelled = true }
  }, [ownerUserId])

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
              <stat.icon className={`h-4 w-4 text-${stat.color}-500`} /> {stat.label}
            </div>
            <div className={`text-2xl font-bold text-slate-900 ${stat.capitalize ? "capitalize" : ""}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Shops owned by this account — clarifies that each merchant row is one
          shop, and a single owner may run several (shop1, shop2, …). */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-sm text-slate-900 flex items-center justify-between">
          <span className="flex items-center gap-2"><Store className="h-4 w-4 text-slate-400" /> Shops by this Owner{partnerShops && partnerShops.length > 0 ? ` (${partnerShops.length})` : ""}</span>
          {ownerEmail && (
            <span className="text-xs font-medium text-slate-500 truncate max-w-[220px]">{ownerEmail}</span>
          )}
        </div>
        {!ownerUserId ? (
          <div className="p-8 text-center text-sm text-slate-400 font-medium">No owner linked to this shop.</div>
        ) : partnerShops === null ? (
          <div className="p-8 text-center text-sm text-slate-400 font-medium">Loading shops…</div>
        ) : partnerShops.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400 font-medium">No shops found for this owner.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {partnerShops.map((s) => {
              const isCurrent = s.id === merchant.id
              return (
                <div key={s.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Store className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        {s.display_name || s.legal_name || "—"}
                        {isCurrent && <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">This shop</span>}
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5">{s.shop_id || "—"} · {s.status}</div>
                    </div>
                  </div>
                  {isCurrent ? (
                    <span className="text-xs text-slate-300 font-medium">Viewing</span>
                  ) : (
                    <Link href={`/merchants/${s.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                      Open <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-sm text-slate-900 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" /> Shop & Location
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Partner ID</div>
            <div className="text-sm font-bold text-slate-900 font-mono">{merchant.partner_id || "—"}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Shop ID</div>
            <div className="text-sm font-bold text-slate-900 font-mono">{merchant.shop_id || "—"}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Service Range</div>
            <div className="text-sm font-bold text-slate-900">{merchant.range_km != null ? `${merchant.range_km} km` : "—"}</div>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="text-xs font-semibold text-slate-500 mb-1">Address</div>
            <div className="text-sm font-medium text-slate-900">{merchant.address || "—"}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Latitude</div>
            <div className="text-sm font-mono text-slate-900">{merchant.latitude != null ? merchant.latitude : "—"}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Longitude</div>
            <div className="text-sm font-mono text-slate-900">{merchant.longitude != null ? merchant.longitude : "—"}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">Country</div>
            <div className="text-sm font-medium text-slate-900">{merchant.country || "—"}</div>
          </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-sm text-slate-900 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-slate-400" /> KYC Details</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${merchant.kyc.completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{merchant.kyc.completed ? "Complete" : "Pending"}</span>
        </div>
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="font-bold text-sm text-slate-900 mb-3">Owner PAN verification</div>
            {merchant.kyc.pan ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <KycField label="PAN" value={merchant.kyc.pan.masked_pan} mono />
                <KycField label="Category" value={merchant.kyc.pan.category} />
                <KycField label="Verified name" value={merchant.kyc.pan.verified_name} wide />
                <KycField label="Verified at" value={formatDateTime(merchant.kyc.pan.verified_at)} wide />
              </div>
            ) : <p className="text-sm text-slate-400">PAN verification has not been completed.</p>}
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="font-bold text-sm text-slate-900 mb-3">Shop GSTIN verification</div>
            {merchant.kyc.gstin ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <KycField label="GSTIN" value={merchant.kyc.gstin.gstin} mono wide />
                <KycField label="Legal name" value={merchant.kyc.gstin.legal_name} wide />
                <KycField label="Registration" value={merchant.kyc.gstin.registration_status} />
                <KycField label="State" value={[merchant.kyc.gstin.state_name, merchant.kyc.gstin.state_code].filter(Boolean).join(" · ") || "-"} />
                <KycField label="Business nature" value={merchant.kyc.gstin.business_nature || "-"} wide />
                <KycField label="Verified at" value={formatDateTime(merchant.kyc.gstin.verified_at)} wide />
              </div>
            ) : <p className="text-sm text-slate-400">GSTIN verification has not been completed for this shop.</p>}
          </div>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-sm text-slate-900">Recent Global Orders</div>
        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
          <Package className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium">No order data available</p>
          <p className="text-xs text-slate-400 mt-1">There is no per-merchant order source connected.</p>
        </div>
      </div>
    </div>
  )
}

function KycField({ label, value, mono = false, wide = false }: { label: string; value: string; mono?: boolean; wide?: boolean }) {
  return <div className={wide ? "col-span-2" : ""}><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</div><div className={`font-semibold text-slate-800 break-words ${mono ? "font-mono" : ""}`}>{value}</div></div>
}

function TabStores({ ownerUserId, currentId }: { ownerUserId: string | null; currentId: string }) {
  const [stores, setStores] = useState<MerchantListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!ownerUserId) { setStores([]); setTotal(0); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setError(null)
    listMerchants({ owner_user_id: ownerUserId, page, page_size: PAGE_SIZE, sort: "created_at" })
      .then((res) => {
        if (cancelled) return
        setStores(res.items)
        setTotal(res.total)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : "Failed to load shops.")
        setStores([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [ownerUserId, page, reloadKey])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Loading shops…</span>
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">{error}</div>
  }

  if (stores.length === 0) {
    return (
      <div className="p-20 text-center text-slate-500 flex flex-col items-center">
        <Store className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">No shops</h3>
        <p className="max-w-md">This owner has no shops.</p>
      </div>
    )
  }

  return (
    <>
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h3 className="font-bold text-slate-900">Owner&apos;s Shops</h3><p className="text-xs text-slate-500 mt-1">New shops start in trial status and require their own GSTIN verification.</p></div>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"><Plus className="h-4 w-4" /> Add Shop</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Shop</th>
              <th className="px-6 py-4">Shop ID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stores.map((s) => {
              const c = s.status === "active" ? "emerald" : s.status === "suspended" ? "rose" : "amber"
              const isCurrent = s.id === currentId
              return (
                <tr key={s.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      {s.display_name || s.legal_name || "—"}
                      {isCurrent && <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">This shop</span>}
                    </div>
                    <div className="text-xs font-mono text-slate-500">{s.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-700 font-bold">{s.shop_id || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`text-${c}-700 bg-${c}-50 px-2.5 py-1 rounded-md text-xs font-bold border border-${c}-100 capitalize`}>{s.status}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{formatDate(s.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    {isCurrent ? (
                      <span className="text-xs text-slate-300 font-medium">Viewing</span>
                    ) : (
                      <Link href={`/merchants/${s.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                        Open <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <span>Page {page} of {totalPages} · {total.toLocaleString()} shops</span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">&lt;</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">&gt;</button>
          </div>
        </div>
      )}
      {addOpen ? <AddShopDialog merchantId={currentId} onClose={() => setAddOpen(false)} onSaved={() => { setAddOpen(false); setReloadKey((value) => value + 1) }} /> : null}
    </>
  )
}

function AddShopDialog({ merchantId, onClose, onSaved }: { merchantId: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ display_name: "", legal_name: "", address: "", state: "", city: "", state_code: "", city_code: "", support_email: "", support_phone: "", range_km: "" })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function save() {
    if (!form.display_name.trim() || !form.address.trim() || !form.state.trim() || !form.city.trim()) {
      setSaveError("Shop name, address, state, and city are required.")
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await createMerchantShop(merchantId, {
        display_name: form.display_name.trim(),
        legal_name: form.legal_name.trim() || undefined,
        address: form.address.trim(),
        state: form.state.trim(),
        city: form.city.trim(),
        state_code: form.state_code.trim().toUpperCase() || "DL",
        city_code: form.city_code.trim().toUpperCase() || "N",
        support_email: form.support_email.trim() || undefined,
        support_phone: form.support_phone.trim() || undefined,
        range_km: form.range_km ? Number(form.range_km) : undefined,
      })
      onSaved()
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to create shop.")
    } finally {
      setSaving(false)
    }
  }

  const fieldClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true" aria-label="Add shop">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-5 border-b border-slate-100 flex items-center justify-between z-10"><div><h2 className="font-bold text-slate-900">Add Shop</h2><p className="text-xs text-slate-500 mt-1">Creates a new shop under the same owner and partner ID.</p></div><button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><X className="h-5 w-5" /></button></div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {saveError ? <div className="sm:col-span-2 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2 text-sm text-rose-600">{saveError}</div> : null}
          <ShopField label="Shop name"><input value={form.display_name} onChange={(event) => setForm({ ...form, display_name: event.target.value })} className={fieldClass} /></ShopField>
          <ShopField label="Legal name"><input value={form.legal_name} onChange={(event) => setForm({ ...form, legal_name: event.target.value })} placeholder="Inherit if blank" className={fieldClass} /></ShopField>
          <ShopField label="Address" wide><input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className={fieldClass} /></ShopField>
          <ShopField label="State"><input value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} className={fieldClass} /></ShopField>
          <ShopField label="City"><input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className={fieldClass} /></ShopField>
          <ShopField label="State code"><input maxLength={2} value={form.state_code} onChange={(event) => setForm({ ...form, state_code: event.target.value })} placeholder="MH" className={fieldClass} /></ShopField>
          <ShopField label="City code"><input maxLength={1} value={form.city_code} onChange={(event) => setForm({ ...form, city_code: event.target.value })} placeholder="M" className={fieldClass} /></ShopField>
          <ShopField label="Support email"><input type="email" value={form.support_email} onChange={(event) => setForm({ ...form, support_email: event.target.value })} className={fieldClass} /></ShopField>
          <ShopField label="Support phone"><input value={form.support_phone} onChange={(event) => setForm({ ...form, support_phone: event.target.value })} className={fieldClass} /></ShopField>
          <ShopField label="Service radius (km)"><input type="number" min="0" value={form.range_km} onChange={(event) => setForm({ ...form, range_km: event.target.value })} className={fieldClass} /></ShopField>
        </div>
        <div className="sticky bottom-0 bg-slate-50 p-5 border-t border-slate-100 flex justify-end gap-3"><button onClick={onClose} disabled={saving} className="px-4 py-2 text-sm font-bold text-slate-600">Cancel</button><button onClick={() => void save()} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create Shop</button></div>
      </div>
    </div>
  )
}

function ShopField({ label, wide = false, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? "sm:col-span-2" : ""}><span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</span>{children}</label>
}

function TabWallet({ merchant }: { merchant: MerchantDetail }) {
  const wallet = merchant.wallet ?? null
  const walletId = wallet?.id ?? null

  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false)
  const [txns, setTxns] = useState<WalletTransactionItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Credit modal state
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  const loadTxns = useCallback(() => {
    if (!walletId) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    getWalletTransactions(walletId, { page, page_size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return
        setTxns(res.items)
        setTotal(res.total)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : "Failed to load wallet transactions.")
        setTxns([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [walletId, page])

  useEffect(() => {
    const cleanup = loadTxns()
    return cleanup
  }, [loadTxns])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  async function handleCredit() {
    if (!walletId) return
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setModalError("Enter a valid amount greater than zero.")
      return
    }
    setSubmitting(true)
    setModalError(null)
    try {
      await adjustWallet(walletId, { direction: "credit", amount: value })
      setIsCreditModalOpen(false)
      setAmount("")
      // Refresh ledger and balance view.
      setPage(1)
      loadTxns()
    } catch (err) {
      setModalError(
        err instanceof ApiError ? err.message : "Failed to credit wallet. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!wallet) {
    return (
      <div className="p-20 text-center text-slate-500 flex flex-col items-center">
        <Wallet className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">No wallet</h3>
        <p className="max-w-md">This merchant does not have a wallet provisioned.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">

      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-end justify-between border-b border-slate-100 pb-6">
        <div className="flex-1 max-w-sm">
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Redeem Code</label>
          <div className="flex gap-2">
            <input type="text" placeholder="No endpoint available" disabled className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono outline-none uppercase bg-slate-50 text-slate-400 cursor-not-allowed" />
            <button disabled className="bg-slate-300 text-white px-4 py-2 rounded-lg text-sm font-bold cursor-not-allowed">Redeem</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button disabled className="flex items-center gap-2 text-sm font-semibold text-slate-400 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm cursor-not-allowed">
            <Download className="h-4 w-4"/> Export CSV
          </button>
          <button onClick={() => { setModalError(null); setIsCreditModalOpen(true) }} className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 border border-transparent px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
            <IndianRupee className="h-4 w-4"/> Credit Wallet
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Merchant Wallet Ledger</h3>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">Current Balance: {formatINR(wallet.balance)}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading transactions…</span>
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-rose-600 bg-rose-50">{error}</div>
        ) : txns.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <FileText className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-white border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Gateway</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {txns.map((tx) => {
                  const n = toNumber(tx.amount)
                  const c = n < 0 ? "rose" : "emerald"
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{formatDateTime(tx.created_at)}</td>
                      <td className="px-6 py-4 font-medium text-slate-900 capitalize">{tx.status}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{tx.gateway_ref || "—"}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{tx.gateway || "—"}</td>
                      <td className={`px-6 py-4 text-right font-bold text-${c}-600`}>{formatINR(tx.amount)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
            <span>Page {page} of {totalPages} · {total.toLocaleString()} transactions</span>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">&lt;</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">&gt;</button>
            </div>
          </div>
        )}
      </div>

      {/* Credit Wallet Modal Overlay */}
      {isCreditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><IndianRupee className="h-5 w-5 text-indigo-600" /> Credit Wallet</h3>
            </div>
            <div className="p-5 space-y-4">
              {modalError && (
                <div className="px-3 py-2 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-600">{modalError}</div>
              )}
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Merchant</label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">{merchant.display_name || merchant.legal_name}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Amount (₹)</label>
                <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount to credit" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Reason</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option>Launch Promotion</option>
                  <option>Refund Adjustment</option>
                  <option>Goodwill / Support</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Reference</label>
                  <input type="text" placeholder="e.g. TKT-991" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Notes</label>
                  <input type="text" placeholder="Optional" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={() => setIsCreditModalOpen(false)} disabled={submitting} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={handleCredit} disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Credit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function TabOrders() {
  return (
    <div className="p-20 text-center text-slate-500 flex flex-col items-center">
      <Package className="h-12 w-12 text-slate-300 mb-4" />
      <h3 className="text-lg font-bold text-slate-900 mb-1">No order data available</h3>
      <p className="max-w-md">There is no per-merchant order source connected to this view.</p>
    </div>
  )
}

function TabSupport({ merchant }: { merchant: MerchantDetail }) {
  const [tickets, setTickets] = useState<SupportTicketListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtered, setFiltered] = useState(false)

  const memberUserIds = useMemo(
    () => new Set(merchant.members.map((m) => m.user_id)),
    [merchant.members]
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listTickets({ requester_type: "merchant", page, page_size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return
        // Try to narrow to this merchant's members by requester_id; if none
        // match, fall back to the full merchant-type list.
        const mine = res.items.filter((t) => memberUserIds.has(t.requester_id))
        if (mine.length > 0) {
          setTickets(mine)
          setFiltered(true)
        } else {
          setTickets(res.items)
          setFiltered(false)
        }
        setTotal(res.total)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : "Failed to load tickets.")
        setTickets([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page, memberUserIds])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const priorityColor = (p: string) =>
    p === "urgent" || p === "high" ? "rose" : p === "medium" ? "amber" : "slate"
  const statusColor = (s: string) =>
    s === "resolved" ? "emerald" : s === "pending" ? "blue" : "amber"

  return (
    <>
      <div className="px-6 pt-4 text-xs font-semibold text-slate-500">
        {filtered
          ? "Merchant tickets · filtered to this merchant's members"
          : "Merchant tickets · showing all merchant-type tickets (no per-merchant filter available)"}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading tickets…</span>
        </div>
      ) : error ? (
        <div className="p-6 text-sm text-rose-600 bg-rose-50">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="p-20 text-center text-slate-500 flex flex-col items-center">
          <Headset className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">No tickets</h3>
          <p className="max-w-md">There are no merchant support tickets.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => {
                const pc = priorityColor(t.priority)
                const sc = statusColor(t.status)
                return (
                  <tr key={t.id} className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{t.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{t.subject || "—"}</td>
                    <td className="px-6 py-4"><span className={`text-${pc}-700 bg-${pc}-50 px-2 py-0.5 rounded text-xs font-bold capitalize`}>{t.priority}</span></td>
                    <td className="px-6 py-4"><span className={`text-${sc}-700 bg-${sc}-50 px-2 py-0.5 rounded border border-${sc}-100 text-xs font-bold capitalize`}>{t.status}</span></td>
                    <td className="px-6 py-4 text-right text-slate-500">{formatDateTime(t.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && !filtered && totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <span>Page {page} of {totalPages} · {total.toLocaleString()} tickets</span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">&lt;</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">&gt;</button>
          </div>
        </div>
      )}
    </>
  )
}

function TabInvoices({ merchantId }: { merchantId: string }) {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    listInvoices({ page, page_size: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return
        setInvoices(res.items.filter((inv) => inv.merchant_id === merchantId))
        setHasNext(res.has_next)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : "Failed to load invoices.")
        setInvoices([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [merchantId, page])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Loading invoices…</span>
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-sm text-rose-600 bg-rose-50">{error}</div>
  }

  if (invoices.length === 0) {
    return (
      <div className="p-20 text-center text-slate-500 flex flex-col items-center">
        <FileText className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">No invoices</h3>
        <p className="max-w-md">No invoices found for this merchant{(page > 1 || hasNext) ? " on this page" : ""}.</p>
        {(page > 1 || hasNext) && (
          <div className="flex gap-1 mt-4">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">&lt; Prev</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={!hasNext} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">Next &gt;</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Invoice Number</th>
              <th className="px-6 py-4">Issued</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Due Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.map((inv) => {
              const sc = inv.status === "paid" ? "emerald" : inv.overdue ? "rose" : "amber"
              return (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{inv.number}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{formatDate(inv.issue_date)}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{formatINR(inv.amount)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(inv.due_date)}{inv.overdue && inv.status !== "paid" ? <span className="ml-2 text-xs font-bold text-rose-600">Overdue</span> : null}</td>
                  <td className="px-6 py-4"><span className={`text-${sc}-700 bg-${sc}-50 px-2 py-0.5 rounded border border-${sc}-100 text-xs font-bold capitalize`}>{inv.status}</span></td>
                  <td className="px-6 py-4 text-right">
                    <button disabled className="text-slate-400 text-sm font-bold flex items-center gap-1 justify-end w-full cursor-not-allowed"><Download className="h-4 w-4"/> PDF</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {(page > 1 || hasNext) && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <span>Page {page}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">&lt;</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={!hasNext} className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40">&gt;</button>
          </div>
        </div>
      )}
    </>
  )
}

function TabRisk({ merchant }: { merchant: MerchantDetail }) {
  const verified = merchant.is_kyc_completed
  const riskLow = merchant.status === "active"

  return (
    <div className="p-6 space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col justify-center items-center text-center shadow-sm">
          {verified ? (
            <ShieldCheck className="h-10 w-10 text-emerald-500 mb-3" />
          ) : (
            <ShieldAlert className="h-10 w-10 text-amber-500 mb-3" />
          )}
          <h3 className="font-bold text-slate-900">{verified ? "KYC Verified" : "KYC Pending"}</h3>
          <p className="text-xs text-slate-500 mt-1">{verified ? "Identity verification completed" : "Identity verification not completed"}</p>
        </div>
        <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col justify-center items-center text-center shadow-sm">
          <div className={`text-3xl font-bold mb-1 ${riskLow ? "text-emerald-600" : "text-rose-600"}`}>{riskLow ? "Low" : "High"}</div>
          <h3 className="font-bold text-slate-900">Risk Status</h3>
          <p className="text-xs text-slate-500 mt-1 capitalize">Derived from status: {merchant.status}</p>
        </div>
        <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col justify-center items-center text-center shadow-sm">
          <Calendar className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-900">Last Updated</h3>
          <p className="text-xs text-slate-500 mt-1">{formatDate(merchant.updated_at)}</p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-sm text-slate-900">Security Audit Log</div>
        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
          <FileText className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium">No audit entries</p>
          <p className="text-xs text-slate-400 mt-1">No per-merchant audit source is connected to this view.</p>
        </div>
      </div>

    </div>
  )
}

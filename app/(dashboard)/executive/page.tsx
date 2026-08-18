"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Store, ShoppingCart, Wallet, ShieldAlert,
  Bot, Package, HelpCircle, FileText, Headset, Tag,
  MoreVertical, ArrowUpRight, ArrowDownRight, IndianRupee,
  Activity, TrendingUp, Building2, PlusCircle, UserX,
  UserPlus, RefreshCw, Coins, Clock, FileWarning, AlertTriangle,
  CheckCircle2, PackageX, ImageOff, WifiOff, Eye, MousePointerClick,
  ShoppingBag, CreditCard, ChevronRight, Share2
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MetricCard } from "@/components/ui/metric-card"
import { Skeleton } from "@/components/ui/skeleton"

import { 
  KPIDef, TIME_RANGES, generateChartData, formatValue, isAverage 
} from "@/lib/mock-data"
import { getExecutiveKpis, getExecutiveKpiSeries, getAlertCounters, getExecutiveOverview, getExecutiveActivity } from "@/lib/api/admin"
import type { AlertCounters, DashboardOverview, ActivityEntry } from "@/lib/api/types"
import { useAuthStore } from "@/lib/auth-store"

// ─── Data Dictionary ──────────────────────────────────────────────

const KPI_CONTAINERS: Record<string, KPIDef[]> = {
  "Commerce KPIs": [
    { id: 'revenue', title: 'Total Revenue', color: 'emerald', trend: 'up', type: 'currency' },
    { id: 'orders', title: 'Total Orders', color: 'amber', trend: 'up', type: 'number' },
    { id: 'aov', title: 'Avg Order Value', color: 'blue', trend: 'neutral', type: 'currency' },
    { id: 'gmv', title: 'Gross Merchandise Value', color: 'indigo', trend: 'up', type: 'currency' }
  ],
  "Merchant KPIs": [
    { id: 'total_merchants', title: 'Total Merchants', color: 'indigo', trend: 'up', type: 'number' },
    { id: 'active_stores', title: 'Active Stores', color: 'blue', trend: 'up', type: 'number' },
    { id: 'new_stores', title: 'New Stores', color: 'emerald', trend: 'neutral', type: 'number' },
    { id: 'merchant_churn', title: 'Merchant Churn', color: 'rose', trend: 'down', type: 'percentage' }
  ],
  "User KPIs": [
    { id: 'users', title: 'Active Users', color: 'blue', trend: 'up', type: 'number' },
    { id: 'new_signups', title: 'New Signups', color: 'emerald', trend: 'up', type: 'number' },
    { id: 'wallet_topups', title: 'Wallet Topups', color: 'purple', trend: 'up', type: 'currency' },
    { id: 'user_retention', title: 'User Retention', color: 'indigo', trend: 'neutral', type: 'percentage' }
  ],
  "AI Economics": [
    { id: 'ai', title: 'AI Operations', color: 'purple', trend: 'up', type: 'number' },
    { id: 'ai_cost', title: 'Total AI Cost', color: 'rose', trend: 'down', type: 'currency' },
    { id: 'timeout_rate', title: 'Timeout Rate', color: 'amber', trend: 'down', type: 'percentage' },
    { id: 'provider_uptime', title: 'Provider Uptime', color: 'emerald', trend: 'neutral', type: 'percentage' }
  ],
  "Merchant Intervention": [
    { id: 'fraud_cases', title: 'Fraud Cases', color: 'red', trend: 'down', type: 'number' },
    { id: 'disputes', title: 'Disputed Invoices', color: 'amber', trend: 'down', type: 'number' },
    { id: 'sla_breaches', title: 'SLA Breaches', color: 'rose', trend: 'down', type: 'number' },
    { id: 'support_tickets', title: 'Support Tickets', color: 'indigo', trend: 'up', type: 'number' }
  ],
  "Store Health": [
    { id: 'stores_online', title: 'Stores Online', color: 'emerald', trend: 'up', type: 'percentage' },
    { id: 'catalog_issues', title: 'Catalog Issues', color: 'amber', trend: 'down', type: 'number' },
    { id: 'missing_images', title: 'Missing Images', color: 'rose', trend: 'down', type: 'number' },
    { id: 'sync_failures', title: 'Sync Failures', color: 'red', trend: 'down', type: 'number' }
  ],
  "Conversion Drop-off": [
    { id: 'impressions', title: 'Impressions', color: 'slate', trend: 'up', type: 'number' },
    { id: 'store_visits', title: 'Store Visits', color: 'blue', trend: 'up', type: 'number' },
    { id: 'add_to_cart', title: 'Add to Cart', color: 'amber', trend: 'up', type: 'number' },
    { id: 'purchases', title: 'Purchases', color: 'emerald', trend: 'up', type: 'number' }
  ]
};

const KPI_ICONS: Record<string, any> = {
  revenue: IndianRupee, orders: ShoppingCart, aov: Activity, gmv: TrendingUp,
  total_merchants: Store, active_stores: Building2, new_stores: PlusCircle, merchant_churn: UserX,
  users: Users, new_signups: UserPlus, wallet_topups: Wallet, user_retention: RefreshCw,
  ai: Bot, ai_cost: Coins, timeout_rate: Clock, provider_uptime: Activity,
  fraud_cases: ShieldAlert, disputes: FileWarning, sla_breaches: AlertTriangle, support_tickets: Headset,
  stores_online: CheckCircle2, catalog_issues: PackageX, missing_images: ImageOff, sync_failures: WifiOff,
  impressions: Eye, store_visits: MousePointerClick, add_to_cart: ShoppingBag, purchases: CreditCard
}

const BASE_VALUES: Record<string, number> = {
  revenue: 2510000, orders: 25145, aov: 99.8, gmv: 3100000,
  total_merchants: 1420, active_stores: 1250, new_stores: 42, merchant_churn: 2.1,
  users: 352152, new_signups: 12400, wallet_topups: 850000, user_retention: 68.4,
  ai: 1200000, ai_cost: 4200, timeout_rate: 0.8, provider_uptime: 99.9,
  fraud_cases: 14, disputes: 8, sla_breaches: 2, support_tickets: 145,
  stores_online: 98.2, catalog_issues: 412, missing_images: 1250, sync_failures: 12,
  impressions: 12400000, store_visits: 512000, add_to_cart: 48000, purchases: 10700
}

// ─── Micro Components ───────────────────────────────────────────

function RealtimeFeed({ activity, loading }: { activity: ActivityEntry[]; loading: boolean }) {
  const events = activity.map((a) => {
    const t = a.created_at ? new Date(a.created_at) : null
    const time = t
      ? t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      : "--:--"
    const outcome = (a.outcome || "").toLowerCase()
    const type =
      outcome === "success"
        ? "success"
        : outcome === "failure" || outcome === "error" || outcome === "denied"
        ? "error"
        : outcome === "pending" || outcome === "warning"
        ? "warning"
        : "info"
    const label = `${a.action} ${a.target_type}`.replace(/_/g, " ").trim()
    return { time, msg: label || a.action, type }
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <h3 className="font-bold text-slate-900">Realtime Feed</h3>
        </div>
        <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <Skeleton className="h-3 w-10 mt-1 shrink-0 bg-slate-200" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-slate-200" />
              </div>
            </div>
          ))
        ) : events.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400 font-medium py-10">
            No recent activity
          </div>
        ) : (
          events.map((e, i) => (
            <div key={i} className="flex items-start gap-3 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-default">
              <div className="text-xs font-mono text-slate-400 mt-0.5 w-10 shrink-0">{e.time}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    e.type === 'success' ? 'bg-emerald-500' :
                    e.type === 'error' ? 'bg-rose-500' :
                    e.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-sm font-medium text-slate-800 capitalize">{e.msg}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-3 border-t border-slate-50 bg-slate-50/50 text-center">
        <Link href="/audit" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View Full Log</Link>
      </div>
    </div>
  )
}

function SnapshotWidget({ title, data, icon: Icon, color = "indigo", loading }: any) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-600 bg-indigo-50", emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50", rose: "text-rose-600 bg-rose-50",
    blue: "text-blue-600 bg-blue-50", purple: "text-purple-600 bg-purple-50",
    slate: "text-slate-600 bg-slate-100"
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col h-full hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-bold text-slate-900 text-sm tracking-tight">{title}</h3>
      </div>
      <div className="flex-1 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <Skeleton className="h-4 w-28 bg-slate-100" />
              <Skeleton className="h-4 w-10 bg-slate-100" />
            </div>
          ))
        ) : (
          data.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">{item.label}</span>
              <span className={`font-bold ${item.alert ? 'text-rose-600' : 'text-slate-900'}`}>{item.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}



function TrendingList({ title, items }: { title: string; items: { name: string, category: string, value: string, rating: string }[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="px-6 py-5 flex items-center justify-between border-b border-slate-50">
        <div>
          <h3 className="font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Top performing assets today</p>
        </div>
        <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <Tag className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="text-amber-500">★ {item.rating}</span>
                  <span>•</span>
                  <span>{item.category}</span>
                </div>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-slate-50 text-center">
        <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">See all</button>
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────

export default function ExecutiveDashboard() {
  const fullName = useAuthStore((s) => s.fullName)
  const firstName = fullName ? fullName.split(" ")[0] : "Admin"

  const [isDownloading, setIsDownloading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false)
  
  // Dashboard Pivot State
  const [selectedContainer, setSelectedContainer] = useState("Commerce KPIs")
  const [timeRange, setTimeRange] = useState("1 Month")
  
  // Metric State (defaults to first item in the selected container)
  const metricsInContainer = KPI_CONTAINERS[selectedContainer];
  const [selectedMetricId, setSelectedMetricId] = useState(metricsInContainer[0].id)

  // Ensure metric syncs when container changes
  useEffect(() => {
    setSelectedMetricId(KPI_CONTAINERS[selectedContainer][0].id);
  }, [selectedContainer])

  // ── Live API state ──
  // KPI totals keyed by id from GET /admin/dashboard/executive/kpis
  const [apiKpiValues, setApiKpiValues] = useState<Record<string, number>>({})
  const [kpisLoading, setKpisLoading] = useState(true)
  
  // Series points for the selected metric from .../kpis/{id}/series
  const [apiSeries, setApiSeries] = useState<{ name: string; value: number }[] | null>(null)
  const [chartLoading, setChartLoading] = useState(true)
  
  // Action Queue counters from GET /admin/alerts/counters
  const [alertCounters, setAlertCounters] = useState<AlertCounters | null>(null)
  const [alertsLoading, setAlertsLoading] = useState(true)
  
  // Aggregate snapshot from GET /admin/dashboard/executive/overview
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)
  
  // Recent audit-log entries from GET /admin/dashboard/executive/activity
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [activityLoading, setActivityLoading] = useState(true)

  // Fetch KPI totals on mount and whenever the time range changes.
  useEffect(() => {
    let cancelled = false
    setKpisLoading(true)
    getExecutiveKpis(timeRange)
      .then((kpis) => {
        if (cancelled) return
        const map: Record<string, number> = {}
        kpis.forEach((k) => { map[k.id] = k.value })
        setApiKpiValues(map)
        setKpisLoading(false)
      })
      .catch(() => {
        // Keep mock-derived values on failure so the UI never breaks.
        if (!cancelled) {
          setApiKpiValues({})
          setKpisLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [timeRange])

  // Fetch the chart series whenever the selected metric or time range changes.
  useEffect(() => {
    let cancelled = false
    setChartLoading(true)
    getExecutiveKpiSeries(selectedMetricId, timeRange)
      .then((res) => {
        if (cancelled) return
        setApiSeries(res.series && res.series.length > 0 ? res.series : null)
        setChartLoading(false)
      })
      .catch(() => {
        // Fall back to the mock generator on error/empty.
        if (!cancelled) {
          setApiSeries(null)
          setChartLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [selectedMetricId, timeRange])

  // Fetch Action Queue counters once on mount.
  useEffect(() => {
    let cancelled = false
    setAlertsLoading(true)
    getAlertCounters()
      .then((c) => { 
        if (!cancelled) {
          setAlertCounters(c)
          setAlertsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setAlertsLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Fetch the snapshot overview + recent activity once on mount.
  useEffect(() => {
    let cancelled = false
    setOverviewLoading(true)
    getExecutiveOverview()
      .then((o) => { 
        if (!cancelled) {
          setOverview(o)
          setOverviewLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setOverviewLoading(false)
      })

    setActivityLoading(true)
    getExecutiveActivity(20)
      .then((a) => { 
        if (!cancelled) {
          setActivity(a)
          setActivityLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setActivityLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Generate exact totals for ALL metrics in the container based on timeRange.
  // Prefer the live API value; fall back to the mock sum only when a KPI id
  // is absent from the API response so the UI never breaks.
  const metricTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    metricsInContainer.forEach(m => {
      if (m.id in apiKpiValues) {
        totals[m.id] = apiKpiValues[m.id];
        return;
      }
      const data = generateChartData(m, timeRange, BASE_VALUES[m.id] || 100);
      const sum = data.reduce((acc, curr) => acc + curr.value, 0);
      totals[m.id] = isAverage(m.type, m.id) ? sum / data.length : sum;
    });
    return totals;
  }, [metricsInContainer, timeRange, apiKpiValues]);

  // Generate dynamic data for chart based on exact selected metric.
  // Prefer the live API series; fall back to the mock generator on error/empty.
  const activeMetricMeta = metricsInContainer.find(m => m.id === selectedMetricId) || metricsInContainer[0];
  const chartData = useMemo(() => {
    if (apiSeries && apiSeries.length > 0) return apiSeries;
    return generateChartData(activeMetricMeta, timeRange, BASE_VALUES[activeMetricMeta.id] || 100);
  }, [activeMetricMeta, timeRange, apiSeries])

  // Resolved Action Queue counts (live counters, defaulting to 0).
  const fraudAlerts = alertCounters?.fraudAlerts ?? 0
  const overdueInvoices = alertCounters?.overdueInvoices ?? 0
  const slaBreaches = alertCounters?.slaBreaches ?? 0
  const failedGenerations = alertCounters?.failedGenerations ?? 0

  // ── Snapshot widgets + funnel, derived from the live overview ──
  // Compact integer formatter; em-dash for fields we do not yet aggregate.
  const n = (v: number | undefined) => (v ?? 0).toLocaleString()
  const dash = "—"

  const mh = overview?.merchant_health
  const sh = overview?.store_health
  const sup = overview?.support
  const inv = overview?.invoices
  const ts = overview?.trust_safety
  const ref = overview?.referral
  const fn = overview?.funnel

  const merchantHealthData = [
    { label: "Total Merchants", value: n(mh?.total) },
    { label: "Active", value: n(mh?.active) },
    { label: "Suspended", value: n(mh?.suspended), alert: (mh?.suspended ?? 0) > 0 },
    { label: "Low Balance Wallets", value: n(mh?.low_balance_wallets), alert: (mh?.low_balance_wallets ?? 0) > 0 },
    { label: "Frozen Wallets", value: n(mh?.frozen_wallets), alert: (mh?.frozen_wallets ?? 0) > 0 },
  ]

  const storeHealthData = [
    { label: "Total Stores", value: n(sh?.total) },
    { label: "Active", value: n(sh?.active) },
    { label: "Inactive", value: n(sh?.inactive), alert: (sh?.inactive ?? 0) > 0 },
    { label: "Suspended", value: n(sh?.suspended), alert: (sh?.suspended ?? 0) > 0 },
  ]

  const referralData = [
    { label: "Referred Users", value: n(ref?.referred_users) },
    { label: "Total Users", value: n(ref?.total_users) },
  ]

  const invoiceData = [
    { label: "Total Invoices", value: n(inv?.total) },
    { label: "Unpaid", value: n(inv?.unpaid), alert: (inv?.unpaid ?? 0) > 0 },
    { label: "Overdue", value: n(inv?.overdue), alert: (inv?.overdue ?? 0) > 0 },
    { label: "Paid", value: n(inv?.paid) },
  ]

  const aiEconomicsData = [
    { label: "AI Cost Today", value: dash },
    { label: "Rev. Influence", value: dash },
    { label: "Cost Per Book", value: dash },
    { label: "Overall ROI", value: dash },
  ]

  const trustSafetyData = [
    { label: "Open Fraud Alerts", value: n(ts?.open_fraud_alerts), alert: (ts?.open_fraud_alerts ?? 0) > 0 },
    { label: "Resolved Fraud Alerts", value: n(ts?.resolved_fraud_alerts) },
  ]

  const supportData = [
    { label: "Open Tickets", value: n(sup?.open) },
    { label: "Pending", value: n(sup?.pending), alert: (sup?.pending ?? 0) > 0 },
    { label: "Resolved", value: n(sup?.resolved) },
    { label: "SLA Breached", value: n(sup?.sla_breaches), alert: (sup?.sla_breaches ?? 0) > 0 },
  ]

  // Funnel bars: width is the stage's share of impressions (cap at 100%).
  const impressions = fn?.impressions ?? 0
  const pct = (v: number | undefined) =>
    impressions > 0 ? Math.min(100, Math.round(((v ?? 0) / impressions) * 100)) : 0
  const funnelStages = [
    { label: "Surfaced", value: fn?.impressions, width: impressions > 0 ? 100 : 0, bar: "bg-indigo-500", valueClass: "" },
    { label: "Clicked", value: fn?.clicks, width: pct(fn?.clicks), bar: "bg-blue-500", valueClass: "" },
    { label: "Added to Cart", value: fn?.add_to_cart, width: pct(fn?.add_to_cart), bar: "bg-amber-400", valueClass: "" },
    { label: "Purchased", value: fn?.purchases, width: pct(fn?.purchases), bar: "bg-emerald-500", valueClass: "text-emerald-600" },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="p-4 space-y-6 max-w-[1600px] mx-auto pb-24">

      {/* ── Page Header & Global Actions ── */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {firstName}</h1>
          <p className="text-sm text-slate-500 mt-1">Here is the status of SimulaFly operations today.</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button 
            onClick={() => {
              setIsDownloading(true)
              setTimeout(() => {
                setIsDownloading(false); setShowToast(true);
                setTimeout(() => setShowToast(false), 3000)
              }, 1500)
            }}
            className="px-4 py-2 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-colors w-36 flex justify-center items-center"
          >
            {isDownloading ? <span className="animate-pulse">Generating...</span> : "Download Report"}
          </button>
          <button 
            onClick={() => setIsActionCenterOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
          >
            Action Center
          </button>
        </div>
      </motion.div>

      {/* ── Container & Time Pivots ── */}
      <motion.div variants={item} className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
        
        {/* KPI Container Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 xl:pb-0 scrollbar-hide flex-1">
          {Object.keys(KPI_CONTAINERS).map(c => (
            <button
              key={c}
              onClick={() => setSelectedContainer(c)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedContainer === c ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden xl:block w-px h-8 bg-slate-200 mx-2"></div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 xl:pb-0 scrollbar-hide">
          {TIME_RANGES.map(tr => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeRange === tr ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-white text-slate-500 border border-transparent hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Top Row: Macro Metrics ── */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col gap-3 shadow-sm h-32 animate-pulse justify-between">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28 bg-slate-100" />
                <Skeleton className="h-8 w-8 rounded-lg bg-slate-100" />
              </div>
              <div>
                <Skeleton className="h-8 w-36 mb-2 bg-slate-100" />
                <Skeleton className="h-3 w-16 bg-slate-100" />
              </div>
            </div>
          ))
        ) : (
          <AnimatePresence mode="wait">
            {metricsInContainer.map((m, idx) => {
              const displayVal = metricTotals[m.id];
              
              return (
                <motion.div
                  key={`${selectedContainer}-${m.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <MetricCard 
                    title={m.title} 
                    value={formatValue(m.type, displayVal)} 
                    icon={KPI_ICONS[m.id]} 
                    trend={m.trend} 
                    trendValue={m.trend === 'up' ? '+12%' : m.trend === 'down' ? '-4%' : '0%'} 
                    color={m.color} 
                    isActive={selectedMetricId === m.id}
                    onClick={() => setSelectedMetricId(m.id)}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </motion.div>

      {/* ── Middle Row: Chart & Trending ── */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Dynamic Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col p-6 h-full relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{activeMetricMeta.title} Timeline</h3>
              <p className="text-sm text-slate-500">Data visualization for the last {timeRange.toLowerCase()}</p>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200"></div>
                {activeMetricMeta.title}
              </div>
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full relative z-10">
            {chartLoading ? (
              <div className="w-full h-full flex flex-col justify-between py-2 animate-pulse">
                <div className="flex-1 flex flex-col justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="h-px w-full bg-slate-100"></div>
                  <div className="h-px w-full bg-slate-100"></div>
                  <div className="h-px w-full bg-slate-100"></div>
                  <div className="h-px w-full bg-slate-100"></div>
                </div>
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-3 w-10 bg-slate-100" />
                  <Skeleton className="h-3 w-10 bg-slate-100" />
                  <Skeleton className="h-3 w-10 bg-slate-100" />
                  <Skeleton className="h-3 w-10 bg-slate-100" />
                  <Skeleton className="h-3 w-10 bg-slate-100" />
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} minTickGap={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dx={-10} 
                    tickFormatter={(val) => formatValue(activeMetricMeta.type, val)} 
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}
                    itemStyle={{ fontWeight: '600', color: '#4f46e5' }}
                    formatter={(val: any) => [formatValue(activeMetricMeta.type, val as number), activeMetricMeta.title]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorMain)" animationDuration={600} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Column List */}
        <div className="lg:col-span-1 h-full">
          <RealtimeFeed activity={activity} loading={activityLoading} />
        </div>
      </motion.div>

      {/* ── Bottom Row: Data Tables ── */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Action Queue Data Table */}
        <div id="action-queue" className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Action Queue</h3>
              <p className="text-sm text-slate-500">Urgent items requiring manual intervention</p>
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Search queue..." className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-white border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Ref ID</th>
                  <th className="px-6 py-4">Queue Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Pending</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {alertsLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <tr key={idx} className="bg-white border-b border-slate-50 animate-pulse">
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16 bg-slate-100" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28 bg-slate-100" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12 bg-slate-100" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-md bg-slate-100" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-14 bg-slate-100" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-16 rounded-lg ml-auto bg-slate-100" /></td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="bg-white border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">#ALT-8042</td>
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-500"/> Fraud Detection</td>
                      <td className="px-6 py-4 text-slate-500">Today</td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-bold">Critical</span></td>
                      <td className="px-6 py-4 font-bold text-slate-900">{fraudAlerts} cases</td>
                      <td className="px-6 py-4 text-right">
                        <Link href="/alerts" className="inline-block px-3 py-1.5 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors">Resolve</Link>
                      </td>
                    </tr>
                    <tr className="bg-white border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">#INV-9201</td>
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2"><FileText className="h-4 w-4 text-amber-500"/> Overdue Invoices</td>
                      <td className="px-6 py-4 text-slate-500">Yesterday</td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-bold">Pending</span></td>
                      <td className="px-6 py-4 font-bold text-slate-900">{overdueInvoices} invoices</td>
                      <td className="px-6 py-4 text-right">
                        <Link href="/alerts" className="inline-block px-3 py-1.5 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors">Review</Link>
                      </td>
                    </tr>
                    <tr className="bg-white border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">#SLA-4492</td>
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2"><Headset className="h-4 w-4 text-indigo-500"/> Ticket SLA Breach</td>
                      <td className="px-6 py-4 text-slate-500">14/03/2026</td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-bold">Review</span></td>
                      <td className="px-6 py-4 font-bold text-slate-900">{slaBreaches} tickets</td>
                      <td className="px-6 py-4 text-right">
                        <Link href="/alerts" className="inline-block px-3 py-1.5 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors">Expedite</Link>
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">#AI-2991</td>
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2"><Bot className="h-4 w-4 text-purple-500"/> Failed Generations</td>
                      <td className="px-6 py-4 text-slate-500">14/03/2026</td>
                      <td className="px-6 py-4"><span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-bold">System</span></td>
                      <td className="px-6 py-4 font-bold text-slate-900">{failedGenerations} nodes</td>
                      <td className="px-6 py-4 text-right">
                        <Link href="/alerts" className="inline-block px-3 py-1.5 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors">Restart</Link>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50">
            <span>Showing urgent queues</span>
            <div className="flex gap-1">
              <button className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">&lt;</button>
              <button className="px-2 py-1 bg-indigo-600 border border-indigo-600 text-white rounded">1</button>
              <button className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">2</button>
              <button className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">&gt;</button>
            </div>
          </div>
        </div>

        {/* Discovery Funnel Breakdown */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900">Funnel Drop-off</h3>
            <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-6">
            {overviewLoading ? (
              <div className="flex-1 flex flex-col justify-center gap-6 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20 bg-slate-100" />
                      <Skeleton className="h-4 w-12 bg-slate-100" />
                    </div>
                    <Skeleton className="h-2.5 w-full rounded-full bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : (
              funnelStages.map((s, i) => (
                <div key={i} className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{s.label}</span>
                    <span className={`font-bold ${s.valueClass}`}>{n(s.value)}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${s.bar} rounded-full`} style={{ width: `${s.width}%` }}></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </motion.div>

      {/* ── Snapshot Matrix ── */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <SnapshotWidget 
          title="Merchant Health" icon={Building2} color="indigo"
          data={merchantHealthData} loading={overviewLoading}
        />

        <SnapshotWidget 
          title="Store Health" icon={Store} color="blue"
          data={storeHealthData} loading={overviewLoading}
        />

        <SnapshotWidget 
          title="Referral Performance" icon={Share2} color="emerald"
          data={referralData} loading={overviewLoading}
        />

        <SnapshotWidget 
          title="Invoice Risk Center" icon={FileText} color="amber"
          data={invoiceData} loading={overviewLoading}
        />

        <SnapshotWidget 
          title="AI Economics Summary" icon={Bot} color="purple"
          data={aiEconomicsData} loading={overviewLoading}
        />

        <SnapshotWidget 
          title="Trust & Safety" icon={ShieldAlert} color="red"
          data={trustSafetyData} loading={overviewLoading}
        />

        <SnapshotWidget 
          title="Support SLA" icon={Headset} color="slate"
          data={supportData}
        />

        {/* Empty placeholder to fill the 4-column grid cleanly */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-5 flex flex-col items-center justify-center text-slate-400">
          <PlusCircle className="h-8 w-8 mb-2 opacity-50" />
          <span className="text-sm font-medium">Add Snapshot</span>
        </div>

      </motion.div>

      {/* ── Action Center Slide-out Panel ── */}
      {isActionCenterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsActionCenterOpen(false)}></div>
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-900 text-lg">Action Center</h2>
              <button onClick={() => setIsActionCenterOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-xl">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider text-slate-500">Urgent Approvals</h3>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-300 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Wallet className="h-4 w-4" /></div>
                    <span className="font-semibold text-slate-900">Large Withdrawal Request</span>
                  </div>
                  <p className="text-sm text-slate-500">Merchant #8922 is requesting a manual withdrawal of ₹12.5L. Review required.</p>
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 bg-indigo-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">Review</button>
                    <button className="flex-1 bg-white border border-slate-200 text-slate-700 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm">Deny</button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider text-slate-500">System Alerts</h3>
                <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  <div className="flex items-center gap-3 mb-2 ml-2">
                    <span className="font-semibold text-slate-900">API Rate Limit Approaching</span>
                  </div>
                  <p className="text-sm text-slate-500 ml-2">The external SMS gateway API is at 92% capacity. Consider upgrading tier.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Toast Notification ── */}
      {showToast && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} 
          className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 border border-slate-700"
        >
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">✓</div>
          <div>
            <p className="text-sm font-semibold">Report Downloaded</p>
            <p className="text-xs text-slate-300">Executive_Summary.pdf saved.</p>
          </div>
        </motion.div>
      )}

    </motion.div>
  )
}

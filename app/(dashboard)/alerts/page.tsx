"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Bell, CheckCircle2, Eye, X, AlertCircle, Wallet, Bot, ShoppingCart, Server, Users, ArrowRight, Clock } from "lucide-react"
import Link from "next/link"

type Alert = {
  id: string
  type: string
  severity: "Critical" | "High" | "Medium" | "Low"
  title: string
  detail: string
  entity: string
  entityLink: string
  time: string
  status: "New" | "Acknowledged" | "Resolved"
}

const initialAlerts: Alert[] = [
  { id: "ALT-9041", type: "Payment", severity: "Critical", title: "Razorpay Payment Failure Spike", detail: "12 consecutive payment failures in the last 5 minutes. Possible gateway outage.", entity: "Payment Gateway", entityLink: "/system/health", time: "3 min ago", status: "New" },
  { id: "ALT-9038", type: "Merchant", severity: "High", title: "Merchant Low Balance — Auto-Freeze Imminent", detail: "SneakerHead India wallet balance ₹450 — store will auto-freeze at ₹0.", entity: "MER-4421", entityLink: "/merchants/MER-4421", time: "8 min ago", status: "New" },
  { id: "ALT-9035", type: "AI", severity: "High", title: "Abnormal AI Usage Detected", detail: "MER-4820 (BrandCo Retail) generated 400+ images in 1 hour. AI access temporarily restricted.", entity: "MER-4820", entityLink: "/merchants/MER-4820", time: "15 min ago", status: "Acknowledged" },
  { id: "ALT-9030", type: "Trust", severity: "High", title: "Suspicious Referral Loop Detected", detail: "40 referral rewards from Campaign WA-Diwali traced to same device fingerprint.", entity: "Campaign: WA-Diwali", entityLink: "/trust/fraud", time: "22 min ago", status: "New" },
  { id: "ALT-9025", type: "Order", severity: "Medium", title: "Order Dispute SLA Breach", detail: "Dispute DSP-4401 has been unassigned for 3 days — above 24h SLA.", entity: "DSP-4401", entityLink: "/orders/disputes", time: "1h ago", status: "Acknowledged" },
  { id: "ALT-9020", type: "System", severity: "Medium", title: "Shiprocket API Degraded", detail: "Delivery tracking API responding at 1.2s avg vs 200ms SLA. Fulfillment updates delayed.", entity: "Integration: Shiprocket", entityLink: "/system/health", time: "2h ago", status: "Acknowledged" },
  { id: "ALT-9015", type: "Finance", severity: "Medium", title: "8 Invoices Unpaid Beyond 7 Days", detail: "Merchants: Style Hub Trends, BrandMart Online have outstanding invoices.", entity: "INV-10031, INV-10020", entityLink: "/finance/invoices", time: "3h ago", status: "New" },
  { id: "ALT-9010", type: "Merchant", severity: "Low", title: "Merchant Inactive for 30+ Days", detail: "Furniture World Koramangala has had 0 orders in 32 days.", entity: "MER-4601", entityLink: "/merchants/MER-4601", time: "6h ago", status: "Resolved" },
]

const severityIndicator: Record<string, string> = {
  Critical: "border-l-red-500 text-red-600",
  High: "border-l-orange-500 text-orange-600",
  Medium: "border-l-amber-500 text-amber-600",
  Low: "border-l-slate-400 text-slate-500",
}
const severityBadge: Record<string, string> = {
  Critical: "bg-red-50 text-red-700 border-red-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-50 text-slate-700 border-slate-200",
}
const typeIcons: Record<string, React.ElementType> = {
  Payment: Wallet, Merchant: Users, AI: Bot, Trust: AlertCircle, Order: ShoppingCart, System: Server, Finance: Wallet,
}

const statusStyles: Record<string, string> = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Acknowledged: "bg-purple-50 text-purple-700 border-purple-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
}

export default function AlertCenter() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [filterSeverity, setFilterSeverity] = useState<string>("All")
  const [filterType, setFilterType] = useState<string>("All")
  const [filterStatus, setFilterStatus] = useState<string>("All")

  function updateStatus(id: string, status: "Acknowledged" | "Resolved") {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const filtered = alerts.filter(a => {
    const matchSeverity = filterSeverity === "All" || a.severity === filterSeverity
    const matchType = filterType === "All" || a.type === filterType
    const matchStatus = filterStatus === "All" ? true : (filterStatus === "Resolved" ? a.status === "Resolved" : a.status !== "Resolved")
    return matchSeverity && matchType && matchStatus
  })

  const newCount = alerts.filter(a => a.status === "New").length
  const ackCount = alerts.filter(a => a.status === "Acknowledged").length

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Alert & Incident Center</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">{newCount} new · {ackCount} acknowledged · {alerts.filter(a => a.status === "Resolved").length} resolved</p>
        </div>
        <button
          onClick={() => setAlerts(prev => prev.map(a => a.status === "New" ? { ...a, status: "Acknowledged" } : a))}
          className="inline-flex h-10 items-center gap-2 px-4 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4" /> Acknowledge All New
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Critical", id: "Critical", val: alerts.filter(a => a.severity === "Critical" && a.status !== "Resolved").length, color: "text-red-600", active: filterSeverity === "Critical" && filterStatus === "Unresolved" },
          { label: "High", id: "High", val: alerts.filter(a => a.severity === "High" && a.status !== "Resolved").length, color: "text-orange-600", active: filterSeverity === "High" && filterStatus === "Unresolved" },
          { label: "Medium", id: "Medium", val: alerts.filter(a => a.severity === "Medium" && a.status !== "Resolved").length, color: "text-amber-600", active: filterSeverity === "Medium" && filterStatus === "Unresolved" },
          { label: "Resolved", id: "Resolved", val: alerts.filter(a => a.status === "Resolved").length, color: "text-emerald-600", active: filterStatus === "Resolved" },
        ].map(s => (
          <div 
            key={s.label} 
            onClick={() => {
              if (s.id === "Resolved") {
                setFilterStatus(filterStatus === "Resolved" ? "All" : "Resolved")
                setFilterSeverity("All")
              } else {
                if (filterSeverity === s.id && filterStatus === "Unresolved") {
                  setFilterSeverity("All")
                  setFilterStatus("All")
                } else {
                  setFilterSeverity(s.id)
                  setFilterStatus("Unresolved")
                }
              }
            }}
            className={`bg-white rounded-2xl border shadow-sm p-6 flex items-center justify-between cursor-pointer transition-colors ${s.active ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'}`}
          >
            <span className={`text-sm font-bold ${s.color}`}>{s.label}</span>
            <span className="text-3xl font-black text-slate-900">{s.val}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["All", "Critical", "High", "Medium", "Low"].map(s => (
          <button key={s} onClick={() => { setFilterSeverity(s); if (s === "All") setFilterStatus("All"); }}
            className={`h-9 px-4 rounded-lg text-sm font-bold border transition-colors shadow-sm ${filterSeverity === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
            {s}
          </button>
        ))}
        <div className="w-px bg-slate-200 mx-2"></div>
        {["All", "Payment", "Merchant", "AI", "Trust", "Order", "System", "Finance"].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`h-9 px-4 rounded-lg text-sm font-bold border transition-colors shadow-sm ${filterType === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filtered.map(alert => {
          const Icon = typeIcons[alert.type] || Bell
          return (
            <div key={alert.id} className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 border-l-4 ${alert.status === "Resolved" ? "opacity-60" : ""} ${severityIndicator[alert.severity].split(' ')[0]}`}>
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 shrink-0 ${severityIndicator[alert.severity].split(' ')[1]}`}><Icon className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                    <span className="text-base font-bold text-slate-900">{alert.title}</span>
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 rounded-md ${severityBadge[alert.severity]}`}>{alert.severity}</Badge>
                    <Badge variant="outline" className={`text-xs px-2 py-0.5 rounded-md ${statusStyles[alert.status]}`}>{alert.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">{alert.detail}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{alert.time}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono">{alert.id}</span>
                    <span className="text-slate-300">•</span>
                    <Link href={alert.entityLink} className="text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">{alert.entity}</Link>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {alert.status === "New" && (
                    <button onClick={() => updateStatus(alert.id, "Acknowledged")}
                      className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">
                      <Eye className="h-3.5 w-3.5 text-slate-400" /> Ack
                    </button>
                  )}
                  {alert.status !== "Resolved" && (
                    <button onClick={() => updateStatus(alert.id, "Resolved")}
                      className="inline-flex h-8 items-center gap-1.5 px-3 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Resolve
                    </button>
                  )}
                  <Link href={alert.entityLink}
                    className="inline-flex h-8 items-center px-3 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

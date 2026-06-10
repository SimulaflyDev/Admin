"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, Users, Store, Wallet, FileText, MessageSquare, ShoppingCart } from "lucide-react"
import Link from "next/link"

const disputes = [
  { id: "DSP-4410", order: "ORD-8812", user: "Sneha R.", store: "Bandra West Outlet", merchant: "SneakerHead India", reason: "Item not as described", amount: 8999, status: "Open", age: "1d", priority: "High" },
  { id: "DSP-4401", order: "ORD-8720", user: "Mohit K.", store: "Royal Electronics HQ", merchant: "Royal Electronics", reason: "Product never delivered", amount: 134900, status: "Under Review", age: "3d", priority: "Critical" },
  { id: "DSP-4388", order: "ORD-8601", user: "Priya S.", store: "Bandra West Outlet", merchant: "SneakerHead India", reason: "Wrong size delivered", amount: 24999, status: "Resolved", age: "6d", priority: "Medium" },
]

const priorityStyles: Record<string, string> = {
  Critical: "bg-red-200 text-red-900 border-red-300",
  High: "bg-red-100 text-red-800 border-red-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
}
const disputeStatusStyles: Record<string, string> = {
  Open: "bg-blue-100 text-blue-800 border-blue-200",
  "Under Review": "bg-purple-100 text-purple-800 border-purple-200",
  Resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

export default function DisputeCenter() {
  const [selected, setSelected] = useState(disputes[0])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order Disputes & Chargebacks</h1>
          <p className="text-sm text-slate-500 mt-1">Manage refund requests, escalations, and chargeback investigations</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Disputes", val: "2", icon: AlertTriangle, color: "text-red-700 bg-red-50" },
          { label: "Under Review", val: "1", icon: Clock, color: "text-purple-700 bg-purple-50" },
          { label: "Resolved (MTD)", val: "14", icon: CheckCircle2, color: "text-emerald-700 bg-emerald-50" },
          { label: "Value at Risk", val: "₹1.44L", icon: Wallet, color: "text-amber-700 bg-amber-50" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${k.color} shrink-0`}><k.icon className="h-5 w-5" /></div>
            <div>
              <div className="text-xs text-slate-500">{k.label}</div>
              <div className="text-xl font-bold text-slate-900">{k.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Split panel: list + detail */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* List */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-100 text-sm font-semibold text-slate-700">All Disputes ({disputes.length})</div>
          <div className="divide-y divide-slate-100">
            {disputes.map(d => (
              <button
                key={d.id}
                onClick={() => setSelected(d)}
                className={`w-full text-left p-3 hover:bg-slate-50 transition-colors ${selected.id === d.id ? "bg-slate-50 border-l-2 border-l-slate-900" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">{d.id}</span>
                  <Badge variant="outline" className={`text-[10px] ${priorityStyles[d.priority]}`}>{d.priority}</Badge>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{d.order} · {d.user}</div>
                <div className="text-xs text-slate-600 mt-0.5 truncate">{d.reason}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="outline" className={`text-[10px] ${disputeStatusStyles[d.status]}`}>{d.status}</Badge>
                  <span className="text-[10px] text-slate-400">{d.age} ago</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">{selected.id}</h2>
                <p className="text-sm text-slate-500">{selected.order} · Filed {selected.age} ago</p>
              </div>
              <Badge variant="outline" className={`${disputeStatusStyles[selected.status]}`}>{selected.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { icon: Users, label: "Customer", val: selected.user },
                { icon: Store, label: "Store", val: selected.store },
                { icon: ShoppingCart, label: "Order", val: selected.order },
                { icon: Wallet, label: "Dispute Amount", val: `₹${selected.amount.toLocaleString()}` },
              ].map(i => (
                <div key={i.label} className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <i.icon className="h-4 w-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">{i.label}</div>
                    <div className="text-sm font-semibold text-slate-900">{i.val}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <div className="text-xs font-semibold text-amber-800 mb-1">Dispute Reason</div>
              <div className="text-sm text-amber-900">{selected.reason}</div>
            </div>

            {/* Resolution Actions */}
            {selected.status !== "Resolved" && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Resolution Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Issue Full Refund
                  </button>
                  <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-200 text-blue-700 text-sm font-medium hover:bg-blue-50">
                    Partial Refund
                  </button>
                  <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
                    <MessageSquare className="h-4 w-4" /> Contact Customer
                  </button>
                  <button className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50">
                    Deny Claim
                  </button>
                </div>
                <textarea className="w-full mt-2 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none" rows={2} placeholder="Add resolution notes (required before action)…" />
              </div>
            )}
            {selected.status === "Resolved" && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Dispute resolved — Full refund of ₹{selected.amount.toLocaleString()} issued to customer.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

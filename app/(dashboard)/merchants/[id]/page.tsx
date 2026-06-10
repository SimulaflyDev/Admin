"use client"

import { useState } from "react"
import { Building2, ShieldCheck, ShieldAlert, Wallet, Store, MapPin, Mail, Phone, Calendar, MoreVertical, FileText, CheckCircle2, AlertTriangle, Share2, Headset, TrendingUp, DollarSign, Package, ExternalLink, Download } from "lucide-react"

export default function MerchantProfile({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "stores", label: "Stores" },
    { id: "wallet", label: "Wallet" },
    { id: "orders", label: "Orders" },
    { id: "support", label: "Support" },
    { id: "invoices", label: "Invoices" },
    { id: "risk", label: "Risk" }
  ]

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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">Royal Electronics</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
              <div className="text-slate-500 text-sm font-mono mt-1 mb-3">{params.id}</div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-slate-400" /> contact@royalelec.in</div>
                <div className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-slate-400" /> +91 98765 43210</div>
                <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" /> Mumbai, India</div>
                <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-400" /> Joined Dec 2025</div>
              </div>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="flex flex-wrap lg:justify-end gap-3 lg:w-1/2">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex-1 min-w-[120px]">
              <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> Balance</div>
              <div className="text-lg font-bold text-slate-900">₹12.5L</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex-1 min-w-[120px]">
              <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><Store className="h-3.5 w-3.5" /> Stores</div>
              <div className="text-lg font-bold text-slate-900">4 Active</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex-1 min-w-[120px]">
              <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><Headset className="h-3.5 w-3.5" /> Support Load</div>
              <div className="text-lg font-bold text-slate-900">12 Open</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex-1 min-w-[120px]">
              <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> Risk Status</div>
              <div className="text-lg font-bold text-emerald-600">Low Risk</div>
            </div>
          </div>

        </div>
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
          {activeTab === "overview" && <TabOverview />}
          {activeTab === "stores" && <TabStores />}
          {activeTab === "wallet" && <TabWallet />}
          {activeTab === "orders" && <TabOrders />}
          {activeTab === "support" && <TabSupport />}
          {activeTab === "invoices" && <TabInvoices />}
          {activeTab === "risk" && <TabRisk />}
        </div>
      </div>
      
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function TabOverview() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Lifetime GMV", value: "₹4.2Cr", icon: DollarSign, color: "emerald" },
          { label: "Total Orders", value: "42,104", icon: Package, color: "indigo" },
          { label: "AI Generations", value: "8,402", icon: Share2, color: "purple" },
          { label: "Return Rate", value: "1.2%", icon: TrendingUp, color: "blue" }
        ].map((stat, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
              <stat.icon className={`h-4 w-4 text-${stat.color}-500`} /> {stat.label}
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-sm text-slate-900">Recent Global Orders</div>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-white border-b border-slate-100 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Store</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1,2,3,4,5].map(i => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-slate-600">#ORD-99{i}2</td>
                <td className="px-4 py-3 font-medium text-slate-900">Royal Flagship Store</td>
                <td className="px-4 py-3 font-bold text-slate-700">₹{i * 1250}</td>
                <td className="px-4 py-3"><span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded text-xs font-bold border border-emerald-100">Delivered</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabStores() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase font-semibold">
          <tr>
            <th className="px-6 py-4">Store Details</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Products</th>
            <th className="px-6 py-4">30d Revenue</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {[
            { n: "Royal Flagship Store", id: "STR-001", s: "Active", c: "emerald", p: 1402, r: "₹4.2L" },
            { n: "Royal Audio", id: "STR-002", s: "Active", c: "emerald", p: 412, r: "₹1.8L" },
            { n: "Royal Mobile Accessories", id: "STR-003", s: "Active", c: "emerald", p: 840, r: "₹2.1L" },
            { n: "Royal Clearance", id: "STR-004", s: "Hidden", c: "amber", p: 54, r: "₹45K" },
          ].map((s, i) => (
            <tr key={i} className="hover:bg-slate-50 group">
              <td className="px-6 py-4">
                <div className="font-bold text-slate-900">{s.n}</div>
                <div className="text-xs font-mono text-slate-500">{s.id}</div>
              </td>
              <td className="px-6 py-4">
                <span className={`text-${s.c}-700 bg-${s.c}-50 px-2.5 py-1 rounded-md text-xs font-bold border border-${s.c}-100`}>{s.s}</span>
              </td>
              <td className="px-6 py-4 font-mono">{s.p}</td>
              <td className="px-6 py-4 font-bold text-slate-700">{s.r}</td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><ExternalLink className="h-4 w-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TabWallet() {
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false)

  return (
    <div className="space-y-6 p-6">
      
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-end justify-between border-b border-slate-100 pb-6">
        <div className="flex-1 max-w-sm">
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Redeem Code</label>
          <div className="flex gap-2">
            <input type="text" placeholder="e.g. SIMULA500" className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none uppercase" />
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors">Redeem</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 shadow-sm transition-colors">
            <Download className="h-4 w-4"/> Export CSV
          </button>
          <button onClick={() => setIsCreditModalOpen(true)} className="flex items-center gap-2 text-sm font-bold text-white bg-indigo-600 border border-transparent px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors">
            <DollarSign className="h-4 w-4"/> Credit Wallet
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Merchant Wallet Ledger</h3>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">Current Balance: ₹12,50,000</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-white border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { d: "Today, 11:30 AM", t: "Buyer Intel Unlock", r: "Rahul Sharma", src: "System", a: "-₹30", c: "rose", b: "₹1,820" },
                { d: "Today, 10:42 AM", t: "AI Visualization", r: "IMG-2218", src: "System", a: "-₹1", c: "rose", b: "₹1,850" },
                { d: "Today, 09:15 AM", t: "Booking Confirmation Fee", r: "ORD-91821", src: "System (Ord Val: ₹7,500)", a: "-₹150", c: "rose", b: "₹1,851" },
                { d: "Yesterday, 4:12 PM", t: "Manual Credit", r: "Promo", src: "Org Manager", a: "+₹1,000", c: "emerald", b: "₹2,001" },
                { d: "14/03/2026", t: "Order Payout", r: "ORD-91821", src: "System", a: "+₹1,001", c: "emerald", b: "₹1,001" },
              ].map((tx, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{tx.d}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{tx.t}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{tx.r}</td>
                  <td className="px-6 py-4 text-slate-600 text-xs">{tx.src}</td>
                  <td className={`px-6 py-4 font-bold text-${tx.c}-600`}>{tx.a}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">{tx.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Credit Wallet Modal Overlay */}
      {isCreditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><DollarSign className="h-5 w-5 text-indigo-600" /> Credit Wallet</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Merchant</label>
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">Royal Electronics</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Amount (₹)</label>
                <input type="number" placeholder="Enter amount to credit" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
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
              <button onClick={() => setIsCreditModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">Cancel</button>
              <button onClick={() => setIsCreditModalOpen(false)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">Confirm Credit</button>
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
      <h3 className="text-lg font-bold text-slate-900 mb-1">Global Order Feed</h3>
      <p className="max-w-md">The Order feed is rendering via the unified Commerce module. Realtime data will populate here when the backend connects.</p>
    </div>
  )
}

function TabSupport() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase font-semibold">
          <tr>
            <th className="px-6 py-4">Ticket ID</th>
            <th className="px-6 py-4">Subject</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4">Priority</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {[
            { id: "TCK-992", sub: "Payout delayed for Order #ORD-991", t: "Billing", p: "High", pc: "rose", s: "Open", sc: "amber", d: "2 hours ago" },
            { id: "TCK-881", sub: "Cannot upload 3D model for product", t: "Technical", p: "Medium", pc: "amber", s: "In Progress", sc: "blue", d: "Yesterday" },
            { id: "TCK-712", sub: "Customer dispute regarding refund", t: "Dispute", p: "High", pc: "rose", s: "Resolved", sc: "emerald", d: "14/03/2026" },
          ].map((t, i) => (
            <tr key={i} className="hover:bg-slate-50 cursor-pointer">
              <td className="px-6 py-4 font-mono text-xs text-slate-500">{t.id}</td>
              <td className="px-6 py-4 font-bold text-slate-900">{t.sub}</td>
              <td className="px-6 py-4 text-slate-600">{t.t}</td>
              <td className="px-6 py-4"><span className={`text-${t.pc}-700 bg-${t.pc}-50 px-2 py-0.5 rounded text-xs font-bold`}>{t.p}</span></td>
              <td className="px-6 py-4"><span className={`text-${t.sc}-700 bg-${t.sc}-50 px-2 py-0.5 rounded border border-${t.sc}-100 text-xs font-bold`}>{t.s}</span></td>
              <td className="px-6 py-4 text-right text-slate-500">{t.d}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TabInvoices() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase font-semibold">
          <tr>
            <th className="px-6 py-4">Invoice ID</th>
            <th className="px-6 py-4">Period</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Due Date</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {[
            { id: "INV-2026-03", p: "March 2026", a: "₹45,200", d: "05/04/2026", s: "Unpaid", sc: "amber" },
            { id: "INV-2026-02", p: "February 2026", a: "₹41,100", d: "05/03/2026", s: "Paid", sc: "emerald" },
            { id: "INV-2026-01", p: "January 2026", a: "₹38,450", d: "05/02/2026", s: "Paid", sc: "emerald" },
          ].map((inv, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-mono text-xs text-slate-500">{inv.id}</td>
              <td className="px-6 py-4 font-medium text-slate-900">{inv.p}</td>
              <td className="px-6 py-4 font-bold text-slate-700">{inv.a}</td>
              <td className="px-6 py-4 text-slate-600">{inv.d}</td>
              <td className="px-6 py-4"><span className={`text-${inv.sc}-700 bg-${inv.sc}-50 px-2 py-0.5 rounded border border-${inv.sc}-100 text-xs font-bold`}>{inv.s}</span></td>
              <td className="px-6 py-4 text-right">
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1 justify-end w-full"><Download className="h-4 w-4"/> PDF</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TabRisk() {
  return (
    <div className="p-6 space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col justify-center items-center text-center shadow-sm">
          <ShieldCheck className="h-10 w-10 text-emerald-500 mb-3" />
          <h3 className="font-bold text-slate-900">KYC Verified</h3>
          <p className="text-xs text-slate-500 mt-1">Documents approved on 12/01/2025</p>
        </div>
        <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col justify-center items-center text-center shadow-sm">
          <div className="text-3xl font-bold text-emerald-600 mb-1">98/100</div>
          <h3 className="font-bold text-slate-900">Trust Score</h3>
          <p className="text-xs text-slate-500 mt-1">Excellent standing</p>
        </div>
        <div className="border border-slate-200 rounded-xl p-5 bg-white flex flex-col justify-center items-center text-center shadow-sm">
          <AlertTriangle className="h-10 w-10 text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-900">0 Active Flags</h3>
          <p className="text-xs text-slate-500 mt-1">No restrictions applied</p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-sm text-slate-900">Security Audit Log</div>
        <table className="w-full text-sm text-left">
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-500 w-32">Today, 10:42 AM</td>
              <td className="px-4 py-3 font-medium text-slate-900">Login from new device (MacBook Pro) in Mumbai, IN</td>
              <td className="px-4 py-3 text-right"><span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">System Note</span></td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-500 w-32">14/03/2026</td>
              <td className="px-4 py-3 font-medium text-slate-900">Bank account details updated and auto-verified</td>
              <td className="px-4 py-3 text-right"><span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">System Note</span></td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )
}

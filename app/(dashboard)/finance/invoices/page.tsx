"use client"

import { useState } from "react"
import { FileText, Download, Search, Filter, ArrowRight, Building2, CreditCard, CheckCircle2, Clock, XCircle } from "lucide-react"

export default function InvoicesPage() {
  const [activeFilter, setActiveFilter] = useState("all")

  // Mock data for wallet recharges by merchants
  const invoices = [
    { id: "INV-2026-0891", merchant: "Royal Electronics", amount: "₹50,000", date: "Today, 10:45 AM", method: "Bank Transfer", status: "Completed", type: "Wallet Recharge" },
    { id: "INV-2026-0890", merchant: "SneakerHead India", amount: "₹15,000", date: "Today, 09:12 AM", method: "Credit Card", status: "Completed", type: "Wallet Recharge" },
    { id: "INV-2026-0889", merchant: "Urban Grocers", amount: "₹5,000", date: "Yesterday, 16:30 PM", method: "UPI", status: "Pending", type: "Wallet Recharge" },
    { id: "INV-2026-0888", merchant: "TechFix Solutions", amount: "₹25,000", date: "Yesterday, 11:20 AM", method: "Bank Transfer", status: "Completed", type: "Wallet Recharge" },
    { id: "INV-2026-0887", merchant: "Bella Boutique", amount: "₹10,000", date: "14/03/2026", method: "Debit Card", status: "Failed", type: "Wallet Recharge" },
    { id: "INV-2026-0886", merchant: "Fresh Foods Market", amount: "₹1,00,000", date: "12/03/2026", method: "Bank Transfer", status: "Completed", type: "Wallet Recharge" },
    { id: "INV-2026-0885", merchant: "Style Hub Trends", amount: "₹8,500", date: "10/03/2026", method: "UPI", status: "Completed", type: "Wallet Recharge" },
  ]

  const filteredInvoices = activeFilter === "all" ? invoices : invoices.filter(inv => inv.status.toLowerCase() === activeFilter.toLowerCase())

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-indigo-600" />
            Wallet Recharge Invoices
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track wallet top-up invoices across all merchants.</p>
        </div>
        <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
          <Download className="h-4 w-4" /> Export All
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-sm font-semibold text-slate-600">Total Recharges (MTD)</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">₹14,50,000</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-6 w-6" /></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-sm font-semibold text-slate-600">Pending Approvals</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">₹45,000</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600"><Clock className="h-6 w-6" /></div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="text-sm font-semibold text-slate-600">Failed Transactions</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">12</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600"><XCircle className="h-6 w-6" /></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        {/* Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search invoices or merchants..." className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-72 bg-white shadow-sm" />
            </div>
            <button className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 bg-white shadow-sm"><Filter className="h-4 w-4" /></button>
          </div>

          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
            {["All", "Completed", "Pending", "Failed"].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter.toLowerCase())}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${
                  activeFilter === filter.toLowerCase() 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-white border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Merchant</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-mono font-medium text-indigo-600">{inv.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold text-slate-900">{inv.merchant}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{inv.date}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{inv.amount}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      {inv.method}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                      inv.status === "Completed" ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                      inv.status === "Pending" ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                      {inv.status === "Completed" && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {inv.status === "Pending" && <Clock className="h-3.5 w-3.5" />}
                      {inv.status === "Failed" && <XCircle className="h-3.5 w-3.5" />}
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Download">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

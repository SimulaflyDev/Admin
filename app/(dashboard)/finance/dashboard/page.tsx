"use client"

import { LineChart, DollarSign, Wallet, ClipboardList, ArrowUpRight, TrendingUp, AlertTriangle, ArrowRight, Download, CreditCard } from "lucide-react"

export default function FinancialDashboard() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <LineChart className="h-6 w-6 text-indigo-600" />
            Financial Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">Executive overview of SimulaFly revenue, fees, and collections.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" /> Export Report
          </button>
        </div>
      </div>

      {/* ── Top Level KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Today */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-slate-600 mb-1 flex items-center justify-between">
            Revenue Today
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">₹45,200</div>
          <div className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> +12% vs yesterday
          </div>
        </div>

        {/* Revenue MTD */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-slate-600 mb-1 flex items-center justify-between">
            Revenue (MTD)
            <DollarSign className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">₹14.2L</div>
          <div className="text-xs font-medium text-emerald-600 mt-2 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> On track for ₹18L target
          </div>
        </div>

        {/* Pending Collections */}
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle className="h-16 w-16 text-amber-500" />
          </div>
          <div className="text-sm font-semibold text-amber-800 mb-1 relative z-10">Pending Collections</div>
          <div className="text-3xl font-black text-amber-900 relative z-10">₹2.4L</div>
          <div className="text-xs font-medium text-amber-700 mt-2 relative z-10">
            Across 18 outstanding invoices
          </div>
        </div>

        {/* Wallet Liability */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-slate-600 mb-1 flex items-center justify-between">
            Total Wallet Credits
            <Wallet className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-900">₹24.8L</div>
          <div className="text-xs font-medium text-slate-500 mt-2">
            Total active balance across all merchants
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Split */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Revenue Breakdown (MTD)</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center gap-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Booking Fees</div>
                  <div className="text-xs text-slate-500">Platform fees charged per booking</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-slate-900">₹8.5L</div>
                <div className="text-xs font-medium text-indigo-600">60% of Revenue</div>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-[60%]"></div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Wallet Topup Surcharge</div>
                  <div className="text-xs text-slate-500">Processing fees on merchant deposits</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-slate-900">₹5.7L</div>
                <div className="text-xs font-medium text-emerald-600">40% of Revenue</div>
              </div>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[40%]"></div>
            </div>

          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-900">High Priority Collections</h3>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-white border-b border-slate-100 uppercase font-semibold">
                <tr>
                  <th className="px-5 py-3">Merchant</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { m: "Style Hub Trends", d: "05/03/2026 (Overdue)", a: "₹45,200", alert: true },
                  { m: "TechFix Solutions", d: "05/04/2026", a: "₹21,000", alert: false },
                  { m: "SneakerHead India", d: "05/04/2026", a: "₹18,500", alert: false },
                  { m: "Royal Mobile Accessories", d: "10/04/2026", a: "₹12,400", alert: false },
                ].map((inv, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-900">{inv.m}</td>
                    <td className={`px-5 py-3 font-medium ${inv.alert ? 'text-rose-600' : 'text-slate-600'}`}>
                      {inv.alert && <AlertTriangle className="inline-block h-3 w-3 mr-1" />}
                      {inv.d}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-800">{inv.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  )
}

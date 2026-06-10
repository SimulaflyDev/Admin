"use client"

import { useState } from "react"
import { Building2, Search, Filter, ShieldCheck, ShieldAlert, Wallet, Store, ArrowRight } from "lucide-react"
import Link from "next/link"

const MOCK_MERCHANTS = [
  { id: "M-8922", name: "Royal Electronics", email: "contact@royalelec.in", verified: true, stores: 4, balance: "₹12.5L", risk: "Low", joined: "12/01/2025" },
  { id: "M-1044", name: "SneakerHead Kicks", email: "sales@sneakerhead.co", verified: true, stores: 1, balance: "₹45.2K", risk: "Low", joined: "04/03/2026" },
  { id: "M-4491", name: "Urban Grocers", email: "admin@urbangrocers.com", verified: false, stores: 0, balance: "₹0", risk: "Medium", joined: "14/03/2026" },
  { id: "M-9921", name: "TechFix Solutions", email: "support@techfix.in", verified: true, stores: 2, balance: "₹8.4L", risk: "High", joined: "11/11/2025" },
  { id: "M-5510", name: "Bella Boutique", email: "hello@bellaboutique.com", verified: true, stores: 3, balance: "₹1.2L", risk: "Low", joined: "05/02/2026" },
]

export default function MerchantDirectory() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Merchant Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and monitor all merchants on the platform.</p>
        </div>
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button className="px-4 py-2 bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-indigo-700">
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Merchant ID, Name, or Email..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50/80 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Merchant</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Stores</th>
                <th className="px-6 py-4">Wallet Balance</th>
                <th className="px-6 py-4">Risk Level</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_MERCHANTS.map((merchant) => (
                <tr key={merchant.id} className="bg-white hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{merchant.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{merchant.id} • {merchant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {merchant.verified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                        Pending KYC
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Store className="h-4 w-4 text-slate-400" /> {merchant.stores}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Wallet className="h-4 w-4 text-slate-400" /> {merchant.balance}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                      merchant.risk === 'Low' ? 'bg-slate-100 text-slate-600' :
                      merchant.risk === 'Medium' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {merchant.risk === 'High' && <ShieldAlert className="h-3.5 w-3.5" />}
                      {merchant.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{merchant.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/merchants/${merchant.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <span>Showing 5 of 1,420 merchants</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">&lt;</button>
            <button className="px-2 py-1 bg-indigo-600 border border-indigo-600 text-white rounded">1</button>
            <button className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">2</button>
            <button className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">3</button>
            <button className="px-2 py-1 bg-white border border-slate-200 rounded hover:bg-slate-50">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Tag, Plus, Copy, Ban, CheckCircle2, XCircle, Clock, AlertTriangle, Layers, Eye } from "lucide-react"

export default function RedeemCodesPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Tag className="h-6 w-6 text-indigo-600" />
            Redeem Codes
          </h1>
          <p className="text-sm text-slate-500 mt-1">Generate and manage promotional wallet credits for merchants.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors">
            <Layers className="h-4 w-4" /> Bulk Generate
          </button>
          <button className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-indigo-600 border border-transparent text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-colors">
            <Plus className="h-4 w-4" /> Create Code
          </button>
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-slate-600 mb-1 flex items-center justify-between">
            Active Codes
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">12</div>
          <div className="text-xs font-medium text-emerald-600 mt-2">
            Ready to be claimed
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-slate-600 mb-1 flex items-center justify-between">
            Redeemed (MTD)
            <Tag className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">45</div>
          <div className="text-xs font-medium text-slate-500 mt-2">
            Wallet credits claimed
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-slate-600 mb-1 flex items-center justify-between">
            Total Value Claimed
            <span className="text-xs font-bold text-slate-400">MTD</span>
          </div>
          <div className="text-3xl font-black text-slate-900">₹22.5K</div>
          <div className="text-xs font-medium text-slate-500 mt-2">
            Cost of promotional credits
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm font-semibold text-slate-600 mb-1 flex items-center justify-between">
            Expired / Disabled
            <Ban className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">8</div>
          <div className="text-xs font-medium text-slate-500 mt-2">
            Codes no longer valid
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Code Master List</h3>
          <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Type: Merchant Wallet Credit Only</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-white border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Created By</th>
                <th className="px-6 py-4">Redeemed By</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { code: "SIMULA500", val: "₹500", cb: "Nia R. (Org Manager)", rb: "-", exp: "31/12/2026", status: "Active", sc: "emerald" },
                { code: "WELCOME1000", val: "₹1,000", cb: "David K. (Ops)", rb: "Royal Electronics", exp: "-", status: "Redeemed", sc: "blue" },
                { code: "FESTIVE250", val: "₹250", cb: "System Auto", rb: "SneakerHead India", exp: "-", status: "Redeemed", sc: "blue" },
                { code: "APOLOGY100", val: "₹100", cb: "Support Agent", rb: "-", exp: "01/01/2026", status: "Expired", sc: "amber" },
                { code: "TESTCODE50", val: "₹50", cb: "Nia R. (Org Manager)", rb: "-", exp: "-", status: "Disabled", sc: "slate" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 tracking-wider bg-slate-100 px-2 py-1 rounded">{row.code}</span>
                      {row.status === "Active" && (
                        <button className="text-slate-400 hover:text-indigo-600" title="Copy Code">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{row.val}</td>
                  <td className="px-6 py-4 text-slate-600">{row.cb}</td>
                  <td className="px-6 py-4">
                    {row.rb !== "-" ? (
                      <span className="font-medium text-slate-900">{row.rb}</span>
                    ) : (
                      <span className="text-slate-400 italic">Unclaimed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{row.exp}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border border-${row.sc}-200 bg-${row.sc}-50 text-${row.sc}-700`}>
                      {row.status === "Active" && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {row.status === "Redeemed" && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {row.status === "Expired" && <Clock className="h-3.5 w-3.5" />}
                      {row.status === "Disabled" && <Ban className="h-3.5 w-3.5" />}
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {row.status === "Redeemed" && (
                        <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Redemption">
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {row.status === "Active" && (
                        <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Disable Code">
                          <Ban className="h-4 w-4" />
                        </button>
                      )}
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

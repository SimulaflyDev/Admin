"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Square, ShieldCheck, Save } from "lucide-react"

const roles = ["Org Manager", "Operations", "Finance", "Merchant Support", "Consumer Support", "Analytics", "Trust & Safety", "Technical"]

const modules = [
  { group: "Command Center", items: ["Executive Dashboard", "Realtime Activity", "Alert Center"] },
  { group: "Users", items: ["User Directory", "User Profile", "User Analytics", "User Attribution"] },
  { group: "Merchants", items: ["Merchant Directory", "Merchant Profile", "Merchant Onboarding", "Merchant Health"] },
  { group: "Stores", items: ["Store Directory", "Store Profile", "Listing Control"] },
  { group: "Products", items: ["Product Directory", "Product Profile", "Product Moderation"] },
  { group: "Orders", items: ["Order Dashboard", "Order Profile", "Dispute Center"] },
  { group: "Finance", items: ["Wallet Dashboard", "Invoice Directory", "Billing Thresholds"] },
  { group: "Offers", items: ["Offer Center", "Coupon Management", "Discount Rules"] },
  { group: "AI", items: ["AI Operations", "AI Economics", "AI Failure Monitor"] },
  { group: "Support", items: ["Consumer Support", "Merchant Support", "Finance Support", "Technical Support"] },
  { group: "Trust & Safety", items: ["Verification Queue", "Fraud Detection", "Restrictions"] },
  { group: "Analytics", items: ["Company Analytics", "Merchant Analytics", "Store Analytics"] },
  { group: "System", items: ["Audit Log", "System Health", "Settings"] },
]

// Default permission matrix
const defaultPerms: Record<string, Record<string, "full" | "view" | "none">> = {
  "Org Manager": Object.fromEntries(modules.flatMap(m => m.items.map(i => [i, "full"]))),
  Operations: Object.fromEntries(modules.flatMap(m => m.items.map(i => [i, m.group === "Finance" || m.group === "System" ? "view" : "full"]))),
  Finance: Object.fromEntries(modules.flatMap(m => m.items.map(i => [i, ["Finance", "Offers"].includes(m.group) ? "full" : m.group === "Command Center" ? "view" : "none"]))),
  "Merchant Support": Object.fromEntries(modules.flatMap(m => m.items.map(i => [i, ["Merchants", "Stores", "Products", "Orders"].includes(m.group) ? "full" : "view"]))),
  "Consumer Support": Object.fromEntries(modules.flatMap(m => m.items.map(i => [i, ["Users", "Orders"].includes(m.group) ? "full" : m.group === "Command Center" ? "view" : "none"]))),
  Analytics: Object.fromEntries(modules.flatMap(m => m.items.map(i => [i, ["Analytics", "Command Center"].includes(m.group) ? "full" : "view"]))),
  "Trust & Safety": Object.fromEntries(modules.flatMap(m => m.items.map(i => [i, ["Trust & Safety", "Command Center"].includes(m.group) ? "full" : "view"]))),
  Technical: Object.fromEntries(modules.flatMap(m => m.items.map(i => [i, ["AI", "System"].includes(m.group) ? "full" : "view"]))),
}

const permStyles: Record<string, { cell: string; label: string }> = {
  full: { cell: "bg-emerald-50", label: "Full" },
  view: { cell: "bg-blue-50", label: "View" },
  none: { cell: "bg-slate-50", label: "—" },
}

export default function PermissionsMatrix() {
  const [perms, setPerms] = useState(defaultPerms)
  const [saved, setSaved] = useState(false)

  function cycle(role: string, item: string) {
    setPerms(prev => {
      const cur = prev[role]?.[item] || "none"
      const next = cur === "full" ? "view" : cur === "view" ? "none" : "full"
      return { ...prev, [role]: { ...prev[role], [item]: next } }
    })
    setSaved(false)
  }

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Permissions Matrix</h1>
          <p className="text-sm text-slate-500 mt-1">Configure module-level access for each admin role. Click a cell to cycle: Full → View → None.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-200 rounded-sm border border-emerald-300"></span>Full Access</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-200 rounded-sm border border-blue-300"></span>View Only</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-200 rounded-sm border border-slate-300"></span>No Access</span>
          </div>
          <button onClick={save} className={`inline-flex h-9 items-center gap-2 px-4 rounded-lg text-sm font-medium transition-colors ${saved ? "bg-emerald-600 text-white" : "bg-slate-900 text-white hover:bg-slate-800"}`}>
            <Save className="h-4 w-4" />{saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Legend note */}
      <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        Changes here are logged in the Audit Log and require Org Manager credentials to save.
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="text-xs min-w-max w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-700 sticky left-0 bg-slate-50 min-w-[200px]">Module / Feature</th>
              {roles.map(role => (
                <th key={role} className="px-3 py-3 font-semibold text-slate-700 text-center min-w-[110px] border-l border-slate-100">
                  <div className="leading-tight">{role}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map(group => (
              <>
                <tr key={group.group} className="bg-slate-100">
                  <td className="px-4 py-1.5 font-bold text-slate-600 uppercase tracking-widest text-[10px] sticky left-0 bg-slate-100" colSpan={roles.length + 1}>
                    {group.group}
                  </td>
                </tr>
                {group.items.map(item => (
                  <tr key={item} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-800 font-medium sticky left-0 bg-white border-r border-slate-100">{item}</td>
                    {roles.map(role => {
                      const perm = perms[role]?.[item] || "none"
                      const style = permStyles[perm]
                      return (
                        <td key={role} className={`text-center py-2 px-2 border-l border-slate-100 cursor-pointer ${style.cell} hover:brightness-95 transition-all`}
                          onClick={() => cycle(role, item)}
                          title={`${role} / ${item}: ${perm} — click to change`}
                        >
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${perm === "full" ? "text-emerald-800" : perm === "view" ? "text-blue-700" : "text-slate-400"}`}>
                            {style.label}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

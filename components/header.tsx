"use client"

import { useState, useEffect } from "react"
import { Bell, ChevronDown, X, History, User } from "lucide-react"
import { GlobalSearch } from "./global-search"

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [orgOpen, setOrgOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState<any>(null)

  const [notifications, setNotifications] = useState([
    { id: 1, color: "bg-rose-500", title: "Member Removed", desc: "Jane Smith was removed from the organization by Nia R.", time: "2 mins ago", author: "Nia R. (Super Admin)", changes: ["Revoked dashboard access for Jane Smith", "Removed user from 'Finance' permission group"] },
    { id: 2, color: "bg-indigo-500", title: "Permissions Updated", desc: "David Kim's role changed to Operations Lead.", time: "1 hour ago", author: "System Auto-Provision", changes: ["Changed Role: Support → Operations Lead", "Granted access to Catalog Management"] }
  ])

  useEffect(() => {
    const handlePricingSave = () => {
      setNotifications(prev => [
        { 
          id: Date.now(), 
          color: "bg-emerald-500", 
          title: "Pricing Controls Updated", 
          desc: "New booking fee rules have been configured by Org Manager.", 
          time: "Just now",
          author: "Sarah Chen (Org Manager)",
          changes: [
            "Updated 'Standard Booking Fee' to ₹100 (Flat)",
            "Modified 'Large Order Fee' threshold to ≥ ₹5,000",
            "Enabled AI Visualization Pricing Module",
            "Set Tier 1 Buyer Intel Unlock to ₹30"
          ]
        },
        ...prev
      ])
      setHasUnread(true)
    }

    window.addEventListener('pricing-config-saved', handlePricingSave)
    return () => window.removeEventListener('pricing-config-saved', handlePricingSave)
  }, [])

  return (
    <header className="h-14 shrink-0 border-b border-slate-200 bg-white flex items-center justify-between px-6">
      {/* Left Spacer (for perfect centering) */}
      <div className="flex-1"></div>

      {/* Global Search (Centered) */}
      <div className="flex-1 max-w-xl relative w-full">
        <GlobalSearch />
      </div>

      {/* Right Controls (Pushed Right) */}
      <div className="flex-1 flex items-center justify-end gap-3 relative">
        {/* Alerts */}
        <div className="relative">
            <button 
              onClick={() => { setAlertsOpen(!alertsOpen); setOrgOpen(false); setHasUnread(false); }}
              className={`relative p-1.5 rounded-md transition-colors ${alertsOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'}`}
            >
              <Bell className="h-5 w-5" />
              {hasUnread && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>}
            </button>
            
            {alertsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <span className="font-semibold text-sm text-slate-900">Internal Org Updates</span>
                  <span className="text-xs text-indigo-600 font-medium cursor-pointer" onClick={() => setHasUnread(false)}>Mark all read</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => { setSelectedNotification(notif); setAlertsOpen(false); }}
                      className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-900 flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${notif.color}`}></span> {notif.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{notif.desc}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Org Context */}
        <div className="relative">
          <div 
            onClick={() => { setOrgOpen(!orgOpen); setAlertsOpen(false); }}
            className={`flex items-center gap-2 text-sm border rounded-md px-2.5 py-1 cursor-pointer transition-colors shadow-sm select-none ${orgOpen ? 'border-indigo-200 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'}`}
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="font-medium text-xs">Org. Global (Super Admin)</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${orgOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`} />
          </div>

          {orgOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 py-1">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Switch Organization</div>
              <div className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-slate-900">Org. Global</span>
                </div>
                <span className="text-xs text-indigo-600 font-medium">Active</span>
              </div>
              <div className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                <span className="text-sm font-medium text-slate-600">Org. India (Regional)</span>
              </div>
              <div className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                <span className="text-sm font-medium text-slate-600">Org. Europe (Regional)</span>
              </div>
              <div className="border-t border-slate-100 mt-1 py-1">
                <div className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-indigo-600 font-medium">
                  Manage Organizations...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Notification Detail Modal ── */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${selectedNotification.color}`}></span>
                Activity Detail
              </h3>
              <button onClick={() => setSelectedNotification(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-lg font-bold text-slate-900">{selectedNotification.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{selectedNotification.desc}</p>
                <p className="text-xs font-bold text-slate-400 mt-2 uppercase">{selectedNotification.time}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <User className="h-4 w-4 text-slate-400" />
                  Action performed by:
                </div>
                <div className="text-sm font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg inline-block">
                  {selectedNotification.author}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                  <History className="h-4 w-4 text-slate-400" />
                  Audit Log / Changes:
                </div>
                <ul className="space-y-2">
                  {selectedNotification.changes.map((change: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-emerald-500 font-bold mt-0.5">+</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button onClick={() => setSelectedNotification(null)} className="px-5 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

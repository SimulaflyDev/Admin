"use client"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Star, Lock, Unlock, Trash2, Archive, AlertTriangle, Clock, ChevronRight } from "lucide-react"
import Link from "next/link"

type ListingState = "Active" | "Hidden" | "Featured" | "Restricted" | "Frozen" | "Delisted" | "Archived"

const stateConfig: Record<ListingState, { color: string; desc: string }> = {
  Active:     { color: "bg-emerald-100 text-emerald-800 border-emerald-200", desc: "Store is live and discoverable by all users." },
  Hidden:     { color: "bg-slate-100 text-slate-700 border-slate-200",      desc: "Store is hidden from search/browse. Direct URL still works." },
  Featured:   { color: "bg-amber-100 text-amber-800 border-amber-200",      desc: "Store is promoted and appears in featured carousels." },
  Restricted: { color: "bg-orange-100 text-orange-800 border-orange-200",   desc: "Store is limited — new bookings blocked. Existing orders continue." },
  Frozen:     { color: "bg-red-100 text-red-800 border-red-200",            desc: "Store is completely locked. No new orders. Wallet frozen." },
  Delisted:   { color: "bg-red-200 text-red-900 border-red-300",            desc: "Store removed from platform. Requires ops approval to reinstate." },
  Archived:   { color: "bg-slate-200 text-slate-700 border-slate-300",      desc: "Store is permanently archived. Cannot be reinstated." },
}

const historyLog = [
  { action: "Activated", by: "Ops: Nia R.", time: "2 Jan 2024, 10:00 AM", reason: "Initial onboarding completed" },
  { action: "Featured", by: "Ops: Nia R.", time: "14 Feb 2024, 11:30 AM", reason: "Valentine's Day campaign" },
  { action: "Active (Demoted)", by: "Ops: Rohan K.", time: "15 Feb 2024, 12:00 AM", reason: "Campaign ended" },
]

const transitions: Record<ListingState, { label: string; target: ListingState; icon: React.ElementType; style: string; role: string }[]> = {
  Active:     [
    { label: "Hide Store", target: "Hidden", icon: EyeOff, style: "border-slate-200 text-slate-700 hover:bg-slate-50", role: "Ops" },
    { label: "Feature Store", target: "Featured", icon: Star, style: "border-amber-200 text-amber-700 hover:bg-amber-50", role: "Ops" },
    { label: "Restrict Store", target: "Restricted", icon: Lock, style: "border-orange-200 text-orange-700 hover:bg-orange-50", role: "Trust & Safety" },
  ],
  Hidden:     [
    { label: "Restore to Active", target: "Active", icon: Eye, style: "border-emerald-200 text-emerald-700 hover:bg-emerald-50", role: "Ops" },
    { label: "Restrict Store", target: "Restricted", icon: Lock, style: "border-orange-200 text-orange-700 hover:bg-orange-50", role: "Trust & Safety" },
  ],
  Featured:   [
    { label: "Demote to Active", target: "Active", icon: CheckCircle2, style: "border-slate-200 text-slate-700 hover:bg-slate-50", role: "Ops" },
    { label: "Hide Store", target: "Hidden", icon: EyeOff, style: "border-slate-200 text-slate-700 hover:bg-slate-50", role: "Ops" },
  ],
  Restricted: [
    { label: "Clear Restriction", target: "Active", icon: Unlock, style: "border-emerald-200 text-emerald-700 hover:bg-emerald-50", role: "Ops" },
    { label: "Freeze Store", target: "Frozen", icon: Lock, style: "border-red-200 text-red-700 hover:bg-red-50", role: "Trust & Safety" },
    { label: "Delist Store", target: "Delisted", icon: Trash2, style: "border-red-300 text-red-800 hover:bg-red-50", role: "Trust & Safety" },
  ],
  Frozen:     [
    { label: "Unfreeze Store", target: "Active", icon: Unlock, style: "border-emerald-200 text-emerald-700 hover:bg-emerald-50", role: "Org Mgr" },
    { label: "Delist Store", target: "Delisted", icon: Trash2, style: "border-red-300 text-red-800 hover:bg-red-50", role: "Trust & Safety" },
  ],
  Delisted:   [
    { label: "Reinstate (Requires Approval)", target: "Active", icon: Unlock, style: "border-emerald-200 text-emerald-700 hover:bg-emerald-50", role: "Org Mgr" },
    { label: "Archive Permanently", target: "Archived", icon: Archive, style: "border-slate-300 text-slate-700 hover:bg-slate-50", role: "Org Mgr" },
  ],
  Archived: [],
}

export default function StoreListingControl({ params }: { params: { id: string } }) {
  const [currentState, setCurrentState] = useState<ListingState>("Active")
  const [reason, setReason] = useState("")
  const [confirmTarget, setConfirmTarget] = useState<ListingState | null>(null)
  const [log, setLog] = useState(historyLog)

  function applyTransition(target: ListingState) {
    if (!reason.trim()) { alert("Please enter a reason before changing the listing state."); return }
    setLog(prev => [{ action: `→ ${target}`, by: "You (Org Mgr)", time: "Just now", reason }, ...prev])
    setCurrentState(target)
    setConfirmTarget(null)
    setReason("")
  }

  const cfg = stateConfig[currentState]

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-start gap-4">
        <Link href="/stores/STR-8812" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Listing Control Panel</h1>
          <p className="text-sm text-slate-500 mt-0.5">Bandra West Outlet · STR-8812 · <Link href="/merchants/MER-4421" className="text-blue-600 hover:underline">SneakerHead India</Link></p>
        </div>
      </div>

      {/* Current State */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">Current Listing State</h2>
        <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${cfg.color}`}>
          <CheckCircle2 className="h-6 w-6 shrink-0" />
          <div>
            <div className="text-lg font-bold">{currentState}</div>
            <div className="text-sm opacity-80 mt-0.5">{cfg.desc}</div>
          </div>
        </div>
      </div>

      {/* State Machine Diagram (visual) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Listing State Machine</h2>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(Object.keys(stateConfig) as ListingState[]).map((state, i, arr) => (
            <div key={state} className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full border font-semibold ${state === currentState ? stateConfig[state].color + " ring-2 ring-offset-1 ring-blue-400" : stateConfig[state].color}`}>
                {state}
              </span>
              {i < arr.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300" />}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {transitions[currentState].length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Available Transitions</h2>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">Reason / Note (required)</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
              rows={2}
              placeholder="Enter reason for this state change (policy violation, merchant request, campaign, etc.)"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {transitions[currentState].map(t => (
              <button
                key={t.target}
                onClick={() => applyTransition(t.target)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-colors ${t.style}`}
              >
                <t.icon className="h-4 w-4 shrink-0" />
                <div className="text-left">
                  <div>{t.label}</div>
                  <div className="text-[10px] opacity-60">{t.role} permission</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center gap-3 text-slate-500">
          <Archive className="h-5 w-5 shrink-0" />
          <div className="text-sm">This store is <strong>Archived</strong>. No further state transitions are available. Contact a Super Admin for escalated closure procedures.</div>
        </div>
      )}

      {/* History Log */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-4">Change History</h2>
        <div className="space-y-3">
          {log.map((entry, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="mt-1 p-1 bg-slate-100 rounded-full shrink-0"><Clock className="h-3 w-3 text-slate-500" /></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">{entry.action}</div>
                <div className="text-xs text-slate-500">{entry.by} · {entry.time}</div>
                <div className="text-xs text-slate-600 mt-0.5 italic">"{entry.reason}"</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

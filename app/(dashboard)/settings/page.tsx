"use client"

import { useState, useEffect } from "react"
import { Building2, Shield, Users, Bell, Lock, FileCheck, Check, Save, RotateCcw, Plus, UserPlus, Server, Key, Eye, Edit2, CheckCircle2, Crown } from "lucide-react"
import { listRoles, listAccounts, createInvitation, deactivateAccount, reactivateAccount, type RoleResponse, type AccountListItem, type InvitationCreateResponse } from "@/lib/api/settings"
import { listAudit, type AuditEntry } from "@/lib/api/ops"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("org")

  const menuItems = [
    { id: "org", label: "Organization", icon: Building2 },
    { id: "roles", label: "Roles & Permissions", icon: Shield },
    { id: "teams", label: "Teams", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "audit", label: "Team Audit Log", icon: FileCheck },
  ]

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 h-[calc(100vh-80px)]">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage organization details, RBAC, teams, and security policies.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex overflow-hidden h-full min-h-[600px]">
        
        {/* ── Left Sidebar Menu ── */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 shrink-0 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configuration</div>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-semibold transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-r-4 border-transparent'
                }`}
              >
                <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Panel ── */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          
          {/* Main Panel Header */}
          <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{menuItems.find(m => m.id === activeTab)?.label}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Make changes to your system configuration here.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                <RotateCcw className="h-4 w-4" /> Reset
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </div>

          {/* Main Panel Content Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
            <div className="max-w-4xl space-y-8">
              {activeTab === "org" && <TabOrganization />}
              {activeTab === "roles" && <TabRoles />}
              {activeTab === "teams" && <TabTeams />}
              {activeTab === "notifications" && <TabNotifications />}
              {activeTab === "security" && <TabSecurity />}
              {activeTab === "audit" && <TabAudit />}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function TabOrganization() {
  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Building2 className="h-5 w-5 text-indigo-600"/> Organization Profile</h3>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Organization Name</label>
              <input type="text" defaultValue="SimulaFly Technologies" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Primary Domain</label>
              <input type="text" defaultValue="simulafly.com" className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Business Category</label>
            <select className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
              <option>E-Commerce / Retail</option>
              <option>SaaS Platform</option>
              <option>Marketplace</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Server className="h-5 w-5 text-indigo-600"/> Regional Defaults</h3>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Time Zone</label>
            <select className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
              <option>(UTC+05:30) Asia/Kolkata</option>
              <option>(UTC+00:00) GMT</option>
              <option>(UTC-05:00) Eastern Time</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Base Currency</label>
            <select className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white">
              <option>INR - Indian Rupee</option>
              <option>USD - US Dollar</option>
              <option>EUR - Euro</option>
            </select>
          </div>
        </div>
      </div>
    </>
  )
}

function TabRoles() {
  const [roles, setRoles] = useState<RoleResponse[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    listRoles()
      .then((res) => { if (!cancelled) setRoles(res.roles) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [])

  // Card accent colors, cycled by index so each role reads distinctly.
  const palette = [
    "text-rose-600 bg-rose-50 border-rose-200",
    "text-emerald-600 bg-emerald-50 border-emerald-200",
    "text-blue-600 bg-blue-50 border-blue-200",
    "text-indigo-600 bg-indigo-50 border-indigo-200",
    "text-purple-600 bg-purple-50 border-purple-200",
    "text-amber-600 bg-amber-50 border-amber-200",
  ]

  // Summarise a role's permission keys into the four capability badges the
  // UI renders. Derived honestly from the real permission catalog.
  const caps = (perms: string[]) => {
    const root = perms.includes("*")
    return {
      v: root || perms.length > 0,
      e: root || perms.some((p) => !p.endsWith(".read")),
      a: root || perms.some((p) => p.includes("approve") || p.endsWith(".manage")),
      o: root,
    }
  }

  return (
    <>
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-8">
        <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-2"><Crown className="h-5 w-5" /> Discord-Style Hierarchy</h3>
        <p className="text-sm text-indigo-700">The <strong>Org Manager</strong> operates as the root administrator with <em>Override</em> capabilities. Lead roles sit beneath the Org Manager, and they can have subordinate roles assigned to them.</p>
      </div>

      <div className="space-y-4">
        {error && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-400 font-medium">
            Unable to load roles.
          </div>
        )}
        {!error && roles === null && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-400 font-medium">
            Loading roles…
          </div>
        )}
        {!error && roles !== null && roles.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-400 font-medium">
            No roles defined.
          </div>
        )}
        {!error && roles !== null && roles.map((r, i) => {
          const p = caps(r.permissions)
          const color = palette[i % palette.length]
          return (
            <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between">

                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${color}`}>
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      {r.name}
                      {p.o && <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">Root</span>}
                      {!p.o && r.is_predefined && <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Predefined</span>}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">{r.description || `${r.permissions.length} permission${r.permissions.length === 1 ? "" : "s"} granted`}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center min-w-[70px] ${p.v ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                    <Eye className="h-4 w-4 mb-1" /> View
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center min-w-[70px] ${p.e ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                    <Edit2 className="h-4 w-4 mb-1" /> Edit
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center min-w-[70px] ${p.a ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                    <CheckCircle2 className="h-4 w-4 mb-1" /> Approve
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center min-w-[70px] ${p.o ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                    <Lock className="h-4 w-4 mb-1" /> Override
                  </div>
                </div>

              </div>
            </div>
          )
        })}

        <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-sm font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" /> Create Custom Role
        </button>
      </div>
    </>
  )
}

function TabTeams() {
  const [accounts, setAccounts] = useState<AccountListItem[] | null>(null)
  const [error, setError] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  const load = () => {
    listAccounts({ page_size: 100 })
      .then((res) => setAccounts(res.items))
      .catch(() => setError(true))
  }

  useEffect(() => {
    let cancelled = false
    listAccounts({ page_size: 100 })
      .then((res) => { if (!cancelled) setAccounts(res.items) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [])

  async function toggleActive(a: AccountListItem) {
    setBusyId(a.id)
    try {
      if (a.is_active) await deactivateAccount(a.id)
      else await reactivateAccount(a.id)
      load()
    } catch {
      /* refetch on next load */
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-bold text-slate-900">Admin Accounts</h3>
        <button onClick={() => setInviteOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
          <UserPlus className="h-4 w-4" /> Invite Admin
        </button>
      </div>

      {error && (
        <div className="p-8 text-center text-sm text-slate-400 font-medium">Unable to load admin accounts.</div>
      )}
      {!error && accounts === null && (
        <div className="p-8 text-center text-sm text-slate-400 font-medium">Loading accounts…</div>
      )}
      {!error && accounts !== null && accounts.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-400 font-medium">No admin accounts found.</div>
      )}

      {!error && accounts !== null && accounts.length > 0 && (
        <div className="divide-y divide-slate-100">
          {accounts.map((a) => (
            <div key={a.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase">
                    {a.email.charAt(0)}
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${a.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{a.email}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{a.role_names.length > 0 ? a.role_names.join(", ") : "No roles assigned"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`text-sm font-medium capitalize ${a.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {a.is_active ? "Active" : "Inactive"}
                </div>
                <button
                  onClick={() => toggleActive(a)}
                  disabled={busyId === a.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
                    a.is_active ? 'text-rose-600 bg-rose-50 hover:bg-rose-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {busyId === a.id ? "…" : a.is_active ? "Deactivate" : "Reactivate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {inviteOpen && (
        <InviteAdminModal
          onClose={() => setInviteOpen(false)}
          onInvited={() => { setInviteOpen(false); load() }}
        />
      )}
    </div>
  )
}

function InviteAdminModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [roles, setRoles] = useState<RoleResponse[] | null>(null)
  const [email, setEmail] = useState("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [result, setResult] = useState<InvitationCreateResponse | null>(null)

  useEffect(() => {
    let cancelled = false
    listRoles()
      .then((res) => { if (!cancelled) setRoles(res.roles) })
      .catch(() => { if (!cancelled) setRoles([]) })
    return () => { cancelled = true }
  }, [])

  const toggleRole = (id: string) =>
    setSelectedRoles((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))

  async function submit() {
    setErr(null)
    if (!email.trim()) { setErr("Enter an email address."); return }
    if (selectedRoles.length === 0) { setErr("Select at least one role."); return }
    setSubmitting(true)
    try {
      const res = await createInvitation(email.trim(), selectedRoles)
      setResult(res)
    } catch (e: any) {
      setErr(e?.message || "Failed to create invitation.")
    } finally {
      setSubmitting(false)
    }
  }

  const activationLink =
    result && typeof window !== "undefined"
      ? `${window.location.origin}/activate?invitation_token=${encodeURIComponent(result.token)}`
      : ""

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2"><UserPlus className="h-5 w-5 text-indigo-600" /> Invite Admin</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-600 text-xl font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors">×</button>
        </div>

        {result ? (
          <div className="p-5 space-y-4">
            <div className="px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700 font-medium">
              Invitation created for <strong>{result.email}</strong>. Share this single-use activation link (it is shown only once):
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Activation Link</label>
              <textarea readOnly value={activationLink} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 h-20 outline-none" onFocus={(e) => e.currentTarget.select()} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Raw Token</label>
              <input readOnly value={result.token} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 outline-none" onFocus={(e) => e.currentTarget.select()} />
            </div>
            <p className="text-xs text-slate-500">Expires {new Date(result.expires_at).toLocaleString()}.</p>
            <div className="pt-2 flex justify-end">
              <button onClick={onInvited} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">Done</button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-4">
              {err && (
                <div className="px-3 py-2 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-600">{err}</div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="newadmin@simulafly.com" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Assign Roles</label>
                {roles === null ? (
                  <div className="text-sm text-slate-400">Loading roles…</div>
                ) : roles.length === 0 ? (
                  <div className="text-sm text-slate-400">No roles available.</div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {roles.map((r) => (
                      <label key={r.id} className="flex items-center gap-3 p-2.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" checked={selectedRoles.includes(r.id)} onChange={() => toggleRole(r.id)} className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{r.name}</div>
                          {r.description && <div className="text-xs text-slate-500">{r.description}</div>}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button onClick={onClose} disabled={submitting} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={submit} disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {submitting ? "Inviting…" : "Send Invitation"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function TabNotifications() {
  const alerts = [
    { title: "SLA Breach Alerts", desc: "Triggered when a support ticket misses the 4-hour reply window." },
    { title: "Fraud Alerts", desc: "Triggered when the trust engine detects suspicious merchant activity." },
    { title: "AI Failure Spikes", desc: "Triggered when generation failure rates exceed 5% in a 10min window." },
    { title: "Low Balance Threshold", desc: "Triggered when a merchant wallet drops below ₹1,000." },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-900">System Alert Routing</h3>
        <p className="text-sm text-slate-500 mt-1">Configure how urgent events are routed to your leads and managers.</p>
      </div>
      <div className="divide-y divide-slate-100">
        {alerts.map((a, i) => (
          <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="max-w-md">
              <h4 className="font-bold text-slate-900">{a.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{a.desc}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                <span className="text-sm font-medium text-slate-700">Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked={i % 2 === 0} className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500" />
                <span className="text-sm font-medium text-slate-700">WhatsApp</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                <span className="text-sm font-medium text-slate-700">In-App</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TabSecurity() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2"><Key className="h-5 w-5 text-indigo-600"/> Authentication Policy</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Require Two-Factor Authentication (2FA)</h4>
              <p className="text-xs text-slate-500 mt-1">Enforce 2FA for all administrative accounts upon next login.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">Idle Session Timeout</h4>
              <p className="text-xs text-slate-500 mt-1">Automatically log out users after a period of inactivity.</p>
            </div>
            <select className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 outline-none bg-white font-medium">
              <option>15 Minutes</option>
              <option>30 Minutes</option>
              <option>1 Hour</option>
              <option>4 Hours</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">IP Address Restriction</h4>
              <p className="text-xs text-slate-500 mt-1">Only allow logins from corporate office IP ranges.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabAudit() {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    listAudit({ page_size: 50 })
      .then((res) => { if (!cancelled) setEntries(res.items) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [])

  const fmtTime = (iso: string) => {
    const d = new Date(iso)
    return isNaN(d.getTime()) ? iso : d.toLocaleString()
  }
  const target = (e: AuditEntry) =>
    [e.target_type, e.target_id].filter(Boolean).join(" ").replace(/_/g, " ") || "—"

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="font-bold text-slate-900">Team Audit Log</h3>
          <p className="text-xs text-slate-500 mt-1">Tracking team activity and configuration changes within the admin panel.</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <input type="text" placeholder="Search logs..." className="border border-slate-200 rounded-lg px-3 py-1.5 outline-none" />
          <button className="bg-white border border-slate-200 font-semibold text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50">Export</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 bg-white border-b border-slate-200 uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Actor</th>
              <th className="px-6 py-4">Target Entity</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {error && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">Unable to load audit log.</td></tr>
            )}
            {!error && entries === null && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">Loading audit log…</td></tr>
            )}
            {!error && entries !== null && entries.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">No audit entries yet.</td></tr>
            )}
            {!error && entries !== null && entries.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-xs font-mono text-slate-500">{fmtTime(log.created_at)}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{log.actor_admin_id ? log.actor_admin_id.slice(0, 8) : "System"}</td>
                <td className="px-6 py-4 font-medium text-indigo-600 capitalize">{target(log)}</td>
                <td className="px-6 py-4 text-slate-700">{log.action.replace(/[._]/g, " ")}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-400 capitalize">{log.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

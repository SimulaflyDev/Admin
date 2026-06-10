"use client"

import { useState } from "react"
import { Building2, Shield, Users, Bell, Lock, FileCheck, Check, Save, RotateCcw, Plus, UserPlus, Server, Key, Eye, Edit2, CheckCircle2, Crown } from "lucide-react"

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
  const roles = [
    { id: "org_manager", name: "Org Manager", desc: "Supreme root admin. Unrestricted access.", color: "text-rose-600 bg-rose-50 border-rose-200", p: { v: true, e: true, a: true, o: true } },
    { id: "fin_lead", name: "Finance Lead", desc: "Manages wallets, billing, and refunds.", color: "text-emerald-600 bg-emerald-50 border-emerald-200", p: { v: true, e: true, a: true, o: false } },
    { id: "ops_lead", name: "Operations Lead", desc: "Manages merchants, stores, and products.", color: "text-blue-600 bg-blue-50 border-blue-200", p: { v: true, e: true, a: true, o: false } },
    { id: "sup_lead", name: "Support Lead", desc: "Manages tickets and consumer disputes.", color: "text-indigo-600 bg-indigo-50 border-indigo-200", p: { v: true, e: true, a: false, o: false } },
    { id: "tech_lead", name: "Technical Lead", desc: "Manages AI operations and system health.", color: "text-purple-600 bg-purple-50 border-purple-200", p: { v: true, e: false, a: false, o: false } },
  ]

  return (
    <>
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 mb-8">
        <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-2"><Crown className="h-5 w-5" /> Discord-Style Hierarchy</h3>
        <p className="text-sm text-indigo-700">The <strong>Org Manager</strong> operates as the root administrator with <em>Override</em> capabilities. Lead roles sit beneath the Org Manager, and they can have subordinate roles assigned to them.</p>
      </div>

      <div className="space-y-4">
        {roles.map((r, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${r.color}`}>
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    {r.name}
                    {r.id === 'org_manager' && <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">Root</span>}
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">{r.desc}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center min-w-[70px] ${r.p.v ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                  <Eye className="h-4 w-4 mb-1" /> View
                </div>
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center min-w-[70px] ${r.p.e ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                  <Edit2 className="h-4 w-4 mb-1" /> Edit
                </div>
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center min-w-[70px] ${r.p.a ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                  <CheckCircle2 className="h-4 w-4 mb-1" /> Approve
                </div>
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex flex-col items-center justify-center min-w-[70px] ${r.p.o ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
                  <Lock className="h-4 w-4 mb-1" /> Override
                </div>
              </div>

            </div>
          </div>
        ))}

        <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-sm font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" /> Create Custom Role
        </button>
      </div>
    </>
  )
}

function TabTeams() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<any | null>(null)
  const [panelMode, setPanelMode] = useState<"activity" | "manage" | "add" | null>(null)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const teams = [
    { name: "Support Team", count: 24, lead: "Sarah Jenkins" },
    { name: "Finance Team", count: 8, lead: "Marcus Thorne" },
    { name: "Operations Team", count: 15, lead: "David Kim" },
    { name: "Analytics Team", count: 5, lead: "Priya Patel" },
    { name: "Technical Team", count: 12, lead: "Alex Rivera" },
    { name: "Trust & Safety", count: 6, lead: "Elena Rostova" },
  ]

  const mockMembers: Record<string, any[]> = {
    "Support Team": [
      { id: 1, name: "Sarah Jenkins", role: "Support Lead", status: "online", lastActive: "Just now", actions: ["Resolved Dispute TCK-812", "Approved refund for M-8922", "Logged in"] },
      { id: 2, name: "John Doe", role: "L1 Agent", status: "away", lastActive: "10m ago", actions: ["Replied to TCK-992", "Escalated TCK-994", "Logged in"] },
      { id: 3, name: "Jane Smith", role: "L2 Agent", status: "offline", lastActive: "2h ago", actions: ["Closed TCK-881", "Added internal note to TCK-881"] }
    ],
    "Operations Team": [
      { id: 4, name: "David Kim", role: "Operations Lead", status: "online", lastActive: "Just now", actions: ["Approved Store STR-012", "Rejected Product PRD-441", "Reviewed Merchant KYC"] },
    ]
  }

  const getMembers = (tName: string) => mockMembers[tName] || [
    { id: 99, name: "Unknown User", role: "Staff", status: "offline", lastActive: "Unknown", actions: ["No recent activity"] }
  ]

  const handleActionToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 4000)
    setPanelMode(null)
    setSelectedMember(null)
    setShowRemoveConfirm(false)
  }

  if (selectedTeam) {
    const members = getMembers(selectedTeam)
    
    return (
      <div className="relative">
        {toastMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-bold flex items-center gap-2 z-50 animate-in slide-in-from-top-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {toastMsg}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <button onClick={() => { setSelectedTeam(null); setSelectedMember(null); setPanelMode(null); }} className="text-slate-500 hover:text-indigo-600 text-sm font-semibold flex items-center gap-1">← Back</button>
              <h3 className="font-bold text-slate-900">{selectedTeam} Members</h3>
            </div>
            <button onClick={() => { setPanelMode("add"); setSelectedMember(null); }} className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <UserPlus className="h-4 w-4" /> Add Member
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {members.map(m => (
              <div 
                key={m.id} 
                onClick={() => { setSelectedMember(m); setPanelMode("activity"); setShowRemoveConfirm(false); }}
                className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
                      {m.name.charAt(0)}
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      m.status === 'online' ? 'bg-emerald-500' : m.status === 'away' ? 'bg-amber-500' : 'bg-slate-300'
                    }`}></span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{m.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{m.role}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-sm font-medium text-slate-600 capitalize">{m.status}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{m.lastActive}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedMember(m); setPanelMode("manage"); setShowRemoveConfirm(false); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ml-2">
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide-Over Panel */}
        {(panelMode === "activity" || panelMode === "manage" || panelMode === "add") && (
          <div className="absolute inset-y-0 right-0 w-[380px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right-8 z-10 rounded-r-xl">
            
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900">
                  {panelMode === "add" ? "Add New Member" : selectedMember?.name}
                </h3>
                {panelMode !== "add" && <p className="text-xs text-slate-500">{selectedMember?.role}</p>}
              </div>
              <button onClick={(e) => { e.stopPropagation(); setPanelMode(null); setSelectedMember(null); }} className="text-slate-400 hover:text-rose-600 text-xl font-bold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors">×</button>
            </div>

            {/* Sub-tabs if viewing an existing member */}
            {panelMode !== "add" && (
              <div className="flex border-b border-slate-100">
                <button onClick={() => setPanelMode("activity")} className={`flex-1 py-3 text-sm font-bold border-b-2 ${panelMode === 'activity' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Activity</button>
                <button onClick={() => setPanelMode("manage")} className={`flex-1 py-3 text-sm font-bold border-b-2 ${panelMode === 'manage' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Manage Access</button>
              </div>
            )}

            <div className="p-5 flex-1 overflow-y-auto bg-slate-50/30">
              
              {/* ACTIVITY VIEW */}
              {panelMode === "activity" && selectedMember && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Recent Work</h4>
                  <div className="space-y-0">
                    {selectedMember.actions.map((act: string, idx: number) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 mt-1.5 shadow-sm"></div>
                          {idx !== selectedMember.actions.length - 1 && <div className="w-px h-10 bg-slate-200 my-1"></div>}
                        </div>
                        <p className="text-sm text-slate-700 pb-4 leading-relaxed">{act}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MANAGE OR ADD VIEW */}
              {(panelMode === "manage" || panelMode === "add") && (
                <div className="space-y-6">
                  {panelMode === "add" && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address</label>
                        <input type="email" placeholder="staff@simulafly.com" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Full Name</label>
                        <input type="text" placeholder="John Doe" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide flex justify-between">
                      Discord-Style Role
                      <span className="text-indigo-600 font-medium">RBAC Level</span>
                    </label>
                    <select defaultValue={panelMode === "manage" ? selectedMember.role : "L1 Agent"} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                      <option>Org Manager (Root)</option>
                      <option>Support Lead</option>
                      <option>Finance Lead</option>
                      <option>Operations Lead</option>
                      <option>L1 Agent</option>
                      <option>L2 Agent</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">This determines their permissions across the platform (View, Edit, Approve).</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Team Group</label>
                    <select defaultValue={selectedTeam} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                      {teams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>

                  {panelMode === "manage" && (
                    <div className="pt-6 border-t border-slate-200 mt-6">
                      {!showRemoveConfirm ? (
                        <button onClick={() => setShowRemoveConfirm(true)} className="w-full py-2.5 border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-sm font-bold transition-colors">
                          Remove Member from Organization
                        </button>
                      ) : (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 animate-in zoom-in-95">
                          <h4 className="font-bold text-rose-800 mb-1">Confirm Removal</h4>
                          <p className="text-xs text-rose-600 mb-4 leading-relaxed">This will revoke all access immediately. An email will be sent to the user, and all Org Managers will be notified.</p>
                          <div className="flex gap-2">
                            <button onClick={() => setShowRemoveConfirm(false)} className="flex-1 py-2 bg-white border border-rose-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50">Cancel</button>
                            <button onClick={() => handleActionToast("Member removed. Notifications sent.")} className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 shadow-sm">Confirm</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(!showRemoveConfirm) && (
                     <div className="pt-4">
                       <button onClick={() => handleActionToast(panelMode === "add" ? "Invitation sent to new member." : "Access updated. Org Managers notified.")} className="w-full py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-bold shadow-sm transition-colors">
                         {panelMode === "add" ? "Send Invite" : "Save Access Changes"}
                       </button>
                     </div>
                  )}

                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-bold text-slate-900">Department Directory</h3>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
          <Plus className="h-4 w-4" /> New Team
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {teams.map((t, i) => (
          <div key={i} onClick={() => setSelectedTeam(t.name)} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                {t.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{t.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Lead: {t.lead}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-semibold text-slate-600">{t.count} Members</div>
              <button className="text-slate-400 group-hover:text-indigo-600 transition-colors"><Eye className="h-4 w-4"/></button>
            </div>
          </div>
        ))}
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
              <th className="px-6 py-4">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { d: "Today, 14:22", u: "Nia R. (Org Mgr)", t: "Role: Finance Lead", a: "Updated permissions (Added Approve)", ip: "192.168.1.42" },
              { d: "Today, 11:05", u: "System", t: "Store STR-004", a: "Auto-frozen due to massive refund spike", ip: "Internal" },
              { d: "Yesterday", u: "Marcus T. (Finance)", t: "Merchant M-8922", a: "Approved manual withdrawal of ₹12.5L", ip: "192.168.1.112" },
              { d: "14/03/2026", u: "David K. (Ops)", t: "Product PRD-119", a: "Force delisted (Policy Violation)", ip: "192.168.1.88" },
            ].map((log, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-xs font-mono text-slate-500">{log.d}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{log.u}</td>
                <td className="px-6 py-4 font-medium text-indigo-600">{log.t}</td>
                <td className="px-6 py-4 text-slate-700">{log.a}</td>
                <td className="px-6 py-4 text-xs font-mono text-slate-400">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

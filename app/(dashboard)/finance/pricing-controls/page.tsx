"use client"

import { useState } from "react"
import { Settings, Plus, Play, Pause, Edit, Eye, ShieldAlert, Percent, DollarSign, BrainCircuit, Sparkles, Save, X } from "lucide-react"

export default function PricingControlsPage() {
  const [buyerIntelEnabled, setBuyerIntelEnabled] = useState(true)
  const [aiPricingEnabled, setAiPricingEnabled] = useState(true)

  const [rules, setRules] = useState([
    { id: 1, name: "Standard Booking Fee", cat: "< ₹5,000", type: "Flat", val: "₹100", status: "Active", sc: "emerald" },
    { id: 2, name: "Large Order Fee", cat: "≥ ₹5,000", type: "Percentage", val: "2%", status: "Active", sc: "emerald" },
    { id: 3, name: "Default Fallback", cat: "No Match", type: "Flat", val: "₹100", status: "Active", sc: "slate" },
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<any>(null)
  
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleOpenModal = (rule: any = null) => {
    setEditingRule(rule)
    setIsModalOpen(true)
  }

  const toggleRuleStatus = (id: number) => {
    setRules(rules.map(r => r.id === id ? { ...r, status: r.status === "Active" ? "Paused" : "Active", sc: r.status === "Active" ? "amber" : "emerald" } : r))
  }

  const handleSaveConfig = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setShowToast(true)
      window.dispatchEvent(new CustomEvent('pricing-config-saved'))
      setTimeout(() => setShowToast(false), 5000)
    }, 1500)
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-8">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Settings className="h-6 w-6 text-indigo-600" />
              Pricing Controls
            </h1>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md border border-indigo-200 flex items-center gap-1">
              Org Manager Only
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Configure booking fee rules and merchant charges for the region.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-indigo-600 border border-transparent text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>

      {/* ── Rule Summary ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
          <div className="text-sm font-semibold text-slate-600 mb-1 flex items-center justify-between">
            Current Pricing Policy
            <Play className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">Orders Below ₹5,000</div>
          <div className="text-sm font-black text-indigo-600 mt-1">₹100 Fixed Fee</div>
        </div>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
          <div className="text-sm font-semibold text-slate-600 mb-1 flex items-center justify-between">
            Large Order Policy
            <Percent className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">Orders ₹5,000+</div>
          <div className="text-sm font-black text-indigo-600 mt-1">2% of Merchant Order Value</div>
        </div>

        <div className="bg-indigo-50 rounded-2xl border border-indigo-200 p-5 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign className="h-16 w-16 text-indigo-600" />
          </div>
          <div className="text-sm font-semibold text-indigo-800 mb-1 relative z-10 flex items-center justify-between">
            Estimated Revenue
          </div>
          <div className="text-3xl font-black text-indigo-900 relative z-10 mt-1">₹12,450</div>
          <div className="text-xs font-medium text-indigo-700 mt-1 relative z-10">
            Today's Booking Fees
          </div>
        </div>
      </div>

      {/* ── Fee Rules Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Active Pricing Rules</h3>
          <button onClick={() => handleOpenModal()} className="inline-flex h-8 items-center gap-2 px-3 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors">
            <Plus className="h-3 w-3" /> Create Fee Rule
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-white border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Rule Name</th>
                <th className="px-6 py-4">Order Value</th>
                <th className="px-6 py-4">Fee Structure</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((rule, i) => (
                <tr key={rule.id} className={`hover:bg-slate-50 transition-colors ${rule.status === 'Paused' ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{rule.name}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-indigo-600">{rule.cat}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {rule.type === "Flat" && <span className="bg-slate-100 p-1 rounded"><DollarSign className="h-3 w-3 text-slate-500" /></span>}
                      {rule.type === "Percentage" && <span className="bg-slate-100 p-1 rounded"><Percent className="h-3 w-3 text-slate-500" /></span>}
                      <span className="font-bold text-slate-800">{rule.val}</span>
                      <span className="text-xs text-slate-500">({rule.type})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border border-${rule.sc}-200 bg-${rule.sc}-50 text-${rule.sc}-700`}>
                      {rule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Impact">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleOpenModal(rule)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Rule">
                        <Edit className="h-4 w-4" />
                      </button>
                      {rule.status === "Active" ? (
                        <button onClick={() => toggleRuleStatus(rule.id)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Disable Rule">
                          <Pause className="h-4 w-4" />
                        </button>
                      ) : (
                        <button onClick={() => toggleRuleStatus(rule.id)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Activate Rule">
                          <Play className="h-4 w-4" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Section B: Buyer Intel ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <BrainCircuit className="h-5 w-5 text-slate-800" />
            <h2 className="text-lg font-bold text-slate-900">Buyer Intel Pricing</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Control unlock costs for behavioral signals and engagement insights.</p>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between h-[320px]">
            <div className="flex items-center justify-between mb-4">
              <label className="font-semibold text-slate-900">Enable Buyer Intel</label>
              <div 
                onClick={() => setBuyerIntelEnabled(!buyerIntelEnabled)}
                className={`w-11 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-200 ${buyerIntelEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all duration-200 ${buyerIntelEnabled ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Tier 1 Unlock Fee</label>
                <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                  <div className="bg-slate-50 px-3 py-2 border-r border-slate-300 text-slate-500 text-sm font-bold">₹</div>
                  <input type="number" defaultValue="30" className="w-full px-3 py-2 text-sm font-bold text-slate-900 outline-none" />
                </div>
                <div className="text-xs text-slate-500 mt-1">10% - 80% Conv. Probability</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Tier 2 Unlock Fee</label>
                <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                  <div className="bg-slate-50 px-3 py-2 border-r border-slate-300 text-slate-500 text-sm font-bold">₹</div>
                  <input type="number" defaultValue="50" className="w-full px-3 py-2 text-sm font-bold text-slate-900 outline-none" />
                </div>
                <div className="text-xs text-slate-500 mt-1">81% - 99% Conv. Probability</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Free Unlocks / Month</label>
                <input type="number" defaultValue="0" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Max Unlocks / Day</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option>Unlimited</option>
                  <option>100</option>
                  <option>50</option>
                  <option>10</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section C: AI Visualization ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Sparkles className="h-5 w-5 text-slate-800" />
            <h2 className="text-lg font-bold text-slate-900">AI Visualization Pricing</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Charge merchants when users successfully generate room visualizations using their products.</p>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[320px] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <label className="font-semibold text-slate-900">Enable AI Pricing</label>
              <div 
                onClick={() => setAiPricingEnabled(!aiPricingEnabled)}
                className={`w-11 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors duration-200 ${aiPricingEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 bg-white w-4 h-4 rounded-full shadow-sm transition-all duration-200 ${aiPricingEnabled ? 'right-1' : 'left-1'}`}></div>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-y divide-x divide-slate-100 flex-1">
              
              <div className="p-5 flex flex-col justify-center">
                <div className="text-sm font-semibold text-slate-600 mb-2">Image Generation</div>
                <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 w-28">
                  <div className="bg-slate-50 px-3 py-1.5 border-r border-slate-300 text-slate-500 text-sm font-bold">₹</div>
                  <input type="number" defaultValue="1" className="w-full px-3 py-1.5 text-sm font-bold text-indigo-600 outline-none" />
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-2">Per completed image</div>
              </div>

              <div className="p-5 flex flex-col justify-center">
                <div className="text-sm font-semibold text-slate-600 mb-2">Regeneration</div>
                <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 w-28">
                  <div className="bg-slate-50 px-3 py-1.5 border-r border-slate-300 text-slate-500 text-sm font-bold">₹</div>
                  <input type="number" defaultValue="1" className="w-full px-3 py-1.5 text-sm font-bold text-indigo-600 outline-none" />
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-2">Per AI re-generate</div>
              </div>

              <div className="p-5 bg-slate-50/50 flex flex-col justify-center">
                <div className="text-sm font-semibold text-slate-600 mb-1">Failed Generation</div>
                <div className="text-xl font-bold text-slate-400">₹0</div>
                <div className="text-[11px] font-medium text-slate-500 mt-1">No charge for failures</div>
              </div>

              <div className="p-5 bg-slate-50/50 flex flex-col justify-center">
                <div className="text-sm font-semibold text-slate-600 mb-1">Preview Open</div>
                <div className="text-xl font-bold text-slate-400">₹0</div>
                <div className="text-[11px] font-medium text-slate-500 mt-1">Free interaction</div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* ── Create/Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{editingRule?.id ? "Edit Fee Rule" : "Create Fee Rule"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Rule Name</label>
                <input type="text" defaultValue={editingRule?.name || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Standard Booking Fee" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Order Value</label>
                  <input type="text" defaultValue={editingRule?.cat || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. < ₹5,000" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Fee Structure</label>
                  <select defaultValue={editingRule?.type || "Flat"} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="Flat">Flat Fee</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Fee Value</label>
                <input type="text" defaultValue={editingRule?.val || ""} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. ₹100 or 2%" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">Save Rule</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Toast Notification ── */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-800 flex items-start gap-3 w-80">
            <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-full shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Configuration Saved</h4>
              <p className="text-xs text-slate-400 mt-1">Changes are live. System notification dispatched to all Org Managers and Finance Team members.</p>
            </div>
            <button onClick={() => setShowToast(false)} className="ml-auto text-slate-400 hover:text-white shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

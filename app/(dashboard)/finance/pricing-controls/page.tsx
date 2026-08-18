"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Settings,
  Plus,
  Edit,
  Loader2,
  X,
  AlertTriangle,
  Percent,
  IndianRupee,
} from "lucide-react"
import {
  listPricingRules,
  createPricingRule,
  updatePricingRule,
  formatINR,
  toNumber,
  type PricingRuleItem,
  type RateType,
} from "@/lib/api/finance"
import { EmptyState } from "@/components/ui/empty-state"
import { ApiError } from "@/lib/api/types"

function formatDateTime(iso: string | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

// Convert an ISO string to a value usable by <input type="datetime-local">.
function toLocalInput(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`
}

function formatRate(rule: PricingRuleItem): string {
  if (rule.rate_type === "percentage") return `${toNumber(rule.rate)}%`
  return formatINR(rule.rate)
}

interface FormState {
  event_type: string
  rate: string
  rate_type: RateType
  currency: string
  effective_from: string
  effective_until: string
  notes: string
}

const EMPTY_FORM: FormState = {
  event_type: "",
  rate: "",
  rate_type: "fixed",
  currency: "INR",
  effective_from: "",
  effective_until: "",
  notes: "",
}

export default function PricingControlsPage() {
  const [rules, setRules] = useState<PricingRuleItem[]>([])
  const [includeHistory, setIncludeHistory] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state. `editing` null → create mode.
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PricingRuleItem | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchRules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listPricingRules({ include_history: includeHistory })
      setRules(res.items)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load pricing rules from the server."
      )
      setRules([])
    } finally {
      setLoading(false)
    }
  }, [includeHistory])

  useEffect(() => {
    void fetchRules()
  }, [fetchRules])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(rule: PricingRuleItem) {
    setEditing(rule)
    setForm({
      event_type: rule.event_type,
      rate: String(toNumber(rule.rate)),
      rate_type: (rule.rate_type as RateType) ?? "fixed",
      currency: rule.currency,
      effective_from: "",
      effective_until: toLocalInput(rule.effective_until),
      notes: rule.notes ?? "",
    })
    setFormError(null)
    setModalOpen(true)
  }

  function update<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  // Client validation: rate >= 0; effective_until >= effective_from.
  function validate(): string | null {
    const rateNum = Number(form.rate)
    if (!Number.isFinite(rateNum) || rateNum < 0) {
      return "Rate must be zero or greater."
    }
    if (!editing && form.event_type.trim() === "") {
      return "Event type is required."
    }
    if (form.effective_from && form.effective_until) {
      const from = new Date(form.effective_from).getTime()
      const until = new Date(form.effective_until).getTime()
      if (until < from) {
        return "Effective until must not precede effective from."
      }
    }
    return null
  }

  async function submit() {
    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }
    setSaving(true)
    setFormError(null)

    const fromIso = form.effective_from
      ? new Date(form.effective_from).toISOString()
      : undefined
    const untilIso = form.effective_until
      ? new Date(form.effective_until).toISOString()
      : null

    try {
      if (editing) {
        await updatePricingRule(editing.id, {
          rate: Number(form.rate),
          rate_type: form.rate_type,
          currency: form.currency,
          effective_from: fromIso,
          effective_until: untilIso,
          notes: form.notes || null,
        })
      } else {
        await createPricingRule({
          event_type: form.event_type.trim(),
          rate: Number(form.rate),
          rate_type: form.rate_type,
          currency: form.currency,
          effective_from: fromIso,
          effective_until: untilIso,
          notes: form.notes || null,
        })
      }
      setModalOpen(false)
      await fetchRules()
    } catch (err) {
      if (err instanceof ApiError) {
        // 422 → backend validation (negative rate / inverted window): surface it.
        setFormError(err.message || "The server rejected this pricing rule.")
      } else {
        setFormError("Failed to save the pricing rule. Please try again.")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto pb-24 animate-in fade-in duration-500 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-600" />
            Pricing Controls
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure event pricing rules and effective windows (INR).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIncludeHistory((v) => !v)}
            className={`inline-flex h-9 items-center gap-2 px-4 rounded-lg text-sm font-semibold border transition-colors ${
              includeHistory
                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {includeHistory ? "Showing history" : "Current only"}
          </button>
          <button
            onClick={openCreate}
            className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-indigo-600 border border-transparent text-white text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Create Rule
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Pricing Rules</h3>
          <span className="text-xs font-semibold text-slate-500">
            {rules.length.toLocaleString("en-IN")} shown
          </span>
        </div>

        {error ? (
          <div className="p-6 text-sm text-rose-600 bg-rose-50 border-b border-rose-100">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Loading pricing rules…</span>
          </div>
        ) : rules.length === 0 ? (
          <EmptyState
            icon={Settings}
            title="No pricing rules"
            description="Create a pricing rule to start charging for platform events."
            actionLabel="Create Rule"
            onAction={openCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 bg-white border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Event Type</th>
                  <th className="px-6 py-4">Rate</th>
                  <th className="px-6 py-4">Effective From</th>
                  <th className="px-6 py-4">Effective Until</th>
                  <th className="px-6 py-4">Scope</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {rule.event_type}
                      </div>
                      {rule.notes ? (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {rule.notes}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 p-1 rounded">
                          {rule.rate_type === "percentage" ? (
                            <Percent className="h-3 w-3 text-slate-500" />
                          ) : (
                            <IndianRupee className="h-3 w-3 text-slate-500" />
                          )}
                        </span>
                        <span className="font-bold text-slate-800">
                          {formatRate(rule)}
                        </span>
                        <span className="text-xs text-slate-500 capitalize">
                          ({rule.rate_type})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {formatDateTime(rule.effective_from)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {formatDateTime(rule.effective_until)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200 bg-slate-50 text-slate-600">
                        {rule.merchant_id ? "Merchant" : "Global"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEdit(rule)}
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">
                {editing ? "Update Pricing Rule" : "Create Pricing Rule"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                  Event Type
                </label>
                <input
                  type="text"
                  value={form.event_type}
                  onChange={(e) => update("event_type", e.target.value)}
                  disabled={!!editing}
                  placeholder="e.g. booking_fee"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-50 disabled:text-slate-500"
                />
                {editing ? (
                  <p className="text-xs text-slate-400 mt-1">
                    Updating opens a new effective window; event type is fixed.
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                    Rate
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.rate}
                    onChange={(e) => update("rate", e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                    Rate Type
                  </label>
                  <select
                    value={form.rate_type}
                    onChange={(e) =>
                      update("rate_type", e.target.value as RateType)
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="fixed">Fixed (₹)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                    Effective From
                  </label>
                  <input
                    type="datetime-local"
                    value={form.effective_from}
                    onChange={(e) => update("effective_from", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Defaults to now if left empty.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                    Effective Until
                  </label>
                  <input
                    type="datetime-local"
                    value={form.effective_until}
                    onChange={(e) => update("effective_until", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Optional open-ended window.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                  Notes
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Optional description"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {formError ? (
                <div className="p-3 rounded-lg text-sm text-rose-700 bg-rose-50 border border-rose-200 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              ) : null}
            </div>
            <div className="p-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-70 inline-flex items-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? "Saving…" : editing ? "Update Rule" : "Create Rule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

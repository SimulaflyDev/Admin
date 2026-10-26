"use client"

import { useState, type FormEvent } from "react"
import { Loader2, ShieldCheck } from "lucide-react"
import { verifyMerchantManually, type MerchantDetail } from "@/lib/api/directory"
import { ApiError } from "@/lib/api/types"
import { useAuthStore } from "@/lib/auth-store"

export function ManualKycVerification({ merchant, onVerified }: {
  merchant: MerchantDetail
  onVerified: (merchant: MerchantDetail) => void
}) {
  const permissions = useAuthStore((state) => state.permissions)
  const canVerify = permissions.includes("*") || permissions.includes("merchants.verify")
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const approval = merchant.kyc.manual_verification

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || !canVerify) return
    setBusy(true)
    setError(null)
    try {
      const updated = await verifyMerchantManually(merchant.id, reason.trim() || "Merchant documents reviewed and approved by admin.")
      onVerified(updated)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification could not be saved. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (approval) {
    return <div role="status" className="mx-4 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
      <p className="flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4" /> Manually verified by admin</p>
      <p className="mt-1">{approval.approved_by_name} · {new Date(approval.approved_at).toLocaleString()}</p>
      <p className="mt-2 break-words">{approval.reason}</p>
      <p className="mt-2 text-xs">This approval covers PAN and GSTIN for this shop. Terms acceptance remains with the merchant.</p>
    </div>
  }
  if (merchant.kyc.completed && merchant.kyc.pan && merchant.kyc.gstin) return null
  if (!canVerify) return <p className="px-4 pb-4 text-xs text-slate-500">Manual approval requires the merchant verification permission.</p>

  return <form onSubmit={verify} className="mx-4 mb-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
    <h4 className="font-bold text-sm text-slate-900">Manual merchant verification</h4>
    <p className="mt-1 text-sm text-slate-600">Approve PAN and GSTIN for this shop after reviewing the business documents. Your approval will be recorded in the audit log.</p>
    <label htmlFor="kyc-review-note" className="mt-3 mb-1 block text-xs font-semibold text-slate-600">Review note (optional)</label>
    <textarea id="kyc-review-note" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} disabled={busy} rows={2} className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-indigo-500" placeholder="Documents reviewed or reason for manual approval" />
    {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
    <button type="submit" disabled={busy || (reason.trim().length > 0 && reason.trim().length < 5)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 sm:w-auto">
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
      {busy ? "Verifying…" : "Verify merchant"}
    </button>
  </form>
}

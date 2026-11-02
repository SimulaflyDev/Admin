"use client"

import { useEffect, useState } from "react"
import { loadTermsAcceptances, type TermsAcceptance } from "@/lib/api/merchant-terms"

export function TermsAcceptances({ merchantId }: { merchantId: string }) {
  const [records, setRecords] = useState<TermsAcceptance[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    let cancelled = false
    loadTermsAcceptances(merchantId).then(({ acceptances }) => {
      if (!cancelled) { setRecords(acceptances); setError(null) }
    }).catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load signatures") })
    return () => { cancelled = true }
  }, [merchantId, retry])

  return <section className="mx-4 mb-4 rounded-xl border border-slate-200 p-4">
    <h4 className="font-bold text-sm text-slate-900">Terms acceptance &amp; signature history</h4>
    {error ? <p role="alert" className="mt-2 text-sm text-rose-700">{error} <button onClick={() => setRetry(retry + 1)} className="underline">Retry</button></p>
      : records === null ? <p className="mt-2 text-sm text-slate-500">Loading signatures…</p>
      : !records.length ? <p className="mt-2 text-sm text-slate-500">The merchant has not accepted the terms.</p>
      : records.map((record, index) => <details key={`${record.document_version || "legacy"}-${index}`} open={index === 0} className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
        <summary className="cursor-pointer font-semibold">{record.signature_name || "Legacy checkbox acceptance (no typed signature)"} · {record.accepted_at ? new Date(record.accepted_at).toLocaleString() : "Date unavailable"}</summary>
        <dl className="mt-3 grid gap-2 break-words sm:grid-cols-2">
          <div><dt className="text-xs text-slate-500">Document</dt><dd>{record.document_title || "Original terms"}</dd></div>
          <div><dt className="text-xs text-slate-500">Account</dt><dd>{record.accepted_by_user_id || "Unavailable"}</dd></div>
          <div><dt className="text-xs text-slate-500">Version</dt><dd className="break-all font-mono text-xs">{record.document_version || "Legacy"}</dd></div>
          <div><dt className="text-xs text-slate-500">Recorded time (UTC)</dt><dd>{record.accepted_at ? new Date(record.accepted_at).toISOString() : "Unavailable"}</dd></div>
          {record.document_sha256 && <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Document SHA-256</dt><dd className="break-all font-mono text-xs">{record.document_sha256}</dd></div>}
        </dl>
      </details>)}
  </section>
}

"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { FileText, Upload } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { loadTerms, loadTermsPage, publishTerms, type TermsDirectory, type TermsDocument, type TermsPage } from "@/lib/api/merchant-terms"

const input = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"

function Preview({ document }: { document: TermsDocument }) {
  const [page, setPage] = useState(1)
  const [retry, setRetry] = useState(0)
  const [result, setResult] = useState<{ key: string; data?: TermsPage; error?: string } | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const key = `${document.version}:${page}:${retry}`
  const current = result?.key === key ? result : null
  useEffect(() => {
    let cancelled = false
    loadTermsPage(document.version, page).then((data) => { if (!cancelled) setResult({ key, data }) })
      .catch((err) => { if (!cancelled) setResult({ key, error: err instanceof Error ? err.message : "Unable to load preview" }) })
    return () => { cancelled = true }
  }, [document.version, page, key])
  useEffect(() => {
    if (!current?.data) return
    let cancelled = false
    const image = new Image()
    image.onload = () => {
      if (cancelled || !canvas.current) return
      canvas.current.width = image.width; canvas.current.height = image.height
      canvas.current.getContext("2d")?.drawImage(image, 0, 0)
    }
    image.src = current.data.image
    return () => { cancelled = true }
  }, [current])
  return <div>
    <div className="mb-3 flex items-center justify-between gap-2 text-sm">
      <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Previous</button>
      <span>Page {page} of {document.page_count}</span>
      <button disabled={page === document.page_count} onClick={() => setPage(page + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Next</button>
    </div>
    <div className="max-h-[70vh] min-h-48 overflow-auto rounded-lg border bg-slate-100 p-2">
      {!current && <p role="status" className="p-6 text-sm text-slate-500">Loading preview…</p>}
      {current?.error && <p role="alert" className="p-6 text-sm text-rose-700">{current.error} <button className="underline" onClick={() => setRetry(retry + 1)}>Retry</button></p>}
      {current?.data && <><canvas ref={canvas} aria-hidden="true" className="h-auto w-full" /><p className="sr-only">{current.data.text}</p></>}
    </div>
  </div>
}

export default function MerchantTermsPage() {
  const permissions = useAuthStore((state) => state.permissions)
  const canEdit = permissions.includes("*") || permissions.includes("content.manage")
  const [directory, setDirectory] = useState<TermsDirectory | null>(null)
  const [selected, setSelected] = useState<TermsDocument | null>(null)
  const [offset, setOffset] = useState(0)
  const [retry, setRetry] = useState(0)
  const [title, setTitle] = useState("SimulaFly Terms & Conditions")
  const [file, setFile] = useState<File | null>(null)
  const [draftUrl, setDraftUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    loadTerms(offset).then((data) => {
      if (!cancelled) { setDirectory(data); setSelected(data.current); setTitle(data.current.title); setError(null) }
    }).catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load terms") })
    return () => { cancelled = true }
  }, [offset, retry])
  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    // Keep the draft preview local until the admin presses Publish.
    const timer = setTimeout(() => setDraftUrl(url), 0)
    return () => { clearTimeout(timer); URL.revokeObjectURL(url) }
  }, [file])

  async function publish(event: FormEvent) {
    event.preventDefault()
    if (!file || !directory || !canEdit || busy) return
    setBusy(true); setError(null); setMessage(null)
    try {
      const pdf_base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result).split(",")[1])
        reader.onerror = () => reject(new Error("Unable to read the selected PDF"))
        reader.readAsDataURL(file)
      })
      const published = await publishTerms({ title: title.trim(), expected_version: directory.current.version, pdf_base64 })
      setFile(null); setDraftUrl(null)
      if (fileInput.current) fileInput.current.value = ""
      setDirectory({ ...directory, current: published }); setSelected(published)
      setMessage("New terms published. Earlier signatures remain linked to their original document.")
      setOffset(0); setRetry((value) => value + 1)
    } catch (err) { setError(err instanceof Error ? err.message : "Could not publish terms") }
    finally { setBusy(false) }
  }

  return <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-8">
    <header><h1 className="flex items-center gap-2 text-2xl font-bold"><FileText /> Merchant Terms &amp; Conditions</h1>
      <p className="mt-2 text-sm text-slate-500">Publish the PDF merchants review and sign during verification. Each publication creates a preserved version.</p></header>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error} <button className="underline" onClick={() => setRetry(retry + 1)}>Reload published terms</button></div>}
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p>}
    {!directory && !error && <p role="status">Loading terms…</p>}
    {directory && <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="space-y-5">
        <section className="rounded-xl border bg-white p-5"><p className="text-xs font-bold uppercase text-emerald-700">Currently published</p>
          <h2 className="mt-2 font-bold">{directory.current.title}</h2><p className="mt-1 text-xs text-slate-500">{directory.current.page_count} pages · {directory.current.published_at ? new Date(directory.current.published_at).toLocaleString() : "Original document"}</p>
          <button className="mt-3 text-sm font-semibold text-indigo-600" onClick={() => setSelected(directory.current)}>Preview current version</button></section>
        <form onSubmit={publish} className="space-y-4 rounded-xl border bg-white p-5">
          <h2 className="font-bold">Upload revised terms</h2><p className="text-xs text-slate-500">Upload your edited PDF, review the preview, then publish. Active shops keep their current status; their next visit to verification offers the new version for signature.</p>
          <fieldset disabled={!canEdit || busy} className="space-y-4 disabled:opacity-60">
            <label className="block text-sm">Document title<input className={input} required minLength={3} maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} /></label>
            <label className="block text-sm">PDF (up to 5 MB, 50 pages)<input ref={fileInput} type="file" accept="application/pdf,.pdf" required className={`${input} cursor-pointer`} onChange={(event) => {
              const next = event.target.files?.[0] || null
              setDraftUrl(null); setFile(null); setMessage(null)
              if (next && (next.size > 5 * 1024 * 1024 || !next.name.toLowerCase().endsWith(".pdf"))) { setError("Choose a PDF no larger than 5 MB."); event.target.value = ""; return }
              setError(null); setFile(next)
            }} /></label>
            <button disabled={!file || !draftUrl} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Upload className="h-4 w-4" />{busy ? "Publishing…" : "Publish new PDF version"}</button>
          </fieldset>
          {!canEdit && <p className="text-xs text-amber-700">Publishing requires the content management permission.</p>}
        </form>
        <section className="rounded-xl border bg-white p-5"><h2 className="font-bold">Version history</h2><div className="mt-3 space-y-2">
          {directory.versions.map((doc) => <button key={doc.version} onClick={() => setSelected(doc)} className="block w-full rounded-lg border p-3 text-left text-sm hover:bg-slate-50"><span className="block font-semibold">{doc.title}</span><span className="text-xs text-slate-500">{doc.published_at && new Date(doc.published_at).toLocaleString()} · {doc.version.slice(0, 12)}</span></button>)}
          <button onClick={() => setSelected(directory.original)} className="text-sm text-indigo-600">Preview original document</button>
        </div><div className="mt-3 flex justify-between text-xs"><button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 20))} className="disabled:opacity-40">Newer versions</button><button disabled={directory.versions.length < 20} onClick={() => setOffset(offset + 20)} className="disabled:opacity-40">Older versions</button></div></section>
      </div>
      <section className="min-w-0 rounded-xl border bg-white p-4 sm:p-5">
        {file && draftUrl ? <><h2 className="mb-3 font-bold">Draft preview · {file.name}</h2><iframe src={`${draftUrl}#toolbar=0`} title="New terms PDF preview" className="h-[70vh] w-full rounded-lg border" /></>
          : selected && <><h2 className="mb-3 font-bold">{selected.title}</h2><p className="mb-3 break-all text-xs text-slate-500">Version {selected.version}</p><Preview key={selected.version} document={selected} /></>}
      </section>
    </div>}
  </div>
}

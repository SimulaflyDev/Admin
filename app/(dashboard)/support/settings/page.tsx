"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { request } from '@/lib/api/client'
import { useAuthStore } from '@/lib/auth-store'

interface HelpSettings {
  version: number
  title: string
  introduction: string
  response_time: string
  contact_email: string | null
  contact_phone: string | null
  accepting_tickets: boolean
  faqs: {question: string; answer: string}[]
}
const field = 'w-full rounded-lg border border-slate-300 bg-white p-3 text-sm disabled:bg-slate-100'

export default function SupportSettingsPage() {
  const permissions = useAuthStore((state) => state.permissions)
  const canEdit = permissions.includes('*') || permissions.includes('content.manage')
  const [settings, setSettings] = useState<HelpSettings | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    const abort = new AbortController()
    request<HelpSettings>('/admin/support/settings', {signal: abort.signal}).then(setSettings)
      .catch((err) => { if (!abort.signal.aborted) setError(err instanceof Error ? err.message : 'Could not load support settings') })
    return () => abort.abort()
  }, [])
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {event.preventDefault(); event.returnValue = ''}
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  function update(change: Partial<HelpSettings>) {
    setSettings((current) => current ? {...current, ...change} : current)
    setDirty(true); setNotice(null)
  }
  async function reload() {
    if (dirty && !window.confirm('Discard unsaved changes and reload?')) return
    setBusy(true); setError(null)
    try { setSettings(await request<HelpSettings>('/admin/support/settings')); setDirty(false) }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not reload settings') }
    finally { setBusy(false) }
  }
  async function save() {
    if (!settings || !canEdit || busy) return
    if (!settings.title.trim() || settings.faqs.some((faq) => !faq.question.trim() || !faq.answer.trim())) {
      setError('Enter a title and complete all FAQ questions and answers.'); return
    }
    const phone = settings.contact_phone?.trim() || null
    const email = settings.contact_email?.trim() || null
    if (phone && !/^\+?[0-9 ()-]{6,30}$/.test(phone)) { setError('Enter a valid phone number.'); return }
    setBusy(true); setError(null); setNotice(null)
    try {
      const value = await request<HelpSettings>('/admin/support/settings', {method: 'PUT', body: {...settings, contact_email: email, contact_phone: phone}})
      setSettings(value); setDirty(false); setNotice('Published. Online apps refresh the support page on opening it or within 30 seconds.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save settings') }
    finally { setBusy(false) }
  }
  return <div className="mx-auto max-w-3xl space-y-5 p-6">
    <Link href="/support" className="text-sm text-emerald-700">← Support Hub</Link>
    <h1 className="text-3xl font-bold">App support page</h1>
    <p className="text-sm text-slate-500">Edit customer-facing help text, contact details and FAQs. Changes are published only when saved.</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    <div className="flex gap-3">
      <button disabled={busy} onClick={() => void reload()} className="rounded-lg border px-4 py-2 disabled:opacity-40">Reload</button>
      <button disabled={busy || !canEdit || !dirty} onClick={() => void save()} className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-40">{busy ? 'Please wait…' : 'Save changes'}</button>
    </div>
    {settings ? <form onSubmit={(event) => { event.preventDefault(); void save() }}>
      <fieldset disabled={busy || !canEdit} className="space-y-5 rounded-xl border bg-white p-6">
        <label className="flex items-center gap-3"><input type="checkbox" checked={settings.accepting_tickets} onChange={(e) => update({accepting_tickets: e.target.checked})} /> Accept new support requests</label>
        <p className="text-xs text-slate-500">Pausing new requests does not close existing conversations.</p>
        <label className="block space-y-2"><span>Page title</span><input className={field} maxLength={100} value={settings.title} onChange={(e) => update({title: e.target.value})} /></label>
        <label className="block space-y-2"><span>Introduction</span><textarea className={field} maxLength={1000} rows={3} value={settings.introduction} onChange={(e) => update({introduction: e.target.value})} /></label>
        <label className="block space-y-2"><span>Response hours / expected response time (optional)</span><input className={field} maxLength={200} value={settings.response_time} onChange={(e) => update({response_time: e.target.value})} /></label>
        <label className="block space-y-2"><span>Contact email (optional)</span><input className={field} type="email" value={settings.contact_email ?? ''} onChange={(e) => update({contact_email: e.target.value || null})} /></label>
        <label className="block space-y-2"><span>Contact phone (optional)</span><input className={field} maxLength={32} value={settings.contact_phone ?? ''} onChange={(e) => update({contact_phone: e.target.value || null})} /></label>
        <h2 className="text-xl font-semibold">FAQs ({settings.faqs.length}/12)</h2>
        {settings.faqs.map((faq, index) => <div key={index} className="space-y-3 rounded-lg border bg-slate-50 p-4">
          <label className="block space-y-1"><span>Question {index + 1}</span><input className={field} maxLength={160} value={faq.question} onChange={(e) => update({faqs: settings.faqs.map((item, i) => i === index ? {...item, question: e.target.value} : item)})} /></label>
          <label className="block space-y-1"><span>Answer</span><textarea className={field} rows={3} maxLength={2000} value={faq.answer} onChange={(e) => update({faqs: settings.faqs.map((item, i) => i === index ? {...item, answer: e.target.value} : item)})} /></label>
          <button type="button" className="text-sm text-red-700" onClick={() => update({faqs: settings.faqs.filter((_, i) => i !== index)})}>Remove FAQ</button>
        </div>)}
        <button type="button" disabled={settings.faqs.length >= 12} onClick={() => update({faqs: [...settings.faqs, {question: '', answer: ''}]})} className="rounded-lg border px-4 py-2 disabled:opacity-40">Add FAQ</button>
      </fieldset>
    </form> : !error && <p>Loading settings…</p>}
  </div>
}

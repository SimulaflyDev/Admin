"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { ApiError } from "@/lib/api/types"
import {
  carouselImageUrl, loadHomeCarousel, saveHomeCarousel, uploadCarouselImage,
  type CarouselAction, type CarouselSlide, type HomeCarouselConfig,
} from "@/lib/api/home-content"

const fieldClass = "w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm disabled:bg-slate-100"
const buttonClass = "rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-40"
const actions: [CarouselAction, string][] = [
  ["explore_rooms", "Explore room styles"], ["scan", "Start a new design"],
  ["shop", "Shop discovery"], ["sessions", "User’s saved rooms"],
  ["merchant", "Specific shop"], ["product", "Specific product"], ["none", "No button"],
]

function newSlide(): CarouselSlide {
  return { id: crypto.randomUUID(), enabled: true, image_url: null, eyebrow: "",
    title: "Your next beautiful space", description: "", button_label: "Explore rooms",
    action: "explore_rooms", merchant_lookup: null, product_id: null }
}

function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(",")[1])
    reader.onerror = () => reject(new Error("Could not read this image"))
    reader.readAsDataURL(file)
  })
}

function publicationError(error: unknown): string {
  if (error instanceof ApiError && error.status === 422 && error.detail && typeof error.detail === "object" && "detail" in error.detail) {
    const issues = error.detail.detail
    if (Array.isArray(issues)) {
      return issues.map((issue: { loc?: (string | number)[]; msg?: string }) =>
        `${issue.loc?.filter((part) => part !== "body").join(" → ") || "Carousel"}: ${issue.msg || "Invalid value"}`,
      ).join(". ")
    }
  }
  return error instanceof Error ? error.message : "Could not save carousel"
}

export default function HomeCarouselPage() {
  const permissions = useAuthStore((state) => state.permissions)
  const canManage = permissions.includes("*") || permissions.includes("content.manage")
  const [config, setConfig] = useState<HomeCarouselConfig | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const abort = new AbortController()
    loadHomeCarousel(abort.signal).then((value) => {
      setConfig(value)
      setSelectedId(value.slides[0]?.id ?? null)
    }).catch((err) => {
      if (!abort.signal.aborted) setError(err instanceof Error ? err.message : "Could not load carousel")
    }).finally(() => { if (!abort.signal.aborted) setLoading(false) })
    return () => abort.abort()
  }, [])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  async function reload() {
    if (dirty && !window.confirm("Discard your unsaved carousel edits and reload?")) return
    setLoading(true)
    setError(null)
    try {
      const value = await loadHomeCarousel()
      setConfig(value); setSelectedId(value.slides[0]?.id ?? null); setDirty(false); setNotice(null)
    } catch (err) { setError(err instanceof Error ? err.message : "Could not reload carousel") }
    finally { setLoading(false) }
  }

  function updateConfig(change: Partial<HomeCarouselConfig>) {
    setConfig((value) => value ? { ...value, ...change } : value)
    setDirty(true); setNotice(null)
  }

  function updateSlide(id: string, change: Partial<CarouselSlide>) {
    setConfig((value) => value ? { ...value, slides: value.slides.map((slide) => slide.id === id ? { ...slide, ...change } : slide) } : value)
    setDirty(true); setNotice(null)
  }

  function move(index: number, direction: number) {
    if (!config) return
    const next = [...config.slides]
    ;[next[index], next[index + direction]] = [next[index + direction], next[index]]
    updateConfig({ slides: next })
  }

  async function upload(file: File | undefined, id: string) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError("Choose an image smaller than 5 MB."); return }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Use JPEG, PNG or WebP."); return }
    setUploading(true); setError(null)
    try {
      const result = await uploadCarouselImage(await readImage(file))
      updateSlide(id, { image_url: result.url })
    } catch (err) { setError(err instanceof Error ? err.message : "Image upload failed") }
    finally { setUploading(false) }
  }

  async function save() {
    if (!config || !canManage) return
    if (!Number.isInteger(config.interval_seconds) || config.interval_seconds < 3 || config.interval_seconds > 30) {
      setError("Choose a whole number between 3 and 30 seconds per slide."); return
    }
    for (const slide of config.slides) {
      if (!slide.title.trim() || (slide.action !== "none" && !slide.button_label.trim())) {
        setError("Every slide needs a title, and every button needs a label."); return
      }
      if (["merchant", "product"].includes(slide.action) && !slide.merchant_lookup?.trim()) {
        setError("Enter a shop slug or ID for each shop/product destination."); return
      }
      if (slide.action === "product" && !slide.product_id?.trim()) {
        setError("Enter a product ID for each product destination."); return
      }
    }
    setSaving(true); setError(null); setNotice(null)
    try {
      const saved = await saveHomeCarousel(config)
      setConfig(saved); setDirty(false)
      setNotice(`Saved version ${saved.version}. Online apps refresh this carousel within about a minute, on reopening Home, or with pull-to-refresh.`)
    } catch (err) { setError(publicationError(err)) }
    finally { setSaving(false) }
  }

  const selected = config?.slides.find((slide) => slide.id === selectedId)
  const disabled = !canManage || loading || saving || uploading
  const image = carouselImageUrl(selected?.image_url ?? null)
  return <div className="mx-auto max-w-7xl space-y-6 p-6">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-3xl font-bold text-slate-900">Home Carousel</h1>
        <p className="mt-2 text-sm text-slate-500">Manage the top banner in the customer app. Changes go live only when you save.</p></div>
      <div className="flex gap-2">
        <button className={buttonClass} disabled={loading || saving || uploading} onClick={() => void reload()}>Reload</button>
        <button className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-40"
          disabled={disabled || !config || !dirty} onClick={() => void save()}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
        </button>
      </div>
    </header>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
    {notice && <div role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}
    {loading && <p className="flex items-center gap-2 p-8"><Loader2 className="h-5 w-5 animate-spin" /> Loading carousel…</p>}
    {config && <>
      <fieldset disabled={disabled} className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-200 bg-white p-5">
        <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={config.enabled} onChange={(event) => updateConfig({ enabled: event.target.checked })} /> Enable carousel</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={config.autoplay} onChange={(event) => updateConfig({ autoplay: event.target.checked })} /> Auto-advance slides</label>
        <label className="flex items-center gap-2 text-sm">Seconds per slide
          <input aria-label="Seconds per slide" className={`${fieldClass} max-w-20`} type="number" min={3} max={30}
            value={config.interval_seconds} onChange={(event) => updateConfig({ interval_seconds: Number(event.target.value) })} />
        </label>
        <span className="text-xs text-slate-500">{config.slides.length}/10 slides · Version {config.version}{dirty ? " · Unsaved edits" : ""}</span>
      </fieldset>
      {!config.enabled && <p className="text-sm text-amber-800">The entire carousel will be hidden after saving. Your slides are kept for later.</p>}
      {config.enabled && !config.slides.some((slide) => slide.enabled) && <p className="text-sm text-amber-800">No enabled slides: the carousel will be hidden.</p>}
      {!canManage && <p className="text-sm text-slate-500">Read-only access. Ask a Super Admin for content.manage permission to edit.</p>}
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <section className="space-y-3" aria-label="Carousel slides">
          {config.slides.map((slide, index) => <div key={slide.id} className={`rounded-xl border bg-white p-3 ${slide.id === selectedId ? "border-emerald-600 ring-1 ring-emerald-600" : "border-slate-200"}`}>
            <button className="w-full text-left" onClick={() => setSelectedId(slide.id)}><p className="text-xs text-slate-500">Slide {index + 1} · {slide.enabled ? "Enabled" : "Disabled"}</p><p className="mt-1 truncate font-semibold">{slide.title}</p></button>
            <div className="mt-3 flex gap-2">
              <button aria-label={`Move slide ${index + 1} up`} className={buttonClass} disabled={disabled || index === 0} onClick={() => move(index, -1)}><ArrowUp className="h-4 w-4" /></button>
              <button aria-label={`Move slide ${index + 1} down`} className={buttonClass} disabled={disabled || index === config.slides.length - 1} onClick={() => move(index, 1)}><ArrowDown className="h-4 w-4" /></button>
              <button aria-label={`Remove slide ${index + 1}`} className={`${buttonClass} ml-auto text-red-700`} disabled={disabled} onClick={() => {
                if (!window.confirm("Remove this slide from your draft? Save changes to publish the removal.")) return
                const next = config.slides.filter((item) => item.id !== slide.id)
                updateConfig({ slides: next }); if (selectedId === slide.id) setSelectedId(next[0]?.id ?? null)
              }}><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>)}
          <button disabled={disabled || config.slides.length >= 10} className={`${buttonClass} flex w-full items-center justify-center gap-2`} onClick={() => {
            const slide = newSlide(); updateConfig({ slides: [...config.slides, slide] }); setSelectedId(slide.id)
          }}><Plus className="h-4 w-4" /> Add slide</button>
        </section>
        {selected ? <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">Edit slide</h2>
          <fieldset disabled={disabled} className="grid gap-4 md:grid-cols-2">
            <label className="col-span-full flex items-center gap-2"><input type="checkbox" checked={selected.enabled} onChange={(event) => updateSlide(selected.id, { enabled: event.target.checked })} /> Enable this slide</label>
            <label className="space-y-1 text-sm md:col-span-2"><span>Image URL (HTTPS) — leave blank for the app’s default photo</span>
              <input className={fieldClass} type="text" maxLength={2048} value={selected.image_url ?? ""} onChange={(event) => updateSlide(selected.id, { image_url: event.target.value || null })} />
            </label>
            <label className="col-span-full space-y-2 text-sm"><span className="flex items-center gap-2"><ImagePlus className="h-4 w-4" /> Or upload JPEG, PNG or WebP (5 MB max)</span>
              <input key={selected.id} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { void upload(event.target.files?.[0], selected.id); event.target.value = "" }} />
              {uploading && <span className="ml-3">Uploading…</span>}
            </label>
            <label className="space-y-1 text-sm"><span>Small heading</span><input className={fieldClass} maxLength={70} value={selected.eyebrow} onChange={(event) => updateSlide(selected.id, { eyebrow: event.target.value })} /></label>
            <label className="space-y-1 text-sm"><span>Title</span><textarea className={fieldClass} rows={2} maxLength={100} value={selected.title} onChange={(event) => updateSlide(selected.id, { title: event.target.value })} /></label>
            <label className="space-y-1 text-sm md:col-span-2"><span>Description</span><textarea className={fieldClass} rows={2} maxLength={200} value={selected.description} onChange={(event) => updateSlide(selected.id, { description: event.target.value })} /></label>
            <label className="space-y-1 text-sm"><span>Button destination</span><select className={fieldClass} value={selected.action} onChange={(event) => updateSlide(selected.id, { action: event.target.value as CarouselAction })}>
              {actions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select></label>
            {selected.action !== "none" && <label className="space-y-1 text-sm"><span>Button label</span><input className={fieldClass} maxLength={36} value={selected.button_label} onChange={(event) => updateSlide(selected.id, { button_label: event.target.value })} /></label>}
            {["merchant", "product"].includes(selected.action) && <label className="space-y-1 text-sm"><span>Shop slug or ID</span><input className={fieldClass} maxLength={120} value={selected.merchant_lookup ?? ""} onChange={(event) => updateSlide(selected.id, { merchant_lookup: event.target.value || null })} /></label>}
            {selected.action === "product" && <label className="space-y-1 text-sm"><span>Product ID</span><input className={fieldClass} maxLength={120} value={selected.product_id ?? ""} onChange={(event) => updateSlide(selected.id, { product_id: event.target.value || null })} /></label>}
          </fieldset>
          <h3 className="mb-3 mt-8 text-sm font-semibold text-slate-500">Draft preview{selected.enabled ? "" : " · This slide is disabled"}</h3>
          <div className="relative mx-auto min-h-60 max-w-md overflow-hidden rounded-2xl bg-emerald-50">
            {/* These admin-selected public URLs are loaded by the browser, never by the Next image optimizer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-r from-[#f0f6ed] via-[#f0f6ed]/90 to-transparent" />
            <div className="relative max-w-[80%] space-y-3 p-5 text-slate-900">
              <p className="text-[9px] tracking-widest">{selected.eyebrow}</p>
              <p className="whitespace-pre-line text-2xl font-bold leading-tight">{selected.title}</p>
              <p className="text-xs">{selected.description}</p>
              {selected.action !== "none" && <span className="inline-block rounded-full bg-emerald-950 px-4 py-2 text-xs text-white">{selected.button_label} →</span>}
              {!image && <p className="text-[10px] text-slate-500">Default app photo</p>}
            </div>
          </div>
        </section> : <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Add a slide to get started.</div>}
      </div>
    </>}
  </div>
}

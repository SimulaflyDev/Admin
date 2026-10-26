"use client"

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Plus, Save, Store, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'
import { carouselImageUrl } from '@/lib/api/home-content'
import { findShops, loadShopsConfig, publishShopsConfig, shopPublicationError, uploadShopImage,
  type ShopsConfig, type ShopOption, type ShopBanner, type ShopCategory, type ShopListing, type ShopIcon } from '@/lib/api/shop-content'

const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100'
const button = 'rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-40'
const panel = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
const icons: ShopIcon[] = ['furniture', 'lighting', 'paint', 'panels', 'decor', 'bath', 'tiles', 'all']

function ImageField({value, onChange, onUpload}: {value: string | null; onChange: (v: string | null) => void; onUpload: (f: File) => void}) {
  const source = carouselImageUrl(value)
  return <div className="space-y-3">
    <label className="block space-y-1 text-sm">Public image URL (optional)
      <input className={input} value={value ?? ''} maxLength={2048} placeholder="https://…" onChange={(e) => onChange(e.target.value || null)} />
    </label>
    <label className="flex flex-wrap items-center gap-2 text-sm"><ImagePlus className="h-4 w-4" /> Upload image
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
        const file = e.target.files?.[0]; if (file) onUpload(file); e.target.value = ''
      }} />
    </label>
    <p className="text-xs text-slate-500">JPEG, PNG or WebP, up to 5 MB. Banner: wide landscape. Store card: square. Leave blank to use the merchant’s storefront image.</p>
    {source && <div className="overflow-hidden rounded-xl bg-emerald-50">
      {/* Public admin-selected images are not fetched through a server image proxy. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="Selected marketing image" src={source} className="h-36 w-full object-cover" referrerPolicy="no-referrer" />
    </div>}
  </div>
}

function ShopPicker({value, onChange}: {value: string; onChange: (value: string) => void}) {
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0)
  const [options, setOptions] = useState<ShopOption[]>([])
  const [selected, setSelected] = useState<ShopOption | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    const abort = new AbortController()
    const timer = setTimeout(() => {
      findShops(search, offset, abort.signal).then((shops) => { if (!abort.signal.aborted) {setOptions(shops); setError(null)} })
        .catch((e) => {if (!abort.signal.aborted) setError(shopPublicationError(e))})
    }, 250)
    return () => {clearTimeout(timer); abort.abort()}
  }, [search, offset])
  useEffect(() => {
    if (!value) return
    const abort = new AbortController()
    findShops(value, 0, abort.signal).then((shops) => {if (!abort.signal.aborted) setSelected(shops.find((s) => s.id === value) ?? null)})
      .catch(() => { /* Keep the existing selected ID while lookup is unavailable. */ })
    return () => abort.abort()
  }, [value])
  const visible = options.some((s) => s.id === value) || selected?.id !== value ? options : [selected, ...options]
  return <div className="space-y-2 rounded-xl bg-slate-50 p-3">
    <label className="block space-y-1 text-sm font-semibold">Select a shop
      <input className={input} value={search} placeholder="Find by name, slug or shop ID" onChange={(e) => {setSearch(e.target.value); setOffset(0)}} maxLength={100} />
    </label>
    <select required aria-label="Shop destination" className={input} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Choose a shop…</option>
      {value && !visible.some((s) => s.id === value) && <option value={value}>Selected shop · {value}</option>}
      {visible.map((s) => <option key={s.id} value={s.id}>{s.display_name} · {s.shop_id || s.slug}{s.available ? '' : ' (not public)'}</option>)}
    </select>
    {selected?.id === value && !selected.available && <p className="text-xs text-amber-700">This shop is unverified or suspended and will not appear in the app until it becomes eligible.</p>}
    {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    <div className="flex items-center justify-between text-xs"><button type="button" className={button} disabled={offset === 0} onClick={() => setOffset(offset - 30)}>Previous shops</button>
      <button type="button" className={button} disabled={options.length < 30} onClick={() => setOffset(offset + 30)}>More shops</button></div>
  </div>
}

function EntryActions({index, count, move, remove}: {index: number; count: number; move: (by: number) => void; remove: () => void}) {
  return <div className="flex gap-1">
    <button type="button" className={button} disabled={index === 0} aria-label="Move up" onClick={() => move(-1)}><ArrowUp className="h-4 w-4" /></button>
    <button type="button" className={button} disabled={index + 1 === count} aria-label="Move down" onClick={() => move(1)}><ArrowDown className="h-4 w-4" /></button>
    <button type="button" className={`${button} text-red-600`} aria-label="Remove from draft" onClick={() => {if (window.confirm('Remove this entry from the draft? Save changes to publish its removal.')) remove()}}><Trash2 className="h-4 w-4" /></button>
  </div>
}

function commaValues(value: string) { return value.split(',').map((v) => v.trim()).filter(Boolean) }

export default function ShopsContentPage() {
  const permissions = useAuthStore((s) => s.permissions)
  const canEdit = permissions.includes('*') || permissions.includes('content.manage')
  const [config, setConfig] = useState<ShopsConfig | null>(null)
  const [tab, setTab] = useState<'page' | 'banners' | 'categories' | 'stores'>('page')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const form = useRef<HTMLFormElement>(null)
  useEffect(() => {
    const abort = new AbortController()
    loadShopsConfig(abort.signal).then((data) => {if (!abort.signal.aborted) setConfig(data)})
      .catch((e) => {if (!abort.signal.aborted) setError(shopPublicationError(e))})
    return () => abort.abort()
  }, [])
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => {e.preventDefault(); e.returnValue = ''}
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function change(data: Partial<ShopsConfig>) {
    setConfig((old) => old ? {...old, ...data} : old); setDirty(true); setNotice(null)
  }
  function banner(index: number, data: Partial<ShopBanner>) { if (config) change({banners: config.banners.map((v, i) => i === index ? {...v, ...data} : v)}) }
  function category(index: number, data: Partial<ShopCategory>) { if (config) change({categories: config.categories.map((v, i) => i === index ? {...v, ...data} : v)}) }
  function listing(index: number, data: Partial<ShopListing>) { if (config) change({listings: config.listings.map((v, i) => i === index ? {...v, ...data} : v)}) }
  function move(key: 'banners' | 'categories' | 'listings', index: number, by: number) {
    if (!config) return
    const items = [...config[key]]; [items[index], items[index + by]] = [items[index + by], items[index]]
    change({[key]: items})
  }
  async function reload() {
    if (dirty && !window.confirm('Discard unsaved edits and reload the published Shops page?')) return
    setBusy(true); setError(null)
    try {setConfig(await loadShopsConfig()); setDirty(false); setNotice(null)}
    catch (e) {setError(shopPublicationError(e))} finally {setBusy(false)}
  }
  async function upload(file: File, apply: (url: string) => void) {
    if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {setError('Use JPEG, PNG or WebP up to 5 MB.'); return}
    setUploading(true); setError(null)
    try {
      const encoded = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1])
        reader.onerror = () => reject(new Error('Could not read image')); reader.readAsDataURL(file)
      })
      apply((await uploadShopImage(encoded)).url)
    } catch (e) {setError(shopPublicationError(e))} finally {setUploading(false)}
  }
  async function save() {
    if (!config || !canEdit || !form.current?.reportValidity()) return
    if (config.banners.some((v) => !v.merchant_id) || config.listings.some((v) => !v.merchant_id)) {
      setError('Select a shop for every banner and store card before publishing.'); return
    }
    setBusy(true); setError(null); setNotice(null)
    const publication = {...config,
      categories: config.categories.map((v) => ({...v, terms: commaValues(v.terms.join(','))})),
      listings: config.listings.map((v) => ({...v, categories: commaValues(v.categories.join(','))})),
    }
    try {const saved = await publishShopsConfig(publication); setConfig(saved); setDirty(false)
      setNotice(`Published version ${saved.version}. Online Shops pages refresh within 60 seconds, on reopening or with pull-to-refresh.`)}
    catch (e) {setError(shopPublicationError(e))} finally {setBusy(false)}
  }
  const disabled = busy || uploading || !canEdit
  return <div className="mx-auto max-w-6xl space-y-6 p-6">
    <header className="flex flex-wrap items-start justify-between gap-4"><div>
      <h1 className="flex items-center gap-3 text-3xl font-bold"><Store className="h-8 w-8 text-emerald-700" />Shops Page</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-500">Curate the customer app’s shop discovery page. Edit your draft, then publish all changes together.</p>
    </div><div className="flex gap-2"><button className={button} disabled={busy || uploading} onClick={() => void reload()}>Reload</button>
      <button className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white disabled:opacity-40" disabled={disabled || !dirty || !config} onClick={() => void save()}>
        <Save className="h-4 w-4" />{busy ? 'Saving…' : uploading ? 'Uploading…' : 'Publish changes'}</button></div></header>
    {!canEdit && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Read-only access. Publishing requires the content.manage permission.</p>}
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>}
    {notice && <div role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{notice}</div>}
    {!config ? <p>Loading page settings…</p> : <>
      <nav aria-label="Page editor sections" className="flex flex-wrap gap-2">{([['page', 'Page & preview'], ['banners', 'Hero banners'], ['categories', 'Categories'], ['stores', 'Store cards']] as const).map(([id, label]) =>
        <button key={id} aria-pressed={tab === id} className={`${button} ${tab === id ? 'bg-emerald-950 text-white' : 'bg-white'}`} disabled={uploading} onClick={() => setTab(id)}>{label}</button>)}</nav>
      <form ref={form} onSubmit={(e) => {e.preventDefault(); void save()}}><fieldset disabled={disabled} className="space-y-5">
        {tab === 'page' && <div className="grid gap-6 lg:grid-cols-2"><section className={`${panel} space-y-4`}>
          <h2 className="text-lg font-bold">Headings & playback</h2>
          {([['title', 'Page title', 40], ['subtitle', 'Page subtitle', 100], ['nearby_title', 'Heading when location is available', 50],
            ['browse_title', 'Heading without location', 50], ['section_subtitle', 'Store section subtitle', 100]] as const).map(([key, label, max]) =>
              <label key={key} className="block space-y-1 text-sm">{label}<input className={input} value={config[key]} required={key.endsWith('title') && key !== 'subtitle' && key !== 'section_subtitle'} maxLength={max} onChange={(e) => change({[key]: e.target.value})} /></label>)}
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={config.banners_enabled} onChange={(e) => change({banners_enabled: e.target.checked})} /> Show hero carousel</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={config.autoplay} onChange={(e) => change({autoplay: e.target.checked})} /> Automatically advance slides</label>
          <label className="block space-y-1 text-sm">Seconds per slide<input className={input} type="number" min={3} max={30} step={1} required value={config.interval_seconds} onChange={(e) => change({interval_seconds: Number(e.target.value)})} /></label>
          <p className="text-xs leading-relaxed text-slate-500">Verified status comes from merchant verification. Offers come from active, unexpired coupons with remaining uses. Distances use the customer’s location. Ratings are hidden until a real shop-rating source exists.</p>
        </section><section className={`${panel} self-start bg-[#f7fbf6]`}><h2 className="mb-4 text-sm font-semibold text-slate-500">Draft layout preview · not live merchant data</h2>
          <h3 className="text-3xl font-extrabold">{config.title}</h3><p className="text-sm text-slate-500">{config.subtitle}</p>
          {config.banners_enabled && config.banners.some((b) => b.enabled) && <div className="mt-4 rounded-xl bg-emerald-950 p-5 text-white">
            <p className="text-xs text-emerald-200">Hero carousel · {config.banners.filter((b) => b.enabled).length} enabled</p>
            <p className="mt-2 font-bold">{config.banners.find((b) => b.enabled)?.title || 'Selected shop name'}</p></div>}
          <div className="my-4 flex flex-wrap gap-2"><span className="rounded-full bg-emerald-950 px-3 py-2 text-xs text-white">All</span>{config.categories.filter((c) => c.enabled).map((c, i) => <span key={i} className="rounded-full bg-emerald-50 px-3 py-2 text-xs">{c.label}</span>)}</div>
          <div className="my-4 flex flex-wrap gap-2 text-xs">{['Filters', 'Near & Fast', 'Offers', 'Sort'].map((v) => <span key={v} className="rounded-full border px-3 py-2">{v}</span>)}</div>
          <h3 className="text-xl font-bold">{config.nearby_title}</h3><p className="text-xs text-slate-500">{config.section_subtitle}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">{[0, 1].map((i) => <div key={i} className="overflow-hidden rounded-xl border bg-white"><div className="flex h-28 items-center justify-center bg-emerald-100"><Store className="text-emerald-700" /></div><p className="p-3 text-xs">Real eligible shop details</p></div>)}</div>
        </section></div>}
        {tab === 'banners' && <>
          <p className="text-sm text-slate-500">Banner order below is the app order. Disabled banners and unavailable shops are hidden. A banner always opens its selected shop directly in the app.</p>
          {config.banners.map((v, i) => <section key={v.id} className={`${panel} space-y-4`}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Banner {i + 1}</h2><EntryActions index={i} count={config.banners.length} move={(by) => move('banners', i, by)} remove={() => change({banners: config.banners.filter((_, n) => n !== i)})} /></div>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={v.enabled} onChange={(e) => banner(i, {enabled: e.target.checked})} />Enabled</label>
            <div className="grid gap-5 md:grid-cols-2"><div className="space-y-4"><ShopPicker value={v.merchant_id} onChange={(id) => banner(i, {merchant_id: id})} />
              {([['title', 'Heading (blank = shop name)', 90], ['subtitle', 'Subheading (blank = shop categories)', 100], ['badge', 'Badge (avoid unsupported personal-match claims)', 28]] as const).map(([key, label, max]) =>
                <label key={key} className="block space-y-1 text-sm">{label}<input className={input} value={v[key]} maxLength={max} onChange={(e) => banner(i, {[key]: e.target.value})} /></label>)}</div>
              <ImageField value={v.image_url} onChange={(url) => banner(i, {image_url: url})} onUpload={(file) => void upload(file, (url) => banner(i, {image_url: url}))} /></div>
          </section>)}
          <button type="button" className={`${button} flex items-center gap-2`} disabled={config.banners.length >= 10} onClick={() => change({banners: [...config.banners, {id: crypto.randomUUID(), merchant_id: '', enabled: true, title: '', subtitle: '', badge: 'Featured shop', image_url: null}]})}><Plus className="h-4 w-4" />Add banner</button>
        </>}
        {tab === 'categories' && <>
          <p className="text-sm text-slate-500">“All” is always first. Matching terms filter actual store categories and published in-app product categories. Reorder or hide categories without deleting merchant data.</p>
          {config.categories.map((v, i) => <section key={i} className={`${panel} space-y-4`}>
            <div className="flex items-center justify-between"><h2 className="font-bold">{v.label || `Category ${i + 1}`}</h2><EntryActions index={i} count={config.categories.length} move={(by) => move('categories', i, by)} remove={() => change({categories: config.categories.filter((_, n) => n !== i)})} /></div>
            <div className="grid gap-4 md:grid-cols-3"><label className="text-sm">Stable key<input className={input} required pattern="[a-z0-9_-]+" maxLength={40} value={v.id} onChange={(e) => category(i, {id: e.target.value})} /></label>
              <label className="text-sm">Label<input className={input} required maxLength={28} value={v.label} onChange={(e) => category(i, {label: e.target.value})} /></label>
              <label className="text-sm">Icon<select className={input} value={v.icon} onChange={(e) => category(i, {icon: e.target.value as ShopIcon})}>{icons.map((icon) => <option key={icon}>{icon}</option>)}</select></label></div>
            <label className="block text-sm">Matching terms (comma separated)<input className={input} value={v.terms.join(',')} onChange={(e) => category(i, {terms: e.target.value.split(',')})} /></label>
            <label className="flex gap-2 text-sm"><input type="checkbox" checked={v.enabled} onChange={(e) => category(i, {enabled: e.target.checked})} />Enabled in the app</label>
          </section>)}
          <button type="button" className={button} disabled={config.categories.length >= 12} onClick={() => change({categories: [...config.categories, {id: `category-${Date.now()}`, label: 'New category', icon: 'all', enabled: true, terms: ['new category']}]})}>Add category</button>
        </>}
        {tab === 'stores' && <>
          <p className="text-sm text-slate-500">Eligible verified shops appear automatically. Add a customization to change a card, feature it, or hide it from discovery. Featured shops follow this order. Hiding here does not delete the merchant or disable their direct shop link.</p>
          {config.listings.map((v, i) => <section key={i} className={`${panel} space-y-4`}>
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Store card {i + 1}</h2><EntryActions index={i} count={config.listings.length} move={(by) => move('listings', i, by)} remove={() => change({listings: config.listings.filter((_, n) => n !== i)})} /></div>
            <div className="grid gap-5 md:grid-cols-2"><div className="space-y-4"><ShopPicker value={v.merchant_id} onChange={(id) => listing(i, {merchant_id: id})} />
              <div className="flex gap-5 text-sm"><label className="flex gap-2"><input type="checkbox" checked={v.visible} onChange={(e) => listing(i, {visible: e.target.checked})} />Visible</label><label className="flex gap-2"><input type="checkbox" checked={v.featured} onChange={(e) => listing(i, {featured: e.target.checked})} />Featured</label></div>
              <label className="block text-sm">Short description<textarea className={input} rows={2} maxLength={140} value={v.description} onChange={(e) => listing(i, {description: e.target.value})} /></label>
              <label className="block text-sm">Image badge<input className={input} maxLength={32} placeholder="e.g. Premium showroom" value={v.badge} onChange={(e) => listing(i, {badge: e.target.value})} /></label>
              <label className="block text-sm">Display categories (comma separated; blank uses merchant categories)<input className={input} value={v.categories.join(',')} onChange={(e) => listing(i, {categories: e.target.value.split(',')})} /></label>
              <div className="grid grid-cols-2 gap-3">{([['delivery_min_minutes', 'Min. delivery minutes'], ['delivery_max_minutes', 'Max. delivery minutes']] as const).map(([key, label]) =>
                <label key={key} className="text-sm">{label}<input className={input} type="number" min={1} max={10080} step={1} value={v[key] ?? ''} onChange={(e) => listing(i, {[key]: e.target.value ? Number(e.target.value) : null})} /></label>)}</div>
              <p className="text-xs text-slate-500">Only enter a merchant-confirmed estimate. Set both bounds, or leave both blank. The app labels these as estimates; these are not map travel times.</p>
            </div><ImageField value={v.image_url} onChange={(url) => listing(i, {image_url: url})} onUpload={(file) => void upload(file, (url) => listing(i, {image_url: url}))} /></div>
          </section>)}
          <button type="button" className={button} disabled={config.listings.length >= 500} onClick={() => change({listings: [...config.listings, {merchant_id: '', visible: true, featured: false, image_url: null, description: '', badge: '', categories: [], delivery_min_minutes: null, delivery_max_minutes: null}]})}>Customize a store card</button>
        </>}
      </fieldset></form>
    </>}
  </div>
}

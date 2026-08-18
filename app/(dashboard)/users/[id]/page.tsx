"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, Bot, ArrowLeft, Mail, Phone, MapPin, Wallet, Sparkles, Activity, FileText, UserPlus, Loader2 } from "lucide-react"
import Link from "next/link"
import { getUser } from "@/lib/api/admin"
import type { UserDetail } from "@/lib/api/types"
import { ApiError } from "@/lib/api/types"

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function initials(name: string | null | undefined): string {
  if (!name) return "—"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "—"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatINR(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return "—"
  return `₹${amount.toLocaleString("en-IN")}`
}

// Safely read an optional string field from the loosely-typed design_profile blob.
function profileString(profile: Record<string, unknown> | undefined, key: string): string | null {
  if (!profile) return null
  const value = profile[key]
  return typeof value === "string" && value.trim() ? value : null
}

export default function UserProfile() {
  const params = useParams<{ id: string }>()
  const userId = params?.id ?? ""

  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      setNotFound(false)
      try {
        const res = await getUser(userId)
        if (!cancelled) setUser(res)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
        } else {
          setError(
            err instanceof ApiError ? err.message : "Failed to load user from the server."
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (userId) void load()
    return () => {
      cancelled = true
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Loading user…</span>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-24">
        <div className="flex items-center gap-4">
          <Link href="/users" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 shadow-sm transition-colors shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm text-center">
          <Sparkles className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <h3 className="font-bold text-slate-900 mb-1">User Not Found</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">No user exists with ID {userId}.</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-24">
        <div className="flex items-center gap-4">
          <Link href="/users" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 shadow-sm transition-colors shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <div className="p-6 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-2xl">
          {error ?? "Failed to load user from the server."}
        </div>
      </div>
    )
  }

  const profile = user.design_profile as Record<string, unknown> | undefined
  const phone = profileString(profile, "phone")
  const city = profileString(profile, "city")
  const referredBy =
    user.attribution?.referring_merchant_name ||
    user.attribution?.referred_by_code ||
    "Organic"
  const acquisition = user.attribution?.acquisition_source || "—"

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-24">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link href="/users" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 shadow-sm transition-colors shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{user.full_name || "—"}</h1>
            <Badge variant="outline" className={`font-bold uppercase text-[10px] tracking-wider ml-2 ${user.is_active ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
              {user.is_active ? "Active" : "Suspended"}
            </Badge>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-0.5">User ID: {user.id} • Registered: {formatDate(user.created_at)}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button disabled className="inline-flex h-9 items-center gap-2 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Impersonate
          </button>
          <button disabled className="inline-flex h-9 items-center gap-2 px-4 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Send Message
          </button>
        </div>
      </div>

      {/* Summary Profile Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 shadow-sm border-slate-200 rounded-2xl overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-indigo-500 to-purple-600"></div>
          <CardContent className="pt-0 relative px-6 pb-6">
            <div className="flex flex-col items-center text-center -mt-12">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center p-1 shadow-md mb-3">
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-3xl font-black text-indigo-600">
                  {initials(user.full_name)}
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user.full_name || "—"}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={`font-bold text-[10px] uppercase ${user.is_active ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                  {user.is_active ? "Active" : "Suspended"}
                </Badge>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><Mail className="h-4 w-4 text-slate-400" /></div>
                {user.email || "—"}
              </div>
              {phone ? (
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><Phone className="h-4 w-4 text-slate-400" /></div>
                  {phone}
                </div>
              ) : null}
              {city ? (
                <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center"><MapPin className="h-4 w-4 text-slate-400" /></div>
                  {city}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-50"><Wallet className="h-5 w-5 text-emerald-600" /></div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Credit Balance</div>
            </div>
            <div className="text-3xl font-black text-emerald-700">{formatINR(user.credit_balance)}</div>
            <div className="text-xs font-semibold text-slate-500 mt-2">Available credits</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-amber-50"><ShoppingCart className="h-5 w-5 text-amber-600" /></div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Acquisition</div>
            </div>
            <div className="text-3xl font-black text-amber-700 capitalize truncate">{acquisition}</div>
            <div className="text-xs font-semibold text-slate-500 mt-2">Source channel</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-indigo-50"><UserPlus className="h-5 w-5 text-indigo-600" /></div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Referred By</div>
            </div>
            <div className="text-xl font-black text-indigo-700 truncate">{referredBy}</div>
            <div className="text-xs font-semibold text-slate-500 mt-2">Referral attribution</div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-blue-50"><Activity className="h-5 w-5 text-blue-600" /></div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</div>
            </div>
            <div className={`text-3xl font-black ${user.is_active ? "text-emerald-700" : "text-slate-500"}`}>{user.is_active ? "Active" : "Suspended"}</div>
            <div className="text-xs font-semibold text-slate-500 mt-2">Account state</div>
          </div>
        </div>
      </div>

      {/* Deep Profile Tabs */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="flex h-auto bg-slate-100/50 border border-slate-200 rounded-xl p-1 gap-1 mb-6 max-w-fit">
          {["activity", "bookings", "ai", "support"].map(tab => (
            <TabsTrigger key={tab} value={tab} className="capitalize rounded-lg text-sm font-semibold px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all">
              {tab === "activity" ? "Demand Funnel Activity" : tab === "bookings" ? "Bookings & Intent" : tab === "ai" ? "AI Generation Logs" : "Support Tickets"}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ACTIVITY TIMELINE TAB */}
        <TabsContent value="activity">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm text-center">
            <Activity className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <h3 className="font-bold text-slate-900 mb-1">No activity data available</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Per-user demand funnel activity is not yet available from the backend.</p>
          </div>
        </TabsContent>

        {/* BOOKINGS TAB */}
        <TabsContent value="bookings">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm text-center">
            <FileText className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <h3 className="font-bold text-slate-900 mb-1">No bookings</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Per-user booking history is not yet available from the backend.</p>
          </div>
        </TabsContent>

        {/* AI LOGS TAB */}
        <TabsContent value="ai">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm text-center">
            <Bot className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <h3 className="font-bold text-slate-900 mb-1">No AI generation logs</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Per-user AI generation sessions are not yet available from the backend.</p>
          </div>
        </TabsContent>

        <TabsContent value="support">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm text-center">
            <Sparkles className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <h3 className="font-bold text-slate-900 mb-1">No Active Tickets</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">No support tickets are available for this user.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

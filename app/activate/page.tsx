"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { activateInvitation } from "@/lib/api/settings"
import { ApiError } from "@/lib/api/types"

function ActivateForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [token, setToken] = useState(params.get("invitation_token") ?? "")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!token.trim()) { setError("Activation token is required."); return }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return }
    if (password !== confirm) { setError("Passwords do not match."); return }
    setLoading(true)
    try {
      await activateInvitation(token.trim(), password)
      setDone(true)
      setTimeout(() => router.push("/login"), 1800)
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setError("This invitation is invalid, expired, or already used.")
      } else {
        setError("Unable to activate the account. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-slate-200">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 bg-slate-900 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl">S</div>
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Activate Your Account</CardTitle>
        <CardDescription>Set a password to finish joining the admin team</CardDescription>
      </CardHeader>
      {done ? (
        <CardContent className="pt-4">
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-3 py-2 text-center">
            Account activated. Redirecting to sign in…
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3 py-2">{error}</div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Invitation Token</label>
              <Input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste your token" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">New Password</label>
              <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Confirm Password</label>
              <Input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" required />
            </div>
          </CardContent>
          <CardFooter>
            <button type="submit" disabled={loading} className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 w-full disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Activating…" : "Activate account"}
            </button>
          </CardFooter>
        </form>
      )}
    </Card>
  )
}

export default function ActivatePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading…</div>}>
        <ActivateForm />
      </Suspense>
    </div>
  )
}

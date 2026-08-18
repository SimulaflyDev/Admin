"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "@/lib/api/admin"
import { useAuthStore } from "@/lib/auth-store"
import { ApiError } from "@/lib/api/types"

export default function LoginPage() {
  const router = useRouter()
  const loadPermissions = useAuthStore((s) => s.loadPermissions)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email.trim(), password)
      await loadPermissions()
      router.push("/executive")
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Invalid email or password.")
      } else if (err instanceof ApiError && err.status === 423) {
        setError("Account temporarily locked after too many attempts. Try again later.")
      } else {
        setError("Unable to sign in. Please check the server and try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 bg-slate-900 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl">
            S
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">SimulaFly Admin OS</CardTitle>
          <CardDescription>Enter your credentials to access the command center</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm px-3 py-2">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Email</label>
              <Input
                type="email"
                autoComplete="username"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">Password</label>
              </div>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in to workspace"}
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

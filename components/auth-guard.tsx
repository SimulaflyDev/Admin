"use client"

import { useRequireAuth } from "@/lib/auth-store"

// Wraps protected dashboard content: redirects to /login when no session is
// present and shows a lightweight loader until the permission set is resolved.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireAuth()

  if (!ready) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
          <span className="text-sm font-medium">Loading workspace…</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Lightweight client-side auth state for the Admin Panel.
//
// Token persistence lives in lib/api/client.ts (localStorage). This store
// tracks derived session state (effective permissions, status) and exposes a
// `useRequireAuth` hook that redirects unauthenticated users to /login.

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { create } from "zustand"
import { getMyPermissions, logout as apiLogout } from "@/lib/api/admin"
import { isAuthenticated } from "@/lib/api/client"

interface AuthState {
  permissions: string[]
  fullName: string | null
  email: string | null
  loaded: boolean
  loading: boolean
  loadPermissions: () => Promise<void>
  hasPermission: (perm: string) => boolean
  reset: () => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  permissions: [],
  fullName: null,
  email: null,
  loaded: false,
  loading: false,

  loadPermissions: async () => {
    if (get().loading) return
    set({ loading: true })
    try {
      const res = await getMyPermissions()
      set({ 
        permissions: res.permissions ?? [], 
        fullName: res.full_name ?? null,
        email: res.email ?? null,
        loaded: true 
      })
    } catch {
      set({ permissions: [], fullName: null, email: null, loaded: true })
    } finally {
      set({ loading: false })
    }
  },

  hasPermission: (perm: string) => {
    const perms = get().permissions
    return perms.includes("*") || perms.includes(perm)
  },

  reset: () => set({ permissions: [], fullName: null, email: null, loaded: false, loading: false }),

  signOut: async () => {
    await apiLogout()
    set({ permissions: [], fullName: null, email: null, loaded: false })
  },
}))

// Redirects to /login when no access token is present; otherwise ensures the
// effective permission set is loaded. Use at the top of protected pages/layouts.
export function useRequireAuth(): { ready: boolean } {
  const router = useRouter()
  const { loaded, loadPermissions } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login")
      return
    }
    if (!loaded) {
      void loadPermissions()
    }
  }, [loaded, loadPermissions, router])

  return { ready: loaded }
}

// Core HTTP client for the SimulaFly Admin API.
//
// Responsibilities:
//  - Resolve the API base URL from NEXT_PUBLIC_API_BASE_URL.
//  - Persist the admin access/refresh token pair in localStorage.
//  - Attach the Bearer access token to every authenticated request.
//  - Transparently refresh the access token once on a 401, then retry.
//  - Surface structured errors via ApiError.
//
// This module is browser-only (uses localStorage); call it from client
// components / event handlers, not during server rendering.

import { ApiError, TokenPair } from "./types"

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api/v1"

const ACCESS_KEY = "sf_admin_access"
const REFRESH_KEY = "sf_admin_refresh"

const isBrowser = () => typeof window !== "undefined"

// ── Token storage ────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return isBrowser() ? window.localStorage.getItem(ACCESS_KEY) : null
}

export function getRefreshToken(): string | null {
  return isBrowser() ? window.localStorage.getItem(REFRESH_KEY) : null
}

export function setTokens(pair: TokenPair): void {
  if (!isBrowser()) return
  window.localStorage.setItem(ACCESS_KEY, pair.access_token)
  window.localStorage.setItem(REFRESH_KEY, pair.refresh_token)
}

export function clearTokens(): void {
  if (!isBrowser()) return
  window.localStorage.removeItem(ACCESS_KEY)
  window.localStorage.removeItem(REFRESH_KEY)
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}

// ── Request core ─────────────────────────────────────────────────

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
  // JSON body; serialized automatically.
  body?: unknown
  // Query params; undefined/null entries are dropped.
  query?: Record<string, string | number | boolean | null | undefined>
  // When false, no Authorization header and no refresh-on-401 (used by login/refresh).
  auth?: boolean
  signal?: AbortSignal
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(
    BASE_URL + (path.startsWith("/") ? path : `/${path}`)
  )
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v))
      }
    }
  }
  return url.toString()
}

async function parse(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

// Tracks an in-flight refresh so concurrent 401s share one refresh call.
let refreshInFlight: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken()
  if (!refresh) return false
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(buildUrl("/admin/auth/refresh"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refresh }),
        })
        if (!res.ok) return false
        const pair = (await parse(res)) as TokenPair
        if (pair?.access_token) {
          setTokens(pair)
          return true
        }
        return false
      } catch {
        return false
      } finally {
        // Reset after the microtask so the result is shared by awaiters first.
        setTimeout(() => {
          refreshInFlight = null
        }, 0)
      }
    })()
  }
  return refreshInFlight
}

function onAuthFailure(): void {
  clearTokens()
  if (isBrowser() && window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

export async function request<T = unknown>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, query, auth = true, signal } = opts

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = {}
    if (body !== undefined) headers["Content-Type"] = "application/json"
    if (auth) {
      const token = getAccessToken()
      if (token) headers["Authorization"] = `Bearer ${token}`
    }
    return fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  }

  let res = await doFetch()

  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      res = await doFetch()
    }
    if (res.status === 401) {
      onAuthFailure()
      throw new ApiError(401, await parse(res), "Session expired")
    }
  }

  if (!res.ok) {
    const detail = await parse(res)
    const message =
      (detail && typeof detail === "object" && "detail" in detail
        ? String((detail as { detail: unknown }).detail)
        : undefined) ?? `Request failed (${res.status})`
    throw new ApiError(res.status, detail, message)
  }

  return (await parse(res)) as T
}

export const apiBaseUrl = BASE_URL

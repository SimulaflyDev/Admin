// Typed endpoint wrappers for the SimulaFly Admin API (/api/v1/admin/*).
// Each function maps 1:1 to a backend route and returns a typed result.

import { clearTokens, getRefreshToken, request, setTokens } from "./client"
import {
  ActivityEntry,
  AlertCategory,
  AlertCounters,
  AlertItem,
  DashboardOverview,
  KPISeries,
  KPIValue,
  ListingEnvelope,
  MerchantListItem,
  PermissionsResponse,
  TokenPair,
  UserDetail,
  UserListItem,
  UserStatusResponse,
} from "./types"

// ── Auth ─────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<TokenPair> {
  const pair = await request<TokenPair>("/admin/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  })
  setTokens(pair)
  return pair
}

export async function logout(): Promise<void> {
  const refresh = getRefreshToken()
  try {
    if (refresh) {
      await request("/admin/auth/logout", {
        method: "POST",
        body: { refresh_token: refresh },
      })
    }
  } finally {
    clearTokens()
  }
}

export function getMyPermissions(): Promise<PermissionsResponse> {
  return request<PermissionsResponse>("/admin/auth/me/permissions")
}

// ── Dashboard / KPIs ─────────────────────────────────────────────

export function getExecutiveKpis(
  range: string,
  compare = false
): Promise<KPIValue[]> {
  return request<KPIValue[]>("/admin/dashboard/executive/kpis", {
    query: { range, compare },
  })
}

export function getExecutiveKpiSeries(
  kpiId: string,
  range: string
): Promise<KPISeries> {
  return request<KPISeries>(
    `/admin/dashboard/executive/kpis/${encodeURIComponent(kpiId)}/series`,
    { query: { range } }
  )
}

// Aggregate snapshot powering the SnapshotWidgets + funnel.
export function getExecutiveOverview(): Promise<DashboardOverview> {
  return request<DashboardOverview>("/admin/dashboard/executive/overview")
}

// Most recent audit-log entries backing the Realtime Feed.
export function getExecutiveActivity(limit = 20): Promise<ActivityEntry[]> {
  return request<ActivityEntry[]>("/admin/dashboard/executive/activity", {
    query: { limit },
  })
}

// ── Finance ──────────────────────────────────────────────────────

export function getFinanceKpis(range: string): Promise<KPIValue[]> {
  return request<KPIValue[]>("/admin/finance/dashboard/kpis", {
    query: { range },
  })
}

// ── Alert Center ─────────────────────────────────────────────────

export function getAlertCounters(): Promise<AlertCounters> {
  return request<AlertCounters>("/admin/alerts/counters")
}

export function listAlertItems(
  category: AlertCategory,
  page = 1,
  pageSize?: number
): Promise<ListingEnvelope<AlertItem>> {
  return request<ListingEnvelope<AlertItem>>(`/admin/alerts/${category}/items`, {
    query: { page, page_size: pageSize },
  })
}

export function resolveAlertItem(
  category: AlertCategory,
  itemId: string
): Promise<{ id: string; category: AlertCategory; resolved: boolean }> {
  return request(`/admin/alerts/${category}/items/${itemId}/resolve`, {
    method: "POST",
  })
}

// ── User directory ───────────────────────────────────────────────

export interface ListParams {
  page?: number
  page_size?: number
  search?: string
  sort?: string
  is_active?: boolean
}

export function listUsers(
  params: ListParams = {}
): Promise<ListingEnvelope<UserListItem>> {
  return request<ListingEnvelope<UserListItem>>("/admin/users", { query: { ...params } })
}

export function getUser(id: string): Promise<UserDetail> {
  return request<UserDetail>(`/admin/users/${id}`)
}

export function suspendUser(id: string): Promise<UserStatusResponse> {
  return request<UserStatusResponse>(`/admin/users/${id}/suspend`, { method: "POST" })
}

export function reactivateUser(id: string): Promise<UserStatusResponse> {
  return request<UserStatusResponse>(`/admin/users/${id}/reactivate`, {
    method: "POST",
  })
}

// ── Merchant directory ───────────────────────────────────────────

export function listMerchants(
  params: ListParams & { status?: string; is_kyc_completed?: boolean } = {}
): Promise<ListingEnvelope<MerchantListItem>> {
  return request<ListingEnvelope<MerchantListItem>>("/admin/merchants", {
    query: { ...params },
  })
}

// ── CSV export helper ────────────────────────────────────────────
// Returns the absolute URL for an export; callers open it (with auth, the
// browser cannot attach the Bearer header to a plain link, so prefer fetch).
export { apiBaseUrl } from "./client"

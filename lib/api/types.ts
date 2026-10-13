// Shared TypeScript types for the SimulaFly Admin API.
// Mirrors the FastAPI response shapes under /api/v1/admin.

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type?: string
}

export interface PermissionsResponse {
  permissions: string[]
  full_name?: string | null
  email?: string | null
}

// Standard paginated listing envelope returned by every admin list endpoint.
export interface ListingEnvelope<T> {
  items: T[]
  page: number
  page_size: number
  total: number
  total_pages: number
  has_next: boolean
  next_page: number | null
}

export type MetricType = "currency" | "number" | "percentage"

// Executive / finance KPI value.
export interface KPIValue {
  id: string
  title: string
  type: MetricType
  value: number
  prior?: number | null
  note?: string | null
}

export interface KPISeriesPoint {
  name: string
  value: number
}

export interface KPISeries {
  id: string
  title: string
  type: MetricType
  range: string
  series: KPISeriesPoint[]
}

// Alert center.
export interface AlertCounters {
  fraudAlerts: number
  overdueInvoices: number
  slaBreaches: number
  failedGenerations: number
  walletsBelow100: number
}

export type AlertCategory =
  | "fraud"
  | "overdue_invoices"
  | "sla_breaches"
  | "failed_generations"
  | "low_balance_wallets"

export interface AlertItem {
  id: string
  category: AlertCategory
  title: string
  created_at: string | null
  detail: Record<string, unknown>
}

// User directory.
export interface UserAttribution {
  referred_by_code: string | null
  acquisition_source: string
  referring_merchant_id: string | null
  referring_merchant_name: string | null
}

export interface UserListItem {
  id: string
  full_name: string | null
  email: string
  is_active: boolean
  created_at: string
  attribution: UserAttribution
}

export interface UserDetail extends UserListItem {
  credit_balance: number
  design_profile: Record<string, unknown>
}

export interface UserStatusResponse {
  id: string
  email: string
  is_active: boolean
}

// Executive dashboard overview (GET /admin/dashboard/executive/overview).
export interface DashboardOverview {
  merchant_health: {
    total: number
    active: number
    suspended: number
    low_balance_wallets: number
    frozen_wallets: number
  }
  store_health: {
    total: number
    active: number
    inactive: number
    suspended: number
  }
  support: {
    open: number
    pending: number
    resolved: number
    sla_breaches: number
  }
  invoices: {
    total: number
    unpaid: number
    paid: number
    overdue: number
  }
  trust_safety: {
    open_fraud_alerts: number
    resolved_fraud_alerts: number
  }
  referral: {
    referred_users: number
    total_users: number
  }
  funnel: {
    impressions: number
    clicks: number
    add_to_cart: number
    purchases: number
  }
  redeem: {
    active_codes: number
    redeemed_codes: number
  }
}

// One audit-log entry backing the Realtime Feed
// (GET /admin/dashboard/executive/activity).
export interface ActivityEntry {
  id: string
  action: string
  target_type: string
  target_id: string | null
  outcome: string
  created_at: string
}

// Merchant directory.
export interface MerchantListItem {
  id: string
  partner_id?: string | null
  shop_id?: string | null
  display_name: string
  legal_name: string
  status: string
  is_kyc_completed: boolean
  state?: string | null
  city?: string | null
  created_at: string
}

// Generic structured API error thrown by the client.
export class ApiError extends Error {
  status: number
  detail: unknown
  constructor(status: number, detail: unknown, message?: string) {
    super(message ?? `API error ${status}`)
    this.name = "ApiError"
    this.status = status
    this.detail = detail
  }
}

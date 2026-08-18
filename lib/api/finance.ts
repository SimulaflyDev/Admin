// Typed endpoint wrappers for the SimulaFly Admin FINANCE surface.
//
// Each function maps 1:1 to a backend route under /api/v1/admin/* and returns a
// typed result. The local interfaces mirror the FastAPI schemas in
// Backendsimulafly/app/schemas/admin/{finance,wallets,redeem_codes,pricing,invoices}.py.
//
// Money is INR (₹). Monetary fields are typed `Money` (number | string) because
// the backend models them as Decimal — depending on the serializer they may
// arrive as a JSON number or a JSON string. Use `toNumber`/`formatINR` to read
// them safely.

import { request } from "./client"
import type { KPIValue, ListingEnvelope, MetricType } from "./types"

// A monetary amount that may arrive as a number or a string (Decimal).
export type Money = number | string

// ── Money helpers ────────────────────────────────────────────────

export function toNumber(v: Money | null | undefined): number {
  if (v === null || v === undefined) return 0
  const n = typeof v === "number" ? v : parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
})

// Format an INR amount as ₹1,23,456.78 (full precision).
export function formatINR(v: Money | null | undefined): string {
  return INR.format(toNumber(v))
}

// Compact INR for KPI tiles: ₹1.2L / ₹4.5K / ₹950.
export function formatINRCompact(v: Money | null | undefined): string {
  const n = toNumber(v)
  const abs = Math.abs(n)
  const sign = n < 0 ? "-" : ""
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L`
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(1)}K`
  return `${sign}₹${abs.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
}

// Format a finance KPI value honouring its metric type.
export function formatKpiValue(type: MetricType, value: number): string {
  if (type === "currency") return formatINRCompact(value)
  if (type === "percentage") return `${value.toFixed(1)}%`
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return value.toLocaleString("en-IN", { maximumFractionDigits: 0 })
}

// ── Finance dashboard (Requirement 12) ───────────────────────────

// finance.py :: FinanceKPI — {id, title, type, value}. Structurally a subset of
// the shared KPIValue (prior/note are optional there), so callers can treat the
// list as KPIValue[] if convenient.
export interface FinanceKPI {
  id: string
  title: string
  type: MetricType
  value: number
}

export interface FinanceSeriesPoint {
  name: string
  value: number
}

export interface FinanceSeries {
  id: string
  title: string
  type: MetricType
  range: string
  series: FinanceSeriesPoint[]
}

export interface TransactionStatusCount {
  status: string
  count: number
}

export interface TransactionBreakdown {
  total: number
  groups: TransactionStatusCount[]
}

export function getFinanceKpis(range: string): Promise<FinanceKPI[]> {
  return request<FinanceKPI[]>("/admin/finance/dashboard/kpis", {
    query: { range },
  })
}

export function getFinanceSeries(range: string): Promise<FinanceSeries> {
  return request<FinanceSeries>("/admin/finance/dashboard/series", {
    query: { range },
  })
}

export function getTransactionBreakdown(): Promise<TransactionBreakdown> {
  return request<TransactionBreakdown>("/admin/finance/transactions/breakdown")
}

// ── Wallets (Requirement 14) ─────────────────────────────────────

export type AdjustmentDirection = "credit" | "debit"

// wallets.py :: WalletListItem
export interface WalletListItem {
  id: string
  merchant_id: string
  merchant_name: string | null
  balance: Money
  currency: string
  status: string
  low_balance_threshold: Money
  last_recharged_at: string | null
  created_at: string
}

// wallets.py :: WalletTransactionItem
export interface WalletTransactionItem {
  id: string
  merchant_id: string
  amount: Money
  currency: string
  payment_method: string | null
  gateway: string
  gateway_ref: string | null
  status: string
  created_at: string
}

// wallets.py :: WalletAdjustmentResponse
export interface WalletAdjustmentResponse {
  wallet_id: string
  merchant_id: string
  direction: AdjustmentDirection
  amount: Money
  balance: Money
  currency: string
  status: string
  transaction_id: string
  ledger_entry_id: string
}

export interface ListWalletsParams {
  page?: number
  page_size?: number
  search?: string
  sort?: string
  below_threshold?: boolean
}

export function listWallets(
  params: ListWalletsParams = {}
): Promise<ListingEnvelope<WalletListItem>> {
  return request<ListingEnvelope<WalletListItem>>("/admin/wallets", {
    query: { ...params },
  })
}

export function getWalletTransactions(
  id: string,
  params: { page?: number; page_size?: number } = {}
): Promise<ListingEnvelope<WalletTransactionItem>> {
  return request<ListingEnvelope<WalletTransactionItem>>(
    `/admin/wallets/${id}/transactions`,
    { query: { ...params } }
  )
}

export function adjustWallet(
  id: string,
  body: { direction: AdjustmentDirection; amount: number }
): Promise<WalletAdjustmentResponse> {
  return request<WalletAdjustmentResponse>(`/admin/wallets/${id}/adjust`, {
    method: "POST",
    body,
  })
}

// ── Redeem codes (Requirement 15) ────────────────────────────────

// redeem_codes.py :: RedeemCodeItem
export interface RedeemCodeItem {
  id: string
  code: string
  value: Money
  currency: string
  status: string
  expires_at: string | null
  redeemed_by: string | null
  redeemed_at: string | null
  batch_id: string | null
  created_at: string
}

// redeem_codes.py :: RedeemCodeGenerateResponse
export interface RedeemCodeGenerateResponse {
  batch_id: string
  quantity: number
  items: RedeemCodeItem[]
}

export interface ListRedeemCodesParams {
  page?: number
  page_size?: number
  status?: string
}

export function listRedeemCodes(
  params: ListRedeemCodesParams = {}
): Promise<ListingEnvelope<RedeemCodeItem>> {
  return request<ListingEnvelope<RedeemCodeItem>>("/admin/redeem-codes", {
    query: { ...params },
  })
}

export function generateRedeemCodes(body: {
  value: number
  quantity: number
  expiry?: string | null
}): Promise<RedeemCodeGenerateResponse> {
  return request<RedeemCodeGenerateResponse>("/admin/redeem-codes", {
    method: "POST",
    body,
  })
}

export function deactivateRedeemCode(id: string): Promise<RedeemCodeItem> {
  return request<RedeemCodeItem>(`/admin/redeem-codes/${id}/deactivate`, {
    method: "POST",
  })
}

// ── Invoices (Requirement 16) ────────────────────────────────────

// invoices.py :: InvoiceListItem
export interface InvoiceListItem {
  id: string
  merchant_id: string
  merchant_name: string | null
  number: string
  amount: Money
  currency: string
  status: string
  issue_date: string
  due_date: string
  overdue: boolean
}

// invoices.py :: MarkPaidResponse
export interface MarkPaidResponse {
  id: string
  status: string
  paid_at: string | null
  overdue: boolean
}

export interface ListInvoicesParams {
  page?: number
  page_size?: number
  status?: string
  search?: string
}

export function listInvoices(
  params: ListInvoicesParams = {}
): Promise<ListingEnvelope<InvoiceListItem>> {
  return request<ListingEnvelope<InvoiceListItem>>("/admin/invoices", {
    query: { ...params },
  })
}

export function markInvoicePaid(id: string): Promise<MarkPaidResponse> {
  return request<MarkPaidResponse>(`/admin/invoices/${id}/mark-paid`, {
    method: "POST",
  })
}

// ── Pricing controls (Requirement 13) ────────────────────────────

export type RateType = "fixed" | "percentage"

// pricing.py :: PricingRuleItem
export interface PricingRuleItem {
  id: string
  event_type: string
  merchant_id: string | null
  rate: Money
  rate_type: string
  currency: string
  effective_from: string
  effective_until: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// pricing.py :: PricingRuleListResponse (NOTE: a plain {items} list, not a
// ListingEnvelope).
export interface PricingRuleListResponse {
  items: PricingRuleItem[]
}

// pricing.py :: PricingRuleCreate
export interface PricingRuleCreate {
  event_type: string
  merchant_id?: string | null
  rate: number
  rate_type?: RateType
  currency?: string
  effective_from?: string | null
  effective_until?: string | null
  notes?: string | null
}

// pricing.py :: PricingRuleUpdate
export interface PricingRuleUpdate {
  rate?: number
  rate_type?: RateType
  currency?: string
  effective_from?: string | null
  effective_until?: string | null
  notes?: string | null
}

export function listPricingRules(
  params: { include_history?: boolean } = {}
): Promise<PricingRuleListResponse> {
  return request<PricingRuleListResponse>("/admin/pricing-rules", {
    query: { ...params },
  })
}

export function createPricingRule(
  body: PricingRuleCreate
): Promise<PricingRuleItem> {
  return request<PricingRuleItem>("/admin/pricing-rules", {
    method: "POST",
    body,
  })
}

export function updatePricingRule(
  id: string,
  body: PricingRuleUpdate
): Promise<PricingRuleItem> {
  return request<PricingRuleItem>(`/admin/pricing-rules/${id}`, {
    method: "PATCH",
    body,
  })
}

// Re-export for convenience so finance pages can reference the shared KPI shape.
export type { KPIValue }

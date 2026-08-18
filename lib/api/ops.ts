// Typed endpoint wrappers for the SimulaFly Admin OPERATIONS surface.
//
// Covers Support, Bookings, Analytics, Audit, and System/Health under
// /api/v1/admin/*. Each function maps 1:1 to a backend route and returns a
// typed result. Local interfaces are derived from the backend Pydantic schemas
// in Backendsimulafly/app/schemas/admin/{support,analytics,audit,system}.py and
// app/schemas/admin/bookings.py.
//
// This module deliberately does NOT touch lib/api/admin.ts; it only imports the
// shared `request` core and the shared envelope / KPI types.

import { request } from "./client"
import type { KPIValue, ListingEnvelope } from "./types"

// ── Support (R17) ────────────────────────────────────────────────

export type SupportTicketStatus = "open" | "pending" | "resolved"
export type SupportTicketPriority = "low" | "medium" | "high" | "urgent"
export type SupportRequesterType = "merchant" | "consumer"

export interface SupportMessage {
  id: string
  ticket_id: string
  author_type: string
  author_id: string
  body: string
  created_at: string
}

export interface SupportTicketListItem {
  id: string
  subject: string
  requester_type: string
  requester_id: string
  status: string
  priority: string
  sla_due_at: string | null
  created_at: string
  sla_breached: boolean
}

export interface SupportTicketDetail extends SupportTicketListItem {
  updated_at: string
  messages: SupportMessage[]
}

export interface SupportListParams {
  page?: number
  page_size?: number
  search?: string
  sort?: string
  status?: SupportTicketStatus
  priority?: SupportTicketPriority
  requester_type?: SupportRequesterType
}

export function listTickets(
  params: SupportListParams = {}
): Promise<ListingEnvelope<SupportTicketListItem>> {
  return request<ListingEnvelope<SupportTicketListItem>>("/admin/support/tickets", {
    query: { ...params },
  })
}

export function listConsumerTickets(
  params: Omit<SupportListParams, "requester_type"> = {}
): Promise<ListingEnvelope<SupportTicketListItem>> {
  return request<ListingEnvelope<SupportTicketListItem>>("/admin/support/consumer", {
    query: { ...params },
  })
}

export function getTicket(id: string): Promise<SupportTicketDetail> {
  return request<SupportTicketDetail>(`/admin/support/tickets/${id}`)
}

export function respondTicket(
  id: string,
  payload: { body: string }
): Promise<SupportTicketDetail> {
  return request<SupportTicketDetail>(`/admin/support/tickets/${id}/messages`, {
    method: "POST",
    body: payload,
  })
}

export function updateTicketStatus(
  id: string,
  payload: { status: SupportTicketStatus }
): Promise<SupportTicketDetail> {
  return request<SupportTicketDetail>(`/admin/support/tickets/${id}/status`, {
    method: "PATCH",
    body: payload,
  })
}

// ── Bookings (R11) ───────────────────────────────────────────────

export type DisputeStatus = "none" | "open" | "resolved"
export type FulfillmentStatus = "pending" | "in_progress" | "fulfilled" | "cancelled"

export interface BookingLineItem {
  product_id?: string | null
  variant_id?: string | null
  qty?: number | null
  price_at_capture?: number | null
  title?: string | null
  img_url?: string | null
  sku?: string | null
  [key: string]: unknown
}

export interface BookingListItem {
  id: string
  user_id: string
  customer_name: string | null
  merchant_id: string
  merchant_name: string | null
  status: string
  amount: number
  dispute_status: string
  fulfillment_status: string
  created_at: string
}

export interface BookingDetail extends BookingListItem {
  lead_id: string
  line_items: BookingLineItem[]
  delivery_address: Record<string, unknown>
  dispute_reason: string | null
  dispute_resolution: string | null
  merchant_notes: string | null
  completed_at: string | null
  updated_at: string
}

export interface BookingListParams {
  page?: number
  page_size?: number
  sort?: string
  status?: string
  merchant_id?: string
  created_from?: string
  created_to?: string
}

export function listBookings(
  params: BookingListParams = {}
): Promise<ListingEnvelope<BookingListItem>> {
  return request<ListingEnvelope<BookingListItem>>("/admin/bookings", {
    query: { ...params },
  })
}

export function getBooking(id: string): Promise<BookingDetail> {
  return request<BookingDetail>(`/admin/bookings/${id}`)
}

export interface BookingQueueParams {
  page?: number
  page_size?: number
  sort?: string
}

export function listDisputes(
  params: BookingQueueParams = {}
): Promise<ListingEnvelope<BookingListItem>> {
  return request<ListingEnvelope<BookingListItem>>("/admin/bookings/disputes", {
    query: { ...params },
  })
}

export interface DisputeResolveResponse {
  id: string
  dispute_status: string
  dispute_resolution: string | null
}

export function resolveDispute(
  id: string,
  payload: { resolution: string; status?: DisputeStatus }
): Promise<DisputeResolveResponse> {
  return request<DisputeResolveResponse>(`/admin/bookings/${id}/dispute/resolve`, {
    method: "POST",
    body: payload,
  })
}

export function listFulfillment(
  params: BookingQueueParams = {}
): Promise<ListingEnvelope<BookingListItem>> {
  return request<ListingEnvelope<BookingListItem>>("/admin/bookings/fulfillment", {
    query: { ...params },
  })
}

export interface FulfillmentUpdateResponse {
  id: string
  fulfillment_status: string
}

export function updateFulfillment(
  id: string,
  payload: { fulfillment_status: FulfillmentStatus }
): Promise<FulfillmentUpdateResponse> {
  // Backend expects {status}; expose the clearer {fulfillment_status} to callers.
  return request<FulfillmentUpdateResponse>(`/admin/bookings/${id}/fulfillment`, {
    method: "PATCH",
    body: { status: payload.fulfillment_status },
  })
}

// ── Analytics (R18) ──────────────────────────────────────────────
// Each view returns { view, range, metrics: KPIValue[] }. The backend metric
// shape ({id,title,type,value,note?}) is a structural subset of KPIValue.

export interface AnalyticsView {
  view: string
  range: string
  metrics: KPIValue[]
}

function analyticsView(view: string, range?: string): Promise<AnalyticsView> {
  return request<AnalyticsView>(`/admin/analytics/${view}`, {
    query: { range },
  })
}

export function getUserActivity(range?: string): Promise<AnalyticsView> {
  return analyticsView("user-activity", range)
}

export function getMerchantActivity(range?: string): Promise<AnalyticsView> {
  return analyticsView("merchant-activity", range)
}

export function getWalletReferral(range?: string): Promise<AnalyticsView> {
  return analyticsView("wallet-referral", range)
}

export function getAiDataUsage(range?: string): Promise<AnalyticsView> {
  return analyticsView("ai-data-usage", range)
}

// ── Audit log (R19) ──────────────────────────────────────────────

export interface AuditEntry {
  id: string
  actor_admin_id: string | null
  action: string
  target_type: string
  target_id: string | null
  outcome: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AuditListParams {
  page?: number
  page_size?: number
  actor_admin_id?: string
  action?: string
  target_type?: string
  target_id?: string
  date_from?: string
  date_to?: string
}

export function listAudit(
  params: AuditListParams = {}
): Promise<ListingEnvelope<AuditEntry>> {
  return request<ListingEnvelope<AuditEntry>>("/admin/audit", {
    query: { ...params },
  })
}

// ── System / Health (R23) ────────────────────────────────────────

export interface WebhookDelivery {
  id: string
  event_type: string
  status: string
  attempt_count: number
  last_attempt_at: string | null
  created_at: string
}

export interface DependencyHealth {
  status: string
  detail: string | null
}

export interface SystemHealth {
  status: string
  database: DependencyHealth
  scheduler: DependencyHealth
}

export interface OperationalCounters {
  pending_jobs: number
  recent_failures: number
}

export function listWebhooks(
  params: { page?: number; page_size?: number } = {}
): Promise<ListingEnvelope<WebhookDelivery>> {
  return request<ListingEnvelope<WebhookDelivery>>("/admin/system/webhooks", {
    query: { ...params },
  })
}

export function redeliverWebhook(id: string): Promise<WebhookDelivery> {
  return request<WebhookDelivery>(`/admin/system/webhooks/${id}/redeliver`, {
    method: "POST",
  })
}

export function getSystemHealth(): Promise<SystemHealth> {
  return request<SystemHealth>("/admin/system/health")
}

export function getSystemCounters(): Promise<OperationalCounters> {
  return request<OperationalCounters>("/admin/system/counters")
}

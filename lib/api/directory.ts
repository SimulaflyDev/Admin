// Typed endpoint wrappers for the SimulaFly Admin *entity directory* routes
// (merchants, stores, products) under /api/v1/admin/*.
//
// This module is intentionally separate from lib/api/admin.ts to avoid edit
// conflicts with concurrent work. It only imports the shared `request` helper
// from ./client and the shared envelope/merchant types from ./types, and
// defines the store/product row types locally (mirroring the backend pydantic
// schemas in app/schemas/admin/stores.py and products.py).

import { request } from "./client"
import type { ListingEnvelope, MerchantListItem } from "./types"

// ── Local row types ──────────────────────────────────────────────

// Mirrors app/schemas/admin/stores.py::StoreListItem.
export interface StoreListItem {
  id: string
  name: string
  merchant_id: string
  merchant_name?: string | null
  status: string
  created_at: string
}

// Mirrors app/schemas/admin/products.py::ProductListItem.
// `price` is a backend Decimal; JSON may surface it as a number or string, so
// we accept both and normalise at the call site.
export interface ProductListItem {
  id: string
  sku: string
  title: string
  merchant_id: string
  merchant_name?: string | null
  price?: number | string | null
  category?: string | null
  primary_image_url?: string | null
  in_app_stock?: number | null
  status: string
  created_at: string
}

// Valid status values accepted by the backend status mutations.
// StoreStatus (app/models/store.py): active | inactive | suspended
export type StoreStatus = "active" | "inactive" | "suspended"
// ProductStatus (app/models/merchant_product.py)
export type ProductStatus =
  | "draft"
  | "published"
  | "paused_insufficient_funds"
  | "archived"

// ── Detail record types (mirror backend detail schemas) ─────────────

// Mirrors app/schemas/admin/merchants.py::MerchantDetail.
export interface MerchantMember {
  id: string
  user_id: string
  role: string
  email?: string | null
  full_name?: string | null
  joined_at: string
}

export interface WalletSummary {
  id: string
  balance: number | string
  currency: string
  status: string
  low_balance_threshold: number | string
  last_recharged_at?: string | null
}

export interface MerchantDetail {
  id: string
  partner_id?: string | null
  shop_id?: string | null
  slug: string
  display_name: string
  legal_name: string
  status: string
  is_kyc_completed: boolean
  country: string
  address?: string | null
  state?: string | null
  city?: string | null
  latitude?: number | null
  longitude?: number | null
  range_km?: number | null
  support_email?: string | null
  support_phone?: string | null
  created_at: string
  updated_at: string
  members: MerchantMember[]
  wallet?: WalletSummary | null
  kyc: MerchantKycDetail
}

export interface MerchantKycDetail {
  completed: boolean
  otp_verification?: {
    method: string
    verified_at: string
    gstin: string
    provider_transaction_id: string
  } | null
  manual_verification?: {
    approved_at: string
    approved_by_admin_id: string
    approved_by_name: string
    reason: string
  } | null
  pan?: {
    masked_pan: string
    verified_name: string
    category: string
    provider_transaction_id?: string | null
    verified_at: string
  } | null
  gstin?: {
    gstin: string
    legal_name: string
    business_nature?: string | null
    state_name?: string | null
    state_code?: string | null
    registration_status: string
    registration_start_date?: string | null
    provider_transaction_id?: string | null
    verified_at: string
  } | null
}

// Mirrors app/schemas/admin/products.py::ProductDetail.
export interface ProductDetail {
  id: string
  merchant_id: string
  merchant_name?: string | null
  sku: string
  title: string
  description?: string | null
  category?: string | null
  subcategory?: string | null
  brand?: string | null
  status: string
  primary_image_url?: string | null
  additional_images: string[]
  has_simulafly_listing: boolean
  price?: number | string | null
  in_app_stock?: number | null
  health_score: string
  health_reason?: string | null
  created_at: string
  updated_at: string
}

export function getMerchant(id: string): Promise<MerchantDetail> {
  return request<MerchantDetail>(`/admin/merchants/${id}`)
}

export function verifyMerchantManually(id: string, reason: string): Promise<MerchantDetail> {
  return request<MerchantDetail>(`/admin/merchants/${id}/verification`, {
    method: "POST",
    body: { reason },
  })
}

export function getProduct(id: string): Promise<ProductDetail> {
  return request<ProductDetail>(`/admin/products/${id}`)
}

// Status mutation response shapes (mirrors the backend *StatusResponse models).
export interface StoreStatusResponse {
  id: string
  name: string
  merchant_id: string
  status: string
}

export interface ProductStatusResponse {
  id: string
  status: string
}

export interface MerchantStatusResponse {
  id: string
  status: string
}

// ── Merchant directory ───────────────────────────────────────────

export interface MerchantListParams {
  page?: number
  page_size?: number
  search?: string
  sort?: string
  status?: string
  is_kyc_completed?: boolean
  partner_id?: string
  owner_user_id?: string
  primary_only?: boolean
  state?: string
  city?: string
}

export function listMerchants(
  params: MerchantListParams = {}
): Promise<ListingEnvelope<MerchantListItem>> {
  return request<ListingEnvelope<MerchantListItem>>("/admin/merchants", {
    query: { ...params },
  })
}

export function suspendMerchant(id: string): Promise<MerchantStatusResponse> {
  return request<MerchantStatusResponse>(`/admin/merchants/${id}/suspend`, {
    method: "POST",
  })
}

export function activateMerchant(id: string): Promise<MerchantStatusResponse> {
  return request<MerchantStatusResponse>(`/admin/merchants/${id}/activate`, {
    method: "POST",
  })
}

export interface CreateShopPayload {
  display_name: string
  legal_name?: string
  address: string
  state: string
  city: string
  state_code?: string
  city_code?: string
  support_email?: string
  support_phone?: string
  latitude?: number
  longitude?: number
  range_km?: number
}

export function createMerchantShop(
  merchantId: string,
  payload: CreateShopPayload
): Promise<MerchantListItem> {
  return request<MerchantListItem>(`/admin/merchants/${merchantId}/shops`, {
    method: "POST",
    body: payload,
  })
}

// ── Store directory ──────────────────────────────────────────────

export interface StoreListParams {
  page?: number
  page_size?: number
  search?: string
  sort?: string
  merchant_id?: string
}

export function listStores(
  params: StoreListParams = {}
): Promise<ListingEnvelope<StoreListItem>> {
  return request<ListingEnvelope<StoreListItem>>("/admin/stores", {
    query: { ...params },
  })
}

export function updateStoreStatus(
  id: string,
  status: StoreStatus
): Promise<StoreStatusResponse> {
  return request<StoreStatusResponse>(`/admin/stores/${id}/status`, {
    method: "PATCH",
    body: { status },
  })
}

// ── Product directory ────────────────────────────────────────────

export interface ProductListParams {
  page?: number
  page_size?: number
  search?: string
  sort?: string
  merchant_id?: string
  status?: string
  min_price?: number
  max_price?: number
}

export interface ProductMutationPayload {
  merchant_id: string
  sku: string
  title: string
  description?: string | null
  category?: string | null
  subcategory?: string | null
  brand?: string | null
  status?: ProductStatus
  primary_image_url?: string | null
  additional_images?: string[]
  price?: number | null
  in_app_stock?: number | null
}

export type ProductUpdatePayload = Partial<Omit<ProductMutationPayload, "merchant_id">>

export function createProduct(payload: ProductMutationPayload): Promise<ProductDetail> {
  return request<ProductDetail>("/admin/products", { method: "POST", body: payload })
}

export function bulkCreateProducts(
  items: ProductMutationPayload[]
): Promise<{ created: number; items: ProductDetail[] }> {
  return request<{ created: number; items: ProductDetail[] }>("/admin/products/bulk", {
    method: "POST",
    body: { items },
  })
}

export function updateProduct(
  id: string,
  payload: ProductUpdatePayload
): Promise<ProductDetail> {
  return request<ProductDetail>(`/admin/products/${id}`, {
    method: "PATCH",
    body: payload,
  })
}

export function archiveProduct(id: string): Promise<null> {
  return request<null>(`/admin/products/${id}`, { method: "DELETE" })
}

export function listProducts(
  params: ProductListParams = {}
): Promise<ListingEnvelope<ProductListItem>> {
  return request<ListingEnvelope<ProductListItem>>("/admin/products", {
    query: { ...params },
  })
}

export function updateProductStatus(
  id: string,
  status: ProductStatus
): Promise<ProductStatusResponse> {
  return request<ProductStatusResponse>(`/admin/products/${id}/status`, {
    method: "PATCH",
    body: { status },
  })
}

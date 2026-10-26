import { request } from './client'
import { ApiError } from './types'

export type ShopIcon = 'all' | 'furniture' | 'lighting' | 'paint' | 'panels' | 'decor' | 'bath' | 'tiles'
export interface ShopCategory { id: string; label: string; icon: ShopIcon; enabled: boolean; terms: string[] }
export interface ShopBanner {
  id: string; merchant_id: string; enabled: boolean; title: string; subtitle: string; badge: string; image_url: string | null
}
export interface ShopListing {
  merchant_id: string; visible: boolean; featured: boolean; image_url: string | null;
  description: string; badge: string; categories: string[];
  delivery_min_minutes: number | null; delivery_max_minutes: number | null
}
export interface ShopsConfig {
  version: number; title: string; subtitle: string; nearby_title: string; browse_title: string; section_subtitle: string;
  banners_enabled: boolean; autoplay: boolean; interval_seconds: number;
  categories: ShopCategory[]; banners: ShopBanner[]; listings: ShopListing[]
}
export interface ShopOption { id: string; slug: string; display_name: string; shop_id: string | null; available: boolean }
export const loadShopsConfig = (signal?: AbortSignal) => request<ShopsConfig>('/admin/shops', { signal })
export const publishShopsConfig = (body: ShopsConfig) => request<ShopsConfig>('/admin/shops', { method: 'PUT', body })
export const findShops = (q: string, offset = 0, signal?: AbortSignal) => request<ShopOption[]>('/admin/shops/merchants', { query: { q, offset, limit: 30 }, signal })
export const uploadShopImage = (image_base64: string) => request<{url: string}>('/admin/shops/images', { method: 'POST', body: { image_base64 } })

export function shopPublicationError(error: unknown): string {
  if (error instanceof ApiError && error.status === 422 && error.detail && typeof error.detail === 'object' && 'detail' in error.detail) {
    const issues = error.detail.detail
    if (Array.isArray(issues)) return issues.map((issue: {loc?: (string | number)[]; msg?: string}) =>
      `${issue.loc?.filter((v) => v !== 'body').join(' → ') || 'Shops page'}: ${issue.msg || 'Invalid value'}`).join('. ')
  }
  return error instanceof Error ? error.message : 'Could not save the Shops page'
}

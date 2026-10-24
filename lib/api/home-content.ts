import { apiBaseUrl, request } from "./client"

export type CarouselAction = "explore_rooms" | "scan" | "shop" | "sessions" | "merchant" | "product" | "none"

export interface CarouselSlide {
  id: string
  enabled: boolean
  image_url: string | null
  eyebrow: string
  title: string
  description: string
  button_label: string
  action: CarouselAction
  merchant_lookup: string | null
  product_id: string | null
}

export interface HomeCarouselConfig {
  version: number
  enabled: boolean
  autoplay: boolean
  interval_seconds: number
  slides: CarouselSlide[]
}

export const loadHomeCarousel = (signal?: AbortSignal) =>
  request<HomeCarouselConfig>("/admin/home/carousel", { signal })

export const saveHomeCarousel = (config: HomeCarouselConfig) =>
  request<HomeCarouselConfig>("/admin/home/carousel", { method: "PUT", body: config })

export const uploadCarouselImage = (imageBase64: string) =>
  request<{ url: string; byte_size: number }>("/admin/home/carousel/images", {
    method: "POST", body: { image_base64: imageBase64 },
  })

export function carouselImageUrl(value: string | null): string | undefined {
  if (!value) return undefined
  try {
    if (/^\/api\/v1\/home\/carousel\/images\/[0-9a-fA-F-]{36}$/.test(value)) return new URL(value, apiBaseUrl).toString()
    if (value.includes("\\") || Array.from(value).some((c) => c.charCodeAt(0) < 32)) return undefined
    const url = new URL(value)
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : undefined
  } catch { return undefined }
}

import { request } from "./client"

export interface TermsDocument {
  version: string; title: string; sha256: string; page_count: number; published_at: string | null
}
export interface TermsPage { image: string; text: string; page: number }
export interface TermsAcceptance {
  accepted: boolean; signature_name?: string; accepted_at?: string; accepted_by_user_id?: string;
  document_version?: string; document_sha256?: string; document_title?: string; accepted_from_ip?: string
}
export interface TermsDirectory { current: TermsDocument; versions: TermsDocument[]; original: TermsDocument }

export const loadTerms = (offset = 0) => request<TermsDirectory>("/admin/merchant-terms", { query: { offset } })
export const publishTerms = (body: { title: string; expected_version: string; pdf_base64: string }) =>
  request<TermsDocument>("/admin/merchant-terms", { method: "POST", body })
export const loadTermsPage = (version: string, page: number) =>
  request<TermsPage>(`/admin/merchant-terms/${encodeURIComponent(version)}/pages/${page}`)
export const loadTermsAcceptances = (merchantId: string) =>
  request<{ acceptances: TermsAcceptance[] }>(`/admin/merchant-terms/acceptances/${encodeURIComponent(merchantId)}`)

// Typed endpoint wrappers for the SimulaFly Admin SETTINGS surface.
//
// Covers RBAC roles (R2) and admin account management (R3) under
// /api/v1/admin/*. Each function maps 1:1 to a backend route and returns a
// typed result derived from the backend Pydantic schemas in
// Backendsimulafly/app/schemas/admin/{rbac,accounts}.py.
//
// This module deliberately does NOT touch lib/api/admin.ts; it only imports the
// shared `request` core.

import { request } from "./client"

// ── Roles & permissions (R2) ─────────────────────────────────────

export interface RoleResponse {
  id: string
  name: string
  description: string | null
  is_predefined: boolean
  permissions: string[]
}

export interface RolesListResponse {
  roles: RoleResponse[]
}

// List every role (predefined + custom) with its permission keys.
export function listRoles(): Promise<RolesListResponse> {
  return request<RolesListResponse>("/admin/roles")
}

// ── Admin accounts (R3) ──────────────────────────────────────────

export interface AccountListItem {
  id: string
  email: string
  role_names: string[]
  is_active: boolean
}

export interface AccountPageResponse {
  items: AccountListItem[]
  page: number
  page_size: number
  total: number
  total_pages: number
  has_next: boolean
  next_page: number | null
}

export interface AccountListParams {
  page?: number
  page_size?: number
}

// Paginated admin accounts: id, email, role names, active status.
export function listAccounts(
  params: AccountListParams = {}
): Promise<AccountPageResponse> {
  return request<AccountPageResponse>("/admin/accounts", { query: { ...params } })
}

// ── Invitations (R3) ─────────────────────────────────────────────

export interface InvitationCreateResponse {
  invitation_id: string
  account_id: string
  email: string
  role_ids: string[]
  token: string
  status: string
  expires_at: string
}

// Invite a new admin by email + one or more role ids. Returns the raw,
// single-use activation token (shown to the inviter exactly once).
export function createInvitation(
  email: string,
  roleIds: string[]
): Promise<InvitationCreateResponse> {
  return request<InvitationCreateResponse>("/admin/invitations", {
    method: "POST",
    body: { email, role_ids: roleIds },
  })
}

export interface AccountStatusResponse {
  id: string
  email: string
  is_active: boolean
  roles: string[]
}

// Deactivate / reactivate an admin account.
export function deactivateAccount(id: string): Promise<AccountStatusResponse> {
  return request<AccountStatusResponse>(`/admin/accounts/${id}/deactivate`, {
    method: "POST",
  })
}

export function reactivateAccount(id: string): Promise<AccountStatusResponse> {
  return request<AccountStatusResponse>(`/admin/accounts/${id}/reactivate`, {
    method: "POST",
  })
}

export interface InvitationActivateResponse {
  account_id: string
  email: string
  is_active: boolean
  role_ids: string[]
}

// Activate an invited account with the raw token + a chosen password.
// Intentionally unauthenticated (the invited user has no token yet).
export function activateInvitation(
  token: string,
  password: string
): Promise<InvitationActivateResponse> {
  return request<InvitationActivateResponse>("/admin/invitations/activate", {
    method: "POST",
    auth: false,
    body: { token, password },
  })
}

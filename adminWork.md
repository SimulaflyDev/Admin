# SimulaFly Admin Panel – Status & Remaining Work Audit

## Executive Summary

- **Overall Completion Progress**: **~82% Complete**
  - **24 Pages / Sub-systems Fully Integrated** with backend APIs, authentication, error boundaries, paginated data loading, search/filters, and live mutation actions.
  - **6 Detail / Feature Pages Remaining** that currently rely on hardcoded static mock data or local React state and require API wiring.
- **Frontend Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts, Framer Motion, Zustand.
- **Backend Stack**: FastAPI (`Backendsimulafly`), Python 3.11+, PostgreSQL + SQLAlchemy Async ORM, Alembic Migrations, JWT Auth & RBAC Security, Audit Logging.

---

## 📊 Comprehensive Page-by-Page Audit Table

| Module / Page | Route Path | Integration Status | Backend Route | Work Remaining |
| :--- | :--- | :--- | :--- | :--- |
| **Auth Login** | `/login` | ✅ Fully Integrated | `/api/v1/admin/auth/login` | None |
| **Auth Activation** | `/activate` | ✅ Fully Integrated | `/api/v1/admin/accounts/activate` | None |
| **Role Selection** | `/role-selection` | 🟡 Client-only | `/api/v1/admin/auth/me/permissions` | Wire dynamic role switching |
| **Executive Dashboard** | `/executive` | ✅ Fully Integrated | `/api/v1/admin/dashboard/*` | Optional SSE/WebSocket stream |
| **Alert & Incident Center** | `/alerts` | ✅ Fully Integrated | `/api/v1/admin/alerts/*` | None |
| **Merchant Directory** | `/merchants` | ✅ Fully Integrated | `/api/v1/admin/merchants` | None |
| **Merchant Profile** | `/merchants/[id]` | ✅ Fully Integrated | `/api/v1/admin/merchants/{id}` | None |
| **Product Directory** | `/products` | ✅ Fully Integrated | `/api/v1/admin/products` | None |
| **Product Profile** | `/products/[id]` | ✅ Fully Integrated | `/api/v1/admin/products/{id}` | None |
| **Store Directory** | `/stores` | ✅ Fully Integrated | `/api/v1/admin/stores` | None |
| **Store Profile** | `/stores/[id]` | 🔴 Hardcoded Mock Data | `/api/v1/admin/stores/{id}` | Connect page to `getStore(id)` API |
| **Store Listing Control** | `/stores/[id]/listing-control` | 🔴 Client Mock State | `/api/v1/admin/stores/{id}/status` | Connect state machine to API |
| **User Directory** | `/users` | ✅ Fully Integrated | `/api/v1/admin/users` | None |
| **User Profile** | `/users/[id]` | ✅ Fully Integrated | `/api/v1/admin/users/{id}` | None |
| **User Attribution** | `/users/attribution` | 🔴 Hardcoded Table | `/api/v1/admin/users/attribution` | Implement backend route & API |
| **Bookings Directory** | `/bookings` | ✅ Fully Integrated | `/api/v1/admin/bookings` | None |
| **Booking Profile** | `/bookings/[id]` | 🔴 Hardcoded Mock Data | `/api/v1/admin/bookings/{id}` | Wire page to `getBooking(id)` API |
| **Dispute Center** | `/bookings/disputes` | ✅ Fully Integrated | `/api/v1/admin/bookings/disputes` | None |
| **Fulfillment Queue** | `/bookings/fulfillment` | ✅ Fully Integrated | `/api/v1/admin/bookings/fulfillment` | None |
| **Finance Dashboard** | `/finance/dashboard` | ✅ Fully Integrated | `/api/v1/admin/finance/dashboard/*` | None |
| **Wallets Directory** | `/finance/wallets` | ✅ Fully Integrated | `/api/v1/admin/wallets` | None |
| **Redeem Codes** | `/finance/redeem-codes` | ✅ Fully Integrated | `/api/v1/admin/redeem-codes` | None |
| **Invoices Directory** | `/finance/invoices` | ✅ Fully Integrated | `/api/v1/admin/invoices` | None |
| **Pricing Control Center** | `/finance/pricing-controls` | ✅ Fully Integrated | `/api/v1/admin/pricing` | None |
| **AI & Data Analytics** | `/analytics/ai-data` | ✅ Fully Integrated | `/api/v1/admin/analytics/ai-data` | None |
| **Merchant Analytics** | `/analytics/merchant` | ✅ Fully Integrated | `/api/v1/admin/analytics/merchant` | None |
| **User Analytics** | `/analytics/user` | ✅ Fully Integrated | `/api/v1/admin/analytics/user` | None |
| **Wallet & Referral** | `/analytics/wallet-referral` | ✅ Fully Integrated | `/api/v1/admin/analytics/wallet-referral` | None |
| **Support Hub** | `/support` | ✅ Fully Integrated | `/api/v1/admin/support/tickets` | None |
| **Consumer Support** | `/support/consumer` | ✅ Fully Integrated | `/api/v1/admin/support/consumer` | None |
| **Consumer Ticket Detail** | `/support/consumer/[id]` | 🔴 Hardcoded Mock Data | `/api/v1/admin/support/tickets/{id}` | Wire `getTicket()` & `respondTicket()` |
| **Platform Audit Log** | `/system/audit` | ✅ Fully Integrated | `/api/v1/admin/audit` | None |
| **Settings - Accounts** | `/settings` | ✅ Fully Integrated | `/api/v1/admin/accounts` | None |
| **Permissions Matrix** | `/settings/permissions` | 🟡 UI Toggle Mock | `/api/v1/admin/rbac/permissions` | Connect Save button to backend RBAC |

---

## 🛠️ Detailed Audit of Remaining Work Items

### 1. Booking Profile Page (`/bookings/[id]`)
- **File**: [app/(dashboard)/bookings/[id]/page.tsx](file:///d:/bai/simulaflyproto/flt/simulafly/Admin-Panel/app/(dashboard)/bookings/[id]/page.tsx)
- **Current Status**: Displays hardcoded static data (`Rahul M.`, `BK-9021`, GMV ₹12,999, static timeline events).
- **Required Action**:
  - Import `getBooking(id)` from `@/lib/api/ops`.
  - Fetch booking details using dynamic `params.id`.
  - Render live line items, customer details, merchant info, fulfillment status, and payment summary.

### 2. Store Profile & Listing Control (`/stores/[id]` & `/stores/[id]/listing-control`)
- **Files**:
  - [app/(dashboard)/stores/[id]/page.tsx](file:///d:/bai/simulaflyproto/flt/simulafly/Admin-Panel/app/(dashboard)/stores/[id]/page.tsx)
  - [app/(dashboard)/stores/[id]/listing-control/page.tsx](file:///d:/bai/simulaflyproto/flt/simulafly/Admin-Panel/app/(dashboard)/stores/[id]/listing-control/page.tsx)
- **Current Status**: `StoreProfile` is hardcoded; `StoreListingControl` uses local React state for state transitions without persisting to backend.
- **Required Action**:
  - Implement `getStore(id)` in `lib/api/directory.ts`.
  - Connect store status mutations (`Active` ↔ `Hidden` ↔ `Restricted` ↔ `Frozen` ↔ `Delisted`) to `updateStoreStatus()` API.
  - Wire live products, orders, and risk history in the tabbed layout.

### 3. Consumer Support Ticket Detail (`/support/consumer/[id]`)
- **File**: [app/(dashboard)/support/consumer/[id]/page.tsx](file:///d:/bai/simulaflyproto/flt/simulafly/Admin-Panel/app/(dashboard)/support/consumer/[id]/page.tsx)
- **Current Status**: Hardcoded static mock ticket (`Refund not processed for returned item`, static chat history, disabled reply box).
- **Required Action**:
  - Connect page to `getTicket(id)` from `@/lib/api/ops`.
  - Wire the reply form to `respondTicket(id, { body })`.
  - Wire status action button to `updateTicketStatus(id, { status: "resolved" })`.

### 4. Permissions Matrix Persistence (`/settings/permissions`)
- **File**: [app/(dashboard)/settings/permissions/page.tsx](file:///d:/bai/simulaflyproto/flt/simulafly/Admin-Panel/app/(dashboard)/settings/permissions/page.tsx)
- **Current Status**: Module permission grid is interactive in local React state, but clicking "Save Changes" only triggers a visual toast banner.
- **Required Action**:
  - Add `updateRolePermissions(roleId, permissions)` in `@/lib/api/settings.ts`.
  - Wire the Save button to persist role-permission matrix changes to backend `/api/v1/admin/rbac/roles/{id}/permissions`.

### 5. User Attribution Backend & Integration (`/users/attribution`)
- **File**: [app/(dashboard)/users/attribution/page.tsx](file:///d:/bai/simulaflyproto/flt/simulafly/Admin-Panel/app/(dashboard)/users/attribution/page.tsx)
- **Current Status**: Static presentation table with hardcoded channels (Organic Search, Merchant Referrals, etc.).
- **Required Action**:
  - Add backend route `/api/v1/admin/users/attribution` returning real attribution channel metrics (CAC, conversion rates, 90d LTV).
  - Add `getUserAttribution()` helper in `@/lib/api/ops.ts`.
  - Render live metrics in `app/(dashboard)/users/attribution/page.tsx`.

### 6. CSV Export & Bulk Actions Polish
- **Current Status**: CSV export endpoints exist in backend (`app/routers/admin/export.py`), but browser links require auth token headers.
- **Required Action**:
  - Add an authenticated blob download helper in `lib/api/client.ts` to download CSV files via `fetch()` with the `Authorization: Bearer` header.
  - Attach export actions to table header toolbars in Merchants, Users, Products, and Invoices directories.

---

## 🚀 Execution Plan to Reach 100% Completion

1. **Step 1**: Wire `/bookings/[id]` and `/support/consumer/[id]` to their respective `ops.ts` API functions.
2. **Step 3**: Add `getStore(id)` and wire `/stores/[id]` & `/stores/[id]/listing-control` to `directory.ts`.
3. **Step 3**: Implement RBAC persistence API for `/settings/permissions`.
4. **Step 4**: Add backend `/admin/users/attribution` router and wire `/users/attribution`.
5. **Step 5**: Add authenticated CSV download helper for export buttons across all directories.

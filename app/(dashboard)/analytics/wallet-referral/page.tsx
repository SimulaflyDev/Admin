"use client"

import { AnalyticsViewPage } from "@/components/analytics-view"
import { getWalletReferral } from "@/lib/api/ops"

export default function WalletReferralAnalytics() {
  return (
    <AnalyticsViewPage
      title="Wallet & Referral Analytics"
      subtitle="Wallet recharge, spend, and referral-conversion metrics."
      fetcher={getWalletReferral}
    />
  )
}

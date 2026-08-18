"use client"

import { AnalyticsViewPage } from "@/components/analytics-view"
import { getMerchantActivity } from "@/lib/api/ops"

export default function MerchantAnalytics() {
  return (
    <AnalyticsViewPage
      title="Merchant Activity Analytics"
      subtitle="Merchant engagement and activity metrics across the network."
      fetcher={getMerchantActivity}
    />
  )
}

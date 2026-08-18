"use client"

import { AnalyticsViewPage } from "@/components/analytics-view"
import { getUserActivity } from "@/lib/api/ops"

export default function UserAnalytics() {
  return (
    <AnalyticsViewPage
      title="User Activity Analytics"
      subtitle="Consumer engagement, retention, and activity metrics."
      fetcher={getUserActivity}
    />
  )
}

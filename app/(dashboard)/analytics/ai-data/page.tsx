"use client"

import { AnalyticsViewPage } from "@/components/analytics-view"
import { getAiDataUsage } from "@/lib/api/ops"

export default function AiDataAnalytics() {
  return (
    <AnalyticsViewPage
      title="AI & Data Usage Analytics"
      subtitle="AI generation, failure, and data-usage metrics."
      fetcher={getAiDataUsage}
    />
  )
}

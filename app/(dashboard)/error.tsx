"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center">
      <div className="bg-red-50 p-4 rounded-full mb-6 border border-red-100">
        <AlertTriangle className="h-12 w-12 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Something went wrong!</h2>
      <p className="text-slate-500 max-w-md mx-auto mb-8">
        We encountered an unexpected error while trying to load this data. Please try again or contact technical support if the issue persists.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
        <button
          onClick={() => window.history.back()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Go Back
        </button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 text-left bg-slate-50 border border-slate-200 rounded-lg p-4 w-full max-w-2xl overflow-auto">
          <p className="text-sm font-bold text-slate-700 mb-2">Developer Detail:</p>
          <pre className="text-xs text-red-600 font-mono whitespace-pre-wrap">{error.message}</pre>
        </div>
      )}
    </div>
  )
}

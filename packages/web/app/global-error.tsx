'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertCircle, RefreshCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0c10] text-white font-sans antialiased">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-400 mb-6">
              A critical error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
            >
              <RefreshCcw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

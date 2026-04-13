'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TenantError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-status-error/10 mx-auto mb-4">
          <AlertCircle className="h-6 w-6 text-status-error" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">
          An error occurred loading this page. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          <Link href="/">
            <Button variant="ghost">
              <Home className="h-4 w-4 mr-2" />
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

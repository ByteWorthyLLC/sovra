'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { useToast } from '@/lib/toast'
import { useTenant } from '@/lib/tenant/context'

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { tenantId } = useTenant()

  async function handleOpen() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      })

      if (!res.ok) {
        throw new Error('Failed to open portal')
      }

      const { url } = await res.json()
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      toast('error', 'Could not open the customer portal. Try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleOpen}
      disabled={loading}
      className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/20 hover:bg-surface-3/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
      ) : (
        <ExternalLink className="h-4 w-4" />
      )}
      Open customer portal
    </button>
  )
}

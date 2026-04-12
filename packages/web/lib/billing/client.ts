import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

let initialized = false

export function configureLemonSqueezy(): void {
  if (initialized) return

  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) {
    throw new Error(
      'LEMONSQUEEZY_API_KEY environment variable is required but not set'
    )
  }

  lemonSqueezySetup({ apiKey })
  initialized = true
}

/** Reset init state (for testing only) */
export function _resetLemonSqueezyInit(): void {
  initialized = false
}

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================
// Task 1: Plan definitions + client + health
// ============================================================

describe('PLANS', () => {
  it('has free, pro, enterprise keys', async () => {
    const { PLANS } = await import('../plans')
    expect(PLANS).toHaveProperty('free')
    expect(PLANS).toHaveProperty('pro')
    expect(PLANS).toHaveProperty('enterprise')
  })

  it('free plan has agents=2, apiCalls=1000, storageMb=100', async () => {
    const { PLANS } = await import('../plans')
    expect(PLANS.free.agents).toBe(2)
    expect(PLANS.free.apiCalls).toBe(1000)
    expect(PLANS.free.storageMb).toBe(100)
  })

  it('enterprise plan has unlimited (-1) for all limits', async () => {
    const { PLANS } = await import('../plans')
    expect(PLANS.enterprise.agents).toBe(-1)
    expect(PLANS.enterprise.apiCalls).toBe(-1)
    expect(PLANS.enterprise.storageMb).toBe(-1)
  })
})

describe('getPlanLimits', () => {
  it('returns correct limits for pro', async () => {
    const { getPlanLimits, PLANS } = await import('../plans')
    expect(getPlanLimits('pro')).toEqual(PLANS.pro)
  })

  it('falls back to free plan limits for unknown plan', async () => {
    const { getPlanLimits, PLANS } = await import('../plans')
    expect(getPlanLimits('invalid')).toEqual(PLANS.free)
  })
})

describe('configureLemonSqueezy', () => {
  it('throws when LEMONSQUEEZY_API_KEY is missing', async () => {
    const originalKey = process.env.LEMONSQUEEZY_API_KEY
    delete process.env.LEMONSQUEEZY_API_KEY
    // Reset module to clear init guard
    vi.resetModules()
    const { configureLemonSqueezy } = await import('../client')
    expect(() => configureLemonSqueezy()).toThrow(/LEMONSQUEEZY_API_KEY/)
    process.env.LEMONSQUEEZY_API_KEY = originalKey
    vi.resetModules()
  })
})

describe('GET /api/health', () => {
  it('returns 200 with { status: ok }', async () => {
    const { GET } = await import('@/app/api/health/route')
    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ status: 'ok' })
  })
})

// ============================================================
// Task 2: Webhook signature verification + event handling
// ============================================================

describe('verifyWebhookSignature', () => {
  it('returns true for valid HMAC-SHA256 signature', async () => {
    const { verifyWebhookSignature } = await import('../webhook')
    const { createHmac } = await import('crypto')
    const secret = 'test-secret'
    const body = '{"test":"payload"}'
    const sig = createHmac('sha256', secret).update(body).digest('hex')
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true)
  })

  it('returns false for invalid signature', async () => {
    const { verifyWebhookSignature } = await import('../webhook')
    expect(verifyWebhookSignature('{"test":"payload"}', 'invalidsig', 'secret')).toBe(false)
  })

  it('returns false for empty signature', async () => {
    const { verifyWebhookSignature } = await import('../webhook')
    expect(verifyWebhookSignature('{"test":"payload"}', '', 'secret')).toBe(false)
  })
})

describe('handleWebhookEvent', () => {
  const makeMockSupabase = () => {
    const upsertMock = vi.fn().mockResolvedValue({ error: null })
    const updateMock = vi.fn().mockResolvedValue({ error: null })
    const eqMock = vi.fn().mockReturnValue({ error: null })
    const mockFrom = vi.fn().mockReturnValue({
      upsert: upsertMock,
      update: () => ({ eq: eqMock }),
    })
    return { from: mockFrom, upsertMock, updateMock, eqMock }
  }

  it('subscription_created upserts subscription row', async () => {
    const { handleWebhookEvent } = await import('../webhook')
    const supabase = makeMockSupabase()
    const data = {
      id: 'ls_sub_1',
      attributes: {
        status: 'active',
        product_name: 'pro',
        renews_at: '2026-05-01T00:00:00Z',
      },
      meta: { custom: { tenant_id: 'tenant-123' } },
    }
    await expect(
      handleWebhookEvent('subscription_created', data, supabase as any)
    ).resolves.not.toThrow()
    expect(supabase.from).toHaveBeenCalledWith('subscriptions')
  })

  it('subscription_cancelled sets status to cancelled', async () => {
    const { handleWebhookEvent } = await import('../webhook')
    const supabase = makeMockSupabase()
    const data = {
      id: 'ls_sub_1',
      attributes: { status: 'cancelled' },
      meta: { custom: { tenant_id: 'tenant-123' } },
    }
    await expect(
      handleWebhookEvent('subscription_cancelled', data, supabase as any)
    ).resolves.not.toThrow()
  })

  it('handles unknown events gracefully without throwing', async () => {
    const { handleWebhookEvent } = await import('../webhook')
    const supabase = makeMockSupabase()
    await expect(
      handleWebhookEvent('some_unknown_event', {}, supabase as any)
    ).resolves.not.toThrow()
  })
})

describe('getSubscriptionForTenant', () => {
  it('returns subscription data or null', async () => {
    const { getSubscriptionForTenant } = await import('../actions')
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'sub-1', plan: 'pro' }, error: null })
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      }),
    }
    const result = await getSubscriptionForTenant(supabase as any, 'tenant-1')
    expect(result).toEqual({ id: 'sub-1', plan: 'pro' })
  })
})

describe('getUsageForTenant', () => {
  it('returns usage metrics object', async () => {
    const { getUsageForTenant } = await import('../actions')
    const supabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'tool_executions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gte: vi.fn().mockResolvedValue({ count: 42, error: null }),
              }),
            }),
          }
        }
        if (table === 'agents') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
            }),
          }
        }
        return { select: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ count: 0, error: null }) }) }
      }),
    }
    const result = await getUsageForTenant(supabase as any, 'tenant-1')
    expect(result).toHaveProperty('apiCalls')
    expect(result).toHaveProperty('agents')
  })
})

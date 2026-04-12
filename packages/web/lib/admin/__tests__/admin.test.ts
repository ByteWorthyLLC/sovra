import { describe, it, expect, vi, beforeEach } from 'vitest'

// server-only is stubbed via vitest.config.ts alias (__mocks__/server-only.ts)
// so we can import server modules directly in tests

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeAdminSupabase(overrides: Record<string, unknown> = {}) {
  const selectResult = {
    data: overrides.data ?? [],
    count: overrides.count ?? 0,
    error: overrides.error ?? null,
  }

  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue(selectResult),
    single: vi.fn().mockResolvedValue({
      data: overrides.singleData ?? null,
      error: overrides.singleError ?? null,
    }),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  }

  return {
    from: vi.fn().mockReturnValue(chain),
    _chain: chain,
  }
}

// ─── createAdminClient tests ─────────────────────────────────────────────────

describe('createAdminClient', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  })

  it('throws when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    const { createAdminClient } = await import('../service-client')
    expect(() => createAdminClient()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/)
  })

  it('creates client with service role key and auth config', async () => {
    const createClientSpy = vi.fn().mockReturnValue({ from: vi.fn() })
    vi.doMock('@supabase/supabase-js', () => ({ createClient: createClientSpy }))

    const { createAdminClient } = await import('../service-client')
    createAdminClient()

    expect(createClientSpy).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-service-role-key',
      expect.objectContaining({
        auth: expect.objectContaining({
          autoRefreshToken: false,
          persistSession: false,
        }),
      })
    )
  })

  it('disables autoRefreshToken in auth config', async () => {
    const createClientSpy = vi.fn().mockReturnValue({ from: vi.fn() })
    vi.doMock('@supabase/supabase-js', () => ({ createClient: createClientSpy }))

    const { createAdminClient } = await import('../service-client')
    createAdminClient()

    const callArgs = createClientSpy.mock.calls[0]
    expect(callArgs[2].auth.autoRefreshToken).toBe(false)
  })

  it('disables persistSession in auth config', async () => {
    const createClientSpy = vi.fn().mockReturnValue({ from: vi.fn() })
    vi.doMock('@supabase/supabase-js', () => ({ createClient: createClientSpy }))

    const { createAdminClient } = await import('../service-client')
    createAdminClient()

    const callArgs = createClientSpy.mock.calls[0]
    expect(callArgs[2].auth.persistSession).toBe(false)
  })
})

// ─── getAllTenants tests ──────────────────────────────────────────────────────

describe('getAllTenants', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  })

  it('returns array of tenants with data and total', async () => {
    const tenants = [
      { id: '1', name: 'Acme', slug: 'acme', plan: 'pro', created_at: '2026-01-01' },
    ]
    const mockClient = makeAdminSupabase({ data: tenants, count: 1 })
    vi.doMock('../service-client', () => ({ createAdminClient: () => mockClient }))

    const { getAllTenants } = await import('../queries')
    const result = await getAllTenants()

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('total')
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('uses page and pageSize for pagination', async () => {
    const mockClient = makeAdminSupabase({ data: [], count: 0 })
    vi.doMock('../service-client', () => ({ createAdminClient: () => mockClient }))

    const { getAllTenants } = await import('../queries')
    await getAllTenants(2, 10)

    expect(mockClient._chain.range).toHaveBeenCalledWith(10, 19)
  })
})

// ─── getAllUsers tests ────────────────────────────────────────────────────────

describe('getAllUsers', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  })

  it('returns array of users with data and total', async () => {
    const users = [{ id: 'u1', email: 'a@test.com', full_name: 'Alice', created_at: '2026-01-01' }]
    const mockClient = makeAdminSupabase({ data: users, count: 1 })
    vi.doMock('../service-client', () => ({ createAdminClient: () => mockClient }))

    const { getAllUsers } = await import('../queries')
    const result = await getAllUsers()

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('total')
    expect(Array.isArray(result.data)).toBe(true)
  })
})

// ─── getAuditLogs tests ───────────────────────────────────────────────────────

describe('getAuditLogs', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  })

  it('returns paginated audit logs with data and total', async () => {
    const logs = [
      { id: 'log1', action: 'user.login', severity: 'info', created_at: '2026-01-01', actor_id: 'u1' },
    ]
    const mockClient = makeAdminSupabase({ data: logs, count: 1 })
    vi.doMock('../service-client', () => ({ createAdminClient: () => mockClient }))

    const { getAuditLogs } = await import('../queries')
    const result = await getAuditLogs()

    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('total')
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('filters by severity when provided', async () => {
    const mockClient = makeAdminSupabase({ data: [], count: 0 })
    vi.doMock('../service-client', () => ({ createAdminClient: () => mockClient }))

    const { getAuditLogs } = await import('../queries')
    await getAuditLogs(1, 50, 'critical')

    expect(mockClient._chain.eq).toHaveBeenCalledWith('severity', 'critical')
  })

  it('orders by created_at desc', async () => {
    const mockClient = makeAdminSupabase({ data: [], count: 0 })
    vi.doMock('../service-client', () => ({ createAdminClient: () => mockClient }))

    const { getAuditLogs } = await import('../queries')
    await getAuditLogs()

    expect(mockClient._chain.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })
})

// ─── getPlatformStats tests ───────────────────────────────────────────────────

describe('getPlatformStats', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  })

  it('returns platform stats object with expected shape', async () => {
    const selectResult = { data: [], count: 42, error: null }
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue(selectResult),
    }
    const mockClient = { from: vi.fn().mockReturnValue(chain), _chain: chain }
    vi.doMock('../service-client', () => ({ createAdminClient: () => mockClient }))

    const { getPlatformStats } = await import('../queries')
    const stats = await getPlatformStats()

    expect(stats).toHaveProperty('totalTenants')
    expect(stats).toHaveProperty('activeUsers')
    expect(stats).toHaveProperty('totalAgents')
    expect(stats).toHaveProperty('apiCallsToday')
  })
})

import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/auth/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

import { createSupabaseServerClient } from '@/lib/auth/server'
import { readSharedMemory, writeSharedMemory, upsertSharedMemory } from '../shared-memory'

describe('readSharedMemory', () => {
  it('returns all entries for workspace', async () => {
    const entries = [
      { id: 'sm-1', key: 'context', value: { data: 'test' } },
      { id: 'sm-2', key: 'summary', value: { text: 'summary' } },
    ]
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: entries, error: null }),
          }),
        }),
      }),
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never)

    const result = await readSharedMemory('ws-1')

    expect(supabase.from).toHaveBeenCalledWith('shared_memory')
    expect(result.data).toEqual(entries)
    expect(result.error).toBeNull()
  })
})

describe('writeSharedMemory', () => {
  it('inserts new entry', async () => {
    const supabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'workspaces') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'ws-1', tenant_id: 'tenant-1' },
                  error: null,
                }),
              }),
            }),
          }
        }
        return {
          insert: vi.fn().mockResolvedValue({ data: { id: 'sm-1' }, error: null }),
        }
      }),
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never)

    const result = await writeSharedMemory('ws-1', 'context', { data: 'test' })

    expect(supabase.from).toHaveBeenCalledWith('shared_memory')
    expect(result.error).toBeNull()
  })

  it('throws error when value exceeds 64KB', async () => {
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'ws-1', tenant_id: 'tenant-1' },
          error: null,
        }),
      }),
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never)

    // Create a value that exceeds 64KB
    const largeValue = { data: 'x'.repeat(65537) }

    const result = await writeSharedMemory('ws-1', 'big-key', largeValue)

    expect(result.error).toContain('64KB')
  })
})

describe('upsertSharedMemory', () => {
  it('uses ON CONFLICT UPDATE for existing key', async () => {
    const upsertFn = vi.fn().mockResolvedValue({ data: { id: 'sm-1' }, error: null })
    const supabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'workspaces') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: 'ws-1', tenant_id: 'tenant-1' },
                  error: null,
                }),
              }),
            }),
          }
        }
        return { upsert: upsertFn }
      }),
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never)

    const result = await upsertSharedMemory('ws-1', 'context', { data: 'updated' })

    expect(upsertFn).toHaveBeenCalled()
    const upsertCall = upsertFn.mock.calls[0]
    expect(upsertCall[1]).toMatchObject({ onConflict: 'workspace_id,key' })
    expect(result.error).toBeNull()
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/cache
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

// Mock auth/server
vi.mock('@/lib/auth/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

// Mock rbac/checker
vi.mock('@/lib/rbac/checker', () => ({
  hasPermission: vi.fn().mockResolvedValue(true),
}))

import { createSupabaseServerClient } from '@/lib/auth/server'
import {
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addAgentToWorkspace,
  removeAgentFromWorkspace,
} from '../actions'

function makeInsertSelectSingleChain(data: unknown) {
  const singleFn = vi.fn().mockResolvedValue({ data, error: null })
  const selectFn = vi.fn().mockReturnValue({ single: singleFn })
  const insertFn = vi.fn().mockReturnValue({ select: selectFn })
  return { insert: insertFn, _single: singleFn, _select: selectFn }
}

const defaultWorkspace = { id: 'ws-1', tenant_id: 'tenant-1', name: 'Test' }

describe('createWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls supabase insert on workspaces table and returns workspace', async () => {
    const chain = makeInsertSelectSingleChain(defaultWorkspace)
    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockReturnValue(chain),
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never)

    const result = await createWorkspace('tenant-1', {
      name: 'Test Workspace',
      collaboration_mode: 'round_robin',
      memory_strategy: 'conversation',
      conflict_resolution: 'vote',
      compression_enabled: true,
      compression_threshold: 80,
      agent_ids: [],
    })

    expect(supabase.from).toHaveBeenCalledWith('workspaces')
    expect(result.error).toBeNull()
  })

  it('inserts workspace_agents records for provided agent_ids', async () => {
    const workspaceChain = makeInsertSelectSingleChain(defaultWorkspace)
    const agentInsertFn = vi.fn().mockResolvedValue({ data: null, error: null })

    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'workspaces') return workspaceChain
        if (table === 'workspace_agents') return { insert: agentInsertFn }
        return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) }
      }),
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never)

    await createWorkspace('tenant-1', {
      name: 'Test',
      collaboration_mode: 'round_robin',
      memory_strategy: 'conversation',
      conflict_resolution: 'vote',
      compression_enabled: true,
      compression_threshold: 80,
      agent_ids: ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'],
    })

    expect(supabase.from).toHaveBeenCalledWith('workspace_agents')
    expect(agentInsertFn).toHaveBeenCalled()
  })
})

describe('updateWorkspace', () => {
  it('calls supabase update with correct fields', async () => {
    const singleFn = vi.fn().mockResolvedValue({ data: { id: 'ws-1', name: 'Updated' }, error: null })
    const selectFn = vi.fn().mockReturnValue({ single: singleFn })
    const eq2Fn = vi.fn().mockReturnValue({ select: selectFn })
    const eqFn = vi.fn().mockReturnValue({ eq: eq2Fn })
    const updateFn = vi.fn().mockReturnValue({ eq: eqFn })

    // Mock for workspace lookup (tenant_id) and tenant_users membership check
    const wsSingle = vi.fn().mockResolvedValue({ data: { tenant_id: 'tenant-1' }, error: null })
    const wsEq = vi.fn().mockReturnValue({ single: wsSingle })
    const wsSelect = vi.fn().mockReturnValue({ eq: wsEq })
    const memSingle = vi.fn().mockResolvedValue({ data: { id: 'tu-1' }, error: null })
    const memEq2 = vi.fn().mockReturnValue({ single: memSingle })
    const memEq1 = vi.fn().mockReturnValue({ eq: memEq2 })
    const memSelect = vi.fn().mockReturnValue({ eq: memEq1 })

    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'tenant_users') return { select: memSelect }
        // First call to workspaces = lookup, second = update
        return { select: wsSelect, update: updateFn }
      }),
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never)

    await updateWorkspace('ws-1', { name: 'Updated' })

    expect(supabase.from).toHaveBeenCalledWith('workspaces')
    expect(updateFn).toHaveBeenCalled()
  })
})

describe('deleteWorkspace', () => {
  it('calls supabase delete', async () => {
    const deleteEq2 = vi.fn().mockResolvedValue({ error: null })
    const deleteEq1 = vi.fn().mockReturnValue({ eq: deleteEq2 })
    const deleteFn = vi.fn().mockReturnValue({ eq: deleteEq1 })

    const wsSingle = vi.fn().mockResolvedValue({ data: { tenant_id: 'tenant-1' }, error: null })
    const wsEq = vi.fn().mockReturnValue({ single: wsSingle })
    const wsSelect = vi.fn().mockReturnValue({ eq: wsEq })
    const memSingle = vi.fn().mockResolvedValue({ data: { id: 'tu-1' }, error: null })
    const memEq2 = vi.fn().mockReturnValue({ single: memSingle })
    const memEq1 = vi.fn().mockReturnValue({ eq: memEq2 })
    const memSelect = vi.fn().mockReturnValue({ eq: memEq1 })

    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'tenant_users') return { select: memSelect }
        return { select: wsSelect, delete: deleteFn }
      }),
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never)

    const result = await deleteWorkspace('ws-1')

    expect(supabase.from).toHaveBeenCalledWith('workspaces')
    expect(deleteFn).toHaveBeenCalled()
    expect(result.error).toBeNull()
  })
})

describe('addAgentToWorkspace', () => {
  it('inserts into workspace_agents', async () => {
    const singleFn = vi.fn().mockResolvedValue({ data: { id: 'ws-1', tenant_id: 'tenant-1' }, error: null })
    const eqFn = vi.fn().mockReturnValue({ single: singleFn })
    const selectFn = vi.fn().mockReturnValue({ eq: eqFn })
    const agentInsertFn = vi.fn().mockResolvedValue({ data: { id: 'wa-1' }, error: null })
    const memSingle = vi.fn().mockResolvedValue({ data: { id: 'tu-1' }, error: null })
    const memEq2 = vi.fn().mockReturnValue({ single: memSingle })
    const memEq1 = vi.fn().mockReturnValue({ eq: memEq2 })
    const memSelect = vi.fn().mockReturnValue({ eq: memEq1 })

    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'tenant_users') return { select: memSelect }
        if (table === 'workspaces') return { select: selectFn }
        return { insert: agentInsertFn }
      }),
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never)

    const result = await addAgentToWorkspace('ws-1', 'agent-1')

    expect(supabase.from).toHaveBeenCalledWith('workspace_agents')
    expect(result.error).toBeNull()
  })
})

describe('removeAgentFromWorkspace', () => {
  it('deletes from workspace_agents', async () => {
    const eq2Fn = vi.fn().mockResolvedValue({ error: null })
    const eq1Fn = vi.fn().mockReturnValue({ eq: eq2Fn })
    const deleteFn = vi.fn().mockReturnValue({ eq: eq1Fn })

    const wsSingle = vi.fn().mockResolvedValue({ data: { tenant_id: 'tenant-1' }, error: null })
    const wsEq = vi.fn().mockReturnValue({ single: wsSingle })
    const wsSelect = vi.fn().mockReturnValue({ eq: wsEq })
    const memSingle = vi.fn().mockResolvedValue({ data: { id: 'tu-1' }, error: null })
    const memEq2 = vi.fn().mockReturnValue({ single: memSingle })
    const memEq1 = vi.fn().mockReturnValue({ eq: memEq2 })
    const memSelect = vi.fn().mockReturnValue({ eq: memEq1 })

    const supabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) },
      from: vi.fn().mockImplementation((table: string) => {
        if (table === 'tenant_users') return { select: memSelect }
        if (table === 'workspaces') return { select: wsSelect }
        return { delete: deleteFn }
      }),
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never)

    const result = await removeAgentFromWorkspace('ws-1', 'agent-1')

    expect(supabase.from).toHaveBeenCalledWith('workspace_agents')
    expect(deleteFn).toHaveBeenCalled()
    expect(result.error).toBeNull()
  })
})

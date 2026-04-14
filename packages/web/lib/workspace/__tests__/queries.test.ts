import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/auth/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

import { createSupabaseServerClient } from '@/lib/auth/server'
import { getWorkspaces, getWorkspaceById, getWorkspaceAgents } from '../queries'

describe('getWorkspaces', () => {
  it('returns array of workspaces for tenant', async () => {
    const workspaces = [
      { id: 'ws-1', name: 'Workspace 1' },
      { id: 'ws-2', name: 'Workspace 2' },
    ]
    const orderFn = vi.fn().mockResolvedValue({ data: workspaces, error: null })
    const selectFn = vi.fn().mockReturnValue({ order: orderFn })
    const supabase = {
      from: vi.fn().mockReturnValue({ select: selectFn }),
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never)

    const result = await getWorkspaces()

    expect(supabase.from).toHaveBeenCalledWith('workspaces')
    expect(result.data).toEqual(workspaces)
    expect(result.error).toBeNull()
  })
})

describe('getWorkspaceById', () => {
  it('returns workspace with agents joined', async () => {
    const workspace = {
      id: 'ws-1',
      name: 'Workspace 1',
      workspace_agents: [{ id: 'wa-1', agent_id: 'agent-1' }],
    }
    const singleFn = vi.fn().mockResolvedValue({ data: workspace, error: null })
    const eqFn = vi.fn().mockReturnValue({ single: singleFn })
    const selectFn = vi.fn().mockReturnValue({ eq: eqFn })
    const supabase = {
      from: vi.fn().mockReturnValue({ select: selectFn }),
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never)

    const result = await getWorkspaceById('ws-1')

    expect(supabase.from).toHaveBeenCalledWith('workspaces')
    expect(result.data).toEqual(workspace)
    expect(result.error).toBeNull()
  })
})

describe('getWorkspaceAgents', () => {
  it('returns agents for workspace', async () => {
    const agents = [
      { id: 'wa-1', agent_id: 'agent-1', position: 0 },
      { id: 'wa-2', agent_id: 'agent-2', position: 1 },
    ]
    const orderFn = vi.fn().mockResolvedValue({ data: agents, error: null })
    const eqFn = vi.fn().mockReturnValue({ order: orderFn })
    const selectFn = vi.fn().mockReturnValue({ eq: eqFn })
    const supabase = {
      from: vi.fn().mockReturnValue({ select: selectFn }),
    }
    vi.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never)

    const result = await getWorkspaceAgents('ws-1')

    expect(supabase.from).toHaveBeenCalledWith('workspace_agents')
    expect(result.data).toEqual(agents)
    expect(result.error).toBeNull()
  })
})

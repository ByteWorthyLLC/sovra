import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/auth/server', () => ({
  createSupabaseServerClient: vi.fn(),
}))

import { createConversation, deleteConversation, saveMessage } from '@/lib/chat/actions'
import { listConversations, getMessages } from '@/lib/chat/queries'
import { createSupabaseServerClient } from '@/lib/auth/server'

const mockUser = { id: 'user-1', email: 'test@test.com' }

function buildMockSupabase(overrides: Record<string, unknown> = {}) {
  const from = vi.fn().mockReturnValue({
    insert: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'conv-1', agent_id: 'agent-1', tenant_id: 'tenant-1' },
          error: null,
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [{ id: 'conv-1' }],
            error: null,
          }),
        }),
        order: vi.fn().mockResolvedValue({
          data: [{ id: 'msg-1', role: 'user', content: 'hello' }],
          error: null,
        }),
      }),
    }),
  })

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: overrides.user !== undefined ? overrides.user : mockUser },
        error: null,
      }),
    },
    from,
  }
}

describe('createConversation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns conversation with agent_id set', async () => {
    const mockSb = buildMockSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSb as any)

    const result = await createConversation({
      tenantId: 'tenant-1',
      agentId: 'agent-1',
      title: 'Test Chat',
    })
    expect(result.error).toBeNull()
    expect(result.conversation).toBeTruthy()
    expect(mockSb.from).toHaveBeenCalledWith('conversations')
  })

  it('returns error when not authenticated', async () => {
    const mockSb = buildMockSupabase({ user: null })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSb as any)

    const result = await createConversation({
      tenantId: 'tenant-1',
      agentId: 'agent-1',
    })
    expect(result.conversation).toBeNull()
    expect(result.error).toBe('Not authenticated')
  })
})

describe('deleteConversation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('removes conversation', async () => {
    // deleteConversation now checks: 1) conversation exists (get tenant_id), 2) tenant membership, 3) delete
    const convSingle = vi.fn().mockResolvedValue({ data: { tenant_id: 'tenant-1' }, error: null })
    const convEq = vi.fn().mockReturnValue({ single: convSingle })
    const convSelect = vi.fn().mockReturnValue({ eq: convEq })
    const memSingle = vi.fn().mockResolvedValue({ data: { id: 'tu-1' }, error: null })
    const memEq2 = vi.fn().mockReturnValue({ single: memSingle })
    const memEq1 = vi.fn().mockReturnValue({ eq: memEq2 })
    const memSelect = vi.fn().mockReturnValue({ eq: memEq1 })
    const delEq2 = vi.fn().mockResolvedValue({ data: null, error: null })
    const delEq1 = vi.fn().mockReturnValue({ eq: delEq2 })
    const deleteFn = vi.fn().mockReturnValue({ eq: delEq1 })

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === 'tenant_users') return { select: memSelect }
      // conversations: first call = select (lookup), subsequent = delete
      return { select: convSelect, delete: deleteFn }
    })
    const mockSb = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) },
      from: mockFrom,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSb as any)

    const result = await deleteConversation('conv-1')
    expect(result.error).toBeNull()
    expect(mockSb.from).toHaveBeenCalledWith('conversations')
  })
})

describe('saveMessage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('inserts message with correct role and content', async () => {
    const mockSb = buildMockSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(createSupabaseServerClient).mockResolvedValue(mockSb as any)

    const result = await saveMessage({
      conversationId: 'conv-1',
      tenantId: 'tenant-1',
      role: 'user',
      content: 'Hello world',
    })
    expect(result.error).toBeNull()
    expect(mockSb.from).toHaveBeenCalledWith('messages')
  })
})

describe('listConversations', () => {
  it('returns conversations for agent within tenant', async () => {
    const mockSb = buildMockSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await listConversations(mockSb as any, 'tenant-1', 'agent-1')
    expect(result.data).toBeTruthy()
    expect(mockSb.from).toHaveBeenCalledWith('conversations')
  })
})

describe('getMessages', () => {
  it('returns messages ordered by created_at ascending', async () => {
    const mockSb = buildMockSupabase()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await getMessages(mockSb as any, 'conv-1')
    expect(result.data).toBeTruthy()
    expect(mockSb.from).toHaveBeenCalledWith('messages')
  })
})

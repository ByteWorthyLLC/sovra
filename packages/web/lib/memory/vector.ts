import { hybridSearch } from '@/lib/vector/search'
import { embedText } from '@/lib/vector/embed'
import type { CoreMessage, MemoryBuildParams } from './types'

const VECTOR_KEEP_RECENT = 4

export async function buildVectorMemory(params: MemoryBuildParams): Promise<CoreMessage[]> {
  const { supabase, conversationId, tenantId, systemPrompt, currentPrompt } = params

  // Generate real embedding for the current prompt for semantic search.
  // Falls back to text-only search if embedding fails (e.g. no OpenAI key).
  let queryEmbedding: number[]
  try {
    queryEmbedding = await embedText(currentPrompt)
  } catch {
    queryEmbedding = []
  }

  const [searchResults, messagesResult] = await Promise.all([
    queryEmbedding.length > 0
      ? hybridSearch(supabase, {
          embedding: queryEmbedding,
          queryText: currentPrompt,
          tenantId,
          limit: 5,
        })
      : Promise.resolve([]),
    supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true }),
  ])

  if (messagesResult.error) {
    throw new Error(`Failed to fetch messages for vector memory: ${messagesResult.error.message}`)
  }

  const result: CoreMessage[] = []

  if (systemPrompt) {
    result.push({ role: 'system', content: systemPrompt })
  }

  for (const item of searchResults) {
    result.push({
      role: 'system',
      content: `Relevant context: ${item.content}`,
    })
  }

  const allMessages: CoreMessage[] = ((messagesResult.data ?? []) as Array<{ role: string; content: string }>).map(
    (row) => ({
      role: row.role as CoreMessage['role'],
      content: row.content,
    })
  )

  const recentMessages = allMessages.slice(-VECTOR_KEEP_RECENT)
  result.push(...recentMessages)

  return result
}

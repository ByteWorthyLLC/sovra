import type { SupabaseClient } from '@supabase/supabase-js'

export type SearchResult = {
  id: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
}

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

interface SemanticSearchParams {
  embedding: number[]
  tenantId: string
  limit?: number
}

interface HybridSearchParams {
  embedding: number[]
  queryText: string
  tenantId: string
  limit?: number
}

export async function semanticSearch(
  supabase: SupabaseClient,
  params: SemanticSearchParams
): Promise<SearchResult[]> {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: JSON.stringify(params.embedding),
    filter_tenant_id: params.tenantId,
    match_count: limit,
  })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as SearchResult[]
}

export async function hybridSearch(
  supabase: SupabaseClient,
  params: HybridSearchParams
): Promise<SearchResult[]> {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)

  const { data, error } = await supabase.rpc('hybrid_search_documents', {
    query_embedding: JSON.stringify(params.embedding),
    query_text: params.queryText,
    filter_tenant_id: params.tenantId,
    match_count: limit,
  })

  if (error) {
    throw new Error(error.message)
  }

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: row.id as string,
    content: row.content as string,
    metadata: row.metadata as Record<string, unknown>,
    similarity: (row.similarity ?? row.score) as number,
  }))
}

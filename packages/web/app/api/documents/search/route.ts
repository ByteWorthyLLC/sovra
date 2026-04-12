import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSupabaseServerClient } from '@/lib/auth/server'
import { embedText } from '@/lib/vector/embed'
import { semanticSearch, hybridSearch } from '@/lib/vector/search'

const searchRequestSchema = z.object({
  query: z.string().min(1, 'Query is required').max(10000, 'Query exceeds 10000 character limit'),
  limit: z.number().int().min(1).max(50).optional().default(10),
  mode: z.enum(['semantic', 'hybrid']).optional().default('hybrid'),
})

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = searchRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { query, limit, mode } = parsed.data

  // Resolve tenant_id from user's tenant membership
  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!tenantUser) {
    return NextResponse.json({ error: 'No tenant found for user' }, { status: 403 })
  }

  let embedding: number[]
  try {
    embedding = await embedText(query)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Embedding failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  try {
    const results =
      mode === 'semantic'
        ? await semanticSearch(supabase, {
            embedding,
            tenantId: tenantUser.tenant_id,
            limit,
          })
        : await hybridSearch(supabase, {
            embedding,
            queryText: query,
            tenantId: tenantUser.tenant_id,
            limit,
          })

    return NextResponse.json({ results })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

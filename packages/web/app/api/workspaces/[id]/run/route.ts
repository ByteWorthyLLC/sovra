import { createSupabaseServerClient } from '@/lib/auth/server'
import { runWorkspace } from '@/lib/workspace/orchestrator'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return new Response('Unauthorized', { status: 401 })

  const { id } = await params

  // Verify user is a member of the workspace's tenant
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('tenant_id')
    .eq('id', id)
    .single()

  if (!workspace) {
    return new Response(JSON.stringify({ error: 'Workspace not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
  }

  const { data: membership } = await supabase
    .from('tenant_users')
    .select('id')
    .eq('user_id', user.id)
    .eq('tenant_id', workspace.tenant_id)
    .single()

  if (!membership) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { prompt } = body as Record<string, unknown>

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: 'prompt is required and must be a non-empty string' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const result = await runWorkspace(id, prompt.trim())
    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Orchestration failed'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

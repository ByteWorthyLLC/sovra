import { createSupabaseServerClient } from '@/lib/auth/server'

export async function getWorkspaces() {
  const supabase = await createSupabaseServerClient()
  return supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false })
}

export async function getWorkspaceById(id: string) {
  const supabase = await createSupabaseServerClient()
  return supabase
    .from('workspaces')
    .select('*, workspace_agents(*, agents(*))')
    .eq('id', id)
    .single()
}

export async function getWorkspaceAgents(workspaceId: string) {
  const supabase = await createSupabaseServerClient()
  return supabase
    .from('workspace_agents')
    .select('*, agents(*)')
    .eq('workspace_id', workspaceId)
    .order('position', { ascending: true })
}

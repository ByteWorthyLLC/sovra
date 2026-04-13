'use server'

import { createSupabaseServerClient } from '@/lib/auth/server'
import { createAdminClient } from './service-client'

interface AdminActionResult {
  error: string | null
}

async function requirePlatformAdmin(): Promise<{ userId: string } | AdminActionResult> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()
  const { data: userRow } = await adminClient
    .from('users')
    .select('is_platform_admin')
    .eq('id', user.id)
    .single()

  if (!userRow?.is_platform_admin) return { error: 'Forbidden' }
  return { userId: user.id }
}

export async function suspendTenant(tenantId: string): Promise<AdminActionResult> {
  const auth = await requirePlatformAdmin()
  if ('error' in auth && auth.error) return auth as AdminActionResult

  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('tenants')
    .update({ status: 'suspended' })
    .eq('id', tenantId)

  if (error) return { error: error.message }

  await adminClient.from('audit_logs').insert({
    tenant_id: tenantId,
    actor_id: (auth as { userId: string }).userId,
    action: 'tenant.suspended',
    resource_type: 'tenant',
    resource_id: tenantId,
  })

  return { error: null }
}

export async function deleteTenant(tenantId: string): Promise<AdminActionResult> {
  const auth = await requirePlatformAdmin()
  if ('error' in auth && auth.error) return auth as AdminActionResult

  const adminClient = createAdminClient()

  await adminClient.from('audit_logs').insert({
    tenant_id: tenantId,
    actor_id: (auth as { userId: string }).userId,
    action: 'tenant.deleted',
    resource_type: 'tenant',
    resource_id: tenantId,
  })

  const { error } = await adminClient
    .from('tenants')
    .delete()
    .eq('id', tenantId)

  if (error) return { error: error.message }

  return { error: null }
}

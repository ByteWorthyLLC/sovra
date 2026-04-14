import { createAdminClient } from './service-client'

export interface AdminTenant {
  id: string
  name: string
  slug: string
  plan: string
  created_at: string
  updated_at?: string
  status?: string
  user_count?: number
  agent_count?: number
}

export interface AdminUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  is_platform_admin?: boolean
  tenant_associations?: Array<{ tenant_id: string; tenant_name: string; role: string }>
}

export interface AuditLog {
  id: string
  tenant_id?: string
  action: string
  user_id?: string
  metadata?: Record<string, unknown>
  severity: 'info' | 'warning' | 'critical'
  created_at: string
}

export interface PlatformStats {
  totalTenants: number
  activeUsers: number
  totalAgents: number
  apiCallsToday: number
}

export async function getAllTenants(
  page = 1,
  pageSize = 20
): Promise<{ data: AdminTenant[]; total: number }> {
  const client = createAdminClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await client
    .from('tenants')
    .select('id, name, slug, plan, created_at, updated_at, status', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(`Failed to fetch tenants: ${error.message}`)

  return { data: (data ?? []) as AdminTenant[], total: count ?? 0 }
}

export async function getAllUsers(
  page = 1,
  pageSize = 20
): Promise<{ data: AdminUser[]; total: number }> {
  const client = createAdminClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await client
    .from('users')
    .select('id, email, full_name, avatar_url, created_at, is_platform_admin', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(`Failed to fetch users: ${error.message}`)

  return { data: (data ?? []) as AdminUser[], total: count ?? 0 }
}

export async function getAuditLogs(
  page = 1,
  pageSize = 50,
  severity?: string
): Promise<{ data: AuditLog[]; total: number }> {
  const client = createAdminClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = client
    .from('audit_logs')
    .select('id, tenant_id, action, user_id, metadata, severity, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (severity) {
    query = query.eq('severity', severity)
  }

  const { data, count, error } = await query.range(from, to)

  if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`)

  return { data: (data ?? []) as AuditLog[], total: count ?? 0 }
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const client = createAdminClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [tenantsResult, usersResult, agentsResult, apiCallsResult] = await Promise.all([
    client.from('tenants').select('id', { count: 'exact' }).range(0, 0),
    client.from('users').select('id', { count: 'exact' }).gte('updated_at', sevenDaysAgo).range(0, 0),
    client.from('agents').select('id', { count: 'exact' }).range(0, 0),
    client.from('tool_executions').select('id', { count: 'exact' }).gte('created_at', todayStart.toISOString()).range(0, 0),
  ])

  return {
    totalTenants: tenantsResult.count ?? 0,
    activeUsers: usersResult.count ?? 0,
    totalAgents: agentsResult.count ?? 0,
    apiCallsToday: apiCallsResult.count ?? 0,
  }
}

export async function suspendTenant(tenantId: string): Promise<void> {
  const client = createAdminClient()

  const { error } = await client
    .from('tenants')
    .update({ status: 'suspended', updated_at: new Date().toISOString() })
    .eq('id', tenantId)

  if (error) throw new Error(`Failed to suspend tenant: ${error.message}`)

  await client.from('audit_logs').insert({
    action: 'tenant.suspended',
    metadata: { tenant_id: tenantId },
    severity: 'warning',
    created_at: new Date().toISOString(),
  })
}

export async function deleteTenant(tenantId: string): Promise<void> {
  const client = createAdminClient()

  await client.from('audit_logs').insert({
    action: 'tenant.deleted',
    metadata: { tenant_id: tenantId },
    severity: 'critical',
    created_at: new Date().toISOString(),
  })

  const { error } = await client
    .from('tenants')
    .delete()
    .eq('id', tenantId)

  if (error) throw new Error(`Failed to delete tenant: ${error.message}`)
}

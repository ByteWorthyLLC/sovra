export interface Tenant {
  id: string
  slug: string
  name: string
  plan: string
  settings: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface TenantUser {
  id: string
  tenantId: string
  userId: string
  role: string
  roleId: string | null
  createdAt: string
}

export interface TenantResolver {
  resolve(request: { url: string; headers: { get(name: string): string | null } }): string | null
}

export type TenantResolutionStrategy = 'path' | 'subdomain' | 'header'

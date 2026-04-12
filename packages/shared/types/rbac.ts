export interface Role {
  id: string
  tenantId: string
  name: string
  description: string | null
  isDefault: boolean
  createdAt: string
}

export interface Permission {
  id: string
  action: string
  description: string | null
  resource: string
  createdAt: string
}

export type PermissionAction =
  | 'agent:create' | 'agent:read' | 'agent:update' | 'agent:delete'
  | 'workspace:create' | 'workspace:read' | 'workspace:update' | 'workspace:delete' | 'workspace:manage'
  | 'tenant:manage' | 'tenant:invite'
  | 'billing:read' | 'billing:manage'
  | 'member:read' | 'member:manage'

export interface RolePermission {
  roleId: string
  permissionId: string
}

export type InviteType = 'email' | 'link'
export type InviteStatus = 'pending' | 'accepted' | 'expired'

export interface Invitation {
  id: string
  tenantId: string
  email: string | null
  roleId: string
  token: string
  inviteType: InviteType
  status: InviteStatus
  maxUses: number | null
  useCount: number
  expiresAt: string
  createdBy: string | null
  createdAt: string
}

export interface PermissionChecker {
  hasPermission(userId: string, tenantId: string, action: string): Promise<boolean>
}

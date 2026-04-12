import type { TenantResolver } from '@byteswarm/shared'

export class HeaderTenantResolver implements TenantResolver {
  resolve(request: { url: string; headers: { get(name: string): string | null } }): string | null {
    return request.headers.get('x-tenant-slug') ?? request.headers.get('x-tenant-id') ?? null
  }
}

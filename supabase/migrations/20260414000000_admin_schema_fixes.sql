-- Add missing columns for admin panel functionality

-- tenants.status: enables suspend/activate workflow
alter table tenants
  add column if not exists status text not null default 'active'
  check (status in ('active', 'suspended'));

-- audit_logs.severity: enables filtering by severity in admin audit view
alter table audit_logs
  add column if not exists severity text not null default 'info'
  check (severity in ('info', 'warning', 'critical'));

-- audit_logs: make resource nullable (admin actions like tenant.suspended don't have a resource)
alter table audit_logs
  alter column resource drop not null;

-- audit_logs: make tenant_id nullable (platform-level audit events have no tenant)
alter table audit_logs
  alter column tenant_id drop not null;

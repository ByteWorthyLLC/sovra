-- ============================================================
-- Phase 2 Plan 2: RBAC + Invitations Schema
-- Creates: roles, permissions, role_permissions, invitations tables
-- Adds: role_id column to tenant_users
-- Seeds: 15 default permissions
-- Provides: seed_tenant_roles() function for tenant creation
-- ============================================================

-- ==========================
-- Table: roles (tenant-scoped)
-- ==========================

create table roles (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  name        text not null,
  description text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  unique(tenant_id, name)
);

-- ==========================
-- Table: permissions (global, not tenant-scoped)
-- ==========================

create table permissions (
  id          uuid primary key default gen_random_uuid(),
  action      text not null unique,
  description text,
  resource    text not null,
  created_at  timestamptz not null default now()
);

-- ==========================
-- Table: role_permissions (junction)
-- ==========================

create table role_permissions (
  role_id       uuid not null references roles(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- ==========================
-- Table: invitations
-- ==========================

create table invitations (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  email       text,
  role_id     uuid not null references roles(id) on delete cascade,
  token       text unique not null,
  invite_type text not null check (invite_type in ('email', 'link')),
  status      text not null default 'pending' check (status in ('pending', 'accepted', 'expired')),
  max_uses    integer,
  use_count   integer not null default 0,
  expires_at  timestamptz not null,
  created_by  uuid references users(id),
  created_at  timestamptz not null default now()
);

-- ==========================
-- Add role_id to tenant_users (backward-compatible: keeps text role column)
-- role_id will be the preferred reference once seed_tenant_roles is called
-- ==========================

alter table tenant_users add column role_id uuid references roles(id);

-- ==========================
-- Indexes
-- ==========================

create index idx_roles_tenant on roles(tenant_id);
create index idx_invitations_token on invitations(token);
create index idx_invitations_tenant on invitations(tenant_id);
create index idx_invitations_email on invitations(email) where email is not null;
create index idx_tenant_users_role_id on tenant_users(role_id) where role_id is not null;

-- ==========================
-- RLS: enable on all new tables
-- ==========================

alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table invitations enable row level security;

-- roles: tenant members can read their tenant's roles
create policy "Tenant members can read roles" on roles
  for select using (tenant_id = get_current_tenant_id());

-- roles: tenant members can manage roles (app-level RBAC enforces owner/admin restriction)
create policy "Tenant members can manage roles" on roles
  for all using (tenant_id = get_current_tenant_id());

-- permissions: global table, readable by all authenticated users
create policy "Authenticated users can read permissions" on permissions
  for select using (auth.uid() is not null);

-- role_permissions: readable by tenant members (joined through roles)
create policy "Tenant members can read role_permissions" on role_permissions
  for select using (
    exists (select 1 from roles where roles.id = role_permissions.role_id and roles.tenant_id = get_current_tenant_id())
  );

create policy "Tenant members can manage role_permissions" on role_permissions
  for all using (
    exists (select 1 from roles where roles.id = role_permissions.role_id and roles.tenant_id = get_current_tenant_id())
  );

-- invitations: tenant members can read and manage their tenant's invitations
create policy "Tenant members can read invitations" on invitations
  for select using (tenant_id = get_current_tenant_id());

create policy "Tenant members can manage invitations" on invitations
  for all using (tenant_id = get_current_tenant_id());

-- invitations: anyone with a valid token can read their specific invitation (for acceptance flow)
create policy "Anyone can read invitation by token" on invitations
  for select using (true);

-- ==========================
-- Seed: default permissions (15 global permissions)
-- ==========================

insert into permissions (action, description, resource) values
  ('agent:create',     'Create new agents',              'agent'),
  ('agent:read',       'View agents',                    'agent'),
  ('agent:update',     'Edit agents',                    'agent'),
  ('agent:delete',     'Delete agents',                  'agent'),
  ('workspace:create', 'Create workspaces',              'workspace'),
  ('workspace:read',   'View workspaces',                'workspace'),
  ('workspace:update', 'Edit workspaces',                'workspace'),
  ('workspace:delete', 'Delete workspaces',              'workspace'),
  ('workspace:manage', 'Manage workspace settings',      'workspace'),
  ('tenant:manage',    'Manage tenant settings',         'tenant'),
  ('tenant:invite',    'Invite users to tenant',         'tenant'),
  ('billing:read',     'View billing information',       'billing'),
  ('billing:manage',   'Manage billing and plans',       'billing'),
  ('member:read',      'View team members',              'member'),
  ('member:manage',    'Manage team members and roles',  'member');

-- ==========================
-- Function: seed_tenant_roles(p_tenant_id)
-- Called by tenant creation logic to provision 4 default roles with permissions
-- ==========================

create or replace function seed_tenant_roles(p_tenant_id uuid)
returns void language plpgsql security definer as $$
declare
  v_owner_role_id  uuid;
  v_admin_role_id  uuid;
  v_member_role_id uuid;
  v_viewer_role_id uuid;
begin
  insert into roles (tenant_id, name, description, is_default) values
    (p_tenant_id, 'owner',  'Full access to all resources',       true) returning id into v_owner_role_id;
  insert into roles (tenant_id, name, description, is_default) values
    (p_tenant_id, 'admin',  'Administrative access',              true) returning id into v_admin_role_id;
  insert into roles (tenant_id, name, description, is_default) values
    (p_tenant_id, 'member', 'Standard team member access',        true) returning id into v_member_role_id;
  insert into roles (tenant_id, name, description, is_default) values
    (p_tenant_id, 'viewer', 'Read-only access',                   true) returning id into v_viewer_role_id;

  -- Owner gets all permissions
  insert into role_permissions (role_id, permission_id)
    select v_owner_role_id, id from permissions;

  -- Admin gets all except billing:manage and tenant:manage
  insert into role_permissions (role_id, permission_id)
    select v_admin_role_id, id from permissions
    where action not in ('billing:manage', 'tenant:manage');

  -- Member: create/read/update on agents and workspaces, plus member:read
  insert into role_permissions (role_id, permission_id)
    select v_member_role_id, id from permissions
    where action in (
      'agent:create', 'agent:read', 'agent:update',
      'workspace:create', 'workspace:read', 'workspace:update',
      'member:read'
    );

  -- Viewer: read-only
  insert into role_permissions (role_id, permission_id)
    select v_viewer_role_id, id from permissions
    where action in ('agent:read', 'workspace:read', 'member:read');
end;
$$;

-- Client portal foundation: clients, contacts, projects, user_profiles, portal invites.

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  org_number text,
  client_slug text unique,
  website text,
  logo_url text,
  brand_color text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  first_name text,
  last_name text,
  email text not null,
  phone text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists client_contacts_email_lower_idx
  on public.client_contacts (lower(email));

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  status text not null default 'draft',
  description text,
  start_date date,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null,
  client_id uuid references public.clients(id) on delete set null,
  client_contact_id uuid references public.client_contacts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_role_check check (role in ('admin', 'client')),
  constraint user_profiles_admin_shape_check check (
    (role = 'admin' and client_id is null and client_contact_id is null)
    or (role = 'client' and client_id is not null and client_contact_id is not null)
  )
);

create table if not exists public.portal_users (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null unique references public.user_profiles(id) on delete cascade,
  client_contact_id uuid not null unique references public.client_contacts(id) on delete cascade,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.portal_invites (
  id uuid primary key default gen_random_uuid(),
  client_contact_id uuid not null references public.client_contacts(id) on delete cascade,
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  opened_at timestamptz,
  accepted_at timestamptz,
  last_error text,
  created_ip text,
  accepted_ip text,
  accepted_user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portal_invites_contact_created_idx
  on public.portal_invites (client_contact_id, created_at desc);

create table if not exists public.portal_audit_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  client_contact_id uuid references public.client_contacts(id) on delete set null,
  user_profile_id uuid references public.user_profiles(id) on delete set null,
  event_type text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists portal_audit_events_created_idx
  on public.portal_audit_events (created_at desc);

-- updated_at triggers
drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists client_contacts_set_updated_at on public.client_contacts;
create trigger client_contacts_set_updated_at
before update on public.client_contacts
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists portal_users_set_updated_at on public.portal_users;
create trigger portal_users_set_updated_at
before update on public.portal_users
for each row execute function public.set_updated_at();

drop trigger if exists portal_invites_set_updated_at on public.portal_invites;
create trigger portal_invites_set_updated_at
before update on public.portal_invites
for each row execute function public.set_updated_at();

-- RLS: no broad anon access on portal tables
alter table public.clients enable row level security;
alter table public.client_contacts enable row level security;
alter table public.projects enable row level security;
alter table public.user_profiles enable row level security;
alter table public.portal_users enable row level security;
alter table public.portal_invites enable row level security;
alter table public.portal_audit_events enable row level security;

grant select on public.user_profiles to authenticated;
grant select on public.portal_users to authenticated;
grant all on public.clients to service_role;
grant all on public.client_contacts to service_role;
grant all on public.projects to service_role;
grant all on public.user_profiles to service_role;
grant all on public.portal_users to service_role;
grant all on public.portal_invites to service_role;
grant all on public.portal_audit_events to service_role;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles for select
to authenticated
using (auth_user_id = auth.uid());

drop policy if exists "Portal users can read own portal row" on public.portal_users;
create policy "Portal users can read own portal row"
on public.portal_users for select
to authenticated
using (
  exists (
    select 1
    from public.user_profiles up
    where up.id = portal_users.user_profile_id
      and up.auth_user_id = auth.uid()
  )
);

-- Dev seed (idempotent)
insert into public.clients (company_name, org_number, client_slug, brand_color, status)
select 'KWStudio Demo Client', null, 'kwstudio-demo', '#2E75BD', 'active'
where not exists (
  select 1 from public.clients where client_slug = 'kwstudio-demo'
);

insert into public.client_contacts (client_id, email, first_name, last_name, role)
select c.id, 'demo.client@kwstudio.se', 'Demo', 'Client', 'Primary contact'
from public.clients c
where c.client_slug = 'kwstudio-demo'
  and not exists (
    select 1 from public.client_contacts cc where lower(cc.email) = lower('demo.client@kwstudio.se')
  );

insert into public.projects (client_id, title, status, description)
select c.id, 'Website redesign', 'draft', 'Demo project for portal foundation testing.'
from public.clients c
where c.client_slug = 'kwstudio-demo'
  and not exists (
    select 1
    from public.projects p
    where p.client_id = c.id and p.title = 'Website redesign'
  );

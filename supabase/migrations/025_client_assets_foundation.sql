-- Client Assets Foundation (Part 1)

-- client_actions metadata for upload action folder binding
alter table public.client_actions
  add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.client_actions
set
  requires_entity_module = 'assets',
  requires_entity_type = 'asset',
  metadata = coalesce(metadata, '{}'::jsonb) || '{"targetFolderSlug":"logo"}'::jsonb
where action_type = 'upload'
  and title ilike '%logo%'
  and requires_entity_module is null;

-- ---------------------------------------------------------------------------
-- asset_folders
-- ---------------------------------------------------------------------------
create table if not exists public.asset_folders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  parent_folder_id uuid references public.asset_folders(id) on delete cascade,
  name text not null,
  slug text not null,
  visibility text not null default 'client',
  sort_order integer not null default 0,
  icon text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint asset_folders_visibility_check check (visibility in ('client', 'internal')),
  constraint asset_folders_project_parent_slug_unique unique (project_id, parent_folder_id, slug)
);

create index if not exists asset_folders_project_sort_idx
  on public.asset_folders (project_id, sort_order);

-- ---------------------------------------------------------------------------
-- project_assets
-- ---------------------------------------------------------------------------
create table if not exists public.project_assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  folder_id uuid not null references public.asset_folders(id) on delete restrict,
  uploaded_by_profile_id uuid references public.user_profiles(id) on delete set null,
  uploaded_by_role text not null,
  current_version_id uuid,
  title text not null,
  description text,
  asset_type text not null default 'other',
  status text not null default 'active',
  visibility text not null default 'client',
  metadata jsonb not null default '{}'::jsonb,
  ai_metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  deleted_by_profile_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_assets_uploaded_by_role_check check (uploaded_by_role in ('admin', 'client')),
  constraint project_assets_status_check check (status in ('active', 'archived', 'deleted')),
  constraint project_assets_visibility_check check (visibility in ('client', 'internal')),
  constraint project_assets_asset_type_check check (
    asset_type in (
      'image', 'document', 'video', 'audio', 'archive',
      'design', 'spreadsheet', 'presentation', 'code', 'other'
    )
  )
);

create index if not exists project_assets_project_folder_status_idx
  on public.project_assets (project_id, folder_id, status);

-- ---------------------------------------------------------------------------
-- project_asset_versions
-- ---------------------------------------------------------------------------
create table if not exists public.project_asset_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.project_assets(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  extension text not null,
  size_bytes bigint not null,
  checksum_sha256 text not null,
  version integer not null,
  change_note text,
  thumbnail_storage_path text,
  preview_storage_path text,
  preview_type text,
  uploaded_at timestamptz not null default now(),
  constraint project_asset_versions_asset_version_unique unique (asset_id, version),
  constraint project_asset_versions_preview_type_check check (
    preview_type is null or preview_type in ('image', 'pdf', 'video', 'download')
  )
);

create index if not exists project_asset_versions_asset_version_idx
  on public.project_asset_versions (asset_id, version desc);

alter table public.project_assets
  add constraint project_assets_current_version_id_fkey
  foreign key (current_version_id) references public.project_asset_versions(id) on delete set null;

-- ---------------------------------------------------------------------------
-- asset_comments
-- ---------------------------------------------------------------------------
create table if not exists public.asset_comments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.project_assets(id) on delete cascade,
  profile_id uuid references public.user_profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists asset_comments_asset_created_idx
  on public.asset_comments (asset_id, created_at asc);

-- ---------------------------------------------------------------------------
-- asset_events (append-only)
-- ---------------------------------------------------------------------------
create table if not exists public.asset_events (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.project_assets(id) on delete cascade,
  event_type text not null,
  actor_type text not null default 'system',
  actor_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint asset_events_actor_type_check check (
    actor_type in ('admin', 'client', 'system')
  )
);

create index if not exists asset_events_asset_created_idx
  on public.asset_events (asset_id, created_at desc);

-- ---------------------------------------------------------------------------
-- asset_requests
-- ---------------------------------------------------------------------------
create table if not exists public.asset_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  folder_id uuid not null references public.asset_folders(id) on delete cascade,
  workflow_action_id uuid references public.client_actions(id) on delete set null,
  asset_id uuid references public.project_assets(id) on delete set null,
  title text not null,
  description text,
  required boolean not null default true,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint asset_requests_status_check check (status in ('pending', 'completed', 'cancelled'))
);

create index if not exists asset_requests_project_status_idx
  on public.asset_requests (project_id, status);

create index if not exists asset_requests_workflow_action_idx
  on public.asset_requests (workflow_action_id);

create index if not exists asset_requests_folder_status_idx
  on public.asset_requests (folder_id, status);

-- ---------------------------------------------------------------------------
-- asset_tags (schema only — no API in Part 1)
-- ---------------------------------------------------------------------------
create table if not exists public.asset_tags (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  slug text not null,
  color text,
  created_at timestamptz not null default now(),
  constraint asset_tags_project_slug_unique unique (project_id, slug)
);

-- ---------------------------------------------------------------------------
-- asset_tag_assignments (schema only — no API in Part 1)
-- ---------------------------------------------------------------------------
create table if not exists public.asset_tag_assignments (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.project_assets(id) on delete cascade,
  tag_id uuid not null references public.asset_tags(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  constraint asset_tag_assignments_asset_tag_unique unique (asset_id, tag_id)
);

create index if not exists asset_tag_assignments_asset_idx
  on public.asset_tag_assignments (asset_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists asset_folders_set_updated_at on public.asset_folders;
create trigger asset_folders_set_updated_at
before update on public.asset_folders
for each row execute function public.set_updated_at();

drop trigger if exists project_assets_set_updated_at on public.project_assets;
create trigger project_assets_set_updated_at
before update on public.project_assets
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS + grants
-- ---------------------------------------------------------------------------
alter table public.asset_folders enable row level security;
alter table public.project_assets enable row level security;
alter table public.project_asset_versions enable row level security;
alter table public.asset_comments enable row level security;
alter table public.asset_events enable row level security;
alter table public.asset_requests enable row level security;
alter table public.asset_tags enable row level security;
alter table public.asset_tag_assignments enable row level security;

grant all on public.asset_folders to service_role;
grant all on public.project_assets to service_role;
grant all on public.project_asset_versions to service_role;
grant all on public.asset_comments to service_role;
grant all on public.asset_events to service_role;
grant all on public.asset_requests to service_role;
grant all on public.asset_tags to service_role;
grant all on public.asset_tag_assignments to service_role;

-- ---------------------------------------------------------------------------
-- storage bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('project-assets', 'project-assets', false)
on conflict (id) do update set public = false;

-- ---------------------------------------------------------------------------
-- backfill default folders for existing projects
-- ---------------------------------------------------------------------------
insert into public.asset_folders (project_id, parent_folder_id, name, slug, visibility, sort_order, icon, color)
select
  p.id,
  null,
  seed.name,
  seed.slug,
  'client',
  seed.sort_order,
  seed.icon,
  seed.color
from public.projects p
cross join (
  values
    ('Logo', 'logo', 1, 'Logo', null),
    ('Brand', 'brand', 2, 'Palette', null),
    ('Content', 'content', 3, 'FileText', null),
    ('Images', 'images', 4, 'Image', null),
    ('Documents', 'documents', 5, 'Folder', null),
    ('Invoices', 'invoices', 6, 'FileText', null),
    ('Deliverables', 'deliverables', 7, 'Package', null),
    ('Other', 'other', 8, 'MoreHorizontal', null)
) as seed(name, slug, sort_order, icon, color)
where not exists (
  select 1 from public.asset_folders af where af.project_id = p.id
);

-- backfill asset_requests for existing upload client actions
insert into public.asset_requests (
  project_id,
  folder_id,
  workflow_action_id,
  title,
  description,
  required,
  status
)
select
  ca.project_id,
  af.id,
  ca.id,
  ca.title,
  ca.description,
  true,
  'pending'
from public.client_actions ca
join public.asset_folders af
  on af.project_id = ca.project_id
 and af.slug = coalesce(ca.metadata->>'targetFolderSlug', case when ca.title ilike '%logo%' then 'logo' else null end)
where ca.action_type = 'upload'
  and ca.requires_entity_module = 'assets'
  and ca.status in ('open', 'in_progress')
  and af.slug is not null
  and not exists (
    select 1 from public.asset_requests ar where ar.workflow_action_id = ca.id
  );

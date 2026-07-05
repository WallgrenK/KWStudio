-- Document Engine Foundation (Part 1)
-- Generic document model: types, templates, instances, versions, blocks, events, render artifacts, service defaults.

-- ---------------------------------------------------------------------------
-- document_types (registry — extensible without schema changes)
-- ---------------------------------------------------------------------------
create table if not exists public.document_types (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- document_templates
-- ---------------------------------------------------------------------------
create table if not exists public.document_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  document_type_id uuid not null references public.document_types(id) on delete restrict,
  service_id uuid references public.services(id) on delete set null,
  is_default boolean not null default false,
  is_system boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_templates_slug_unique unique (slug)
);

create index if not exists document_templates_type_idx
  on public.document_templates (document_type_id);

create index if not exists document_templates_service_idx
  on public.document_templates (service_id)
  where archived_at is null;

-- ---------------------------------------------------------------------------
-- document_template_versions
-- ---------------------------------------------------------------------------
create table if not exists public.document_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.document_templates(id) on delete cascade,
  version_number integer not null default 1,
  status text not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_template_versions_status_check check (
    status in ('draft', 'published')
  ),
  constraint document_template_versions_template_version_unique unique (template_id, version_number)
);

create index if not exists document_template_versions_template_idx
  on public.document_template_versions (template_id, version_number desc);

-- ---------------------------------------------------------------------------
-- document_template_blocks
-- ---------------------------------------------------------------------------
create table if not exists public.document_template_blocks (
  id uuid primary key default gen_random_uuid(),
  template_version_id uuid not null references public.document_template_versions(id) on delete cascade,
  sort_order integer not null default 0,
  block_type text not null,
  content jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_template_blocks_block_type_check check (
    block_type in (
      'heading', 'paragraph', 'bullet_list', 'pricing_table', 'timeline',
      'callout', 'image', 'signature_placeholder', 'divider'
    )
  )
);

create index if not exists document_template_blocks_version_sort_idx
  on public.document_template_blocks (template_version_id, sort_order);

-- ---------------------------------------------------------------------------
-- documents (instance header)
-- ---------------------------------------------------------------------------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  document_type_id uuid not null references public.document_types(id) on delete restrict,
  template_id uuid references public.document_templates(id) on delete set null,
  active_version_id uuid,
  status text not null default 'draft',
  title text not null,
  reference_number text,
  currency text not null default 'SEK',
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_status_check check (
    status in (
      'draft', 'generated', 'sent', 'viewed', 'approved', 'rejected',
      'expired', 'archived', 'cancelled'
    )
  )
);

create index if not exists documents_client_idx on public.documents (client_id, created_at desc);
create index if not exists documents_project_idx on public.documents (project_id) where project_id is not null;
create index if not exists documents_type_status_idx on public.documents (document_type_id, status);

-- ---------------------------------------------------------------------------
-- document_versions (immutable when published)
-- ---------------------------------------------------------------------------
create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_number integer not null,
  status text not null default 'draft',
  source text not null default 'manual',
  change_summary text,
  variables_snapshot jsonb,
  pricing_snapshot jsonb,
  published_at timestamptz,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_versions_status_check check (
    status in ('draft', 'published')
  ),
  constraint document_versions_source_check check (
    source in ('manual', 'generated', 'duplicated', 'template', 'ai_assisted')
  ),
  constraint document_versions_document_version_unique unique (document_id, version_number)
);

create index if not exists document_versions_document_idx
  on public.document_versions (document_id, version_number desc);

alter table public.documents
  drop constraint if exists documents_active_version_id_fkey;
alter table public.documents
  add constraint documents_active_version_id_fkey
  foreign key (active_version_id) references public.document_versions(id) on delete set null;

-- ---------------------------------------------------------------------------
-- document_blocks (instance version content)
-- ---------------------------------------------------------------------------
create table if not exists public.document_blocks (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.document_versions(id) on delete cascade,
  sort_order integer not null default 0,
  block_type text not null,
  content jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_blocks_block_type_check check (
    block_type in (
      'heading', 'paragraph', 'bullet_list', 'pricing_table', 'timeline',
      'callout', 'image', 'signature_placeholder', 'divider'
    )
  )
);

create index if not exists document_blocks_version_sort_idx
  on public.document_blocks (version_id, sort_order);

-- ---------------------------------------------------------------------------
-- document_events (append-only audit)
-- ---------------------------------------------------------------------------
create table if not exists public.document_events (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_id uuid references public.document_versions(id) on delete set null,
  event_type text not null,
  actor_type text not null default 'system',
  actor_user_profile_id uuid references public.user_profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint document_events_actor_type_check check (
    actor_type in ('admin', 'client', 'system')
  )
);

create index if not exists document_events_document_created_idx
  on public.document_events (document_id, created_at desc);

-- ---------------------------------------------------------------------------
-- document_render_artifacts (cache — no rendering in Part 1)
-- ---------------------------------------------------------------------------
create table if not exists public.document_render_artifacts (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.document_versions(id) on delete cascade,
  render_target text not null,
  content_hash text,
  storage_path text,
  html_inline text,
  registry_versions jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  constraint document_render_artifacts_target_check check (
    render_target in ('html', 'pdf', 'email')
  ),
  constraint document_render_artifacts_version_target_unique unique (version_id, render_target)
);

-- ---------------------------------------------------------------------------
-- service_document_defaults (one default template per service + document type)
-- ---------------------------------------------------------------------------
create table if not exists public.service_document_defaults (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  document_type_id uuid not null references public.document_types(id) on delete cascade,
  template_id uuid not null references public.document_templates(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_document_defaults_service_type_unique unique (service_id, document_type_id)
);

create index if not exists service_document_defaults_service_idx
  on public.service_document_defaults (service_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists document_types_set_updated_at on public.document_types;
create trigger document_types_set_updated_at
before update on public.document_types
for each row execute function public.set_updated_at();

drop trigger if exists document_templates_set_updated_at on public.document_templates;
create trigger document_templates_set_updated_at
before update on public.document_templates
for each row execute function public.set_updated_at();

drop trigger if exists document_template_versions_set_updated_at on public.document_template_versions;
create trigger document_template_versions_set_updated_at
before update on public.document_template_versions
for each row execute function public.set_updated_at();

drop trigger if exists document_template_blocks_set_updated_at on public.document_template_blocks;
create trigger document_template_blocks_set_updated_at
before update on public.document_template_blocks
for each row execute function public.set_updated_at();

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

drop trigger if exists document_versions_set_updated_at on public.document_versions;
create trigger document_versions_set_updated_at
before update on public.document_versions
for each row execute function public.set_updated_at();

drop trigger if exists document_blocks_set_updated_at on public.document_blocks;
create trigger document_blocks_set_updated_at
before update on public.document_blocks
for each row execute function public.set_updated_at();

drop trigger if exists service_document_defaults_set_updated_at on public.service_document_defaults;
create trigger service_document_defaults_set_updated_at
before update on public.service_document_defaults
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS + grants
-- ---------------------------------------------------------------------------
alter table public.document_types enable row level security;
alter table public.document_templates enable row level security;
alter table public.document_template_versions enable row level security;
alter table public.document_template_blocks enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.document_blocks enable row level security;
alter table public.document_events enable row level security;
alter table public.document_render_artifacts enable row level security;
alter table public.service_document_defaults enable row level security;

grant all on public.document_types to service_role;
grant all on public.document_templates to service_role;
grant all on public.document_template_versions to service_role;
grant all on public.document_template_blocks to service_role;
grant all on public.documents to service_role;
grant all on public.document_versions to service_role;
grant all on public.document_blocks to service_role;
grant all on public.document_events to service_role;
grant all on public.document_render_artifacts to service_role;
grant all on public.service_document_defaults to service_role;

-- ---------------------------------------------------------------------------
-- Seed: document types
-- ---------------------------------------------------------------------------
insert into public.document_types (slug, name, description, is_system)
select v.slug, v.name, v.description, true
from (
  values
    ('proposal', 'Proposal', 'Commercial proposal for client review and approval.'),
    ('contract', 'Contract', 'Binding agreement document.'),
    ('project_brief', 'Project Brief', 'Project scope and requirements summary.'),
    ('change_order', 'Change Order', 'Scope or pricing change request.'),
    ('delivery_report', 'Delivery Report', 'Project delivery summary and handover.'),
    ('maintenance_agreement', 'Maintenance Agreement', 'Ongoing maintenance terms and pricing.')
) as v(slug, name, description)
where not exists (select 1 from public.document_types dt where dt.slug = v.slug);

-- ---------------------------------------------------------------------------
-- Seed: system document templates for website service
-- ---------------------------------------------------------------------------
insert into public.document_templates (slug, name, document_type_id, service_id, is_default, is_system)
select
  v.template_slug,
  v.template_name,
  dt.id,
  s.id,
  true,
  true
from (
  values
    ('website-proposal-v1', 'Website Proposal', 'proposal'),
    ('website-contract-v1', 'Website Contract', 'contract'),
    ('website-brief-v1', 'Website Project Brief', 'project_brief')
) as v(template_slug, template_name, type_slug)
join public.document_types dt on dt.slug = v.type_slug
join public.services s on s.slug = 'website'
where not exists (
  select 1 from public.document_templates t where t.slug = v.template_slug
);

-- Publish template versions v1 with starter blocks
insert into public.document_template_versions (template_id, version_number, status, published_at)
select t.id, 1, 'published', now()
from public.document_templates t
where t.slug in ('website-proposal-v1', 'website-contract-v1', 'website-brief-v1')
  and not exists (
    select 1 from public.document_template_versions tv where tv.template_id = t.id
  );

insert into public.document_template_blocks (template_version_id, sort_order, block_type, content, settings)
select tv.id, v.sort_order, v.block_type, v.content::jsonb, '{}'::jsonb
from public.document_template_versions tv
join public.document_templates t on t.id = tv.template_id
cross join (
  values
    (1, 'heading', '{"text":"{{document.title}}","level":1}'),
    (2, 'paragraph', '{"text":"Prepared for {{client.name}}."}'),
    (3, 'divider', '{}'),
    (4, 'paragraph', '{"text":"Document content goes here."}')
) as v(sort_order, block_type, content)
where t.slug = 'website-proposal-v1' and tv.version_number = 1
  and not exists (
    select 1 from public.document_template_blocks b where b.template_version_id = tv.id
  );

insert into public.document_template_blocks (template_version_id, sort_order, block_type, content, settings)
select tv.id, v.sort_order, v.block_type, v.content::jsonb, '{}'::jsonb
from public.document_template_versions tv
join public.document_templates t on t.id = tv.template_id
cross join (
  values
    (1, 'heading', '{"text":"Agreement","level":1}'),
    (2, 'paragraph', '{"text":"This agreement is between KWStudio and {{client.name}}."}'),
    (3, 'signature_placeholder', '{"label":"Client signature"}'),
    (4, 'signature_placeholder', '{"label":"KWStudio signature"}')
) as v(sort_order, block_type, content)
where t.slug = 'website-contract-v1' and tv.version_number = 1
  and not exists (
    select 1 from public.document_template_blocks b where b.template_version_id = tv.id
  );

insert into public.document_template_blocks (template_version_id, sort_order, block_type, content, settings)
select tv.id, v.sort_order, v.block_type, v.content::jsonb, '{}'::jsonb
from public.document_template_versions tv
join public.document_templates t on t.id = tv.template_id
cross join (
  values
    (1, 'heading', '{"text":"Project Brief","level":1}'),
    (2, 'paragraph', '{"text":"Project: {{project.title}}"}'),
    (3, 'bullet_list', '{"items":["Goals","Scope","Timeline"]}')
) as v(sort_order, block_type, content)
where t.slug = 'website-brief-v1' and tv.version_number = 1
  and not exists (
    select 1 from public.document_template_blocks b where b.template_version_id = tv.id
  );

-- ---------------------------------------------------------------------------
-- Seed: service_document_defaults for website service
-- ---------------------------------------------------------------------------
insert into public.service_document_defaults (service_id, document_type_id, template_id)
select s.id, dt.id, t.id
from public.services s
join public.document_types dt on dt.slug in ('proposal', 'contract', 'project_brief')
join public.document_templates t on t.document_type_id = dt.id and t.service_id = s.id
where s.slug = 'website'
  and t.slug in ('website-proposal-v1', 'website-contract-v1', 'website-brief-v1')
  and not exists (
    select 1 from public.service_document_defaults sd
    where sd.service_id = s.id and sd.document_type_id = dt.id
  );

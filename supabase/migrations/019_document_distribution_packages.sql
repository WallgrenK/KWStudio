-- Document Distribution + Packages (Part 6)
-- Packages group document creation; distributions are the transport layer to clients.

-- ---------------------------------------------------------------------------
-- service_document_packages
-- ---------------------------------------------------------------------------
create table if not exists public.service_document_packages (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_document_packages_slug_unique unique (service_id, slug)
);

create index if not exists service_document_packages_service_idx
  on public.service_document_packages (service_id);

-- ---------------------------------------------------------------------------
-- service_document_package_items
-- ---------------------------------------------------------------------------
create table if not exists public.service_document_package_items (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.service_document_packages(id) on delete cascade,
  sort_order integer not null default 0,
  document_type_id uuid not null references public.document_types(id) on delete restrict,
  template_id uuid not null references public.document_templates(id) on delete restrict,
  create_client_action boolean not null default false,
  client_action_title text,
  requires_approval boolean not null default false,
  auto_send boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_document_package_items_package_sort_idx
  on public.service_document_package_items (package_id, sort_order);

-- ---------------------------------------------------------------------------
-- document_distributions
-- ---------------------------------------------------------------------------
create table if not exists public.document_distributions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_id uuid not null references public.document_versions(id) on delete restrict,
  target text not null default 'portal',
  status text not null default 'pending',
  sent_at timestamptz,
  viewed_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint document_distributions_target_check check (
    target in ('portal', 'email', 'pdf', 'bankid', 'api')
  ),
  constraint document_distributions_status_check check (
    status in ('pending', 'sent', 'viewed', 'completed', 'expired', 'cancelled')
  )
);

create index if not exists document_distributions_document_idx
  on public.document_distributions (document_id, created_at desc);

create index if not exists document_distributions_client_portal_idx
  on public.document_distributions (document_id, target, status)
  where target = 'portal' and status in ('sent', 'viewed', 'completed');

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists service_document_packages_set_updated_at on public.service_document_packages;
create trigger service_document_packages_set_updated_at
before update on public.service_document_packages
for each row execute function public.set_updated_at();

drop trigger if exists service_document_package_items_set_updated_at on public.service_document_package_items;
create trigger service_document_package_items_set_updated_at
before update on public.service_document_package_items
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS + grants
-- ---------------------------------------------------------------------------
alter table public.service_document_packages enable row level security;
alter table public.service_document_package_items enable row level security;
alter table public.document_distributions enable row level security;

grant all on public.service_document_packages to service_role;
grant all on public.service_document_package_items to service_role;
grant all on public.document_distributions to service_role;

-- ---------------------------------------------------------------------------
-- Seed: additional document types
-- ---------------------------------------------------------------------------
insert into public.document_types (slug, name, description, is_system)
select v.slug, v.name, v.description, true
from (
  values
    ('welcome_guide', 'Welcome Guide', 'Onboarding guide for new clients.'),
    ('maintenance_offer', 'Maintenance Offer', 'Optional ongoing maintenance proposal.')
) as v(slug, name, description)
where not exists (select 1 from public.document_types dt where dt.slug = v.slug);

-- ---------------------------------------------------------------------------
-- Seed: website templates for welcome guide + maintenance offer
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
    ('website-welcome-v1', 'Website Welcome Guide', 'welcome_guide'),
    ('website-maintenance-offer-v1', 'Website Maintenance Offer', 'maintenance_offer')
) as v(template_slug, template_name, type_slug)
join public.document_types dt on dt.slug = v.type_slug
join public.services s on s.slug = 'website'
where not exists (
  select 1 from public.document_templates t where t.slug = v.template_slug
);

insert into public.document_template_versions (template_id, version_number, status, published_at)
select t.id, 1, 'published', now()
from public.document_templates t
where t.slug in ('website-welcome-v1', 'website-maintenance-offer-v1')
  and not exists (
    select 1 from public.document_template_versions tv where tv.template_id = t.id
  );

insert into public.document_template_blocks (template_version_id, sort_order, block_type, content, settings)
select tv.id, v.sort_order, v.block_type, v.content::jsonb, '{}'::jsonb
from public.document_template_versions tv
join public.document_templates t on t.id = tv.template_id
cross join (
  values
    (1, 'heading', '{"text":"Welcome to KWStudio","level":1}'),
    (2, 'paragraph', '{"text":"Hello {{client.name}}, here is everything you need to get started."}'),
    (3, 'bullet_list', '{"items":["Portal access","Project timeline","Support contacts"]}')
) as v(sort_order, block_type, content)
where t.slug = 'website-welcome-v1' and tv.version_number = 1
  and not exists (
    select 1 from public.document_template_blocks b where b.template_version_id = tv.id
  );

insert into public.document_template_blocks (template_version_id, sort_order, block_type, content, settings)
select tv.id, v.sort_order, v.block_type, v.content::jsonb, '{}'::jsonb
from public.document_template_versions tv
join public.document_templates t on t.id = tv.template_id
cross join (
  values
    (1, 'heading', '{"text":"Maintenance Offer","level":1}'),
    (2, 'paragraph', '{"text":"Optional ongoing support for {{client.name}}."}'),
    (3, 'pricing_table', '{"lineItems":[{"label":"Monthly maintenance","quantity":1,"unitPrice":2500,"vatRate":25}]}')
) as v(sort_order, block_type, content)
where t.slug = 'website-maintenance-offer-v1' and tv.version_number = 1
  and not exists (
    select 1 from public.document_template_blocks b where b.template_version_id = tv.id
  );

-- ---------------------------------------------------------------------------
-- Seed: website service document package
-- ---------------------------------------------------------------------------
insert into public.service_document_packages (service_id, slug, name, description, is_default)
select s.id, 'website-standard', 'Website Standard Package', 'Proposal, contract, brief, welcome guide, and maintenance offer.', true
from public.services s
where s.slug = 'website'
  and not exists (
    select 1 from public.service_document_packages p
    where p.service_id = s.id and p.slug = 'website-standard'
  );

insert into public.service_document_package_items (
  package_id,
  sort_order,
  document_type_id,
  template_id,
  create_client_action,
  client_action_title,
  requires_approval,
  auto_send
)
select
  p.id,
  v.sort_order,
  dt.id,
  t.id,
  v.create_client_action,
  v.client_action_title,
  v.requires_approval,
  v.auto_send
from public.service_document_packages p
join public.services s on s.id = p.service_id and s.slug = 'website'
cross join (
  values
    (1, 'proposal', 'website-proposal-v1', true, 'Review Proposal', true, false),
    (2, 'contract', 'website-contract-v1', true, 'Approve Contract', true, false),
    (3, 'project_brief', 'website-brief-v1', false, null, false, false),
    (4, 'welcome_guide', 'website-welcome-v1', false, null, false, true),
    (5, 'maintenance_offer', 'website-maintenance-offer-v1', false, null, false, false)
) as v(sort_order, type_slug, template_slug, create_client_action, client_action_title, requires_approval, auto_send)
join public.document_types dt on dt.slug = v.type_slug
join public.document_templates t on t.slug = v.template_slug
where p.slug = 'website-standard'
  and not exists (
    select 1 from public.service_document_package_items i where i.package_id = p.id
  );

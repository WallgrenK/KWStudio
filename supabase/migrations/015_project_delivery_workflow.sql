-- Project Delivery Workflow Foundation v3
-- Service catalog, versioned workflow templates, workflow instances, milestones, client actions, activity.

-- ---------------------------------------------------------------------------
-- workflow_templates (versioned)
-- ---------------------------------------------------------------------------
create table if not exists public.workflow_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  version integer not null default 1,
  is_default boolean not null default false,
  is_system boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workflow_templates_slug_version_unique unique (slug, version)
);

create index if not exists workflow_templates_slug_idx on public.workflow_templates (slug);
create index if not exists workflow_templates_default_idx on public.workflow_templates (slug, is_default)
  where archived_at is null;

-- ---------------------------------------------------------------------------
-- workflow_template_phases
-- ---------------------------------------------------------------------------
create table if not exists public.workflow_template_phases (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workflow_templates(id) on delete cascade,
  phase_key text not null,
  title text not null,
  description text,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workflow_template_phases_template_key_unique unique (template_id, phase_key)
);

create index if not exists workflow_template_phases_template_sort_idx
  on public.workflow_template_phases (template_id, sort_order);

-- ---------------------------------------------------------------------------
-- services (catalog)
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  default_workflow_template_id uuid references public.workflow_templates(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- projects.service_id + delivery status constraint
-- ---------------------------------------------------------------------------
alter table public.projects
  add column if not exists service_id uuid references public.services(id) on delete restrict;

alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check check (
  status in ('draft', 'active', 'waiting_for_client', 'on_hold', 'completed', 'cancelled')
);

-- Normalize legacy demo status
update public.projects set status = 'draft' where status not in (
  'draft', 'active', 'waiting_for_client', 'on_hold', 'completed', 'cancelled'
);

-- ---------------------------------------------------------------------------
-- project_workflows
-- ---------------------------------------------------------------------------
create table if not exists public.project_workflows (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects(id) on delete cascade,
  template_id uuid not null references public.workflow_templates(id) on delete restrict,
  template_slug text not null,
  template_version integer not null,
  service_id uuid not null references public.services(id) on delete restrict,
  current_phase_id uuid,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- project_workflow_phases
-- ---------------------------------------------------------------------------
create table if not exists public.project_workflow_phases (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.project_workflows(id) on delete cascade,
  phase_key text not null,
  title text not null,
  description text,
  sort_order integer not null,
  status text not null default 'upcoming',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_workflow_phases_status_check check (
    status in ('upcoming', 'current', 'completed', 'skipped')
  ),
  constraint project_workflow_phases_workflow_key_unique unique (workflow_id, phase_key)
);

create index if not exists project_workflow_phases_workflow_sort_idx
  on public.project_workflow_phases (workflow_id, sort_order);

alter table public.project_workflows
  drop constraint if exists project_workflows_current_phase_id_fkey;
alter table public.project_workflows
  add constraint project_workflows_current_phase_id_fkey
  foreign key (current_phase_id) references public.project_workflow_phases(id) on delete set null;

-- ---------------------------------------------------------------------------
-- project_milestones
-- ---------------------------------------------------------------------------
create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  workflow_phase_id uuid references public.project_workflow_phases(id) on delete set null,
  title text not null,
  description text,
  sort_order integer not null default 0,
  status text not null default 'pending',
  completion_mode text not null default 'manual',
  due_date date,
  completed_at timestamptz,
  visibility text not null default 'client',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_milestones_status_check check (
    status in ('pending', 'in_progress', 'completed', 'cancelled')
  ),
  constraint project_milestones_completion_mode_check check (
    completion_mode in ('manual', 'automatic')
  ),
  constraint project_milestones_visibility_check check (
    visibility in ('client', 'internal')
  )
);

create index if not exists project_milestones_project_sort_idx
  on public.project_milestones (project_id, sort_order);

-- ---------------------------------------------------------------------------
-- client_actions
-- ---------------------------------------------------------------------------
create table if not exists public.client_actions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.project_milestones(id) on delete set null,
  assigned_to_contact_id uuid references public.client_contacts(id) on delete set null,
  title text not null,
  description text,
  action_type text not null default 'task',
  status text not null default 'open',
  priority text not null default 'normal',
  estimated_minutes integer,
  due_date date,
  completed_at timestamptz,
  sort_order integer not null default 0,
  requires_entity_module text,
  requires_entity_type text,
  requires_entity_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_actions_action_type_check check (
    action_type in ('task', 'approval', 'upload', 'review', 'meeting', 'payment')
  ),
  constraint client_actions_status_check check (
    status in ('open', 'in_progress', 'completed', 'cancelled')
  ),
  constraint client_actions_priority_check check (
    priority in ('low', 'normal', 'high')
  )
);

create index if not exists client_actions_project_status_idx
  on public.client_actions (project_id, status, sort_order);

-- ---------------------------------------------------------------------------
-- project_activity_events (append-only)
-- ---------------------------------------------------------------------------
create table if not exists public.project_activity_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  event_type text not null,
  title text not null,
  description text,
  importance text not null default 'info',
  visibility text not null default 'client',
  actor_type text not null default 'system',
  actor_user_profile_id uuid references public.user_profiles(id) on delete set null,
  source_module text,
  source_entity_type text,
  source_entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint project_activity_events_importance_check check (
    importance in ('info', 'success', 'warning', 'critical')
  ),
  constraint project_activity_events_visibility_check check (
    visibility in ('client', 'internal')
  ),
  constraint project_activity_events_actor_type_check check (
    actor_type in ('admin', 'client', 'system')
  )
);

create index if not exists project_activity_events_project_created_idx
  on public.project_activity_events (project_id, created_at desc);

create index if not exists project_activity_events_client_feed_idx
  on public.project_activity_events (project_id, visibility, created_at desc);

-- ---------------------------------------------------------------------------
-- dependencies
-- ---------------------------------------------------------------------------
create table if not exists public.project_milestone_dependencies (
  milestone_id uuid not null references public.project_milestones(id) on delete cascade,
  depends_on_milestone_id uuid not null references public.project_milestones(id) on delete cascade,
  primary key (milestone_id, depends_on_milestone_id),
  constraint project_milestone_dependencies_no_self check (milestone_id <> depends_on_milestone_id)
);

create table if not exists public.client_action_dependencies (
  action_id uuid not null references public.client_actions(id) on delete cascade,
  depends_on_action_id uuid not null references public.client_actions(id) on delete cascade,
  primary key (action_id, depends_on_action_id),
  constraint client_action_dependencies_no_self check (action_id <> depends_on_action_id)
);

-- ---------------------------------------------------------------------------
-- workflow_automation_rules (future-ready, empty in v1)
-- ---------------------------------------------------------------------------
create table if not exists public.workflow_automation_rules (
  id uuid primary key default gen_random_uuid(),
  workflow_template_id uuid references public.workflow_templates(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  trigger_event_type text not null,
  conditions jsonb,
  actions jsonb not null default '[]'::jsonb,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists workflow_templates_set_updated_at on public.workflow_templates;
create trigger workflow_templates_set_updated_at
before update on public.workflow_templates
for each row execute function public.set_updated_at();

drop trigger if exists workflow_template_phases_set_updated_at on public.workflow_template_phases;
create trigger workflow_template_phases_set_updated_at
before update on public.workflow_template_phases
for each row execute function public.set_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

drop trigger if exists project_workflows_set_updated_at on public.project_workflows;
create trigger project_workflows_set_updated_at
before update on public.project_workflows
for each row execute function public.set_updated_at();

drop trigger if exists project_workflow_phases_set_updated_at on public.project_workflow_phases;
create trigger project_workflow_phases_set_updated_at
before update on public.project_workflow_phases
for each row execute function public.set_updated_at();

drop trigger if exists project_milestones_set_updated_at on public.project_milestones;
create trigger project_milestones_set_updated_at
before update on public.project_milestones
for each row execute function public.set_updated_at();

drop trigger if exists client_actions_set_updated_at on public.client_actions;
create trigger client_actions_set_updated_at
before update on public.client_actions
for each row execute function public.set_updated_at();

drop trigger if exists workflow_automation_rules_set_updated_at on public.workflow_automation_rules;
create trigger workflow_automation_rules_set_updated_at
before update on public.workflow_automation_rules
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS + grants
-- ---------------------------------------------------------------------------
alter table public.workflow_templates enable row level security;
alter table public.workflow_template_phases enable row level security;
alter table public.services enable row level security;
alter table public.project_workflows enable row level security;
alter table public.project_workflow_phases enable row level security;
alter table public.project_milestones enable row level security;
alter table public.client_actions enable row level security;
alter table public.project_activity_events enable row level security;
alter table public.project_milestone_dependencies enable row level security;
alter table public.client_action_dependencies enable row level security;
alter table public.workflow_automation_rules enable row level security;

grant all on public.workflow_templates to service_role;
grant all on public.workflow_template_phases to service_role;
grant all on public.services to service_role;
grant all on public.project_workflows to service_role;
grant all on public.project_workflow_phases to service_role;
grant all on public.project_milestones to service_role;
grant all on public.client_actions to service_role;
grant all on public.project_activity_events to service_role;
grant all on public.project_milestone_dependencies to service_role;
grant all on public.client_action_dependencies to service_role;
grant all on public.workflow_automation_rules to service_role;

-- ---------------------------------------------------------------------------
-- Seed: Standard Website Workflow v1
-- ---------------------------------------------------------------------------
insert into public.workflow_templates (slug, name, version, is_default, is_system)
select 'standard-website-delivery', 'Standard Website Workflow', 1, true, true
where not exists (
  select 1 from public.workflow_templates
  where slug = 'standard-website-delivery' and version = 1
);

insert into public.workflow_template_phases (template_id, phase_key, title, description, sort_order)
select t.id, v.phase_key, v.title, v.description, v.sort_order
from public.workflow_templates t
cross join (
  values
    ('discovery', 'Discovery', 'Understanding goals, scope, and requirements.', 1),
    ('planning', 'Planning', 'Structuring the project plan and milestones.', 2),
    ('design', 'Design', 'Visual direction, wireframes, and design reviews.', 3),
    ('development', 'Development', 'Building and implementing the solution.', 4),
    ('testing', 'Testing', 'Quality assurance and client review cycles.', 5),
    ('launch', 'Launch', 'Final checks and go-live preparation.', 6),
    ('completed', 'Completed', 'Project delivered and closed out.', 7)
) as v(phase_key, title, description, sort_order)
where t.slug = 'standard-website-delivery' and t.version = 1
  and not exists (
    select 1 from public.workflow_template_phases p where p.template_id = t.id
  );

-- ---------------------------------------------------------------------------
-- Seed: services catalog
-- ---------------------------------------------------------------------------
insert into public.services (slug, name, description, default_workflow_template_id, is_active)
select v.slug, v.name, v.description, t.id, true
from (
  values
    ('website', 'Website', 'Full website design and development projects.'),
    ('landing-page', 'Landing Page', 'Focused landing page builds.'),
    ('ecommerce', 'E-commerce', 'Online store design and development.'),
    ('brand-identity', 'Brand Identity', 'Brand strategy, identity, and guidelines.'),
    ('hosting', 'Hosting', 'Managed hosting and infrastructure.'),
    ('seo', 'SEO', 'Search engine optimization engagements.'),
    ('maintenance', 'Maintenance', 'Ongoing website maintenance and support.')
) as v(slug, name, description)
cross join public.workflow_templates t
where t.slug = 'standard-website-delivery' and t.version = 1
  and not exists (select 1 from public.services s where s.slug = v.slug);

-- ---------------------------------------------------------------------------
-- Backfill demo project service_id
-- ---------------------------------------------------------------------------
update public.projects p
set service_id = s.id
from public.services s
where s.slug = 'website'
  and p.service_id is null;

alter table public.projects
  alter column service_id set not null;

-- ---------------------------------------------------------------------------
-- Backfill demo project workflow (idempotent)
-- ---------------------------------------------------------------------------
do $$
declare
  v_project_id uuid;
  v_template_id uuid;
  v_service_id uuid;
  v_workflow_id uuid;
  v_current_phase_id uuid;
begin
  select p.id into v_project_id
  from public.projects p
  join public.clients c on c.id = p.client_id
  where c.client_slug = 'kwstudio-demo' and p.title = 'Website redesign'
  limit 1;

  if v_project_id is null then
    return;
  end if;

  select id into v_template_id from public.workflow_templates
  where slug = 'standard-website-delivery' and version = 1;

  select id into v_service_id from public.services where slug = 'website';

  if exists (select 1 from public.project_workflows where project_id = v_project_id) then
    return;
  end if;

  insert into public.project_workflows (
    project_id, template_id, template_slug, template_version, service_id, started_at
  ) values (
    v_project_id, v_template_id, 'standard-website-delivery', 1, v_service_id, now()
  ) returning id into v_workflow_id;

  insert into public.project_workflow_phases (
    workflow_id, phase_key, title, description, sort_order, status, started_at
  )
  select
    v_workflow_id,
    tp.phase_key,
    tp.title,
    tp.description,
    tp.sort_order,
    case when tp.sort_order = 1 then 'current' else 'upcoming' end,
    case when tp.sort_order = 1 then now() else null end
  from public.workflow_template_phases tp
  where tp.template_id = v_template_id
  order by tp.sort_order;

  select id into v_current_phase_id
  from public.project_workflow_phases
  where workflow_id = v_workflow_id and status = 'current'
  limit 1;

  update public.project_workflows
  set current_phase_id = v_current_phase_id
  where id = v_workflow_id;

  insert into public.project_milestones (project_id, workflow_phase_id, title, description, sort_order, status, completion_mode, visibility)
  select v_project_id, ph.id, m.title, m.description, m.sort_order, m.status, 'manual', 'client'
  from (
    values
      ('discovery', 'Kickoff', 'Initial alignment and project kickoff.', 1, 'completed'),
      ('design', 'Wireframes', 'Wireframe review and approval.', 2, 'in_progress'),
      ('design', 'Homepage approved', 'Client approval of homepage design.', 3, 'pending'),
      ('development', 'Development complete', 'Core build finished.', 4, 'pending'),
      ('testing', 'Testing complete', 'QA and staging review done.', 5, 'pending'),
      ('launch', 'Launch', 'Site live and handover complete.', 6, 'pending')
  ) as m(phase_key, title, description, sort_order, status)
  join public.project_workflow_phases ph
    on ph.workflow_id = v_workflow_id and ph.phase_key = m.phase_key
  where not exists (select 1 from public.project_milestones where project_id = v_project_id);

  update public.project_milestones
  set completed_at = now()
  where project_id = v_project_id and title = 'Kickoff';

  insert into public.client_actions (project_id, title, description, action_type, status, priority, sort_order)
  select v_project_id, a.title, a.description, a.action_type, a.status, a.priority, a.sort_order
  from (
    values
      ('Kickoff meeting', 'Attend the project kickoff meeting.', 'meeting', 'completed', 'normal', 1),
      ('Upload logo', 'Share your logo files for the project.', 'upload', 'open', 'high', 2),
      ('Send company text', 'Provide text content for key pages.', 'task', 'open', 'normal', 3),
      ('Approve homepage', 'Review and approve the homepage design.', 'approval', 'open', 'high', 4),
      ('Review staging site', 'Review the staging site before launch.', 'review', 'open', 'normal', 5)
  ) as a(title, description, action_type, status, priority, sort_order)
  where not exists (select 1 from public.client_actions where project_id = v_project_id);

  update public.client_actions
  set completed_at = now()
  where project_id = v_project_id and title = 'Kickoff meeting';

  insert into public.project_activity_events (project_id, event_type, title, description, importance, visibility, actor_type)
  select v_project_id, e.event_type, e.title, e.description, e.importance, 'client', 'system'
  from (
    values
      ('project_created', 'Project created', 'Your project workspace is ready.', 'info'),
      ('workflow_initialized', 'Workflow initialized', 'Standard Website Workflow v1 has been set up.', 'info'),
      ('phase_started', 'Discovery started', 'We began the discovery phase.', 'info'),
      ('milestone_completed', 'Kickoff completed', 'The kickoff milestone is complete.', 'success'),
      ('client_action_created', 'Action assigned: Upload logo', 'Please share your logo files when ready.', 'info')
  ) as e(event_type, title, description, importance)
  where not exists (select 1 from public.project_activity_events where project_id = v_project_id);

  update public.projects set status = 'active' where id = v_project_id and status = 'draft';
end $$;

-- Project Conversations Foundation (Part 2)

-- ---------------------------------------------------------------------------
-- project_conversations
-- ---------------------------------------------------------------------------
create table if not exists public.project_conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  subject text,
  conversation_type text not null default 'general',
  visibility text not null default 'client',
  status text not null default 'active',
  created_by_profile_id uuid references public.user_profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_conversations_visibility_check check (
    visibility in ('client', 'admin', 'internal')
  ),
  constraint project_conversations_status_check check (
    status in ('active', 'waiting_for_client', 'waiting_for_admin', 'resolved', 'archived')
  )
);

create index if not exists project_conversations_project_status_idx
  on public.project_conversations (project_id, status, updated_at desc);

-- ---------------------------------------------------------------------------
-- conversation_participants
-- ---------------------------------------------------------------------------
create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.project_conversations(id) on delete cascade,
  profile_id uuid not null references public.user_profiles(id) on delete cascade,
  role text not null,
  last_read_message_id uuid,
  joined_at timestamptz not null default now(),
  constraint conversation_participants_role_check check (role in ('admin', 'client')),
  constraint conversation_participants_conversation_profile_unique unique (conversation_id, profile_id)
);

create index if not exists conversation_participants_conversation_idx
  on public.conversation_participants (conversation_id);

create index if not exists conversation_participants_profile_idx
  on public.conversation_participants (profile_id);

-- ---------------------------------------------------------------------------
-- conversation_messages
-- ---------------------------------------------------------------------------
create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.project_conversations(id) on delete cascade,
  parent_message_id uuid references public.conversation_messages(id) on delete set null,
  sender_profile_id uuid references public.user_profiles(id) on delete set null,
  sender_role text not null default 'system',
  message_type text not null default 'text',
  body text not null default '',
  search_text text,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  is_pinned boolean not null default false,
  pinned_at timestamptz,
  pinned_by_profile_id uuid references public.user_profiles(id) on delete set null,
  edited_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint conversation_messages_sender_role_check check (
    sender_role in ('admin', 'client', 'system')
  ),
  constraint conversation_messages_message_type_check check (
    message_type in ('text', 'system', 'note', 'status', 'file', 'approval')
  ),
  constraint conversation_messages_status_check check (
    status in ('active', 'edited', 'deleted')
  )
);

create index if not exists conversation_messages_conversation_created_idx
  on public.conversation_messages (conversation_id, created_at asc);

create index if not exists conversation_messages_conversation_status_idx
  on public.conversation_messages (conversation_id, status);

-- ---------------------------------------------------------------------------
-- conversation_attachments (generic entity references)
-- ---------------------------------------------------------------------------
create table if not exists public.conversation_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.conversation_messages(id) on delete cascade,
  entity_module text not null,
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  constraint conversation_attachments_entity_unique unique (message_id, entity_module, entity_type, entity_id)
);

create index if not exists conversation_attachments_message_idx
  on public.conversation_attachments (message_id);

create index if not exists conversation_attachments_entity_idx
  on public.conversation_attachments (entity_module, entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- message_reactions (schema only — no Part 2 API)
-- ---------------------------------------------------------------------------
create table if not exists public.message_reactions (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.conversation_messages(id) on delete cascade,
  profile_id uuid not null references public.user_profiles(id) on delete cascade,
  reaction text not null,
  created_at timestamptz not null default now(),
  constraint message_reactions_unique unique (message_id, profile_id, reaction)
);

create index if not exists message_reactions_message_idx
  on public.message_reactions (message_id);

-- ---------------------------------------------------------------------------
-- conversation_drafts (schema only — no Part 2 API)
-- ---------------------------------------------------------------------------
create table if not exists public.conversation_drafts (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.project_conversations(id) on delete cascade,
  profile_id uuid not null references public.user_profiles(id) on delete cascade,
  body text not null default '',
  updated_at timestamptz not null default now(),
  constraint conversation_drafts_conversation_profile_unique unique (conversation_id, profile_id)
);

create index if not exists conversation_drafts_profile_idx
  on public.conversation_drafts (profile_id);

-- ---------------------------------------------------------------------------
-- conversation_events
-- ---------------------------------------------------------------------------
create table if not exists public.conversation_events (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.project_conversations(id) on delete cascade,
  event_type text not null,
  actor_type text not null default 'system',
  actor_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint conversation_events_actor_type_check check (
    actor_type in ('admin', 'client', 'system')
  )
);

create index if not exists conversation_events_conversation_created_idx
  on public.conversation_events (conversation_id, created_at desc);

-- ---------------------------------------------------------------------------
-- deferred FK: last_read_message_id
-- ---------------------------------------------------------------------------
alter table public.conversation_participants
  add constraint conversation_participants_last_read_fk
  foreign key (last_read_message_id) references public.conversation_messages(id) on delete set null;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists project_conversations_set_updated_at on public.project_conversations;
create trigger project_conversations_set_updated_at
before update on public.project_conversations
for each row execute function public.set_updated_at();

drop trigger if exists conversation_drafts_set_updated_at on public.conversation_drafts;
create trigger conversation_drafts_set_updated_at
before update on public.conversation_drafts
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS + grants
-- ---------------------------------------------------------------------------
alter table public.project_conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.conversation_attachments enable row level security;
alter table public.message_reactions enable row level security;
alter table public.conversation_drafts enable row level security;
alter table public.conversation_events enable row level security;

grant all on public.project_conversations to service_role;
grant all on public.conversation_participants to service_role;
grant all on public.conversation_messages to service_role;
grant all on public.conversation_attachments to service_role;
grant all on public.message_reactions to service_role;
grant all on public.conversation_drafts to service_role;
grant all on public.conversation_events to service_role;

-- ---------------------------------------------------------------------------
-- backfill: default General conversation per project
-- ---------------------------------------------------------------------------
insert into public.project_conversations (
  project_id,
  title,
  subject,
  conversation_type,
  visibility,
  status,
  metadata
)
select
  p.id,
  'General',
  null,
  'general',
  'client',
  'active',
  '{}'::jsonb
from public.projects p
where not exists (
  select 1
  from public.project_conversations pc
  where pc.project_id = p.id
    and pc.conversation_type = 'general'
    and pc.title = 'General'
);

insert into public.conversation_participants (conversation_id, profile_id, role)
select
  pc.id,
  up.id,
  up.role
from public.project_conversations pc
join public.projects p on p.id = pc.project_id
join public.user_profiles up
  on up.role = 'admin'
  or (up.role = 'client' and up.client_id = p.client_id)
where pc.title = 'General'
  and pc.conversation_type = 'general'
  and not exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = pc.id
      and cp.profile_id = up.id
  );

insert into public.conversation_events (conversation_id, event_type, actor_type, metadata)
select
  pc.id,
  'conversation_created',
  'system',
  jsonb_build_object('source', 'migration_backfill')
from public.project_conversations pc
where pc.title = 'General'
  and pc.conversation_type = 'general'
  and not exists (
    select 1
    from public.conversation_events ce
    where ce.conversation_id = pc.id
      and ce.event_type = 'conversation_created'
  );

-- Signature Engine Foundation (Part 9)
-- Provider-agnostic signing requests, participants, sessions, and events.

-- Allow signed document status
alter table public.documents drop constraint if exists documents_status_check;
alter table public.documents
  add constraint documents_status_check check (
    status in (
      'draft', 'generated', 'sent', 'viewed', 'approved', 'rejected', 'signed',
      'expired', 'archived', 'cancelled'
    )
  );

alter table public.documents
  add column if not exists signed_at timestamptz,
  add column if not exists signed_by uuid references public.user_profiles(id) on delete set null;

-- ---------------------------------------------------------------------------
-- signature_requests
-- ---------------------------------------------------------------------------
create table if not exists public.signature_requests (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_id uuid not null references public.document_versions(id) on delete restrict,
  status text not null default 'draft',
  provider text not null default 'internal_approval',
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint signature_requests_status_check check (
    status in ('draft', 'pending', 'signing', 'completed', 'cancelled', 'expired')
  )
);

create unique index if not exists signature_requests_active_document_idx
  on public.signature_requests (document_id)
  where status in ('draft', 'pending', 'signing');

create index if not exists signature_requests_document_idx
  on public.signature_requests (document_id, created_at desc);

-- ---------------------------------------------------------------------------
-- signature_participants
-- ---------------------------------------------------------------------------
create table if not exists public.signature_participants (
  id uuid primary key default gen_random_uuid(),
  signature_request_id uuid not null references public.signature_requests(id) on delete cascade,
  role text not null default 'signer',
  name text not null,
  email text not null,
  client_contact_id uuid references public.client_contacts(id) on delete set null,
  status text not null default 'pending',
  signed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint signature_participants_status_check check (
    status in ('pending', 'signing', 'signed', 'declined', 'cancelled')
  )
);

create index if not exists signature_participants_request_idx
  on public.signature_participants (signature_request_id, sort_order);

-- ---------------------------------------------------------------------------
-- signature_sessions
-- ---------------------------------------------------------------------------
create table if not exists public.signature_sessions (
  id uuid primary key default gen_random_uuid(),
  signature_request_id uuid not null references public.signature_requests(id) on delete cascade,
  participant_id uuid not null references public.signature_participants(id) on delete cascade,
  provider text not null,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz,
  ip text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint signature_sessions_status_check check (
    status in ('active', 'completed', 'cancelled')
  )
);

create index if not exists signature_sessions_request_idx
  on public.signature_sessions (signature_request_id, started_at desc);

-- ---------------------------------------------------------------------------
-- signature_events (append-only)
-- ---------------------------------------------------------------------------
create table if not exists public.signature_events (
  id uuid primary key default gen_random_uuid(),
  signature_request_id uuid not null references public.signature_requests(id) on delete cascade,
  participant_id uuid references public.signature_participants(id) on delete set null,
  session_id uuid references public.signature_sessions(id) on delete set null,
  event_type text not null,
  actor_type text not null default 'system',
  actor_user_profile_id uuid references public.user_profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists signature_events_request_idx
  on public.signature_events (signature_request_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists signature_requests_set_updated_at on public.signature_requests;
create trigger signature_requests_set_updated_at
before update on public.signature_requests
for each row execute function public.set_updated_at();

drop trigger if exists signature_participants_set_updated_at on public.signature_participants;
create trigger signature_participants_set_updated_at
before update on public.signature_participants
for each row execute function public.set_updated_at();

drop trigger if exists signature_sessions_set_updated_at on public.signature_sessions;
create trigger signature_sessions_set_updated_at
before update on public.signature_sessions
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS + grants
-- ---------------------------------------------------------------------------
alter table public.signature_requests enable row level security;
alter table public.signature_participants enable row level security;
alter table public.signature_sessions enable row level security;
alter table public.signature_events enable row level security;

grant all on public.signature_requests to service_role;
grant all on public.signature_participants to service_role;
grant all on public.signature_sessions to service_role;
grant all on public.signature_events to service_role;

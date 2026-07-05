-- Notification center: user-scoped attention layer (separate from activity history).

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  event_type text not null,
  title text not null,
  message text,
  severity text not null default 'info',
  is_read boolean not null default false,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint notifications_severity_check check (
    severity in ('info', 'success', 'warning', 'critical')
  )
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_profile_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_profile_id, is_read)
  where is_read = false;

alter table public.notifications enable row level security;

grant all on public.notifications to service_role;

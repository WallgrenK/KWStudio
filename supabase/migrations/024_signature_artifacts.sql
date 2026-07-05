-- Handwritten signature artifacts (Part 12)

create table if not exists public.signature_artifacts (
  id uuid primary key default gen_random_uuid(),
  signature_request_id uuid not null references public.signature_requests(id) on delete cascade,
  signature_session_id uuid not null references public.signature_sessions(id) on delete cascade,
  participant_id uuid not null references public.signature_participants(id) on delete cascade,
  format text not null default 'svg',
  storage_path text not null,
  preview_path text,
  width integer not null,
  height integer not null,
  stroke_count integer not null,
  content_hash text not null,
  created_at timestamptz not null default now(),
  constraint signature_artifacts_format_check check (format in ('svg', 'png'))
);

create unique index if not exists signature_artifacts_session_idx
  on public.signature_artifacts (signature_session_id);

create index if not exists signature_artifacts_request_idx
  on public.signature_artifacts (signature_request_id, created_at desc);

alter table public.signature_artifacts enable row level security;

grant all on public.signature_artifacts to service_role;

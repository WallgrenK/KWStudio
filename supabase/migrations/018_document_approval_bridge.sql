-- Document approval bridge (Part 5)
-- Lightweight approval fields on documents. Designed for future Approval Engine migration.

alter table public.documents
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.user_profiles(id) on delete set null,
  add column if not exists rejected_at timestamptz,
  add column if not exists rejected_by uuid references public.user_profiles(id) on delete set null,
  add column if not exists approval_comment text;

create index if not exists documents_client_status_idx
  on public.documents (client_id, status, updated_at desc);

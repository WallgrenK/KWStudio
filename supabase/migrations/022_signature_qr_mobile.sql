-- QR / mobile signing session tokens (hash-only storage)

alter table public.signature_sessions
  add column if not exists signing_token_hash text,
  add column if not exists signing_token_expires_at timestamptz,
  add column if not exists mobile_status text;

alter table public.signature_sessions drop constraint if exists signature_sessions_mobile_status_check;
alter table public.signature_sessions
  add constraint signature_sessions_mobile_status_check check (
    mobile_status is null or mobile_status in ('pending', 'opened', 'completed', 'cancelled', 'expired')
  );

create unique index if not exists signature_sessions_signing_token_hash_idx
  on public.signature_sessions (signing_token_hash)
  where signing_token_hash is not null and status = 'active';

create index if not exists signature_sessions_mobile_status_idx
  on public.signature_sessions (signature_request_id, mobile_status);

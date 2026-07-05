-- Document PDF artifacts (Part 7)
-- PDF binaries live in Supabase Storage; metadata only in Postgres.

alter table public.document_render_artifacts
  add column if not exists mime_type text,
  add column if not exists file_name text;

comment on column public.document_render_artifacts.storage_path is
  'Supabase Storage object path for pdf/email targets; null for inline html.';

comment on column public.document_render_artifacts.mime_type is
  'MIME type of stored artifact, e.g. application/pdf for render_target pdf.';

comment on column public.document_render_artifacts.file_name is
  'Safe download file name for client/admin PDF responses.';

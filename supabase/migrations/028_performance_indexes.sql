-- Batch 2 performance: indexes for common admin list queries.

create index if not exists project_conversations_admin_updated_idx
  on public.project_conversations (updated_at desc)
  where status <> 'archived';

create index if not exists project_assets_admin_updated_idx
  on public.project_assets (updated_at desc)
  where status <> 'deleted';

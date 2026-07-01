create table if not exists public.lead_ai_insights (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  summary text not null,
  recommended_service text not null,
  pitch text not null,
  email_subject text not null,
  email_body text not null,
  raw_response jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists lead_ai_insights_lead_id_idx
on public.lead_ai_insights(lead_id);

create index if not exists lead_ai_insights_created_at_idx
on public.lead_ai_insights(created_at);

alter table public.lead_ai_insights enable row level security;

grant select on public.lead_ai_insights to anon;
grant select, insert, update, delete on public.lead_ai_insights to service_role;

drop policy if exists "Demo admin can read lead AI insights" on public.lead_ai_insights;
create policy "Demo admin can read lead AI insights"
on public.lead_ai_insights for select
to anon
using (true);


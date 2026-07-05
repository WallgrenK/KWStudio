-- Workspace settings foundation: site_settings key-value store + finance_settings extensions.
-- Tax settings (finance_tax_settings) are unchanged.

-- ---------------------------------------------------------------------------
-- site_settings
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid null
);

alter table public.site_settings
  add column if not exists value jsonb default '{}'::jsonb,
  add column if not exists updated_at timestamptz default now(),
  add column if not exists updated_by uuid null;

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

revoke all on public.site_settings from anon;
revoke all on public.site_settings from authenticated;
revoke all on public.site_settings from public;
grant select, insert, update, delete on public.site_settings to service_role;

-- ---------------------------------------------------------------------------
-- finance_settings extensions
-- ---------------------------------------------------------------------------
alter table public.finance_settings
  add column if not exists default_currency text default 'SEK',
  add column if not exists default_vat_rate numeric default 25,
  add column if not exists default_payment_account text default '1930',
  add column if not exists fiscal_year_label text default 'Calendar year (Jan–Dec)',
  add column if not exists invoice_number_prefix text default '',
  add column if not exists payment_terms_days integer default 30,
  add column if not exists invoice_footer text default '',
  add column if not exists vat_number text default '',
  add column if not exists phone text default '',
  add column if not exists website text default '',
  add column if not exists address text default '';

-- ---------------------------------------------------------------------------
-- Seed site_settings category defaults
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value)
values
  (
    'workspace',
    jsonb_build_object(
      'workspaceName', 'KWStudio',
      'workspaceEmail', 'hello@kwstudio.se',
      'timezone', 'Europe/Stockholm',
      'language', 'Swedish',
      'locale', 'sv-SE'
    )
  ),
  (
    'business',
    jsonb_build_object(
      'companyName', 'KWStudio AB',
      'organizationNumber', '',
      'vatNumber', '',
      'address', 'Stockholm, Sweden',
      'contactEmail', 'hello@kwstudio.se',
      'phone', '',
      'website', 'kwstudio.se',
      'description', 'Web design and development'
    )
  ),
  (
    'branding',
    jsonb_build_object(
      'brandColor', '#2E75BD',
      'typography', 'Inter',
      'logoUrl', null,
      'faviconUrl', null
    )
  ),
  (
    'website',
    jsonb_build_object(
      'seoTitle', '',
      'seoDescription', '',
      'socialLinks', '',
      'maintenanceMode', false,
      'contactEmail', '',
      'contactPhone', '',
      'analyticsId', '',
      'publicBaseUrl', null,
      'portalTitle', 'KWStudio Client Portal',
      'uploadLimitMb', 50,
      'fileRetentionDays', 365,
      'allowedPortalFeatures', '[]'::jsonb
    )
  ),
  (
    'ai',
    jsonb_build_object(
      'defaultModel', 'gpt-4.1',
      'systemPrompt', '',
      'toolAccess', 'Enabled for admin tools',
      'provider', 'openai',
      'temperature', 0.7,
      'maxTokens', 4096
    )
  ),
  (
    'email',
    jsonb_build_object(
      'fromName', 'KWStudio',
      'fromAddress', 'hello@kwstudio.se',
      'replyTo', 'hello@kwstudio.se',
      'signature', ''
    )
  ),
  (
    'appearance',
    jsonb_build_object(
      'theme', 'System',
      'density', 'Comfortable',
      'sidebarBehavior', 'Expanded on desktop',
      'animations', true
    )
  ),
  (
    'security',
    jsonb_build_object(
      'sessionTimeoutMinutes', 480,
      'allowedOrigins', '[]'::jsonb,
      'inviteTtlDays', 7,
      'passwordMinLength', 8
    )
  ),
  (
    'developer',
    jsonb_build_object(
      'featureFlags', '{}'::jsonb,
      'crm', jsonb_build_object(
        'defaultLeadOwner', null,
        'defaultPipelineStage', null
      ),
      'projects', jsonb_build_object(
        'defaultProjectStatus', null,
        'deliveryStages', '[]'::jsonb
      ),
      'documents', jsonb_build_object(
        'defaultSignatureExpiryDays', 30,
        'defaultTemplateId', null
      )
    )
  )
on conflict (key) do nothing;

-- Migrate legacy maintenance_mode key into website settings when present.
do $$
declare
  legacy_value jsonb;
begin
  select value into legacy_value
  from public.site_settings
  where key = 'maintenance_mode'
  limit 1;

  if legacy_value is not null then
    update public.site_settings
    set value = jsonb_set(
      value,
      '{maintenanceMode}',
      case
        when jsonb_typeof(legacy_value) = 'boolean' then legacy_value
        when legacy_value #>> '{}' = 'true' then 'true'::jsonb
        else 'false'::jsonb
      end,
      true
    )
    where key = 'website';

    delete from public.site_settings where key = 'maintenance_mode';
  end if;
end
$$;

-- Ensure finance_settings singleton row exists.
insert into public.finance_settings (
  company_name,
  organisation_number,
  accounting_plan,
  default_currency,
  default_vat_rate,
  default_payment_account,
  fiscal_year_label,
  owner_expense_recognition_account,
  owner_expense_reimbursement_account
)
select
  'KWStudio AB',
  '',
  'BAS 2024',
  'SEK',
  25,
  '1930',
  'Calendar year (Jan–Dec)',
  '2018',
  '2018'
where not exists (select 1 from public.finance_settings limit 1);

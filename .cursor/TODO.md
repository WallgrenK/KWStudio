# TODO

## Completed

- Public KWStudio website foundation.
- Admin shell and navigation.
- CRM/lead views.
- SCB lead discovery.
- Lead scoring and AI pitch support.
- Finance CSV import.
- Receipt upload and matching.
- Journal draft, approval, posting, and cancellation.
- General Ledger.
- Trial balance.
- Income statement.
- Balance sheet.
- SIE4 export with regression protection.
- VAT reporting (periods, locking, validation, cross-report regression).
- **Priority 10 — Swedish Tax Estimation (Enskild Firma):**
  - Tax engine, forecast engine, validation framework, cash planning.
  - `finance_tax_settings` migration and API.
  - Tax Estimation orchestrator and Finance API routes.
  - Live TaxesTab UI (KPI grids, breakdown, scenario calculator).
  - Full 18-scenario regression matrix (`taxEstimationMatrix.regression.ts`).
- **Priority 10.8 — Finance stabilization:**
  - Shared finance formatters and feedback components.
  - Consistent StatusBadge, loading, empty, and error patterns across live tabs.
  - Ready for Priority 11 (Bank Sync).

## In Progress

- Owner Expenses & Reimbursements (hardening).
- Replacing remaining demo/static Finance tabs with backend data where endpoints exist.

## Next

- **Priority 11 — Bank Sync** (choose provider, security model, sync schedule).
- Apply `013_finance_tax_settings.sql` in all environments and configure municipality/rates.

## Backlog

- Bank sync.
- Automatic reconciliation.
- Year-end closing.
- Invoice integration.
- Payroll support.
- Multi-company support.
- Production RLS hardening.

## Tax Estimation — Future Work

- Municipality rate lookup (`GET /finance/tax-estimation/municipalities` or external cache).
- Skatteverket / NE export compatibility (link to same breakdown, no filing).
- Aktiebolag tax estimation support.
- Live municipal tax rate updates from external sources.
- Optional forecast bar chart / SVG line chart in TaxesTab.

## Ideas

- Finance export history table.
- Admin audit log.
- Better period locking.
- More granular finance validation dashboard.
- CRM automation for follow-ups.
- Lead source quality analytics.

## Technical Debt

- Split `_PageViews.tsx` Finance sections into focused route modules when explicitly scheduled.
- Wire demo Finance tabs (Bookkeeping/Journal, Invoices, Expenses, Assets, Settings, Ledger report card) to backend APIs.
- Consolidate duplicate demo supplier/category rules in `finance.ts`.
- Confirm missing migrations for journal entries, journal lines, finance accounts, suppliers, and VAT periods.
- Confirm API Worker production hosting and deployment process.
- Harden development/demo RLS policies before production.
- Optional: Supabase integration tests for tax orchestrator against seeded fixtures.

# AI Context

## Current Implementation Status

KWStudio has a public agency website, an admin dashboard, Supabase-backed CRM/finance data, and a separate TypeScript API Worker for backend logic.

The most recent active work focused on Finance Priority 7: SIE4 Export. The exporter now generates Swedish SIE4 files from posted journal entries and journal lines, not raw transactions. It supports CRLF line endings, UTF-8, optional opening/closing balances, validation, downloadable responses, metadata headers, and regression checks for SIE compatibility concerns.

## Completed Modules

Completed or substantially implemented:

- Public KWStudio marketing site.
- Admin shell and admin navigation.
- Lead/CRM views.
- SCB lead discovery integration.
- Website audit and lead scoring workflows.
- Finance CSV import.
- Finance receipts upload and matching.
- Supplier categorization support.
- Journal draft creation from finance transactions.
- Journal approval and posting flow.
- General Ledger account views.
- Trial balance.
- Income statement.
- Balance sheet.
- VAT calculation and VAT period scaffolding.
- SIE4 export.

Partially implemented or mixed live/static:

- Finance dashboard cards.
- Admin dashboard summaries.
- Invoices, expenses, assets, tax reserve, and some operational widgets.
- Some admin views use static data from `app/data`.

## Current Active Priority

Priority 8: Owner Expenses & Reimbursements.

Expected direction:

- Track owner-paid business expenses.
- Attach receipts.
- Create appropriate journal entries.
- Maintain clear reimbursement status.
- Preserve posted-entry immutability.

TODO:

- Confirm exact data model and workflow before implementation.

## Upcoming Priorities

1. Owner Expenses & Reimbursements.
2. VAT Reporting.
3. Tax Estimation.
4. Bank Sync.
5. Automatic Reconciliation.
6. Year-End Closing.
7. Invoice Integration.
8. Payroll Support.
9. Multi-company Support.

## Known Technical Decisions

- Backend services own business logic.
- Frontend services should remain API wrappers.
- Finance reports must derive from posted journal entries and journal lines.
- `finance_transactions` are import/payment records, not accounting truth.
- Posted journal entries are immutable.
- SIE export must remain deterministic and importer-compatible.
- Supabase service role must remain backend-only.
- Schema changes should be delivered through migrations.

## Known Limitations

- Some admin sections still rely on static data.
- Journal and finance account migrations may exist outside the visible frontend repository; confirm before schema changes.
- Production hosting details for the API Worker are TODO.
- RLS policies are marked as development/demo in existing migrations and need production hardening.
- SIE export has local regression checks but has not been verified in real Fortnox, Visma, Bokio, or BL Administration import tools.

## Important AI Conventions

- Do not invent backend data if an endpoint exists.
- Do not calculate accounting reports from raw transactions.
- Do not use AI for finance source-of-truth generation.
- Keep API contracts backwards compatible.
- Prefer small patches over broad rewrites.
- Preserve current routing and admin UI patterns.
- Mark missing information as TODO instead of guessing.


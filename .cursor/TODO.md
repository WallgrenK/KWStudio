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

## In Progress

- Owner Expenses & Reimbursements.
- Continued hardening of finance workflows.
- Replacing static admin finance/demo data with backend-backed data where endpoints exist.

## Next

- Define owner expense schema and workflow.
- Add owner expense backend service and routes.
- Add owner expense UI in Finance.
- Ensure owner expense postings flow through journal entries.
- Add focused tests/regression checks for owner expense accounting.

## Backlog

- Production VAT reporting.
- Tax estimation.
- Bank sync.
- Automatic reconciliation.
- Year-end closing.
- Invoice integration.
- Payroll support.
- Multi-company support.
- Production RLS hardening.

## Ideas

- Finance export history table.
- Admin audit log.
- Better period locking.
- More granular finance validation dashboard.
- CRM automation for follow-ups.
- Lead source quality analytics.

## Technical Debt

- Confirm missing migrations for journal entries, journal lines, finance accounts, suppliers, and VAT periods.
- Split large admin page file into focused modules when explicitly scheduled.
- Replace remaining static admin data with backend APIs where appropriate.
- Confirm API Worker production hosting and deployment process.
- Harden development/demo RLS policies before production.
- Add broader backend test coverage for finance services.

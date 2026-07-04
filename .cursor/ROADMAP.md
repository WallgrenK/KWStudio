# Roadmap

## Implementation Roadmap

### 1. Core Finance ✅

Finance foundations are in place, including imports, finance transactions, category rules, receipt metadata, and backend services.

### 2. Posting Engine ✅

Journal draft creation, approval, posting, cancellation rules, and posted-entry immutability are implemented in the API Worker.

### 3. Reports ✅

Backend report services exist for income statement and balance sheet based on posted journal entries and journal lines.

### 4. Dashboard Finance ✅

Finance dashboard views exist in the admin UI. Some views still mix static/fallback data with backend-backed data.

### 5. Financial Statements ✅

Income statement and balance sheet services exist. They should continue to derive from posted accounting data.

### 6. General Ledger ✅

Ledger account views and trial balance logic exist in the API Worker. The General Ledger is based on posted journal entries and journal lines.

### 7. SIE4 Export ✅

SIE4 export is implemented in the backend and available from the Finance Reports UI. It exports posted journal entries only, skips empty verifications, uses deterministic `A` series numbering, supports optional opening/closing balances, validates balances, preserves UTF-8, and returns a downloadable `.se` file.

### 8. Owner Expenses & Reimbursements (Current)

Implement owner-paid business expense workflows.

Expected scope:

- Record owner-paid expenses.
- Attach receipts.
- Track reimbursement status.
- Generate correct journal entries.
- Preserve posted-entry immutability.

TODO:

- Confirm database schema and exact accounting treatment.

### 9. VAT Reporting ✅

Production-ready Swedish VAT reporting workflows are implemented.

Scope delivered:

- VAT boxes and period validation.
- Locking and lifecycle behavior.
- Cross-report and SIE compatibility regression coverage.

### 10. Tax Estimation ✅

Swedish Tax Estimation for Enskild Firma is implemented (Priority 10 complete).

Scope delivered:

- Pure tax, forecast, validation, and cash planning engines.
- `finance_tax_settings` migration and GET/PATCH settings API.
- Orchestrator wired to posted journals, income statement, trial balance, and VAT YTD.
- Live TaxesTab UI with dual KPI grids, confidence badge, scenario calculator.
- Full 18-scenario regression matrix (`npm run test:tax`).

Explicit non-goals (future):

- Skatteverket filing / NE XML.
- Municipality live lookup.
- Aktiebolag tax estimation.
- Live external tax rate feeds.

### 10.8 Finance Stabilization ✅

Finance module UX and maintainability pass before Bank Sync.

Scope delivered:

- Centralized formatting (`app/lib/financeFormat.ts`).
- Shared loading, error, setup, and validation UI components.
- Consistent `StatusBadge` registry for finance states.
- Page-level finance API load feedback with retry.
- VAT detail error aggregation fix (no stale closure drops).
- Deduplicated owner expense journal preview table.
- Removed unused imports and local duplicate formatters.

### 11. Bank Sync (Next)

Add direct bank sync when a provider is selected.

TODO:

- Choose provider.
- Define security model.
- Define sync schedule and reconciliation behavior.

### 12. Automatic Reconciliation

Match bank transactions, invoices, receipts, and journal entries automatically where confidence is high.

Expected scope:

- Matching rules.
- Manual review queue.
- Audit trail.
- No silent posting without defined approval rules.

### 13. Year-End Closing

Support Swedish year-end accounting workflows.

Expected scope:

- Closing entries.
- Result allocation.
- Opening balances for next year.
- Locked periods.

### 14. Invoice Integration

Integrate invoice generation or external invoice provider data.

Expected scope:

- Invoice lifecycle.
- Payment matching.
- Revenue journal entries.
- VAT handling.

### 15. Payroll Support (Future)

Future payroll support is planned but not currently active.

TODO:

- Define provider, legal requirements, and scope.

### 16. Multi-company Support

Future support for multiple companies.

Expected architectural impact:

- Company scoping on finance tables.
- Company-aware authentication/authorization.
- SIE exports per company.
- Settings per company.


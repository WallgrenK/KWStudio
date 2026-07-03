# Architecture

## Overall Architecture

KWStudio consists of three main layers:

- React frontend application.
- TypeScript API Worker.
- Supabase PostgreSQL database and authentication.

```mermaid
flowchart LR
  User[User / Admin] --> Frontend[React + React Router Frontend]
  Frontend --> SupabaseAuth[Supabase Auth]
  Frontend --> ApiWorker[KWStudio API Worker]
  Frontend --> SupabaseClient[Supabase Client]
  ApiWorker --> SupabaseService[Supabase Service Role Client]
  ApiWorker --> External[External Services: SCB, OpenAI, Website Checks]
  SupabaseClient --> Supabase[(Supabase PostgreSQL)]
  SupabaseService --> Supabase
```

## React Application

The React application is the user-facing and admin-facing frontend.

Key areas:

- Public marketing routes in `app/routes`.
- Admin views in `app/routes/admin`.
- Shared UI components in `app/components`.
- Frontend API wrappers in `app/services`.
- Static/fallback domain data in `app/data`.

The admin UI uses an `AdminShell` pattern with reusable panels, tables, tabs, metrics, and status badges.

## API Worker

The API Worker is a sibling TypeScript/Express project. It owns backend business logic and privileged Supabase access.

Core files:

- `src/index.ts` - Express app setup, CORS, JSON parsing, route registration.
- `src/routes/*` - Thin route modules.
- `src/services/*` - Business logic and domain rules.
- `src/middleware/*` - Authentication and authorization middleware.
- `src/lib/supabase.ts` - Service-role Supabase client.

Route modules should remain thin. Services should own validation, calculations, and persistence rules.

## Supabase

Supabase provides:

- PostgreSQL database.
- Auth sessions used by the frontend.
- RLS-protected tables.
- Service-role backend access through the API Worker.

Schema changes must be made with SQL migrations. Existing migrations define lead platform tables, AI insight tables, finance import tables, receipt tables, and development RLS policies.

## Authentication Approach

Frontend:

- Uses Supabase Auth sessions.
- Sends bearer tokens to the API Worker.

Backend:

- Uses `requireSupabaseAuth` middleware for authenticated routes.
- Uses service-role Supabase client for privileged database operations.

TODO:

- Confirm final production admin role model and RLS policy strategy.

## Services

Services contain domain logic:

- Finance import parsing and transaction persistence.
- Receipt upload, matching, extraction, and recalculation.
- Journal posting workflow.
- Ledger and trial balance calculations.
- Financial statements.
- VAT period generation.
- SIE4 export generation.
- Lead scoring and sales pitch generation.

## Routes

Routes should:

- Authenticate requests.
- Validate basic request shape.
- Call a service.
- Return typed JSON or file responses.
- Avoid embedding business rules.

## Data Flow

```mermaid
sequenceDiagram
  participant Admin
  participant Frontend
  participant API as API Worker
  participant DB as Supabase

  Admin->>Frontend: Uses admin interface
  Frontend->>API: Authenticated request
  API->>DB: Service-role query/mutation
  DB-->>API: Data
  API-->>Frontend: JSON or file response
  Frontend-->>Admin: UI update
```

## Finance Flow

Finance must flow from source data into immutable accounting records.

```mermaid
flowchart TD
  Import[CSV / Bank Import] --> Transactions[finance_transactions]
  Transactions --> Receipts[Receipts and Matching]
  Transactions --> Drafts[Journal Drafts]
  Receipts --> Drafts
  Drafts --> Approved[Approved Journal Entries]
  Approved --> Posted[Posted Journal Entries]
  Posted --> Ledger[General Ledger]
  Ledger --> TrialBalance[Trial Balance]
  TrialBalance --> Statements[Financial Statements]
  TrialBalance --> VAT[VAT Reports]
  TrialBalance --> SIE[SIE4 Export]
```

Rules:

- Posted journal entries and journal lines are the accounting source of truth.
- Raw transactions are not used directly for reports.
- Posted entries are immutable.
- SIE export includes only posted entries with journal lines.

## CRM Flow

```mermaid
flowchart TD
  Sources[Website / SCB / Manual Sources] --> Leads[Leads]
  Leads --> Audit[Website Audit]
  Leads --> Score[Lead Scoring]
  Audit --> Workspace[Lead Workspace]
  Score --> Workspace
  Workspace --> FollowUp[Follow-ups / Proposals / Sales Work]
```

## AI Generation Flow

```mermaid
sequenceDiagram
  participant Admin
  participant Frontend
  participant API as API Worker
  participant DB as Supabase
  participant AI as OpenAI

  Admin->>Frontend: Requests AI assistance
  Frontend->>API: Authenticated request
  API->>DB: Load lead/context data
  API->>AI: Generate insight or pitch
  AI-->>API: Generated output
  API->>DB: Store generated result when applicable
  API-->>Frontend: Return result
```

Important:

- AI is appropriate for lead, sales, copy, and audit assistance.
- AI is not appropriate for accounting source-of-truth generation or statutory exports.


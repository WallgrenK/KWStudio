# KWStudio Project

## Overview

KWStudio is a premium web design and development agency website with an internal admin platform for operations, lead management, finance, reporting, and automation. The public website is designed to feel handcrafted, trustworthy, modern, and conversion-oriented for small businesses and entrepreneurs.

The project combines a polished agency frontend with an operational dashboard backed by Supabase and a separate API Worker for backend business logic.

## Business Goals

- Present KWStudio as a premium web design and development agency.
- Convert visitors into project inquiries.
- Support internal lead qualification and CRM workflows.
- Centralize finance workflows such as imports, receipts, posting, reporting, VAT, and SIE export.
- Build toward a reliable small-business operating system for KWStudio.

## Current Stack

Frontend:

- React
- TypeScript
- React Router
- Vite
- Tailwind-style utility classes
- lucide-react icons
- Supabase client

Backend:

- Separate `KWStudio API Worker` project
- Node.js
- Express
- TypeScript
- Supabase service-role client
- OpenAI integration for selected AI-assisted workflows
- PDF and file processing for receipts

Database:

- Supabase PostgreSQL
- SQL migrations in `supabase/migrations`
- Row-level security enabled on finance and CRM tables where migrations define it

Deployment:

- Frontend target: Cloudflare Pages
- Backend target: TODO confirm production hosting target for the API Worker
- Database: Supabase

## Repository Structure

Main frontend repository:

- `app/` - React Router application source.
- `app/routes/` - Public and admin route entry files.
- `app/routes/admin/_PageViews.tsx` - Large admin page implementation file containing many admin views.
- `app/components/` - Shared UI, admin, and marketing components.
- `app/services/` - Frontend API wrappers for Supabase and KWStudio API Worker calls.
- `app/data/` - Static and fallback data used by public/admin interfaces.
- `app/styles/app.css` - Global styling.
- `supabase/migrations/` - Supabase SQL migrations.
- `public/` - Static assets.

Sibling backend repository:

- `../KWStudio API Worker/src/index.ts` - Express app bootstrap.
- `../KWStudio API Worker/src/routes/` - API route modules.
- `../KWStudio API Worker/src/services/` - Backend business logic.
- `../KWStudio API Worker/src/lib/supabase.ts` - Service-role Supabase client.
- `../KWStudio API Worker/src/middleware/` - Auth and admin middleware.

## Backend Architecture

The API Worker exposes Express routes grouped by domain. Routes authenticate requests and delegate business logic to services.

Known route areas:

- Root health/status routes.
- SCB company data routes.
- Lead/CRM routes.
- Finance routes.
- Receipt routes.

Known service areas:

- Finance CSV import and transaction listing.
- Journal entry creation, approval, posting, and cancellation.
- General Ledger, account ledger, and trial balance.
- Financial reports such as income statement and balance sheet.
- VAT calculations and VAT period handling.
- Receipt upload, extraction, matching, and recalculation.
- Supplier rules and categorization.
- SIE4 export.
- Website audit and lead AI assistance.

## Frontend Architecture

The frontend uses React Router with route modules under `app/routes`. Admin pages reuse a shared admin shell and UI building blocks such as tables, panels, cards, tabs, metrics, and status badges.

Frontend services in `app/services` wrap backend or Supabase calls. They should remain thin and typed. Business rules should stay in backend services when a backend endpoint exists.

## Supabase Usage

Supabase is used for:

- Authentication in the frontend.
- CRM/lead data.
- Finance import batches and transactions.
- Receipt metadata and matching.
- Finance category rules.
- Journal entries and journal lines in the API Worker.
- AI insight storage for leads.

Known migrations in this repository:

- `001_leads_platform.sql`
- `002_lead_ai_insights.sql`
- `003_finance_imports.sql`
- `004_finance_receipts.sql`

TODO:

- Confirm where journal entry, journal line, finance account, VAT period, and supplier table migrations are stored if they are not in this repository.

## Finance Module

The finance module is the most accounting-sensitive part of the project.

Current finance flow:

1. Import or load finance transactions.
2. Match receipts where required.
3. Create journal entry drafts from transactions.
4. Approve journal entries.
5. Post journal entries.
6. Use posted journal entries and journal lines as the General Ledger.
7. Generate trial balance, reports, financial statements, VAT calculations, and SIE4 exports from posted accounting.

Important rule:

- Reports and exports must never be calculated directly from raw `finance_transactions`.

## CRM Module

The CRM module supports lead discovery, lead status management, lead scoring, audit data, and lead workspaces. It uses Supabase for lead data and the API Worker for selected enrichment and AI-assisted workflows.

Known CRM features:

- Lead listing and filtering.
- SCB company search/import.
- Website audit summaries.
- Lead scoring and prioritization.
- Lead workspace views.
- AI pitch and email support.

## Dashboard

The admin dashboard summarizes operational state across leads, projects, websites, finance, tasks, pipeline, and recent activity. Some dashboard areas use live Supabase/backend data while others still use static data from `app/data`.

## AI Features

AI features exist for selected lead and sales workflows, including:

- Lead insights.
- Sales pitch generation.
- Website audit support.

Important:

- AI must not be used for accounting exports, journal posting, financial statements, VAT, or SIE generation.
- AI output should remain reviewable and should not silently mutate financial source-of-truth data.

## Future Vision

KWStudio is moving toward a complete internal business platform:

- Reliable finance ledger and Swedish accounting exports.
- Owner expenses and reimbursements.
- VAT reporting.
- Tax estimation.
- Bank sync and automatic reconciliation.
- Invoice integration.
- Year-end closing.
- Stronger CRM automation.
- More production-grade deployment and security hardening.


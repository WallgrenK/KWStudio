# Coding Style

## TypeScript

- Use strict TypeScript.
- Do not use `any`.
- Prefer explicit domain types for API payloads and service returns.
- Keep types close to the code that owns them unless they are reused broadly.
- Parse and validate unknown external data before trusting it.
- Avoid broad type assertions.

## Folder Structure

Frontend:

- Components: `app/components`.
- Admin components: `app/components/admin`.
- Routes: `app/routes`.
- Frontend service wrappers: `app/services`.
- Static/fallback data: `app/data`.
- Shared utilities: `app/lib` or `app/utils`.

Backend:

- Routes: `src/routes`.
- Services: `src/services`.
- Middleware: `src/middleware`.
- Config: `src/config`.
- Shared clients: `src/lib`.

## Naming Conventions

- Components: PascalCase.
- Hooks: `useSomething`.
- Services/functions: camelCase.
- Types: PascalCase.
- Constants: SCREAMING_SNAKE_CASE when truly global/static, otherwise descriptive camelCase.
- Database columns: snake_case.
- API JSON should match existing endpoint conventions.

## Components

- Prefer reusable components over duplicated markup.
- Keep components focused on rendering and interaction.
- Do not hide backend business logic in components.
- Use semantic HTML.
- Preserve existing admin UI patterns.
- Use lucide-react icons where an icon is appropriate.

## Hooks

- Use hooks for frontend stateful behavior.
- Keep hooks focused and testable.
- Avoid hooks that mix unrelated data fetching, formatting, and business rules.

## Services

Frontend services:

- Wrap API calls.
- Type request and response payloads.
- Handle authentication headers.
- Return predictable result shapes.
- Avoid business calculations when backend endpoints exist.

Backend services:

- Own business rules.
- Validate domain invariants.
- Keep calculations deterministic.
- Throw clear errors that routes can convert into responses.

## Utilities

- Add utilities only when reuse is clear.
- Prefer simple local helpers for single-file concerns.
- Do not introduce large abstractions for small workflows.

## Error Handling

- Backend routes should return clear status codes and error messages.
- Validation failures should be detailed enough to fix the input.
- Frontend should show actionable errors without exposing secrets.
- Do not swallow errors silently unless there is a documented fallback.

## API Patterns

- Keep route handlers thin.
- Use JSON for normal data responses.
- Use file responses only for downloads such as SIE export.
- Preserve existing endpoint paths and response shapes unless explicitly changing an API version.
- Keep CORS headers aligned with frontend needs.

## Formatting

- Follow existing file formatting.
- Keep line lengths readable.
- Avoid unnecessary whitespace churn.
- Do not reformat unrelated files.

## Imports

- Prefer existing alias patterns in the frontend.
- Keep imports grouped by external packages, components, data, services, and local helpers when practical.
- Remove unused imports.

## Comments

- Write comments only when they clarify non-obvious domain logic.
- Avoid comments that restate the code.
- Accounting and statutory export logic should include short comments when rules are easy to misinterpret.

## Performance Expectations

- Keep frontend bundles reasonable.
- Avoid unnecessary network requests.
- Avoid expensive calculations in render paths.
- Use backend aggregation for backend-owned data.
- Keep finance exports deterministic and efficient over the selected period.

## Accessibility Expectations

- Use semantic HTML.
- Provide visible focus states.
- Use labels for form controls.
- Preserve keyboard navigation.
- Use ARIA only when necessary.
- Maintain contrast against the premium minimalist palette.

## Testing Philosophy

- Add tests or regression checks for business-critical logic.
- Finance posting, reports, VAT, and SIE export should have focused regression protection.
- Prefer deterministic tests that do not require live external services.
- For UI changes, run `npm run typecheck` and `npm run build`.
- For API Worker changes, run `npx tsc --noEmit` and any relevant focused test scripts.


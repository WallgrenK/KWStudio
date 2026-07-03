# Design System

## Brand

KWStudio is a premium web design and development agency. The visual identity should feel handcrafted, calm, trustworthy, and modern. The design should avoid generic AI-template patterns.

Design principles:

- Premium over flashy.
- Simplicity over complexity.
- Consistency over variety.
- Whitespace is intentional.
- Every visual element supports the brand.

## Typography

- Headings should be confident, clear, and high contrast.
- Body copy should be easy to read.
- Keep body line length near 65-80 characters where possible.
- Use one H1 per page.
- Maintain clear heading hierarchy.

## Spacing

Use the established spacing scale:

- 4px
- 8px
- 12px
- 16px
- 24px
- 32px
- 48px
- 64px
- 96px
- 128px

Avoid random spacing values.

## Colors

Primary accent:

- KWStudio blue: `#2E75BD`

Base palette:

- White backgrounds.
- Near-black text.
- Light neutral grays.

Avoid:

- Bright gradients.
- Multiple competing accent colors.
- Heavy shadows.
- Overly colorful admin interfaces.

## Border Radius

- Use restrained radius.
- Cards and panels should feel modern but not playful.
- Admin UI currently uses rounded panels; preserve existing conventions unless a broader redesign is requested.

## Buttons

- Primary actions should use KWStudio blue.
- Secondary actions should use neutral borders/text.
- Buttons should have clear hover/focus states.
- Use icon + text for important commands when helpful.
- Disable buttons during async actions that should not run twice.

## Cards and Panels

- Cards should group related content.
- Do not nest cards unnecessarily.
- Use panels for admin sections.
- Keep card content concise and scannable.

## Tables

- Tables should prioritize readability and scanning.
- Use clear column names.
- Keep status values visually consistent.
- Avoid cramming unrelated actions into rows.

## Forms

- Inputs must have labels.
- Focus states should be visible.
- Use clear validation feedback.
- Keep forms compact but not cramped.
- Use checkboxes/toggles for binary settings.

## Navigation

- Preserve current routing and admin navigation.
- Navigation labels should be clear and stable.
- Do not move routes without explicit instruction.

## Icons

- Use lucide-react icons.
- Icons should support recognition, not decorate randomly.
- Pair icons with text for unfamiliar actions.

## Admin UI

The admin UI should feel operational, quiet, and efficient:

- Dense enough for repeated work.
- Clear section hierarchy.
- Minimal decorative elements.
- Consistent panels, tables, tabs, metrics, and status badges.
- Use live backend data where endpoints exist.

## Responsive Rules

- Build responsive-first.
- Ensure text does not overflow controls.
- Use grids that collapse cleanly.
- Preserve usable touch targets on mobile.
- Test important admin workflows at desktop and mobile widths when possible.

## Animation Philosophy

Allowed:

- Subtle hover transitions.
- Fade in.
- Slide up.

Avoid:

- Parallax.
- Heavy motion.
- Auto-playing decorative effects.

Animation should support the experience, not become the experience.

## Visual Consistency Guidelines

- Use KWStudio blue sparingly for actions and emphasis.
- Maintain generous whitespace.
- Avoid generic SaaS hero tropes in the public site.
- Avoid overuse of shadows.
- Keep finance/admin views practical and information-focused.


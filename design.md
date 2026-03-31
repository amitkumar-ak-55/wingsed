# WingsEd Web Design Guide

Last updated: March 31, 2026
Scope: Frontend page and component design standards for consistency across all UI work.

## 1. Design Principles

- Clarity first: users should understand what to do in under 3 seconds.
- High trust look: clean spacing, strong typography, clear hierarchy.
- Action-oriented flows: every page should have one primary CTA.
- Accessible by default: keyboard, contrast, semantic structure.
- Reuse before invent: prefer existing UI components and patterns.

## 2. Brand Foundations

Source of truth: frontend/src/app/globals.css

### Color Tokens

- Primary: `--color-primary` = `#0F172A`
- Primary light: `--color-primary-light` = `#1E293B`
- Primary hover: `--color-primary-hover` = `#334155`
- Accent gold: `--color-accent-gold` = `#F59E0B`
- Accent blue: `--color-accent-blue` = `#3B82F6`
- Surface background: `--background` = `#F8FAFC`
- Surface card: `--surface` = `#FFFFFF`
- Body text: `--foreground` = `#0F172A`
- Secondary text: `--text-secondary` = `#64748B`
- Muted text: `--text-muted` = `#94A3B8`
- Border: `--border` = `#E2E8F0`
- Success: `--color-success` = `#22C55E`
- WhatsApp: `--color-whatsapp` = `#25D366`

### Typography

- Base sans: Inter (`--font-inter`)
- Display/headings: Plus Jakarta Sans (`--font-jakarta`)
- Use `.font-display` for major headings and hero text.

### Mode

- Light mode only (current product direction).

## 3. Layout System

### Containers

- Page width target: `max-w-7xl` for most pages.
- Narrow content pages (policies/forms): `max-w-3xl` to `max-w-4xl`.
- Dashboard/admin dense data: `max-w-7xl` with responsive grids.

### Spacing Rhythm

- Section vertical spacing: `py-12` to `py-20`
- Card padding: `p-4`, `p-6`, or `p-8` depending on density
- Grid gaps: `gap-4`, `gap-6`, `gap-8`
- Keep consistent spacing increments (4/6/8/12/16 scale)

### Border Radius and Depth

- Primary cards: `rounded-xl` or `rounded-2xl`
- Buttons/inputs: `rounded-lg` to `rounded-xl`
- Shadows: subtle by default (`shadow-sm`/`shadow-md`), stronger only for hero/CTA cards

## 4. Component Rules

### Buttons

- Primary CTA: navy background, white text, clear hover state.
- Secondary CTA: outlined or light surface button.
- Destructive action: explicit danger style and confirmation flow.
- Never place two visual-primary actions side by side.

### Forms

- Always pair input with a visible label.
- Helper/error text below control only.
- Required fields marked consistently.
- Show loading and disabled states on submit.

### Cards

- Title, summary, and key meta should be visible without scrolling.
- Keep one card type per context (do not mix many visual styles in one grid).
- Empty state card must include next action.

### Tables and Admin Data

- Sticky or visible headers for long data lists.
- Search/filter controls above table.
- Row actions grouped and predictable (view/edit/delete order).

## 5. Motion and Interaction

Source of truth animations: frontend/src/app/globals.css

Use existing utility classes:
- `.animate-fade-in`
- `.animate-fade-in-up`
- `.animate-fade-in-scale`
- `.animate-slide-up`

Guidelines:
- Use motion to support hierarchy, not decoration.
- Prefer 200ms to 600ms durations.
- Use stagger classes (`animate-delay-100...500`) for list reveals.
- Disable autoplay-like behavior for critical content.

## 6. Page Blueprint Standards

### Marketing/Landing Pages

Recommended structure:
1. Hero (headline + subtext + primary CTA)
2. Credibility strip (logos/stats/testimonials)
3. Core value sections
4. Workflow/how-it-works
5. Final CTA

### Listing Pages (Universities)

Recommended structure:
1. Header + search/filter controls
2. Active filter summary
3. Results grid or table
4. Pagination
5. Empty state with reset filters CTA

### Detail Pages (University)

Recommended structure:
1. Hero summary (name, location, key badges)
2. Key stat cards
3. Tabbed deep details
4. Supporting actions (save, track, website, WhatsApp)

### Dashboard Pages

Recommended structure:
1. KPI strip
2. Main actionable list (applications/saved)
3. Contextual side panel or quick actions

### Admin Pages

Recommended structure:
1. Summary metrics
2. Search/filter + bulk controls
3. Data grid
4. Modal or inline edit flows

## 7. Accessibility and Content Rules

- Maintain visible focus states on all interactive controls.
- Use semantic headings (`h1` -> `h2` -> `h3`) in order.
- Text contrast must meet WCAG AA.
- Do not rely on color alone to indicate status.
- All icon-only buttons require accessible labels.
- Use concise, plain language for labels and CTA text.

## 8. Reuse Map (Current Codebase)

Primary reusable areas:
- `frontend/src/components/ui` (base UI primitives)
- `frontend/src/components/sections` (landing section patterns)
- `frontend/src/lib/utils.ts` (formatting helpers)
- `frontend/src/lib/validations.ts` (form schema patterns)
- `frontend/src/lib/compare-context.tsx` (state pattern reference)

## 9. Page Design Review Checklist

Before marking any page done:

1. Visual hierarchy is clear in first viewport.
2. Primary CTA is obvious and singular.
3. Spacing and typography follow this guide.
4. States are complete: loading, empty, error, success.
5. Keyboard navigation works end-to-end.
6. Mobile layout is usable and not cramped.
7. Colors use brand tokens from globals.css.
8. No one-off styles that duplicate existing components.

## 10. Change Process

When adding or changing UI patterns:

1. Reuse an existing pattern first.
2. If new pattern is needed, update this `design.md` with:
   - Purpose
   - Usage context
   - Do/Don't notes
3. Keep design decisions documented here to avoid style drift.

## 11. Live Inconsistencies Audit (Public Site)

Audit date: April 1, 2026
Audit target: https://www.wingsed.com public routes and signed-in public routes (no admin)
Brand target: Landing page blue-gold identity (navy + gold + blue accents) used on home hero.

Visited routes:
- /
- /universities
- /compare
- /onboarding
- /dashboard/saved
- /dashboard/applications
- /privacy
- /terms
- /sign-in
- /sign-up

### A. Visual Identity Inconsistencies

- Landing page has a strong navy-gold visual signature, but non-landing pages often fall back to neutral gray-blue UI styling.
- Some pages use legacy hard-coded hex values from older palette patterns instead of global brand tokens.
- CTA hierarchy is inconsistent: landing uses strong brand CTAs while secondary flows often look generic and less premium.
- Empty states differ in style and tone between Compare, Saved, and Applications pages.

### B. Cross-Page UX Inconsistencies

- Compare route behavior was inconsistent earlier (redirect to sign-in in one pass, then public empty-state in another pass).
- Onboarding and signed-in navigation include Saved/Applications links, but dashboard pages can present sparse states without a strong guided next action.
- Universities page repeatedly remains in Searching state in live checks, creating a broken-feeling experience.
- Clerk warning states and redirect warnings are visible in console, indicating outdated redirect prop usage and potentially confusing flow behavior.

### C. Reliability Signals Affecting Design Perception

- University/logo media requests showed repeated blocked requests in live inspection.
- Universities listing appeared stuck in loading text state during multiple checks.
- These reliability issues directly reduce perceived design quality even if visual styling is correct.

## 12. Correction Plan: Make All Pages Match Landing Brand

### Phase 1: Lock Brand Foundation (Highest Priority)

1. Replace hard-coded page colors with design tokens from globals.css only.
2. Define one canonical palette mapping for page backgrounds, cards, headings, links, borders, and primary/secondary CTAs.
3. Standardize heading style system so all major page headers use the same display typography and spacing rhythm as landing.

### Phase 2: Unify Shared Surfaces

1. Header consistency pass:
   - Keep nav structure consistent across signed-out and signed-in states.
   - Ensure action prominence and spacing matches landing.
2. Footer consistency pass:
   - Keep footer style constant and remove any page-specific visual drift.
3. Empty-state system:
   - Introduce one reusable empty-state pattern for Compare, Saved, Applications, and Universities fallback states.

### Phase 3: Page-by-Page Brand Alignment

1. Universities page:
   - Apply landing-style section heading language and visual hierarchy.
   - Make filter surface and results cards use tokenized accents (gold for labels/highlights, blue for interactive states).
   - Replace Searching-only dead state with proper loading, error, and retry UI.
2. Compare page:
   - Keep compare matrix in the same visual family as landing card system.
   - Improve empty state to match landing tone and CTA treatment.
3. Onboarding:
   - Keep form progression aligned to brand accents (gold progress emphasis, navy structure).
   - Ensure the final CTA style is identical to primary brand CTA behavior.
4. Saved and Applications:
   - Upgrade sparse states with action-oriented cards and clear next step CTAs.
   - Use consistent iconography, spacing, and status semantics.
5. Privacy and Terms:
   - Keep legal readability but apply branded heading and spacing system.

### Phase 4: Behavior and Reliability Fixes (Required for Perceived Quality)

1. Fix Universities API loading behavior so list and cards render reliably.
2. Resolve Compare route auth/redirect inconsistency and make route policy explicit.
3. Update Clerk redirect prop usage to current API to remove deprecated flow warnings.
4. Reduce failing media requests by normalizing image sources and fallback rendering.

### Phase 5: Validation Checklist for Completion

1. Every public page visually reads as one product family with navy-gold-blue signature.
2. Primary CTA style is identical across routes.
3. Loading, empty, and error states are present and consistent everywhere.
4. No major route shows stuck searching/loading behavior.
5. Signed-in route transitions feel coherent and do not unexpectedly redirect.

## 13. Implementation Order Recommendation

1. Token and shared component cleanup first.
2. Universities page reliability and styling second.
3. Compare and onboarding third.
4. Saved and applications fourth.
5. Legal pages polish last.

This order minimizes rework and produces visible consistency early.

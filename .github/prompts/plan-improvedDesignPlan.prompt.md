## Plan: Wingsed Inconsistency Remediation Board

Unify all audited routes under the landing-page brand system while eliminating reliability/auth regressions that currently degrade UX trust. Execute in six phases with reliability blockers first, then shared UI system, then route-level alignment. /compare policy is set to auth-required.

**Steps**
1. Phase 1 - Token and typography lock (estimated 6-8 hours)
   - Replace route-level hard-coded colors with globals token usage across app routes. 
   - Standardize page heading treatment to landing-style display hierarchy.
   - Normalize primary/secondary CTA variants and remove route-specific one-offs.
   - Dependencies: none.
   - Parallelism: Can run in parallel with Step 2.

2. Phase 2 - Shared surface consolidation (estimated 6-10 hours)
   - Align signed-out/signed-in header visual rhythm and action hierarchy.
   - Align footer spacing/colors to a single variant.
   - Introduce a reusable empty state pattern and adopt it in compare/saved/applications/universities fallback states.
   - Dependencies: none.
   - Parallelism: Can run in parallel with Step 1.

3. Phase 3 - Reliability fixes (estimated 10-14 hours)
   - Fix universities backend filtering query placeholder/indexing so loading resolves consistently.
   - Add explicit loading/error/retry UI states for universities listing fetch failures.
   - Enforce /compare auth-required policy in middleware and ensure deterministic redirect behavior.
   - Remove deprecated Clerk routing prop usage in sign-in/sign-up routes.
   - Replace fragile image onError sibling manipulation with resilient fallback rendering.
   - Dependencies: none, but Step 4 depends on this phase for trustworthy QA outcomes.

4. Phase 4 - Route-level brand alignment (estimated 12-18 hours)
   - Universities: bring filter/results surfaces into brand token system and aligned hierarchy.
   - Compare: align compare cards/empty state CTA tone with landing visual family while preserving auth-required behavior.
   - Onboarding: align progress emphasis and final CTA to brand primary action pattern.
   - Dashboard saved/applications: improve sparse states with guided action cards and consistent status semantics.
   - Privacy/terms: keep readability while applying branded heading/spacing system.
   - Dependencies: depends on Steps 1-3.
   - Parallelism: Universities/Compare/Onboarding can run in parallel subtracks after dependencies are complete.

5. Phase 5 - State-completeness and accessibility pass (estimated 4-6 hours)
   - Verify each audited route has complete loading/empty/error/success states.
   - Validate focus visibility, heading order, and icon-only control labeling.
   - Verify mobile layout density and CTA prominence consistency.
   - Dependencies: depends on Step 4.

6. Phase 6 - Regression verification and release gate (estimated 3-5 hours)
   - Run route smoke checks for /, /universities, /compare, /onboarding, /dashboard/saved, /dashboard/applications, /privacy, /terms, /sign-in, /sign-up.
   - Validate no stuck-searching behavior in universities with combined filters.
   - Validate compare redirect behavior is deterministic for guest sessions.
   - Validate no Clerk deprecation warnings and no critical broken image UI regressions.
   - Dependencies: depends on Step 5.

**Relevant files**
- c:\wingsed\frontend\src\app\globals.css - source of truth for brand token and animation utilities; enforce canonical palette mapping.
- c:\wingsed\frontend\src\app\layout.tsx - global shell and shared surfaces composition baseline.
- c:\wingsed\frontend\src\components\header.tsx - normalize nav action hierarchy and spacing across auth states.
- c:\wingsed\frontend\src\components\footer.tsx - unify footer appearance and spacing.
- c:\wingsed\frontend\src\components\ui\ - central button/card/input/select primitives to standardize CTAs and surfaces.
- c:\wingsed\frontend\src\app\universities\page.tsx - loading/error/empty states and listing UI consistency.
- c:\wingsed\backend\src\modules\universities\universities.service.ts - likely filter query parameter indexing issue causing hanging searches.
- c:\wingsed\frontend\src\app\compare\page.tsx - compare empty/loading UX and auth-compatible behavior.
- c:\wingsed\frontend\src\middleware.ts - enforce auth-required policy for /compare consistently.
- c:\wingsed\frontend\src\app\sign-in\[[...sign-in]]\page.tsx - remove deprecated Clerk prop usage.
- c:\wingsed\frontend\src\app\sign-up\[[...sign-up]]\page.tsx - remove deprecated Clerk prop usage.
- c:\wingsed\frontend\src\app\universities\[id]\page.tsx - resilient media/logo fallback behavior.
- c:\wingsed\frontend\src\app\dashboard\saved\ - sparse/empty state brand alignment and CTA guidance.
- c:\wingsed\frontend\src\app\dashboard\applications\ - sparse/empty state brand alignment and status semantics.
- c:\wingsed\frontend\src\app\onboarding\ - progression and CTA brand consistency.
- c:\wingsed\frontend\src\app\privacy\ and c:\wingsed\frontend\src\app\terms\ - legal page spacing/heading system consistency.

**Verification**
1. Frontend static checks: run lint/typecheck in frontend package and resolve all newly introduced style/type violations.
2. Backend checks: run backend tests for universities module and ensure filter combinations return timely responses.
3. Manual route QA on desktop and mobile breakpoints for all audited routes with screenshots.
4. Console/network audit: ensure no Clerk deprecation warnings, no persistent loading loops, and graceful image fallback rendering on failed assets.
5. UX checklist audit against design guide sections 7, 9, and 12 for every touched route.

**Decisions**
- /compare policy is auth-required (selected by user during planning alignment).
- Scope includes public and signed-in public routes only; admin route restyling is excluded.
- Priority is reliability and UX trust first, then visual harmonization.

**Further Considerations**
1. Recommend creating a shared EmptyState component under frontend/src/components/ui to reduce future drift.
2. Recommend adding a lightweight CI check for disallowed hard-coded hex values in app routes.
3. Recommend recording approved CTA variants in design.md after implementation to keep guidance in sync.

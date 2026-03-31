## Plan: Full Truth Audit for Context Memory

This plan performs a strict, evidence-driven codebase audit in small chunks, then rewrites context_memory.md from verified code only. It explicitly captures active architecture plus legacy traces (removed/replaced logic still present in docs/env/config), with verification gates at each phase.

**Steps**
1. Phase 1: Baseline Inventory
1.1 Build authoritative file inventory for root, backend, frontend, and infrastructure files. Record only existing paths and current names.  
1.2 Identify critical config surfaces to audit: package manifests, tsconfig variants, Next/Nest configs, ESLint, PostCSS, Docker, Prisma, env examples, test configs.  
1.3 Output: inventory table + config-audit checklist.  
Dependency: none.

2. Phase 2: Tech Stack and Integration Matrix
2.1 Parse dependencies/devDependencies from frontend and backend manifests and map each library to purpose (auth, validation, ORM, security, UI, tooling).  
2.2 Cross-check env-example variables against actual runtime usage to classify each var as active, optional, or legacy trace.  
2.3 Extract runtime settings from app bootstraps (CORS, throttling, global prefix, validation, middleware).  
2.4 Output: verified tech stack matrix + third-party integrations matrix + legacy trace list.  
Dependency: depends on 1.

3. Phase 3: Folder Architecture Mapping (Frontend + Backend)
3.1 Map backend modules, controllers, services, guards, filters, decorators, prisma layer, scripts.  
3.2 Map frontend app-router routes, route groups, middleware behavior, providers, components, state/context, utility layers.  
3.3 Mark removed/replaced logic evidence: references still mentioned in docs or env but not present in runtime modules/files.  
3.4 Output: architecture tree with role-by-folder and “current vs legacy” annotations.  
Dependency: depends on 1; parallelizable with Step 2.2 after baseline.

4. Phase 4: End-to-End Data Flow Trace
4.1 Build frontend-to-backend endpoint map from API client functions to backend controller routes (method + path + auth requirement).  
4.2 Build backend-to-database map from services to Prisma model operations and relation/cascade behavior.  
4.3 Trace auth/token pipeline: Clerk middleware, bearer propagation, ClerkAuthGuard, AdminGuard, webhook signature verification.  
4.4 Trace hidden/background logic: scripts, seed/migration flows, scheduled or sync-like jobs, non-obvious middleware and global filters.  
4.5 Output: key data-flow narratives with path-based evidence and edge-case notes.  
Dependency: depends on 2 and 3.

5. Phase 5: Drift Audit Against Existing Context File
5.1 Read current context_memory.md section-by-section and compare each claim against audited evidence.  
5.2 Label each claim: Accurate, Outdated, Partial, or Removed.  
5.3 Produce a drift ledger capturing what was removed/replaced, what changed names/locations, and what is newly introduced.  
5.4 Output: signed-off correction checklist used as source for rewrite.  
Dependency: depends on 2, 3, and 4.

6. Phase 6: Full Rewrite of context_memory.md
6.1 Rewrite from scratch using your required structure: Tech Stack, Folder Architecture, Key Data Flows, Auth/Security, External Dependencies.  
6.2 Add explicit “Legacy/Removed/Residual Traces” subsection to prevent future confusion.  
6.3 Add operational sections you requested: env matrix, startup commands, migration/seed workflow, testing/coverage status.  
6.4 Keep the document evidence-forward and concise, with path references for major claims.  
Dependency: depends on 5.

7. Phase 7: Verification and Quality Gate
7.1 Re-validate every major section claim against source files (strict evidence mode).  
7.2 Consistency check: endpoint names, auth guards, model fields, enum values, package versions, and route accessibility.  
7.3 Hallucination guard: no undocumented assumptions, no inferred modules without file evidence, and all legacy flags justified.  
7.4 Final sign-off checklist before handoff.  
Dependency: depends on 6.

**Relevant files**
- [context_memory.md](context_memory.md) — target document to be fully rewritten based on verified code truth.
- [docker-compose.yml](docker-compose.yml) — infrastructure and DB service truth.
- [backend/package.json](backend/package.json) — backend stack and scripts.
- [frontend/package.json](frontend/package.json) — frontend stack and scripts.
- [backend/.env.example](backend/.env.example) — backend integration/env surface (including potential legacy traces).
- [frontend/.env.example](frontend/.env.example) — frontend integration/env surface (including potential legacy traces).
- [backend/src/main.ts](backend/src/main.ts) — global middleware, CORS, validation, route prefix.
- [backend/src/app.module.ts](backend/src/app.module.ts) — module wiring, throttling, global guards/filters.
- [frontend/src/middleware.ts](frontend/src/middleware.ts) — route protection and auth middleware behavior.
- [frontend/src/lib/api.ts](frontend/src/lib/api.ts) — FE-BE endpoint mapping and error handling pattern.
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma) — DB schema, models, enums, relations.
- [backend/prisma/seed.ts](backend/prisma/seed.ts) — seed/background data initialization logic.
- [backend/src/modules](backend/src/modules) — controller/service route and business logic source of truth.
- [frontend/src/app](frontend/src/app) — App Router architecture and page flows.
- [frontend/src/lib/compare-context.tsx](frontend/src/lib/compare-context.tsx) — hidden client state flow.
- [backend/src/common/guards/clerk-auth.guard.ts](backend/src/common/guards/clerk-auth.guard.ts) — auth token verification.
- [backend/src/common/guards/admin.guard.ts](backend/src/common/guards/admin.guard.ts) — role-based admin protection.
- [backend/src/modules/webhooks/webhooks.controller.ts](backend/src/modules/webhooks/webhooks.controller.ts) — webhook signature validation and sync path.

**Verification**
1. Structural verification: ensure every section in rewritten context file maps to at least one existing source file.
2. Endpoint verification: reconcile frontend API client calls with backend controller decorators and paths.
3. Security verification: confirm middleware/guard/filter chain from frontend route protection to backend authorization.
4. Data verification: reconcile Prisma schema fields and relations with service usage and DTO mappings.
5. Legacy-trace verification: for each removed/replaced item, provide explicit evidence path showing mismatch or absence.
6. Operational verification: confirm scripts/commands/env variables against package scripts, docker, prisma, and test configs.
7. Final diff review: ensure old inaccuracies are removed and no stale phase/status statements remain.

**Decisions**
- Include both current active logic and legacy traces of removed/replaced logic.
- Use strict evidence mode for major claims.
- Include operational sections (startup/env/migration/seed/test status) in the rewrite.
- No implementation changes to application code during audit; only context documentation update once evidence is complete.

**Further Considerations**
1. Legacy trace style recommendation: keep a compact table with columns Claim, Current Truth, Evidence, Action.
2. Drift maintenance recommendation: add a short “Last verified on” and “Audit scope” header in context_memory.md for future updates.
3. Optional hardening recommendation: after rewrite, run one quick automated validator step to catch any stale route or module references before finalizing.

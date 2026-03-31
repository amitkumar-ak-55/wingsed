# WingsEd Context Memory
Last verified: March 31, 2026
Audit scope: Repository truth from current files in root, backend, frontend, and configuration surfaces.

## 1. Tech Stack

### Frontend
- Framework: Next.js 16.1.6 App Router
- Language: TypeScript, React 19.2.3
- Styling: Tailwind CSS v4 via PostCSS plugin @tailwindcss/postcss
- UI primitives: custom components under src/components/ui plus @headlessui/react
- Auth client: @clerk/nextjs
- Validation: zod
- Utilities: clsx
- Font setup: Inter and Plus Jakarta Sans via next/font/google

### Backend
- Framework: NestJS 11.1.12
- Language: TypeScript, CommonJS runtime
- ORM: Prisma 5.22.0 and @prisma/client
- Database: PostgreSQL (Docker compose service included)
- Auth server SDK: @clerk/backend
- Security middleware: helmet
- Rate limiting: @nestjs/throttler
- Validation: class-validator, class-transformer
- Webhook signature verification: svix

### Database schema summary
- Provider: PostgreSQL
- Prisma models: User, StudentProfile, University, SavedUniversity, WhatsAppLead, Program, Application
- Prisma enums: Role, TestTaken, ApplicationStatus, CampusType, DegreeType
- Notable constraints:
  - Unique user email and clerkId
  - Unique SavedUniversity userId + universityId
  - Unique Application userId + universityId
  - Cascade deletes on key relations

## 2. Folder Architecture

### Root
- context_memory.md
- docker-compose.yml
- README.md
- SECURITY.md
- prd.md
- .github/prompts/plan-fullTruthAuditForContextMemory.prompt.md

### Backend architecture
- backend/src/main.ts
  - App bootstrap, helmet, CORS, global ValidationPipe, global prefix api
- backend/src/app.module.ts
  - Global ConfigModule, Throttler, global ThrottlerGuard, global AllExceptionsFilter
  - Feature modules: users, profile, universities, leads, webhooks, saved-universities, applications, admin
- backend/src/common
  - guards: clerk-auth.guard.ts, admin.guard.ts
  - filters: all-exceptions.filter.ts
  - decorators: current-user.decorator.ts
  - security tests: security.spec.ts, security-attacks.spec.ts
- backend/src/prisma
  - prisma.module.ts and prisma.service.ts
- backend/src/modules
  - users
  - profile
  - universities
  - leads
  - saved-universities
  - applications
  - admin
  - webhooks
- backend/prisma
  - schema.prisma, seed.ts, migrations
- backend/data
  - universities.json seed source
- backend/src/scripts
  - currently empty folder

### Frontend architecture
- frontend/src/app
  - layout.tsx: ClerkProvider and app Providers wrapper
  - providers.tsx: CompareProvider mount
  - middleware.ts: route protection rules
  - public routes: /, /universities, /universities/:id, /privacy, /terms, /sign-in, /sign-up
  - protected route groups include /dashboard and /admin
  - feature routes:
    - /universities
    - /universities/[id]
    - /compare
    - /onboarding
    - /dashboard/applications
    - /dashboard/saved
    - /admin
    - /admin/leads
    - /admin/universities
    - /admin/users
- frontend/src/lib
  - api.ts central HTTP client and endpoint wrappers
  - compare-context.tsx compare state provider
  - validations.ts zod schemas
  - utils.ts formatting helpers
- frontend/src/components
  - layout and shared feature components
  - ui component primitives
- frontend/src/types
  - API-facing and domain interfaces

## 3. Key Data Flows

### 3.1 Frontend to backend API flow
- Base URL resolved from NEXT_PUBLIC_API_URL, defaulting to http://localhost:4000
- All requests flow through apiClient in frontend/src/lib/api.ts
- API response contract pattern in frontend:
  - Returns object shapes with data and error semantics instead of throwing as primary pattern

#### Public API flow
- GET /api/universities
- GET /api/universities/countries
- GET /api/universities/count
- GET /api/universities/recommendations
- GET /api/universities/:id

#### Authenticated API flow
- Users
  - GET /api/users/me
  - PATCH /api/users/onboarding-step
- Profile
  - GET /api/profile
  - POST /api/profile
  - PATCH /api/profile
  - PATCH /api/profile/whatsapp-status
- Leads
  - POST /api/leads/whatsapp-redirect
  - PATCH /api/leads/:id/feedback
  - GET /api/leads/my-leads
- Saved universities
  - GET /api/saved-universities
  - GET /api/saved-universities/ids
  - POST /api/saved-universities/:universityId
  - DELETE /api/saved-universities/:universityId
  - GET /api/saved-universities/:universityId/status
- Applications
  - GET /api/applications
  - GET /api/applications/by-status
  - GET /api/applications/stats
  - POST /api/applications
  - PATCH /api/applications/:id
  - DELETE /api/applications/:id

#### Admin API flow
- GET /api/admin/stats
- GET /api/admin/leads
- GET /api/admin/leads/:id
- DELETE /api/admin/leads/:id
- GET /api/admin/universities
- GET /api/admin/universities/:id
- POST /api/admin/universities
- PATCH /api/admin/universities/:id
- DELETE /api/admin/universities/:id
- POST /api/admin/universities/:universityId/programs
- PATCH /api/admin/programs/:id
- DELETE /api/admin/programs/:id
- GET /api/admin/users
- PATCH /api/admin/users/:id/role

### 3.2 Backend to database flow
- Controllers delegate to services, services call PrismaService
- Universities service
  - Regular filtering through Prisma where clauses
  - Search path uses pg_trgm style fuzzy search via raw SQL and similarity scoring
  - Budget filter conversion uses INR to USD constant value 83
  - University detail includes programs relation
- Leads service
  - Persists WhatsAppLead and creates wa.me redirect URL with encoded message text
  - Updates StudentProfile.whatsAppRedirectAt when profile exists
- Applications service
  - Validates user and university existence
  - Enforces one application per user per university via unique key handling
  - Sets appliedAt when status transitions to APPLIED first time
- Admin service
  - Aggregates dashboard stats
  - University delete performs dependent deletes before main delete

### 3.3 Frontend state flow
- Compare feature state is in-memory React context only, max 3 IDs, no persistence layer
- Admin layout performs client-side admin gate check by calling /api/admin/stats with bearer token
- Onboarding flow tracks step and syncs onboarding step via backend endpoint

## 4. Auth and Security

### 4.1 Authentication and authorization
- Frontend route protection via Clerk middleware in frontend/src/middleware.ts
- Backend token verification in backend/src/common/guards/clerk-auth.guard.ts
  - Requires Authorization Bearer token
  - Verifies token using Clerk secret key
  - Fetches Clerk user and attaches request.user
- Role authorization in backend/src/common/guards/admin.guard.ts
  - Requires authenticated user
  - Checks DB role equals ADMIN

### 4.2 Webhook security
- Clerk webhook endpoint at POST /api/webhooks/clerk
- Signature verification with svix headers and configured CLERK_WEBHOOK_SECRET
- Webhooks controller marked with SkipThrottle

### 4.3 Global security controls
- helmet middleware enabled in bootstrap
- CORS configured from CORS_ORIGINS env, defaults to localhost frontend
- Global ValidationPipe with whitelist, forbidNonWhitelisted, transform enabled
- Global rate limiting via ThrottlerGuard
  - Default TTL 900000 ms and limit 100
- Global exception filter standardizes error response payload

## 5. External Dependencies and Integrations

### Active integrations
- Clerk authentication and user identity lifecycle
- Clerk webhook ingestion with signature validation
- PostgreSQL database via Prisma
- WhatsApp deep-link integration using wa.me and configured phone number
- Wikimedia remote image domain allowlist in Next image config

### Tooling dependencies
- ESLint with Next core-web-vitals and TypeScript rules
- Jest and ts-jest for backend tests
- Prisma CLI for generate, migrate, studio, seed

## 6. Hidden Logic and Background Behavior

### Hidden or non-obvious runtime logic
- Universities search has dual path:
  - non-search requests through Prisma query builder
  - search requests through raw SQL similarity logic
- Leads service has pending-feedback query helper intended for 24-hour follow-up checks
- Webhooks route bypasses throttling intentionally

### Background or scheduled jobs status
- No active scheduler or queue worker currently wired in runtime modules
- Leads pending-feedback query method is implemented in service logic; only scheduler/queue integration for automated follow-up remains TODO
- backend/src/scripts exists but is empty, so no active script jobs there

## 7. Operational Configuration and Runbook

### Root infrastructure
- docker-compose.yml defines PostgreSQL 16-alpine service and persistent volume only
- No Typesense container or Redis container defined in compose file

### Backend env matrix
- Required runtime env patterns:
  - DATABASE_URL
  - DIRECT_URL
  - CLERK_SECRET_KEY
  - CLERK_WEBHOOK_SECRET
  - WHATSAPP_PHONE_NUMBER
  - NODE_ENV
  - PORT
  - CORS_ORIGINS
  - THROTTLE_TTL
  - THROTTLE_LIMIT
- backend/.env.example still includes TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL, TYPESENSE_API_KEY entries

### Frontend env matrix
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_CLERK_SIGN_IN_URL
- NEXT_PUBLIC_CLERK_SIGN_UP_URL
- NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
- NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
- NEXT_PUBLIC_API_URL
- API_URL
- NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER
- frontend/.env.example still includes NEXT_PUBLIC_TYPESENSE_HOST, NEXT_PUBLIC_TYPESENSE_PORT, NEXT_PUBLIC_TYPESENSE_PROTOCOL, NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY entries

### Build and run scripts
- Backend package scripts include start, build, tests, prisma generate/migrate/studio, db seed/reset
- Frontend package scripts include dev, build, start, lint

### Test status view
- Backend has broad test coverage files across modules and common layers
- Jest global coverage thresholds are enforced in backend config
- Frontend test framework is not configured as a first-class test suite in package scripts

## 8. Legacy, Removed, or Residual Traces

### Confirmed residual traces
1. Typesense appears in env examples and test setup comments/vars, but no active Typesense runtime module is registered in backend app module.
2. backend/src/scripts is present but empty, while historical notes referenced script files.
3. Old assumptions that admin universities UI was missing are no longer true; route and page exist at frontend/src/app/admin/universities/page.tsx.

### Current interpretation
- Typesense is currently a residual integration surface, not active runtime behavior.
- Search is currently implemented with PostgreSQL and Prisma, including raw SQL fuzzy matching.

## 9. Evidence Index
- docker-compose.yml
- backend/package.json
- backend/tsconfig.json
- backend/nest-cli.json
- backend/jest.config.js
- backend/.env.example
- backend/src/main.ts
- backend/src/app.module.ts
- backend/src/common/guards/clerk-auth.guard.ts
- backend/src/common/guards/admin.guard.ts
- backend/src/common/filters/all-exceptions.filter.ts
- backend/src/modules/webhooks/webhooks.controller.ts
- backend/src/modules/universities/universities.controller.ts
- backend/src/modules/universities/universities.service.ts
- backend/src/modules/leads/leads.controller.ts
- backend/src/modules/leads/leads.service.ts
- backend/src/modules/applications/applications.controller.ts
- backend/src/modules/applications/applications.service.ts
- backend/src/modules/admin/admin.controller.ts
- backend/src/modules/admin/admin.service.ts
- backend/prisma/schema.prisma
- backend/prisma/seed.ts
- frontend/package.json
- frontend/tsconfig.json
- frontend/eslint.config.mjs
- frontend/postcss.config.mjs
- frontend/next.config.ts
- frontend/.env.example
- frontend/src/middleware.ts
- frontend/src/app/layout.tsx
- frontend/src/app/providers.tsx
- frontend/src/app/admin/layout.tsx
- frontend/src/lib/api.ts
- frontend/src/lib/compare-context.tsx
- frontend/src/app/onboarding/page.tsx
- frontend/src/app/dashboard/saved/page.tsx

## 10. Corrections Applied vs Previous Memory
- Removed stale phase-tracker narrative and replaced with current-state architecture truth.
- Updated frontend architecture to include active admin universities route and page.
- Updated backend architecture to reflect empty scripts folder and no active Typesense module.
- Rewrote data flow to include current endpoint inventory and service behavior.
- Added explicit residual traces section so removed or replaced logic is tracked without being mistaken as active.

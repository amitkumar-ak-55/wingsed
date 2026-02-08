# WingsEd Project Context Memory
> Snapshot Date: February 7, 2026  
> Status: Active Development — Phases 1, 2, 4, 6 Complete | Phases 3, 5 Pending

---

## 1. High-Level Project Goal(s) [Confirmed]

- **WingsEd**: A study abroad platform helping students discover and compare universities
- Target users: Students looking to study abroad (India-focused, based on INR currency usage)
- Core value proposition: University search, comparison, application tracking, and lead capture for counseling
- Admin can manually edit all university/program data via admin dashboard (no external API integrations)

---

## 2. Current State of the Project [Confirmed]

### Tech Stack
- **Frontend**: Next.js (v16.1.6) with App Router, TypeScript, Tailwind CSS **v4**, Clerk authentication, Turbopack
- **Backend**: NestJS on port 4000, Prisma 5.22.0, PostgreSQL on port 5432
- **Database**: PostgreSQL (via Docker Compose)
- **Tables**: users, student_profiles, universities, programs, whatsapp_leads, saved_universities, applications
- **Auth**: Clerk (JWT) — all admin routes protected by ClerkAuthGuard + AdminGuard

### Design System [Confirmed]
- Text color: `#111827`
- Muted text: `#6B7280`
- Background: `#F9FAFB`
- Primary blue: `#2563EB`
- Secondary purple: `#7C3AED` (used in detail page hero gradient)

### Tailwind CSS v4 Syntax Rules [CRITICAL]
- Gradients: Use `bg-linear-to-r` NOT `bg-gradient-to-r`
- Gradients: Use `bg-linear-to-br` NOT `bg-gradient-to-br`
- Z-index: Use `z-55` NOT `z-[55]`, use `z-60` NOT `z-[60]`
- These are breaking changes from Tailwind v3 → v4

### Git Status [Confirmed]
- Current branch: `feature/initial-review`
- Remote: Pushed to origin (GitHub)
- Local changes: Multiple phases of work applied, needs commit

### INR Conversion
- Hardcoded `* 83` multiplier throughout frontend (USD → INR)
- Backend stores all prices in USD
- Frontend displays in INR (₹) with `formatINR()` helper

---

## 3. Completed Features [Confirmed]

### Original Features (pre-expansion):
- Admin Dashboard (stats, leads, universities CRUD, users)
- Compare Universities feature (compare bar, side-by-side)
- Application Tracker (CRUD with status pipeline)
- University search/filtering (country, budget, text search, pagination)
- Onboarding flow with lead capture (5-step: country, budget, field, test, intake)
- User profiles (student profile with preferences)
- Saved universities functionality (bookmark/unbookmark)
- WhatsApp lead capture (redirect + feedback tracking)

### Expansion Work Completed This Session:
- **Phase 1**: Database Schema Redesign (14 new university fields + Program model)
- **Phase 2**: Seed Data (51 universities, 122 programs across 10 countries)
- **Phase 4**: Admin Panel expansion (full university + program CRUD with all fields)
- **Phase 6**: Frontend Detail Page complete redesign (tabbed, rich data display)
- **Test Fix**: Fixed 3 TypeScript compilation errors in `universities.controller.spec.ts`

---

## 4. Decisions Made [Confirmed]

### Code Review Fixes (6 total, applied to `frontend/src/app/admin/leads/page.tsx`)

1. **Defensive handling for `lead.redirectedAt`**
   - Change: `{lead.redirectedAt ? formatDate(lead.redirectedAt) : "—"}`
   - Reason: `formatDate()` produces "Invalid Date" if null

2. **Clear error state on successful fetch**
   - Change: Added `setError(null)` in success branch of `fetchLeads()`
   - Reason: Stale error state persisted after successful retry

3. **Better budget display logic**
   - Change: Multi-condition display showing "From X" / "Up to X" / full range / "—"
   - Reason: Budget showed `₹0` when only min or max was set

4. **Accessible labels for select elements**
   - Change: Added `<label className="sr-only" htmlFor="...">` with matching `id` attributes
   - Targets: Country filter (`country-filter`) and Feedback filter (`feedback-filter`)

5. **Fixed stale state in handleSearch**
   - Changes: Removed direct `fetchLeads()` call from `handleSearch`, added `search` to useEffect deps
   - Reason: `setPage(1)` is async; `fetchLeads()` read stale `page` from closure

6. **Proper result checking in handleDelete**
   - Change: Check `result.error` before calling `fetchLeads()`
   - Reason: `deleteAdminLead` returns `{ error: string }` on failure instead of throwing

### Architectural Decisions [Confirmed]

- **Phone number in onboarding**: Keep **optional** (not required)
- **New questionnaire questions planned**: Academic Background, Work Experience (deferred)
- **Error handling pattern**: API functions return `{ data?, error? }` objects, not exceptions
- **University data scope**: ALL countries equally, not just US-focused
- **Program-level data**: YES, program-level (e.g., MS Computer Science at MIT)
- **Similar colleges feature**: DROPPED — not worth the complexity
- **Non-technical editing**: Admin panel should allow non-technical users to edit data easily
- **Data sourcing**: Manual entry via admin panel (no external APIs)
- **Implementation order**: Schema + seed data first, then UI
- **Data accuracy**: Current seed data is mix of real (names, cities, countries) and estimated (rankings, financials, program requirements). Good enough for dev, needs verification for production. User confirmed "right now it is fine."

---

## 5. Problems Encountered & Resolved [Confirmed]

| Problem | Status | Solution |
|---------|--------|----------|
| "Failed to fetch" errors in frontend | Resolved | Backend wasn't running; started with `npm run start:dev` |
| "Can't reach database server at localhost:5432" | Resolved | PostgreSQL wasn't running; user started Docker/database |
| `npx prisma db seed` exit code 1 | Resolved | TypeScript type issues with CampusType enum; fixed with explicit cast `as CampusType` |
| Tailwind v4 gradient syntax | Resolved | `bg-gradient-to-r` → `bg-linear-to-r`, `bg-gradient-to-br` → `bg-linear-to-br` |
| Tailwind v4 z-index syntax | Resolved | `z-[60]` → `z-60`, `z-[55]` → `z-55` |
| Test spec TypeScript errors (3 errors) | Resolved | Added all 13 new fields to `mockUniversity` in `universities.controller.spec.ts` |
| Detail page only showed basic info | Resolved | Complete redesign of `universities/[id]/page.tsx` with all new fields |
| Admin DTOs only had 8 fields | Resolved | Expanded to include all 21 university fields + full program DTOs |
| Program orphan records on university delete | Resolved | Added `program.deleteMany` + `savedUniversity.deleteMany` + `application.deleteMany` before `university.delete` |
| `findById` didn't return programs | Resolved | Added `include: { programs: true }` to `universities.service.ts` |

---

## 6. Constraints, Preferences, and Rules [Confirmed]

### User Preferences
- Prefers short, direct answers
- Asks for yes/no when appropriate
- Wants to understand system behavior (e.g., token limits, context window)
- Wants comprehensive context_memory.md to survive context window resets

### Technical Constraints
- Windows OS environment
- PostgreSQL required (via Docker or local)
- Clerk authentication integration
- Tailwind CSS v4 (different syntax from v3 — see Section 2)
- Next.js 16.1.6 with Turbopack

---

## 7. Project Structure [Confirmed]

```
wingsed/
├── context_memory.md          ← THIS FILE
├── docker-compose.yml
├── prd.md
├── README.md
├── backend/
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── data/
│   │   └── universities.json       ← 51 universities, 122 programs (seed source)
│   ├── prisma/
│   │   ├── schema.prisma           ← 5 enums, 7 models
│   │   ├── seed.ts                 ← Reads universities.json, creates with nested programs
│   │   └── migrations/
│   │       ├── 20260129183729_init/
│   │       ├── 20260204184150_add_saved_universities/
│   │       ├── 20260204192443_add_applications/
│   │       └── 20260206192454_add_university_details_and_programs/  ← Phase 1
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── common/
│       │   ├── decorators/  (current-user.decorator.ts)
│       │   ├── filters/     (http-exception.filter.ts)
│       │   └── guards/      (clerk-auth.guard.ts, admin.guard.ts)
│       ├── modules/
│       │   ├── admin/           ← EXPANDED: admin.controller.ts, admin.service.ts, admin.module.ts
│       │   ├── applications/
│       │   ├── leads/
│       │   ├── profile/
│       │   ├── saved-universities/
│       │   ├── typesense/
│       │   ├── universities/    ← universities.service.ts (findById now includes programs)
│       │   ├── users/
│       │   └── webhooks/
│       ├── prisma/   (prisma.module.ts, prisma.service.ts)
│       └── scripts/  (typesense-clear.ts, typesense-sync.ts)
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── eslint.config.mjs
│   └── src/
│       ├── middleware.ts
│       ├── app/
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.tsx              ← Landing page
│       │   ├── providers.tsx
│       │   ├── admin/
│       │   │   ├── layout.tsx        ← Admin sidebar nav
│       │   │   ├── page.tsx          ← Admin dashboard stats
│       │   │   ├── leads/page.tsx    ← Leads management (6 code review fixes applied)
│       │   │   ├── universities/page.tsx  ← REWRITTEN: Full CRUD with tabbed form + programs
│       │   │   └── users/page.tsx    ← User management + role assignment
│       │   ├── compare/              ← University comparison
│       │   ├── dashboard/            ← Student dashboard
│       │   ├── onboarding/           ← 5-step onboarding flow
│       │   ├── universities/
│       │   │   ├── page.tsx          ← University browse/list (Phase 5 target)
│       │   │   └── [id]/page.tsx     ← REDESIGNED: Rich detail page with tabs
│       │   ├── sign-in/, sign-up/
│       │   ├── privacy/, terms/
│       │   └── ...
│       ├── components/
│       │   ├── header.tsx, footer.tsx
│       │   ├── compare-bar.tsx, compare-button.tsx
│       │   ├── save-button.tsx, track-button.tsx
│       │   ├── whatsapp-button.tsx
│       │   ├── index.ts              ← Barrel exports
│       │   ├── sections/             ← Landing page sections
│       │   └── ui/                   ← Reusable UI components (Card, Button, Input, Skeleton, etc.)
│       ├── data/
│       │   ├── constants.ts          ← COUNTRIES array, FIELDS, etc.
│       │   ├── testimonials.ts
│       │   └── index.ts
│       ├── lib/
│       │   ├── api.ts                ← EXPANDED: All API functions including admin program CRUD
│       │   ├── compare-context.tsx
│       │   ├── utils.ts              ← formatINR, formatUSD, getCountryFlag helpers
│       │   ├── validations.ts
│       │   └── index.ts
│       └── types/
│           └── index.ts              ← EXPANDED: University (24 fields), Program (17 fields)
```

---

## 8. Database Schema [Confirmed — Complete]

### Enums
```prisma
enum Role { STUDENT, ADMIN, COUNSELOR }
enum TestTaken { IELTS, GRE, NONE }
enum ApplicationStatus { RESEARCHING, PREPARING, APPLIED, ACCEPTED, REJECTED }
enum CampusType { URBAN, SUBURBAN, RURAL }        ← Phase 1
enum DegreeType { BACHELORS, MASTERS, PHD, DIPLOMA, CERTIFICATE }  ← Phase 1
```

### Models Summary
| Model | Table Name | Fields | Notes |
|-------|-----------|--------|-------|
| User | users | 7 | Clerk integrated, has role enum |
| StudentProfile | student_profiles | 12 | 1:1 with User, onboarding data |
| University | universities | 24 | Expanded in Phase 1 (14 new fields) |
| Program | programs | 18 | NEW in Phase 1, belongs to University |
| WhatsAppLead | whatsapp_leads | 11 | Lead tracking |
| SavedUniversity | saved_universities | 4 | Many-to-many User↔University |
| Application | applications | 11 | Application tracker with status pipeline |

### University Model Fields [Complete — 24 fields]
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| name | String | Required |
| country | String | Required, indexed |
| city | String | Required |
| tuitionFee | Int | Annual tuition in USD, indexed |
| publicPrivate | String | "Public" or "Private" |
| logoUrl | String? | University logo |
| imageUrl | String? | **Phase 1** Campus/banner image |
| websiteUrl | String? | University website |
| description | String? | Brief description |
| address | String? | **Phase 1** Full address |
| qsRanking | Int? | **Phase 1** QS World Ranking, indexed |
| timesRanking | Int? | **Phase 1** THE Ranking |
| usNewsRanking | Int? | **Phase 1** US News Ranking |
| acceptanceRate | Float? | **Phase 1** e.g., 0.07 = 7% |
| applicationFee | Int? | **Phase 1** In USD |
| campusType | CampusType? | **Phase 1** URBAN/SUBURBAN/RURAL |
| totalStudents | Int? | **Phase 1** Total enrolled |
| internationalStudentPercent | Float? | **Phase 1** e.g., 0.23 = 23% |
| foodHousingCost | Int? | **Phase 1** Annual in USD |
| avgScholarshipAmount | Int? | **Phase 1** In USD |
| employmentRate | Float? | **Phase 1** e.g., 0.94 = 94% |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

**Relations**: `savedBy` (SavedUniversity[]), `applications` (Application[]), `programs` (Program[])

### Program Model Fields [Complete — 18 fields]
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| universityId | String (FK) | CASCADE delete, indexed |
| name | String | e.g., "MS Computer Science", indexed |
| degreeType | DegreeType | BACHELORS/MASTERS/PHD/etc., indexed |
| department | String? | e.g., "School of Engineering" |
| duration | String? | e.g., "2 years" |
| tuitionFee | Int? | Program-specific (overrides university) |
| description | String? | |
| applicationDeadline | DateTime? | Next upcoming deadline |
| intakes | String[] | e.g., ["Fall", "Spring"] |
| greRequired | Boolean | Default false |
| greMinScore | Int? | |
| gmatRequired | Boolean | Default false |
| gmatMinScore | Int? | |
| ieltsMinScore | Float? | e.g., 6.5 |
| toeflMinScore | Int? | e.g., 90 |
| gpaMinScore | Float? | e.g., 3.0 on 4.0 scale |
| createdAt, updatedAt | DateTime | Auto |

### WhatsAppLead Model Fields [Complete — 11 fields]
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| clerkId | String | Indexed |
| email | String | |
| name | String? | |
| country | String? | |
| budgetMin | Int? | |
| budgetMax | Int? | |
| targetField | String? | |
| messageText | String | Pre-filled WhatsApp message |
| redirectedAt | DateTime | Default now() |
| feedbackAt | DateTime? | |
| feedback | String? | "connected" or "no_response" |

### Application Model Fields [11 fields]
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| userId | String (FK) | Indexed, CASCADE |
| universityId | String (FK) | CASCADE |
| status | ApplicationStatus | Default RESEARCHING, indexed |
| program | String? | Program name text |
| intake | String? | e.g., "Fall 2026" |
| notes | String? | Personal notes |
| deadline | DateTime? | |
| appliedAt | DateTime? | |
| createdAt, updatedAt | DateTime | Auto |
| @@unique | [userId, universityId] | One app per university per user |

---

## 9. API Endpoints [Complete]

### Public Endpoints (no auth)
| Method | Path | Handler | Notes |
|--------|------|---------|-------|
| GET | /api/universities | findMany | Pagination, filters (country, budget, search) |
| GET | /api/universities/countries | getCountries | Unique country list |
| GET | /api/universities/count | getCount | Total count for landing page |
| GET | /api/universities/:id | findById | **Now includes programs** (Phase 6 fix) |
| GET | /api/universities/recommendations | getRecommendations | Personalized, fills gaps with affordable options |

### Authenticated Endpoints (ClerkAuthGuard)
| Method | Path | Handler | Notes |
|--------|------|---------|-------|
| GET | /api/users/me | getCurrentUser | |
| PATCH | /api/users/onboarding-step | updateOnboardingStep | |
| GET/PATCH | /api/profile | getProfile/updateProfile | |
| POST | /api/leads/whatsapp-redirect | createWhatsAppLead | Returns leadId + redirectUrl |
| PATCH | /api/leads/:id/feedback | updateWhatsAppFeedback | connected/no_response |
| GET/POST/DELETE | /api/saved-universities/* | CRUD | |
| GET | /api/saved-universities/ids | getSavedUniversityIds | Quick check for UI |
| GET/POST/PATCH/DELETE | /api/applications/* | CRUD | |
| GET | /api/applications/by-status | getApplicationsByStatus | Grouped |
| GET | /api/applications/stats | getApplicationStats | Summary counts |

### Admin Endpoints (ClerkAuthGuard + AdminGuard)
| Method | Path | Handler | Notes |
|--------|------|---------|-------|
| GET | /api/admin/stats | getDashboardStats | Totals, today, this week, by country |
| GET | /api/admin/leads | getAllLeads | Paginated, filterable |
| GET | /api/admin/leads/:id | getLeadById | |
| DELETE | /api/admin/leads/:id | deleteLead | |
| GET | /api/admin/universities | getAllUniversities | **Now includes programs** |
| POST | /api/admin/universities | createUniversity | **All 21 fields** |
| GET | /api/admin/universities/:id | getUniversityById | **NEW (Phase 4)** with programs |
| PATCH | /api/admin/universities/:id | updateUniversity | **All 21 fields** |
| DELETE | /api/admin/universities/:id | deleteUniversity | **Cascades programs, saved, applications** |
| POST | /api/admin/universities/:universityId/programs | createProgram | **NEW (Phase 4)** |
| PATCH | /api/admin/programs/:id | updateProgram | **NEW (Phase 4)** |
| DELETE | /api/admin/programs/:id | deleteProgram | **NEW (Phase 4)** |
| GET | /api/admin/users | getAllUsers | Paginated, filterable |
| PATCH | /api/admin/users/:id/role | updateUserRole | STUDENT/ADMIN/COUNSELOR |

---

## 10. Frontend Types [Complete — from `frontend/src/types/index.ts`]

### University Interface (24 fields)
```typescript
interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  tuitionFee: number;           // USD annual
  publicPrivate: "Public" | "Private" | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  description: string | null;
  imageUrl: string | null;       // Phase 1
  address: string | null;        // Phase 1
  qsRanking: number | null;     // Phase 1
  timesRanking: number | null;   // Phase 1
  usNewsRanking: number | null;  // Phase 1
  acceptanceRate: number | null; // Phase 1 — 0.07 = 7%
  applicationFee: number | null; // Phase 1
  campusType: "URBAN" | "SUBURBAN" | "RURAL" | null;  // Phase 1
  totalStudents: number | null;  // Phase 1
  internationalStudentPercent: number | null; // Phase 1
  foodHousingCost: number | null;     // Phase 1
  avgScholarshipAmount: number | null; // Phase 1
  employmentRate: number | null;       // Phase 1
  programs?: Program[];          // Optional relation
  createdAt: string;
  updatedAt: string;
}
```

### Program Interface (17 fields)
```typescript
interface Program {
  id: string;
  universityId: string;
  name: string;
  degreeType: "BACHELORS" | "MASTERS" | "PHD" | "DIPLOMA" | "CERTIFICATE";
  durationMonths: number | null;
  tuitionFee: number | null;
  applicationDeadline: string | null;
  intakeSeason: string | null;
  description: string | null;
  requiresGRE: boolean;
  requiresGMAT: boolean;
  minIELTS: number | null;
  minTOEFL: number | null;
  minGPA: number | null;
  departmentUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**NOTE**: Frontend Program interface uses `durationMonths`, `intakeSeason`, `requiresGRE`, `requiresGMAT`, `minIELTS`, `minTOEFL`, `minGPA`, `departmentUrl` — slightly different field names from Prisma schema which uses `duration`, `intakes`, `greRequired`, `gmatRequired`, `ieltsMinScore`, `toeflMinScore`, `gpaMinScore`. The admin DTOs bridge this gap.

---

## 11. Frontend API Client [Complete — from `frontend/src/lib/api.ts`]

### Key Functions (658 lines total)
- `apiClient<T>(endpoint, options)` — Core fetch wrapper with token auth, error handling
- Public: `getUniversities`, `getCountries`, `getUniversityCount`, `getUniversityById`, `getRecommendations`
- Auth: `getCurrentUser`, `updateOnboardingStep`, `getProfile`, `updateProfile`, `createWhatsAppLead`, `updateWhatsAppFeedback`
- Saved: `getSavedUniversities`, `getSavedUniversityIds`, `saveUniversity`, `unsaveUniversity`
- Applications: `getApplications`, `getApplicationsByStatus`, `getApplicationStats`, `createApplication`, `updateApplication`, `deleteApplication`
- Admin: `getAdminStats`, `getAdminLeads`, `deleteAdminLead`, `getAdminUniversities`, `createAdminUniversity`, `updateAdminUniversity`, `deleteAdminUniversity`, `getAdminUniversityById` (**new**), `createAdminProgram` (**new**), `updateAdminProgram` (**new**), `deleteAdminProgram` (**new**), `getAdminUsers`, `updateAdminUserRole`
- Convenience: `api` object wrapping all functions with simpler return types

### Admin University Create Data Type (21 fields)
```typescript
data: {
  name: string; country: string; city: string; tuitionFee: number;
  publicPrivate: string; logoUrl?: string; websiteUrl?: string;
  description?: string; imageUrl?: string; address?: string;
  qsRanking?: number; timesRanking?: number; usNewsRanking?: number;
  acceptanceRate?: number; applicationFee?: number; campusType?: string;
  totalStudents?: number; internationalStudentPercent?: number;
  foodHousingCost?: number; avgScholarshipAmount?: number; employmentRate?: number;
}
```

### Admin Program Functions
```typescript
createAdminProgram(token, universityId, data: Record<string, unknown>)
updateAdminProgram(token, programId, data: Record<string, unknown>)
deleteAdminProgram(token, programId)
```

---

## 12. Backend Admin Service DTOs [Complete — from `backend/src/modules/admin/admin.service.ts`]

### CreateUniversityDto (21 fields)
- Required: name, country, city, tuitionFee, publicPrivate
- Optional: logoUrl, websiteUrl, description, imageUrl, address, qsRanking, timesRanking, usNewsRanking, acceptanceRate, applicationFee, campusType (CampusType), totalStudents, internationalStudentPercent, foodHousingCost, avgScholarshipAmount, employmentRate

### UpdateUniversityDto (21 fields)
- All optional, nullable numeric fields accept `number | null` for clearing values

### CreateProgramDto (13 fields)
- Required: name, degreeType (DegreeType)
- Optional: durationMonths, tuitionFee, applicationDeadline (string → Date), intakeSeason, description, requiresGRE, requiresGMAT, minIELTS, minTOEFL, minGPA, departmentUrl

### UpdateProgramDto (13 fields)
- All optional, nullable fields accept `type | null`

### Important Service Behaviors
- `createUniversity` and `updateUniversity` — return with `include: { programs: true }`
- `deleteUniversity` — cascades: deletes programs, saved_universities, applications first, then university
- `createProgram` — verifies university exists, converts `applicationDeadline` string → Date
- `updateProgram` — converts `applicationDeadline` string → Date or null
- `getAllUniversities` — always includes programs in response
- `getUniversityById` — includes programs, throws NotFoundException if missing
- Imports: `CampusType, DegreeType` from `@prisma/client`

---

## 13. University Detail Page [Complete — `frontend/src/app/universities/[id]/page.tsx`]

### Page Structure (~798 lines)
- **Client-side rendered** (`"use client"`)
- Fetches via `getUniversityById(id)` on mount
- Loading state with Skeleton components

### Helper Components (defined inline)
1. **StatCard** — icon, label, value with color-coded bg (blue/green/purple/amber/rose/indigo)
2. **RankBadge** — circular gold gradient badge with rank number, null-safe
3. **SectionTitle** — icon + h2 with blue accent
4. **DegreeTypeBadge** — colored pill per degree type (blue=Bachelors, purple=Masters, red=PhD, green=Diploma, amber=Certificate)
5. **ProgramCard** — full program card with requirements grid

### Layout Sections (top to bottom)
1. **Hero Card** — `bg-linear-to-r from-[#2563EB] to-[#7C3AED]` gradient banner, logo with shadow, name, city/country with flag emoji, badges (Public/Private, acceptance rate, program count), campus type
2. **Rankings Row** — Gold medal badges for QS, THE, US News rankings (only shown if data exists)
3. **Key Stats Grid** — 4 StatCards: Annual Tuition (₹), Acceptance Rate, Total Students, Employment Rate
4. **3-Tab Navigation** — `activeTab` state: "overview" | "programs" | "costs"
   - **Overview Tab**: description, campus & student life grid (campus type, address, international students, total students), top 4 programs preview
   - **Programs Tab**: programs grouped by degreeType, ProgramCard for each showing duration, tuition, intake, deadline, admission requirements (GRE/GMAT, IELTS, TOEFL, GPA), department URL link
   - **Costs & Aid Tab**: tuition/food/housing/application fee breakdown (all formatted in ₹), scholarship info with net cost calculation, employment rate circular SVG progress chart
5. **CTA Section** — "Visit Website" button + WhatsApp button

### Key Features
- Breadcrumb navigation (Home > Universities > [Name])
- Back button
- Save and Track buttons in hero card
- Country flag emojis via `getCountryFlag()` utility
- All monetary values displayed in INR (₹) using `formatINR()` with `* 83` conversion
- Graceful null handling — sections only render if data exists

---

## 14. Admin Universities Page [Complete — `frontend/src/app/admin/universities/page.tsx`]

### Page Structure (~894 lines)
- **Client-side rendered** (`"use client"`)
- Uses `useAuth()` from Clerk for token
- `useCallback` for `fetchUniversities` to avoid infinite loops

### Form Data Types
```typescript
interface UniversityFormData {
  name, country, city, tuitionFee, publicPrivate, logoUrl, websiteUrl, description,
  imageUrl, address, qsRanking, timesRanking, usNewsRanking, acceptanceRate,
  applicationFee, campusType, totalStudents, internationalStudentPercent,
  foodHousingCost, avgScholarshipAmount, employmentRate  // all strings
}

interface ProgramFormData {
  name, degreeType, durationMonths, tuitionFee, applicationDeadline, intakeSeason,
  description, minIELTS, minTOEFL, minGPA, departmentUrl  // strings
  requiresGRE, requiresGMAT  // booleans
}
```

### University Form — 5 Tabs
1. **Basic Info** — name, country (dropdown), city, tuition fee, public/private, logo URL, website URL, image URL, description (textarea)
2. **Rankings** — QS ranking, THE ranking, US News ranking, acceptance rate, employment rate
3. **Campus** — campus type (dropdown: Urban/Suburban/Rural), address, total students, international student %
4. **Financial** — application fee, food & housing cost, avg scholarship amount
5. **Programs** — list of all programs with:
   - Program cards showing name, degree type badge, meta info (duration, tuition, intake, deadline)
   - Edit and Delete buttons per program
   - "Add Program" button at bottom

### Program Modal Form
- Name, Degree Type (dropdown), Duration (months), Tuition Fee, Intake Season, Application Deadline (date picker)
- Description (textarea)
- **Admission Requirements** section: GRE checkbox, GMAT checkbox, Min IELTS, Min TOEFL, Min GPA
- Department URL

### UI Features
- University cards show: logo, name, city/country with flag, tuition in USD, program count badge (blue), QS ranking badge (amber)
- Success toast notifications (green, top-right, auto-dismiss 3 seconds)
- Proper refresh after all CRUD operations
- Responsive grid layout
- Modal with `z-60` overlay and `z-60` content (Tailwind v4 syntax)

### Data Flow
1. Form stores all values as strings
2. On submit, converts to numbers where needed (parseInt/parseFloat)
3. Empty strings sent as undefined (stripped from payload)
4. Updates call `fetchUniversities()` to refresh list

---

## 15. Backend Universities Service [Key Changes]

### `universities.service.ts` Changes (Phase 6)
- `findById(id)` — **Changed**: Now uses `include: { programs: true }` instead of bare `findUnique`
- Return type changed from explicit `Promise<University | null>` to inferred (because Prisma return type changes with include)
- `findMany` — Unchanged, still paginated without programs (list view doesn't need them yet)
- `getRecommendations` — Unchanged, no programs included
- INR_TO_USD_RATE = 83 (constant at top of file)
- Budget filters convert INR input to USD for query

---

## 16. Test File Fix [Confirmed]

### `universities.controller.spec.ts`
- **Problem**: 3 TypeScript compilation errors — `mockUniversity` was missing all 13 new fields added in Phase 1
- **Solution**: Added all 13 fields to `mockUniversity` object with `null` values: `imageUrl`, `address`, `qsRanking`, `timesRanking`, `usNewsRanking`, `acceptanceRate`, `applicationFee`, `campusType`, `totalStudents`, `internationalStudentPercent`, `foodHousingCost`, `avgScholarshipAmount`, `employmentRate`
- **Status**: All tests compile successfully after fix
- **Test structure**: Tests getUniversities (pagination, filters), getUniversityById (found, not found), getCountries, getUniversityCount

---

## 17. Seed Data Details [Confirmed]

### `backend/prisma/seed.ts` (132 lines)
- Imports: `PrismaClient, CampusType, DegreeType` from `@prisma/client`
- Reads from `backend/data/universities.json`
- Typed interfaces: `RawProgram` (16 fields) and `RawUniversity` (22 fields + programs array)
- Flow: clears programs → clears universities → loops through JSON → `prisma.university.create` with nested `programs: { create: [...] }`
- Handles: `campusType` cast to `CampusType`, `degreeType` cast to `DegreeType`, `applicationDeadline` string→Date, `greRequired`/`gmatRequired` default false
- Logs: per-university with program count, summary by country

### `backend/data/universities.json`
- 51 universities total
- 122 programs total (2-4 per university)
- 10 countries: US(18), UK(9), Australia(6), Canada(5), Germany(4), Ireland(3), Singapore(2), Netherlands(2), Hong Kong(1), South Korea(1)
- Programs cover: MS, MBA, PhD across CS, Data Science, AI, Business, Engineering, etc.
- Data is mix of real (names, locations, general info) and estimated (exact rankings, financials, admission requirements)
- **User acknowledged data accuracy situation and said "right now it is fine"**

---

## 18. Key File Locations [Complete]

| Purpose | Path |
|---------|------|
| Context memory (THIS FILE) | `context_memory.md` |
| Prisma schema | `backend/prisma/schema.prisma` |
| Database seed script | `backend/prisma/seed.ts` |
| University seed data (JSON) | `backend/data/universities.json` |
| Latest migration | `backend/prisma/migrations/20260206192454_add_university_details_and_programs/` |
| Admin controller | `backend/src/modules/admin/admin.controller.ts` |
| Admin service (DTOs + logic) | `backend/src/modules/admin/admin.service.ts` |
| Universities service | `backend/src/modules/universities/universities.service.ts` |
| Universities controller | `backend/src/modules/universities/universities.controller.ts` |
| Universities controller spec | `backend/src/modules/universities/universities.controller.spec.ts` |
| Frontend types | `frontend/src/types/index.ts` |
| Frontend API client | `frontend/src/lib/api.ts` |
| Frontend utils | `frontend/src/lib/utils.ts` |
| Frontend constants | `frontend/src/data/constants.ts` |
| University detail page | `frontend/src/app/universities/[id]/page.tsx` |
| University browse page | `frontend/src/app/universities/page.tsx` |
| Admin layout (sidebar) | `frontend/src/app/admin/layout.tsx` |
| Admin dashboard | `frontend/src/app/admin/page.tsx` |
| Admin universities page | `frontend/src/app/admin/universities/page.tsx` |
| Admin leads page | `frontend/src/app/admin/leads/page.tsx` |
| Admin users page | `frontend/src/app/admin/users/page.tsx` |
| Auth guards | `backend/src/common/guards/clerk-auth.guard.ts`, `admin.guard.ts` |

---

## 19. Useful Commands [Confirmed]

```powershell
# Start database (Docker)
cd c:\Users\sahoo\OneDrive\Desktop\wingsed
docker-compose up -d

# Start backend
cd backend
npm run start:dev

# Start frontend
cd frontend
npm run dev

# Prisma commands (from backend folder)
npx prisma generate          # Generate client after schema changes
npx prisma migrate dev --name <name>  # Create and apply migration
npx prisma studio            # GUI for database
npx prisma db seed           # Seed database

# Run tests
cd backend
npm run test                  # Run all tests
npm run test -- --coverage    # With coverage

# Git
git push origin feature/initial-review
```

---

## 20. Phase Completion Tracker

| Phase | Name | Status | Date | Details |
|-------|------|--------|------|---------|
| 1 | Database Schema Redesign | ✅ DONE | Feb 7, 2026 | 14 new University fields, Program model, 2 new enums, migration applied |
| 2 | Seed Data | ✅ DONE | Feb 7, 2026 | 51 universities, 122 programs, 10 countries, seed.ts + universities.json |
| 3 | Backend API Updates | ⬜ PENDING | — | Public Program endpoints if needed (programs currently only via university include or admin API) |
| 4 | Admin Panel | ✅ DONE | Feb 7, 2026 | Full university CRUD (21 fields, 5-tab form) + program CRUD (13 fields) + backend DTOs/endpoints |
| 5 | Frontend List View | ⬜ PENDING | — | Show rankings, program count, acceptance rate on university browse cards |
| 6 | Frontend Detail Page | ✅ DONE | Feb 7, 2026 | Complete redesign with hero, rankings, stats, 3-tab layout (overview/programs/costs) |

### Additional Completed Items
- ✅ Test spec fix (3 TS errors in universities.controller.spec.ts)
- ✅ Code review fixes (6 fixes in admin/leads/page.tsx)
- ✅ Backend findById includes programs

### Pending / Deferred Work
- ⬜ Phase 3: Backend public Program endpoints (may not be needed if programs always come via university include)
- ⬜ Phase 5: University browse page (`/universities`) — add ranking badges, program count, acceptance rate to cards
- ⬜ Onboarding updates: Academic Background question, Work Experience question, make phone optional
- ⬜ Planned schema change: `qualification` + `workExperience` enums on Lead model (migration: `add_qualification_work_experience`)
- ⬜ Commit and push all Phase 1/2/4/6 changes to Git
- ⬜ End-to-end testing of all new features
- ⬜ Data verification: Replace estimated seed data with real university data via admin panel

---

## 21. Phase Changelogs

### Phase 1 Changelog — Database Schema Redesign (Feb 7, 2026)

**Files Modified:**
1. `backend/prisma/schema.prisma`
   - Added `CampusType` enum (URBAN, SUBURBAN, RURAL)
   - Added `DegreeType` enum (BACHELORS, MASTERS, PHD, DIPLOMA, CERTIFICATE)
   - Expanded University model with 14 new fields (rankings, admissions, campus, financial)
   - Added `programs` relation to University
   - Added `qsRanking` index
   - Created Program model (18 fields with admission requirements, deadlines, intakes)
   - Added indexes: universityId, degreeType, name

**Files Created:**
1. `backend/prisma/migrations/20260206192454_add_university_details_and_programs/migration.sql`

**Security Notes:**
- All new fields nullable (no breaking changes)
- Program FK CASCADE delete (no orphans)
- `greRequired`/`gmatRequired` default false
- All queries via Prisma ORM (SQL injection protected)

---

### Phase 2 Changelog — Seed Data (Feb 7, 2026)

**Files Modified:**
1. `backend/prisma/seed.ts`
   - Switched from `createMany` to individual `create` with nested `programs.create`
   - Added `CampusType`/`DegreeType` imports for casting
   - Added `RawProgram`/`RawUniversity` interfaces
   - Handles applicationDeadline string→Date, default booleans

**Files Recreated:**
1. `backend/data/universities.json`
   - 51 universities across 10 countries with 122 programs
   - Covers all new fields
   - Data: mix of real + estimated

**Seed Results:** 51 universities, 122 programs inserted. All enums validated.

---

### Phase 4 Changelog — Admin Panel Expansion (Feb 7, 2026)

**Files Modified:**
1. `backend/src/modules/admin/admin.service.ts` (438 lines)
   - Expanded DTOs: `CreateUniversityDto` (21 fields), `UpdateUniversityDto` (21 fields)
   - Added: `CreateProgramDto` (13 fields), `UpdateProgramDto` (13 fields)
   - Imported `CampusType, DegreeType` from `@prisma/client`
   - All university queries now `include: { programs: true }`
   - New methods: `getUniversityById`, `createProgram`, `updateProgram`, `deleteProgram`
   - `deleteUniversity` now cascades: programs → saved_universities → applications → university

2. `backend/src/modules/admin/admin.controller.ts` (200 lines)
   - Added imports: `CreateProgramDto, UpdateProgramDto`
   - New endpoints:
     - `GET /admin/universities/:id` → getUniversityById
     - `POST /admin/universities/:universityId/programs` → createProgram
     - `PATCH /admin/programs/:id` → updateProgram
     - `DELETE /admin/programs/:id` → deleteProgram

3. `frontend/src/lib/api.ts` (658 lines)
   - Added `Program` to type import
   - Expanded `createAdminUniversity` data type (all 21 fields)
   - Changed `updateAdminUniversity` data param to `Record<string, unknown>`
   - New functions: `getAdminUniversityById`, `createAdminProgram`, `updateAdminProgram`, `deleteAdminProgram`

4. `frontend/src/app/admin/universities/page.tsx` (894 lines — COMPLETE REWRITE)
   - `UniversityFormData` (21 string fields) and `ProgramFormData` (13 fields)
   - 5-tab university form: Basic Info, Rankings, Campus, Financial, Programs
   - Program modal with full form + admission requirements section
   - Success toast notifications
   - University cards with program count + QS ranking badges
   - Fixed Tailwind v4 syntax (z-index, gradients)

---

### Phase 6 Changelog — Frontend Detail Page (Feb 7, 2026)

**Files Modified:**
1. `backend/src/modules/universities/universities.service.ts`
   - `findById`: Added `include: { programs: true }`
   - Return type changed from explicit `Promise<University | null>` to inferred

2. `frontend/src/types/index.ts`
   - University interface: added 13 new fields + `programs?: Program[]`
   - Added: `Program` interface (17 fields)

3. `frontend/src/app/universities/[id]/page.tsx` (798 lines — COMPLETE REWRITE)
   - From ~260 basic lines → 798 lines rich layout
   - Helper components: StatCard, RankBadge, SectionTitle, DegreeTypeBadge, ProgramCard
   - Hero with gradient, rankings, stats, 3-tab navigation, CTA section
   - Full program display with admission requirements
   - Costs & aid breakdown with net cost calculator
   - Employment rate circular SVG progress

---

### Test Fix Changelog (Feb 7, 2026)

**Files Modified:**
1. `backend/src/modules/universities/universities.controller.spec.ts`
   - Added 13 null-valued fields to `mockUniversity` to match expanded schema
   - Fields: imageUrl, address, qsRanking, timesRanking, usNewsRanking, acceptanceRate, applicationFee, campusType, totalStudents, internationalStudentPercent, foodHousingCost, avgScholarshipAmount, employmentRate

---

## 22. Assumptions & Notes

- API functions follow pattern: return `{ data?, error? }` objects, not throw exceptions
- INR (₹) currency for budget display with hardcoded `* 83` USD→INR multiplier
- Clerk handles all authentication (JWT tokens via `useAuth()` hook)
- Next.js 16.1.6 with Turbopack
- User has Docker available for PostgreSQL
- Admin role check: `user.role === 'ADMIN'` in AdminGuard
- All admin routes: `@UseGuards(ClerkAuthGuard, AdminGuard)`
- DashboardStats interface includes: totalLeads, leadsToday, leadsThisWeek, totalUsers, usersToday, totalUniversities, leadsByCountry, recentLeads

---

## 23. Context Window Information

- Model: Claude Opus 4.6
- Context limit: 128K tokens
- Behavior when exceeded: Older messages summarized, conversation continues
- This file exists to preserve full project context across context window resets

---

*End of context memory snapshot — Last updated: February 7, 2026*

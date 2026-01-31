# Product Requirements Document (PRD): WingsEdu (Digital Sherpa V1)

**North-Star Metric:** % of signups who connect with a counselor via WhatsApp within 24 hours

## 1. Product Vision

Build a minimalist, trust-first web application for Indian students planning to study abroad (postgraduate), focused on converting early interest into qualified leads through intelligent user flows, lightweight university discovery, and counselor chat facilitation.

## 2. Tech Stack

* **Frontend**: Next.js 15 (App Router, Server Components, `src/` structure)
* **Styling**: Tailwind CSS, Headless UI
* **Auth**: Clerk (OAuth, OTP, Email)
* **Backend**: NestJS (Node.js) with Module-Service-Controller architecture
* **Database**: PostgreSQL using Prisma ORM
* **Storage**: AWS S3 with Presigned Upload URLs (reserved for future)
* **Search**: Self-hosted Typesense
* **Deployment**: Vercel (Frontend), Render or Railway (Backend)

## 3. Key Features (MVP Scope)

### 3.1 Public Landing Page (No Login)

* Hero section with CTA: "Shortlist Universities That Fit You"
* Country logo strip (US, UK, Canada, Germany, etc.)
* Testimonials carousel (text and video-supported)
* Counters: universities supported, admits generated
* Floating WhatsApp button (auth-gated) with auto-feedback loop

### 3.2 Lightweight Onboarding (Pre-Signup)

* 3–5 step form with progress indicator: "Takes < 60 seconds"
* Fields:

  * Country of Interest *(required)*
  * Budget Range *(skippable: default to "Flexible")*
  * Field of Study *(required)*
  * Test Taken *(enum: IELTS/GRE/None, not string)*
  * Intake Target *(skippable: default to "Undecided")*
* Allow early exit to WhatsApp after minimum required fields

### 3.3 WhatsApp Counselor Redirect (Lead Capture + Feedback)

* Persistent floating CTA: "Need Help? Talk to an Expert"
* On click:

  * If not logged in → Clerk modal (permitted UI popup)
  * After auth: use collected fields to prefill WhatsApp message
  * Redirect:

    ```
    https://wa.me/919812345678?text=Hi%20I%20am%20{Name},%20I%20want%20to%20study%20in%20{Country}%20within%20a%20budget%20of%20₹{X}.
    ```
* After 24h → ping user:

  * ✅ "Yes, I connected with a counselor"
  * ❌ "No response yet"
* Store this `postWhatsAppStatus` for reporting

### 3.4 University Discovery (Lightweight Confidence Builder)

* Typesense-powered search on `University` model
* Filters:

  * Country
  * Budget range
  * Field of Study
* Show cards:

  * Logo, Name, City (explicit field), Tuition, basic narrative copy
  * CTA: "Is this right for you?" (instead of "View Details")
* No ROI numbers or deep salary/visa fields in MVP

## 4. Models (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  clerkId       String   @unique
  role          Role     @default(STUDENT)
  onboardingStep Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  studentProfile StudentProfile?
}

enum Role {
  STUDENT
  ADMIN
  COUNSELOR
}

model StudentProfile {
  id               String   @id @default(cuid())
  userId           String   @unique
  country          String
  budgetMin        Int?
  budgetMax        Int?
  targetField      String
  intake           String?
  testTaken        TestTaken
  postWhatsAppStatus String? // success feedback
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

enum TestTaken {
  IELTS
  GRE
  NONE
}

model University {
  id              String   @id @default(cuid())
  name            String
  country         String
  city            String
  tuitionFee      Int
  publicPrivate   String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

## 5. Security & Privacy

* Role-based access + strict data isolation
* Rate Limiting: 100 req/15 min/IP via NestJS ThrottlerModule
* Input Validation:

  * Zod (frontend)
  * class-validator (backend)

## 6. UI Design Language

* **Font**: Geist Sans
* **Palette**:

  * Background: #F9FAFB
  * Text: #111827
  * Primary: #2563EB
* **Guidelines**:

  * Large whitespace padding
  * Skeleton loaders for async components
  * Allow essential modals (e.g. auth); no deceptive patterns

## 7. Delayed or Out of Scope Features (Future Phase)

* Secure Document Vault (OCR/Verification)
* Referral Engine with rewards
* Application Tracker
* Full ROI Scoring Engine with AI filtering
* SOP Editor

---

This PRD reflects a hardened MVP focused on delivering qualified counselor connections via WhatsApp with trackable intent, low friction onboarding, and confidence-building search. Ready for AI-based or human full-stack execution.

# WingsEd - Digital Sherpa V1

Helping Indian students find their dream universities abroad

A minimalist, trust-first web application for Indian students planning to study abroad (postgraduate).

## Tech Stack

- **Frontend**: Next.js 15 (App Router, Server Components)
- **Styling**: Tailwind CSS, Headless UI
- **Auth**: Clerk (OAuth, OTP, Email)
- **Backend**: NestJS with Module-Service-Controller architecture
- **Database**: PostgreSQL with Prisma ORM
- **Search**: PostgreSQL `pg_trgm` (Fuzzy Search) for now

## Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ (you have v22.17.1 ✓)
- **Docker Desktop** installed and running
- **Clerk Account** with API keys

## Quick Start

### Step 1: Start Docker Services

```bash
# From the project root directory
docker-compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`

Verify services are running:
```bash
docker-compose ps
```

### Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and add your Clerk keys
# Then run database migrations (this enables pg_trgm extension)
npx prisma migrate dev --name init

# Seed the database with university data
npx prisma db seed

# Start development server
npm run start:dev
```

Backend runs on render

### Step 3: Setup Frontend

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local and add your Clerk keys

# Start development server
npm run dev
```

Frontend runs on vercel

# Environment Variables

### Backend (.env)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Clerk secret key (sk_test_...) |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key (pk_test_...) |
| `CLERK_WEBHOOK_SECRET` | Webhook secret for user sync |
| `WHATSAPP_PHONE_NUMBER` | WhatsApp business number (optional) |
| `CORS_ORIGINS` | Comma-separated list of allowed origins (e.g. `https://wingsed.com,https://www.wingsed.com`) |

### Frontend (.env.local)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_API_URL` | Backend API URL (Use Render URL in production) |
| `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER` | WhatsApp number |

## Project Structure

```
wingsed/
├── docker-compose.yml     # PostgreSQL
├── backend/               # NestJS API
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   ├── common/        # Guards, decorators, filters
│   │   └── prisma/        # Prisma service
│   └── prisma/
│       ├── schema.prisma  # Database schema
│       └── seed.ts        # University seed data
└── frontend/              # Next.js App
    └── src/
        ├── app/           # App Router pages
        ├── components/    # Reusable UI components
        ├── lib/           # Utilities, API client
        └── data/          # Testimonials, static data
```

##  Database Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database
npx prisma db seed
```

##  Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Backend (Render / Railway)

1. Create new Web Service in Render/Railway
2. Connect GitHub repository
3. Context: `backend`
4. Build Command: `npm install && npx prisma migrate deploy && npm run build`
5. Start Command: `npm run start:prod`
6. Add Environment Variables (`DATABASE_URL`, `CLERK_KEYS`, `CORS_ORIGINS`)

## License

Private - All rights reserved

---

Built with ❤️ for Indian students pursuing global education

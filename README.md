# WingsEd - Digital Sherpa V1

A minimalist, trust-first web application for Indian students planning to study abroad (postgraduate).

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router, Server Components)
- **Styling**: Tailwind CSS, Headless UI
- **Auth**: Clerk (OAuth, OTP, Email)
- **Backend**: NestJS with Module-Service-Controller architecture
- **Database**: PostgreSQL with Prisma ORM
- **Search**: Typesense

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18+ (you have v22.17.1 ✓)
- **Docker Desktop** installed and running
- **Clerk Account** with API keys

## 🚀 Quick Start

### Step 1: Start Docker Services

```bash
# From the project root directory
docker-compose up -d
```

This starts:
- PostgreSQL on `localhost:5432`
- Typesense on `localhost:8108`

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
# Then run database migrations
npx prisma migrate dev --name init

# Seed the database with university data
npx prisma db seed

# Sync universities to Typesense
npm run typesense:sync

# Start development server
npm run start:dev
```

Backend runs on `http://localhost:4000`

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

Frontend runs on `http://localhost:3000`

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Clerk secret key (sk_test_...) |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key (pk_test_...) |
| `CLERK_WEBHOOK_SECRET` | Webhook secret for user sync |
| `TYPESENSE_API_KEY` | Typesense admin API key |
| `WHATSAPP_PHONE_NUMBER` | WhatsApp business number |

### Frontend (.env.local)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER` | WhatsApp number |

## 📁 Project Structure

```
wingsed/
├── docker-compose.yml     # PostgreSQL + Typesense
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

## 🗄️ Database Commands

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

## 🔍 Typesense Commands

```bash
# Sync universities from PostgreSQL to Typesense
npm run typesense:sync

# Clear Typesense index
npm run typesense:clear
```

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Backend (Railway)

1. Create new project in Railway
2. Add PostgreSQL from Railway's database options
3. Deploy from GitHub
4. Set environment variables
5. Add Typesense Cloud or self-host on Railway

## 📝 License

Private - All rights reserved

---

Built with ❤️ for Indian students pursuing global education

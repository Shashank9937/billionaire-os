# Billionaire Execution OS

A production-grade founder operating system to build a ₹100 Cr+ company in 3 years and scale toward a billion-dollar enterprise.

## Core Principle
Every module in this system is designed to answer:
- Does this accelerate path to ₹100 Cr?
- Does this increase leverage?
- Does this improve capital efficiency?
- Does this create a moat?

## Tech Stack
- Next.js (App Router)
- PostgreSQL + Prisma ORM
- Tailwind CSS
- Recharts
- JWT authentication (HttpOnly cookies)
- Role-ready auth architecture
- Vercel-ready deployment setup

## Modules Implemented
1. Strategic Command Center
2. Opportunity Intelligence Engine
3. Decision Engine
4. Capital Allocation System
5. Execution War Room
6. Validation Lab
7. Moat Builder Panel
8. Founder Performance System
9. Idea Comparison Matrix
10. Export Center

## Key Features
- KPI-heavy strategic dashboard with risk index, runway, burn, gap-to-target, and execution score
- Idea intake with TAM/SAM/SOM, moat type, strategic fit, and speed-to-₹100 Cr
- ICE scoring + venture viability index auto-calculation
- Financial modeling (36-month projection + scenario models + break-even)
- Experiment/validation tracking with explicit Scale/Iterate/Pivot/Kill decisions
- Founder discipline logging (deep work, decisions, outreach, learning, health, weekly review)
- Export capabilities: investor PDF, venture summary, financial CSV, weekly performance summary
- Keyboard-driven navigation (`Alt+1` ... `Alt+9`)
- Dark/light mode

## Folder Structure
```text
billionaire-execution-os/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (protected)/
│   │   ├── dashboard/page.tsx
│   │   ├── opportunity-intelligence/page.tsx
│   │   ├── decision-engine/page.tsx
│   │   ├── capital-allocation/page.tsx
│   │   ├── execution-war-room/page.tsx
│   │   ├── validation-lab/page.tsx
│   │   ├── moat-builder/page.tsx
│   │   ├── founder-performance/page.tsx
│   │   ├── idea-comparison/page.tsx
│   │   └── exports/page.tsx
│   ├── api/
│   │   ├── auth/{login,logout,me}/route.ts
│   │   ├── ideas/route.ts
│   │   ├── evaluations/route.ts
│   │   ├── experiments/route.ts
│   │   ├── ventures/route.ts
│   │   ├── financial-models/route.ts
│   │   ├── capital-allocations/route.ts
│   │   ├── kpis/route.ts
│   │   ├── milestones/route.ts
│   │   ├── founder-metrics/route.ts
│   │   ├── moat-metrics/route.ts
│   │   ├── comparisons/route.ts
│   │   ├── notes/route.ts
│   │   ├── dashboard/summary/route.ts
│   │   └── exports/{investor-snapshot,venture-summary,financial-model,weekly-performance}/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/
│   ├── charts/
│   ├── forms/
│   ├── layout/
│   └── ui/
├── lib/
│   ├── auth/
│   ├── db/prisma.ts
│   ├── calculations.ts
│   ├── dashboard.ts
│   ├── http.ts
│   ├── utils.ts
│   └── validations/schemas.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts
├── .env.example
├── package.json
├── DEPLOYMENT.md
└── vercel.json
```

## Database Models
Included relational schema with full FK relationships for:
- Users
- Ideas
- Evaluations
- Experiments
- Ventures
- FinancialModels
- KPIs
- Milestones
- CapitalAllocations
- FounderMetrics
- MoatMetrics
- Comparisons
- Notes

See [`prisma/schema.prisma`](./prisma/schema.prisma).

## Local Setup
### 1) Prerequisites
- Node.js 20+
- PostgreSQL 15+

### 2) Environment
```bash
cp .env.example .env
```
Update `.env` values.

### 3) Install dependencies
```bash
npm install
```

### 4) Generate Prisma client
```bash
npm run prisma:generate
```

### 5) Run migrations
```bash
npm run prisma:migrate -- --name init
```

### 6) Seed sample founder data
```bash
npm run seed
```

### 7) Start app
```bash
npm run dev
```

## Seed Credentials
- Email: `founder@beos.local`
- Password: `Founder@123`

## Migration Instructions
### Dev
```bash
npm run prisma:migrate -- --name <migration_name>
```

### Production
```bash
npm run prisma:deploy
```

## Security Notes
- JWT auth with HttpOnly cookie (`beos_token`)
- Middleware-protected app routes and API surface
- Role-ready permission checks for capital/venture/export operations
- Zod input validation on all mutation endpoints
- Prisma ORM parameterization prevents SQL injection

## Export Endpoints
- `GET /api/exports/investor-snapshot` -> PDF
- `GET /api/exports/venture-summary?ventureId=<id>` -> Markdown summary
- `GET /api/exports/financial-model?ventureId=<id>` -> CSV
- `GET /api/exports/weekly-performance` -> Weekly markdown report

## Deployment
See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for Vercel + Postgres production steps.

## Notes
- Type/lint checks were not executed in this workspace because dependencies are not installed yet.
- After `npm install`, run:
  - `npm run typecheck`
  - `npm run lint`

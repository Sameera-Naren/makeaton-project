# Brightloop Software – Subscription Management System

A centralized subscription management platform for Brightloop Software, built during Make-A-Ton hackathon.

---

## Team Structure

| Member | Module |
|--------|--------|
| Member 1 | Authentication & Customer Portal |
| Member 2 | Products, Plans & Discounts |
| **Member 3** | **Quotations & Subscription Management** |
| Member 4 | Billing, Payments & Analytics |

---

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma 5
- **Styling**: Vanilla CSS (dark mode design system)
- **API**: REST

---

## Project Structure

```
makeaton/
├── frontend/    ← React + Vite app (port 5173)
└── backend/     ← Express API (port 4000)
    └── prisma/  ← Schema and migrations
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Database Setup

Create the database:
```sql
CREATE DATABASE brightloop_db;
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials

npm install
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations (creates tables)
npm run dev             # Start backend on http://localhost:4000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev             # Start frontend on http://localhost:5173
```

---

## Member 3 – API Endpoints

### Quotations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/quotations | List all quotations |
| GET | /api/quotations/:id | Get quotation details |
| POST | /api/quotations | Create quotation with items |
| PATCH | /api/quotations/:id | Update draft quotation |
| POST | /api/quotations/:id/confirm | Confirm a draft quotation |
| POST | /api/quotations/:id/convert | Convert to subscription |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/subscriptions | List all subscriptions |
| GET | /api/subscriptions/:id | Get subscription details |
| PATCH | /api/subscriptions/:id/status | Update status (generic) |
| POST | /api/subscriptions/:id/pause | Pause subscription |
| POST | /api/subscriptions/:id/resume | Resume subscription |
| POST | /api/subscriptions/:id/close | Close subscription |

---

## Branch Strategy

- `main` — stable, reviewed code only
- `feature/quotations-subscriptions` — Member 3 active branch
- Each member works on their own feature branch

# Brightloop Software – Subscription Management System
**Make-A-Ton Virtual Round Hackathon Project**

A centralized subscription management platform for Brightloop Software, built by a team of four during Make-A-Ton hackathon.

---

## 👥 Team Structure & Ownership

| Member | Module | Status |
|--------|--------|--------|
| **Member 1** | Authentication & Customer Portal | Implemented (`client/`, `server/`) |
| **Member 2** | Products, Plans & Discounts | Planned / In Progress |
| **Member 3** | **Quotations & Subscription Management** | **Integrated & Active** (`feature/quotations-subscriptions`) |
| **Member 4** | Billing, Payments & Analytics | Planned / In Progress |

---

## 🏗️ Architecture & Technology Stack

- **Monorepo Structure**:
  - `client/` — React + TypeScript + Vite + Tailwind CSS
  - `server/` — Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL with Prisma ORM (plus fallback store for demo)
- **UI Design System**: Tailwind CSS, Lucide Icons, Pastel Accent Visuals

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- npm or pnpm
- PostgreSQL (optional for local DB; in-memory store available for rapid demo)

### 2. Setup & Installation

```bash
# Install root dependencies
npm install

# Start both backend and frontend concurrently
npm run dev
```

Or run individually:

```bash
# Server (Backend on port 5000)
cd server
npm install
npm run dev

# Client (Frontend on port 5173)
cd client
npm install
npm run dev
```

---

## 📋 Member 3 – Quotations & Subscriptions API

### Quotations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions/quotations` | List quotations with filters |
| GET | `/api/subscriptions/quotations/:id` | Get quotation details |
| POST | `/api/subscriptions/quotations` | Create quotation with products & plans |
| POST | `/api/subscriptions/quotations/:id/confirm` | Confirm a draft quotation |
| POST | `/api/subscriptions/quotations/:id/convert` | Convert quotation to active subscription |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions/all` | List all subscriptions (Staff/Admin) |
| GET | `/api/subscriptions/:id` | Get subscription details & line items |
| PUT | `/api/subscriptions/:id/status` | Update subscription lifecycle status |
| POST | `/api/subscriptions/:id/pause` | Pause subscription |
| POST | `/api/subscriptions/:id/resume` | Resume subscription |
| POST | `/api/subscriptions/:id/close` | Close subscription |

---

## 🌿 Branch Strategy

- `main` — production / consolidated team branch
- `feature/quotations-subscriptions` — Member 3 feature branch

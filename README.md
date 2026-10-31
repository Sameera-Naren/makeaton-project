# Brightloop Subscription Management System

> Built for the Make-A-Ton Hackathon. A high-performance, modular monolith subscription billing and management platform.

---

## 🏗️ Architecture & Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, TypeScript, REST API
- **Database & ORM:** PostgreSQL, Prisma ORM (with in-memory fallback store for rapid judging & offline evaluation)
- **Architecture:** Modular Monolith with clean domain separation

---

## 👥 Module Distribution

| Member | Domain Module | Responsibilities | Status |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Auth & Customer Portal** | User authentication, JWT, RBAC, Customer Dashboard, Profile | ✅ Active |
| **Member 2** | **Products, Plans & Discounts** | Products catalog, billing frequencies, pricing tiers, discounts | In progress |
| **Member 3** | **Quotations & Subscriptions** | Quotations, templates, approvals, subscription lifecycle | In progress |
| **Member 4** | **Billing, Payments & Analytics** | **Invoice generation, status lifecycle, payments ledger, MRR & executive analytics** | ✅ **Implemented** |

---

## 💳 Member 4: Billing, Payments & Analytics

### 1. Backend REST Endpoints (`/api/billing`)

All endpoints are protected and accessible to `STAFF` and `ADMIN` roles:

- `POST /api/billing/invoices/generate` — Auto-generates an invoice from an active subscription, copying line items, applying tax rates, computing discounts, and issuing a unique invoice number (`INV-2026-XXXX`).
- `GET /api/billing/invoices` — Retrieves all invoices with optional filtering by status (`DRAFT`, `CONFIRMED`, `PAID`, `OVERDUE`, `CANCELLED`) and search query.
- `GET /api/billing/invoices/:id` — Fetches full invoice detail with line items, customer profile, and payment audit history.
- `POST /api/billing/invoices` — Creates an ad-hoc custom invoice with arbitrary line items, tax, and discount amounts.
- `PUT /api/billing/invoices/:id/status` — Updates invoice status (e.g. moves `DRAFT` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PAID` / `OVERDUE` / `CANCELLED`).
- `POST /api/billing/payments` — Manually records a customer remittance against an invoice across supported channels (`CREDIT_CARD`, `BANK_TRANSFER`, `STRIPE`, `CASH`, `UPI`). When payments meet or exceed the invoice total, the invoice is automatically settled to `PAID`.
- `GET /api/billing/payments` — Complete payment ledger audit trail with timestamps, payment numbers, and transaction notes.
- `GET /api/billing/analytics` (and `/overview`) — Returns executive revenue metrics:
  - **Monthly Recurring Revenue (MRR)** accurately normalized across `DAILY`, `WEEKLY`, `MONTHLY`, and `YEARLY` subscriptions
  - **Annual Run Rate (ARR)**
  - **Total Revenue Collected**
  - **Outstanding Receivables & Overdue Debt**
  - **Payment Channel Distribution Breakdown**
  - **Invoice Lifecycle Counts**

### 2. Frontend Views

- **Executive Analytics Dashboard (`/billing/analytics` or default home for Staff/Admin):**
  - Hero metric cards for MRR, Total Revenue, Receivables, and Overdue debt.
  - Payment Channel Distribution progress meters.
  - Invoice Lifecycle Status matrix.
  - Quick modals for invoice auto-generation, manual invoice creation, and payment remittance.
- **Invoices Management Console (`/billing/invoices`):**
  - Filterable and searchable table with status change controls, printable invoice preview, and direct payment shortcut.
- **Payments Ledger & Audit Trail (`/billing/payments`):**
  - Transaction log with printable payment voucher/receipt dialog.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Installation
Install dependencies in both `server` and `client`:
```bash
# In the repository root:
cd server && npm install
cd ../client && npm install
```

### 3. Run Development Servers
Start backend server (runs on `http://localhost:5000`):
```bash
cd server
npm run dev
```

Start frontend client (runs on `http://localhost:5173`):
```bash
cd client
npm run dev
```

### 4. Running Verification Test Suites
Run Member 1 and Member 4 verification tests directly:
```bash
cd server
npm run test           # Member 1 Auth & Customer Portal tests
npm run test:billing   # Member 4 Billing, Payments & Analytics tests
```

---

## 🔐 Demo Credentials
The platform includes quick-switch buttons in the top navbar for easy evaluation:

- **Customer:** `customer@brightloop.com` / `Password@123` (Alex Rivera)
- **Staff:** `staff@brightloop.com` / `Staff@12345` (Sarah Chen)
- **Admin:** `admin@brightloop.com` / `Admin@12345` (Marcus Vance)

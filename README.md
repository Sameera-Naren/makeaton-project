# Brightloop Subscription Management System

> Built for the Make-A-Ton Hackathon. A high-performance monorepo subscription billing and management platform with customer, quotation, billing, and revenue workflows.

---

## 👥 Team Structure & Ownership

| Member | Module | Status |
|--------|--------|--------|
| **Member 1** | Authentication & Customer Portal | ✅ Implemented |
| **Member 2** | Products, Plans & Discounts | In progress |
| **Member 3** | **Quotations & Subscription Lifecycle** | ✅ Integrated |
| **Member 4** | **Billing, Payments & Analytics** | ✅ Implemented |

---

## 🏗️ Architecture & Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, TypeScript, REST API
- **Database & ORM:** PostgreSQL, Prisma ORM (with in-memory fallback store for rapid judging & demo mode)
- **Architecture:** Modular monolith with clean domain separation for auth, customer, quotations, subscriptions, and billing

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

## 💳 Member 4: Billing, Payments & Analytics

### Backend REST Endpoints (`/api/billing`)

All endpoints are protected and accessible to `STAFF` and `ADMIN` roles:

- `POST /api/billing/invoices/generate` — generates an invoice from an active subscription
- `GET /api/billing/invoices` — retrieves invoice list with status filters and search
- `GET /api/billing/invoices/:id` — fetches full invoice details and payment audit trail
- `POST /api/billing/invoices` — creates a manual invoice
- `PUT /api/billing/invoices/:id/status` — updates invoice status lifecycle
- `POST /api/billing/payments` — records invoice payment remittance
- `GET /api/billing/payments` — complete payment ledger
- `GET /api/billing/analytics` and `/overview` — executive revenue metrics including MRR, ARR, receivables, and payment mix

### Frontend Views

- Executive billing dashboard under `/billing/analytics`
- Invoices console under `/billing/invoices`
- Payments ledger under `/billing/payments`

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Installation
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Run Development Servers
```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

### 4. Run Verification Tests
```bash
cd server
npm run test
npm run test:billing
```

---

## 🔐 Demo Credentials

- **Customer:** `customer@brightloop.com` / `Password@123`
- **Staff:** `staff@brightloop.com` / `Staff@12345`
- **Admin:** `admin@brightloop.com` / `Admin@12345`

---

## 🌿 Branch Strategy

- `main` — consolidated production branch
- `billing` — billing and revenue implementation branch
- `feature/quotations-subscriptions` — quotations and subscription lifecycle branch

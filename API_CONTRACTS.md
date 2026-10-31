# Brightloop Subscription Management System — API Contracts & Team Integration Guide

## 🏗️ Architecture Overview
Simple Modular Monolith with:
- **Backend:** Node.js + Express + TypeScript (`server/`)
- **Frontend:** React + TypeScript + Vite + Tailwind CSS (`client/`)
- **Database / ORM:** PostgreSQL + Prisma (`server/prisma/schema.prisma`)

---

## 👥 Module Distribution & Ownership

### **Member 1 (Auth & Customer Portal - Implemented)**
- **Auth Endpoints:**
  - `POST /api/auth/register` (Enforces email uniqueness & password rule: >8 chars, upper, lower, special)
  - `POST /api/auth/login` (Returns JWT + User)
  - `GET /api/auth/me` (Protected)
  - `POST /api/auth/forgot-password` (Simulates email dispatch)
  - `POST /api/auth/add-staff` (Admin only)
- **Customer Portal Endpoints:**
  - `GET /api/customer/dashboard` (Returns overview metrics, active subscriptions, recent invoices)
  - `GET /api/customer/subscriptions` (Customer-filtered subscriptions)
  - `GET /api/customer/subscriptions/:id`
  - `GET /api/customer/invoices` (Customer-filtered invoices with tax and discounts)
  - `GET /api/customer/invoices/:id`
  - `GET /api/customer/payments` (Customer payment receipts)
  - `POST /api/customer/pay-invoice` (Simulated instant invoice settlement)
  - `GET /api/customer/profile`
  - `PUT /api/customer/profile`
- **Frontend Views:**
  - Sign In / Registration with real-time password checklist
  - Customer Dashboard (Hero cards styled with pastel accents, metrics, quick actions)
  - My Subscriptions (Filter by status, line items breakdown, variant view, renewal request)
  - Invoices (Outstanding balance tracker, printable invoice modal, pay invoice trigger)
  - Payments (Ledger table, payment method badges, receipt details)
  - Profile (Organization info, role and security policy viewer)

---

### **Member 2 (Products, Plans & Discounts)**
- **Backend Folder:** `server/src/modules/products/`
- **Routes to implement:**
  - `GET /api/products` — List all products with variants (e.g. Odoo brand +$560)
  - `POST /api/products` — Create product (Admin only)
  - `GET /api/products/plans` — List subscription plans (billing frequencies: DAILY, WEEKLY, MONTHLY, YEARLY)
  - `POST /api/products/plans` — Create plan (Admin only)
  - `GET /api/products/discounts` — List discount rules
  - `POST /api/products/discounts` — Create discount rule (Admin only)
- **Database Models to use:** `Product`, `ProductVariant`, `Plan`, `DiscountRule`

---

### **Member 3 (Quotations & Subscriptions)**
- **Backend Folder:** `server/src/modules/subscriptions/`
- **Routes to implement:**
  - `GET /api/subscriptions/quotations` — List quotations
  - `POST /api/subscriptions/quotations` — Create quotation from template
  - `POST /api/subscriptions/quotations/:id/confirm` — Confirm quotation
  - `POST /api/subscriptions/quotations/:id/convert` — Convert quotation to active subscription
  - `GET /api/subscriptions/all` — Staff/Admin view of all subscriptions
  - `PUT /api/subscriptions/:id/status` — Status transition: Draft -> Quotation -> Confirmed -> Active -> Paused -> Closed
- **Database Models to use:** `QuotationTemplate`, `Quotation`, `QuotationLine`, `Subscription`, `SubscriptionLine`

---

### **Member 4 (Billing, Payments & Analytics)**
- **Backend Folder:** `server/src/modules/billing/`
- **Routes to implement:**
  - `POST /api/billing/invoices/generate` — Auto-generate invoice from active subscription
  - `GET /api/billing/invoices` — View all invoices
  - `PUT /api/billing/invoices/:id/status` — Move Draft -> Confirmed -> Paid / Cancelled
  - `POST /api/billing/payments` — Manual payment recording against an invoice
  - `GET /api/billing/analytics` — Executive revenue summary:
    - Total active subscriptions
    - Monthly Recurring Revenue (MRR)
    - Total revenue collected
    - Outstanding and overdue invoice amounts
- **Database Models to use:** `Invoice`, `InvoiceLine`, `Payment`

---

## 🔐 Standard Response Format
All REST endpoints should return JSON matching:
```ts
// Success
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}

// Error
{
  "success": false,
  "error": "Error message description"
}
```

## 🔑 Authentication Middleware
Protect your routes with:
```ts
import { authenticateToken, requireRole } from '../../middleware/auth.middleware.js';

// Require any logged-in user:
router.get('/my-route', authenticateToken, handler);

// Require ADMIN:
router.post('/admin-only', authenticateToken, requireRole('ADMIN'), handler);

// Require STAFF or ADMIN:
router.get('/internal', authenticateToken, requireRole('ADMIN', 'STAFF'), handler);
```

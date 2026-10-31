# Brightloop Software — Subscription Management System

> Make-A-Ton Virtual Round Hackathon Project  
> Architecture: Simple Modular Monolith (React + TypeScript + Vite + Node.js + Express + Prisma + Tailwind CSS)

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
# In the client directory:
cd client
npm install

# In the server directory:
cd ../server
npm install
```

### 2. Run the Development Servers
In separate terminals:

```bash
# Terminal 1: Backend Server (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2: Frontend Vite App (runs on http://localhost:5173)
cd client
npm run dev
```

### 3. Quick Demo Access
On the login screen or in the top navigation bar, use the **1-Click Demo Buttons** to instantly log in as:
- **Customer (Alex Rivera):** `customer@brightloop.com` / `Password@123`
- **Staff (Sarah Chen):** `staff@brightloop.com` / `Staff@12345`
- **Admin (Marcus Vance):** `admin@brightloop.com` / `Admin@12345`

---

## 👥 Module Distribution
- **Member 1 (Implemented):** Authentication, Role-based Access Control (Admin, Staff, Customer), and Customer Portal (Dashboard, Active Subscriptions, Invoices, Outstanding Payment Tracking, Profile).
- **Member 2:** Products, Variants, Plans & Discounts (`server/src/modules/products/`).
- **Member 3:** Quotations, Templates & Subscription Lifecycle (`server/src/modules/subscriptions/`).
- **Member 4:** Invoice Generation, Payment Recording & Analytics (`server/src/modules/billing/`).

See [`API_CONTRACTS.md`](./API_CONTRACTS.md) for full endpoint specifications and database relationships.

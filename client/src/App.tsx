import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ProductsPage } from './pages/ProductsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { QuotationsPage } from './pages/QuotationsPage';
import { QuotationCreatePage } from './pages/QuotationCreatePage';
import { QuotationDetailPage } from './pages/QuotationDetailPage';
import { BillingAnalyticsPage } from './pages/BillingAnalyticsPage';
import { BillingInvoicesPage } from './pages/BillingInvoicesPage';
import { BillingPaymentsPage } from './pages/BillingPaymentsPage';

const DynamicDashboard: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'STAFF' || user?.role === 'ADMIN') {
    return <BillingAnalyticsPage />;
  }
  return <CustomerDashboard />;
};

const DynamicInvoices: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'STAFF' || user?.role === 'ADMIN') {
    return <BillingInvoicesPage />;
  }
  return <InvoicesPage />;
};

const DynamicPayments: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'STAFF' || user?.role === 'ADMIN') {
    return <BillingPaymentsPage />;
  }
  return <PaymentsPage />;
};

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd]">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfcfd]">
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
      <footer className="border-t border-zinc-200/80 bg-white py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Brightloop Software Platform — Hackathon 2026 Edition</span>
          <span className="text-zinc-400">
            Enterprise Subscription &amp; Customer Billing Suite • Modular Architecture
          </span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <DynamicDashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedLayout>
                <CustomerDashboard />
              </ProtectedLayout>
            }
          />

          <Route
            path="/quotations"
            element={
              <ProtectedLayout>
                <QuotationsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/quotations/new"
            element={
              <ProtectedLayout>
                <QuotationCreatePage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/quotations/:id"
            element={
              <ProtectedLayout>
                <QuotationDetailPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedLayout>
                <BillingAnalyticsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/billing/analytics"
            element={
              <ProtectedLayout>
                <BillingAnalyticsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/billing/invoices"
            element={
              <ProtectedLayout>
                <BillingInvoicesPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/billing/payments"
            element={
              <ProtectedLayout>
                <BillingPaymentsPage />
              </ProtectedLayout>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedLayout>
                <ProductsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedLayout>
                <SubscriptionsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedLayout>
                <DynamicInvoices />
              </ProtectedLayout>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedLayout>
                <DynamicPayments />
              </ProtectedLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedLayout>
                <ProfilePage />
              </ProtectedLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

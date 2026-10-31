import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { QuotationListPage } from './pages/QuotationListPage';
import { QuotationCreatePage } from './pages/QuotationCreatePage';
import { QuotationDetailPage } from './pages/QuotationDetailPage';
import { SubscriptionListPage } from './pages/SubscriptionListPage';
import { SubscriptionDetailPage } from './pages/SubscriptionDetailPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/quotations" element={<QuotationListPage />} />
            <Route path="/quotations/new" element={<QuotationCreatePage />} />
            <Route path="/quotations/:id" element={<QuotationDetailPage />} />
            <Route path="/subscriptions" element={<SubscriptionListPage />} />
            <Route path="/subscriptions/:id" element={<SubscriptionDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

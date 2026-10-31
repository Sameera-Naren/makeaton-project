import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quotationsApi } from '../api/quotations';
import { subscriptionsApi } from '../api/subscriptions';
import type { Quotation, Subscription } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export function DashboardPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([quotationsApi.list(), subscriptionsApi.list()])
      .then(([qRes, sRes]) => {
        setQuotations(qRes.data.data);
        setSubscriptions(sRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: string | number) =>
    `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const activeRevenue = subscriptions
    .filter((s) => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + Number(s.totalAmount), 0);

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Quotations &amp; Subscription Management — Brightloop Software</p>
      </div>
      <div className="page-content">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Quotations</span>
            <span className="stat-value">{quotations.length}</span>
            <span className="stat-sub">{quotations.filter(q => q.status === 'DRAFT').length} drafts</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Confirmed</span>
            <span className="stat-value">{quotations.filter(q => q.status === 'CONFIRMED').length}</span>
            <span className="stat-sub">Awaiting conversion</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Active Subscriptions</span>
            <span className="stat-value">{subscriptions.filter(s => s.status === 'ACTIVE').length}</span>
            <span className="stat-sub">{subscriptions.length} total</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Active Revenue</span>
            <span className="stat-value" style={{ fontSize: '20px' }}>{fmt(activeRevenue)}</span>
            <span className="stat-sub">From active subscriptions</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Quotations</span>
              <Link to="/quotations" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            {quotations.length === 0 ? (
              <div className="empty-state"><p>No quotations yet</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Number</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {quotations.slice(0, 5).map(q => (
                      <tr key={q.id}>
                        <td><Link to={`/quotations/${q.id}`} className="mono" style={{ textDecoration: 'none' }}>{q.quotationNumber}</Link></td>
                        <td>{q.customer?.companyName ?? '—'}</td>
                        <td style={{ fontFamily: 'monospace' }}>{fmt(q.totalAmount)}</td>
                        <td><StatusBadge status={q.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Subscriptions</span>
              <Link to="/subscriptions" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            {subscriptions.length === 0 ? (
              <div className="empty-state"><p>No subscriptions yet</p></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Ref</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {subscriptions.slice(0, 5).map(s => (
                      <tr key={s.id}>
                        <td><Link to={`/subscriptions/${s.id}`} className="mono" style={{ textDecoration: 'none' }}>{s.subscriptionRef}</Link></td>
                        <td>{s.customer?.companyName ?? '—'}</td>
                        <td style={{ fontFamily: 'monospace' }}>{fmt(s.totalAmount)}</td>
                        <td><StatusBadge status={s.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

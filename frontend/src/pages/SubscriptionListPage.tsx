import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionsApi } from '../api/subscriptions';
import type { Subscription } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export function SubscriptionListPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    subscriptionsApi.list()
      .then((res) => setSubscriptions(res.data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: string | number) =>
    `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <>
      <div className="page-header">
        <h2>Subscriptions</h2>
        <p>View and manage all active customer subscriptions.</p>
      </div>
      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {(['ACTIVE', 'PAUSED', 'CLOSED'] as const).map((s) => (
            <div className="stat-card" key={s}>
              <span className="stat-label">{s}</span>
              <span className="stat-value">{subscriptions.filter((sub) => sub.status === s).length}</span>
            </div>
          ))}
          <div className="stat-card">
            <span className="stat-label">Total Subscriptions</span>
            <span className="stat-value">{subscriptions.length}</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">All Subscriptions</span>
          </div>

          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : subscriptions.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
              <p>No subscriptions yet. Convert a confirmed quotation to create one.</p>
              <Link to="/quotations" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Go to Quotations</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Customer</th>
                    <th>Source Quotation</th>
                    <th>Billing</th>
                    <th>Total</th>
                    <th>Renewal</th>
                    <th>Start Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((s) => (
                    <tr key={s.id}>
                      <td className="mono">{s.subscriptionRef}</td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.customer?.companyName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.customer?.user?.email}</div>
                      </td>
                      <td className="mono" style={{ fontSize: 12 }}>
                        <Link to={`/quotations/${s.quotationId}`} style={{ textDecoration: 'none', color: 'var(--indigo-400)' }}>
                          {s.quotation?.quotationNumber}
                        </Link>
                      </td>
                      <td><span className="tag">{s.billingFrequency}</span></td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(s.totalAmount)}</td>
                      <td>{fmtDate(s.renewalDate)}</td>
                      <td>{fmtDate(s.startDate)}</td>
                      <td><StatusBadge status={s.status} /></td>
                      <td><Link to={`/subscriptions/${s.id}`} className="btn btn-secondary btn-sm">Manage</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

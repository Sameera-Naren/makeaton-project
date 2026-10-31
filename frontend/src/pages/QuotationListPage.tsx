import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quotationsApi } from '../api/quotations';
import type { Quotation } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export function QuotationListPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    quotationsApi.list()
      .then((res) => setQuotations(res.data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: string | number) =>
    `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <>
      <div className="page-header">
        <h2>Quotations</h2>
        <p>Manage all customer quotations for Brightloop Software products.</p>
      </div>
      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <div className="card-header">
            <span className="card-title">All Quotations ({quotations.length})</span>
            <Link to="/quotations/new" className="btn btn-primary" id="btn-new-quotation">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Quotation
            </Link>
          </div>

          {loading ? (
            <div className="loading-wrap"><div className="spinner" /></div>
          ) : quotations.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>No quotations yet. Create your first one!</p>
              <Link to="/quotations/new" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>New Quotation</Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Quotation #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Expires</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.map((q) => (
                    <tr key={q.id}>
                      <td className="mono">{q.quotationNumber}</td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{q.customer?.companyName ?? '—'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{q.customer?.user?.email}</div>
                      </td>
                      <td>{q.items?.length ?? 0}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(q.totalAmount)}</td>
                      <td>{q.expiresAt ? fmtDate(q.expiresAt) : '—'}</td>
                      <td>{fmtDate(q.createdAt)}</td>
                      <td><StatusBadge status={q.status} /></td>
                      <td>
                        <Link to={`/quotations/${q.id}`} className="btn btn-secondary btn-sm">View</Link>
                      </td>
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

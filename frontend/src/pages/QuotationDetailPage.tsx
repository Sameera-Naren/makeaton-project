import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { quotationsApi } from '../api/quotations';
import type { Quotation } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';

type ModalType = 'confirm' | 'convert' | null;

export function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState<ModalType>(null);

  const load = () => {
    if (!id) return;
    setLoading(true);
    quotationsApi.getById(id)
      .then((res) => setQuotation(res.data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const fmt = (n: string | number) =>
    `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const handleConfirm = async () => {
    if (!id) return;
    setActionLoading(true); setError(''); setSuccess('');
    try {
      const res = await quotationsApi.confirm(id);
      setQuotation(res.data.data);
      setSuccess('Quotation confirmed successfully!');
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(false); setModal(null); }
  };

  const handleConvert = async () => {
    if (!id) return;
    setActionLoading(true); setError(''); setSuccess('');
    try {
      const res = await quotationsApi.convert(id);
      const sub = (res.data.data as any).subscription;
      setSuccess('Converted to subscription!');
      setModal(null);
      setTimeout(() => navigate(`/subscriptions/${sub.id}`), 1200);
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(false); }
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;
  if (!quotation) return <div className="page-content"><div className="alert alert-error">{error || 'Quotation not found'}</div></div>;

  return (
    <>
      {modal === 'confirm' && (
        <ConfirmModal
          title="Confirm Quotation"
          message={`Are you sure you want to confirm ${quotation.quotationNumber}? This will lock the quotation for conversion.`}
          confirmLabel="Yes, Confirm"
          confirmClass="btn btn-primary"
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal === 'convert' && (
        <ConfirmModal
          title="Convert to Subscription"
          message={`Convert ${quotation.quotationNumber} into an active subscription? This action cannot be undone.`}
          confirmLabel="Convert"
          confirmClass="btn btn-success"
          onConfirm={handleConvert}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      <div className="page-header">
        <Link to="/quotations" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Quotations
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <h2 style={{ marginBottom: 0 }}>{quotation.quotationNumber}</h2>
          <StatusBadge status={quotation.status} />
        </div>
        <p>Created {fmtDate(quotation.createdAt)}</p>
      </div>

      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Main */}
          <div>
            {/* Customer Info */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><span className="card-title">Customer</span></div>
              <div className="detail-grid">
                <div className="detail-row">
                  <div className="detail-label">Company</div>
                  <div className="detail-value">{quotation.customer?.companyName ?? '—'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Contact</div>
                  <div className="detail-value">{quotation.customer?.user?.name ?? '—'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{quotation.customer?.user?.email ?? '—'}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Expiry Date</div>
                  <div className="detail-value">{fmtDate(quotation.expiresAt)}</div>
                </div>
              </div>
              {quotation.notes && (
                <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 6 }}>
                  <div className="detail-label">Notes</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{quotation.notes}</div>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="card">
              <div className="card-header"><span className="card-title">Line Items ({quotation.items.length})</span></div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Plan</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Disc%</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.product?.name}</div>
                          {item.variant && <div className="tag">{item.variant.name}</div>}
                        </td>
                        <td>
                          <div>{item.plan?.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.plan?.billingFrequency}</div>
                        </td>
                        <td>{item.quantity}</td>
                        <td style={{ fontFamily: 'monospace' }}>{fmt(item.unitPrice)}</td>
                        <td>{Number(item.discountPct) > 0 ? `${item.discountPct}%` : '—'}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Totals */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><span className="card-title">Pricing Summary</span></div>
              <div className="totals-row"><span>Subtotal</span><span style={{ fontFamily: 'monospace' }}>{fmt(quotation.subtotal)}</span></div>
              <div className="totals-row">
                <span>Discount ({quotation.discountPct}%)</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--success)' }}>−{fmt(quotation.discountAmount)}</span>
              </div>
              <div className="totals-row total"><span>Total</span><span>{fmt(quotation.totalAmount)}</span></div>
            </div>

            {/* Timeline */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><span className="card-title">Timeline</span></div>
              <div className="detail-row">
                <div className="detail-label">Created</div>
                <div className="detail-value">{fmtDate(quotation.createdAt)}</div>
              </div>
              {quotation.confirmedAt && <div className="detail-row">
                <div className="detail-label">Confirmed</div>
                <div className="detail-value">{fmtDate(quotation.confirmedAt)}</div>
              </div>}
              {quotation.convertedAt && <div className="detail-row">
                <div className="detail-label">Converted</div>
                <div className="detail-value">{fmtDate(quotation.convertedAt)}</div>
              </div>}
              {quotation.subscription && (
                <div style={{ marginTop: 12 }}>
                  <Link to={`/subscriptions/${quotation.subscription.id}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                    View Subscription →
                  </Link>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="card">
              <div className="card-header"><span className="card-title">Actions</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {quotation.status === 'DRAFT' && (
                  <button className="btn btn-primary" style={{ justifyContent: 'center' }}
                    onClick={() => setModal('confirm')} id="btn-confirm-quotation">
                    ✓ Confirm Quotation
                  </button>
                )}
                {quotation.status === 'CONFIRMED' && !quotation.subscription && (
                  <button className="btn btn-success" style={{ justifyContent: 'center' }}
                    onClick={() => setModal('convert')} id="btn-convert-quotation">
                    ⚡ Convert to Subscription
                  </button>
                )}
                {quotation.status === 'CONVERTED' && (
                  <div className="badge badge-converted" style={{ justifyContent: 'center', padding: '10px' }}>
                    Already Converted
                  </div>
                )}
                {(quotation.status === 'DRAFT' || quotation.status === 'CONFIRMED') && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
                    {quotation.status === 'DRAFT' ? 'Confirm before converting to subscription' : 'Ready to convert to an active subscription'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

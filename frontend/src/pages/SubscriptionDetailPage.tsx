import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subscriptionsApi } from '../api/subscriptions';
import type { Subscription } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';

type ActionType = 'pause' | 'resume' | 'close' | null;

const ACTION_CONFIG: Record<NonNullable<ActionType>, { title: string; message: string; label: string; cls: string }> = {
  pause: { title: 'Pause Subscription', message: 'Pause this subscription? It can be resumed later.', label: 'Pause', cls: 'btn btn-warning' },
  resume: { title: 'Resume Subscription', message: 'Resume this paused subscription?', label: 'Resume', cls: 'btn btn-success' },
  close: { title: 'Close Subscription', message: 'Permanently close this subscription? This cannot be undone.', label: 'Close', cls: 'btn btn-danger' },
};

export function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modal, setModal] = useState<ActionType>(null);

  const load = () => {
    if (!id) return;
    setLoading(true);
    subscriptionsApi.getById(id)
      .then((res) => setSubscription(res.data.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const fmt = (n: string | number) =>
    `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const handleAction = async () => {
    if (!id || !modal) return;
    setActionLoading(true); setError(''); setSuccess('');
    try {
      let res;
      if (modal === 'pause') res = await subscriptionsApi.pause(id);
      else if (modal === 'resume') res = await subscriptionsApi.resume(id);
      else res = await subscriptionsApi.close(id);
      setSubscription(res.data.data);
      setSuccess(res.data.message);
    } catch (e: any) { setError(e.message); }
    finally { setActionLoading(false); setModal(null); }
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;
  if (!subscription) return <div className="page-content"><div className="alert alert-error">{error || 'Subscription not found'}</div></div>;

  const status = subscription.status;
  const canPause = status === 'ACTIVE';
  const canResume = status === 'PAUSED';
  const canClose = status === 'ACTIVE' || status === 'PAUSED';

  return (
    <>
      {modal && (
        <ConfirmModal
          {...ACTION_CONFIG[modal]}
          onConfirm={handleAction}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      <div className="page-header">
        <Link to="/subscriptions" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Subscriptions
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <h2 style={{ marginBottom: 0 }}>{subscription.subscriptionRef}</h2>
          <StatusBadge status={subscription.status} />
        </div>
        <p>Created from <Link to={`/quotations/${subscription.quotationId}`} style={{ color: 'var(--indigo-400)' }}>{subscription.quotation?.quotationNumber}</Link></p>
      </div>

      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          {/* Main */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><span className="card-title">Customer &amp; Details</span></div>
              <div className="detail-grid">
                <div className="detail-row">
                  <div className="detail-label">Company</div>
                  <div className="detail-value">{subscription.customer?.companyName}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Contact</div>
                  <div className="detail-value">{subscription.customer?.user?.name}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Billing Frequency</div>
                  <div className="detail-value"><span className="tag">{subscription.billingFrequency}</span></div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Total Amount</div>
                  <div className="detail-value" style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }}>{fmt(subscription.totalAmount)}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Start Date</div>
                  <div className="detail-value">{fmtDate(subscription.startDate)}</div>
                </div>
                <div className="detail-row">
                  <div className="detail-label">Renewal Date</div>
                  <div className="detail-value" style={{ color: 'var(--warning)' }}>{fmtDate(subscription.renewalDate)}</div>
                </div>
                {subscription.endDate && <div className="detail-row">
                  <div className="detail-label">End Date</div>
                  <div className="detail-value">{fmtDate(subscription.endDate)}</div>
                </div>}
                {subscription.pausedAt && <div className="detail-row">
                  <div className="detail-label">Paused At</div>
                  <div className="detail-value">{fmtDate(subscription.pausedAt)}</div>
                </div>}
                {subscription.closedAt && <div className="detail-row">
                  <div className="detail-label">Closed At</div>
                  <div className="detail-value">{fmtDate(subscription.closedAt)}</div>
                </div>}
              </div>
            </div>

            {/* Subscription Items */}
            <div className="card">
              <div className="card-header"><span className="card-title">Subscribed Items ({subscription.items.length})</span></div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Plan</th>
                      <th>Qty</th>
                      <th>Agreed Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscription.items.map((item) => (
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
                        <td style={{ fontFamily: 'monospace' }}>{fmt(item.agreedUnitPrice)}</td>
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
            {/* Actions */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header"><span className="card-title">Actions</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {canPause && (
                  <button className="btn btn-warning" style={{ justifyContent: 'center' }}
                    onClick={() => setModal('pause')} id="btn-pause-subscription">
                    ⏸ Pause Subscription
                  </button>
                )}
                {canResume && (
                  <button className="btn btn-success" style={{ justifyContent: 'center' }}
                    onClick={() => setModal('resume')} id="btn-resume-subscription">
                    ▶ Resume Subscription
                  </button>
                )}
                {canClose && (
                  <button className="btn btn-danger" style={{ justifyContent: 'center' }}
                    onClick={() => setModal('close')} id="btn-close-subscription">
                    ✕ Close Subscription
                  </button>
                )}
                {!canPause && !canResume && !canClose && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                    No actions available for {status} subscriptions.
                  </div>
                )}
              </div>
            </div>

            {/* Source Quotation */}
            <div className="card">
              <div className="card-header"><span className="card-title">Source Quotation</span></div>
              <Link to={`/quotations/${subscription.quotationId}`} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                {subscription.quotation?.quotationNumber} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

import type { QuotationStatus, SubscriptionStatus } from '../types';

type AnyStatus = QuotationStatus | SubscriptionStatus;

const STATUS_MAP: Record<AnyStatus, { label: string; cls: string; dot: string }> = {
  DRAFT:     { label: 'Draft',     cls: 'badge-draft',     dot: '#64748b' },
  CONFIRMED: { label: 'Confirmed', cls: 'badge-confirmed', dot: '#3b82f6' },
  CONVERTED: { label: 'Converted', cls: 'badge-converted', dot: '#8b5cf6' },
  EXPIRED:   { label: 'Expired',   cls: 'badge-expired',   dot: '#64748b' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-cancelled', dot: '#f87171' },
  ACTIVE:    { label: 'Active',    cls: 'badge-active',    dot: '#10b981' },
  PAUSED:    { label: 'Paused',    cls: 'badge-paused',    dot: '#f59e0b' },
  CLOSED:    { label: 'Closed',    cls: 'badge-closed',    dot: '#ef4444' },
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: 'badge-draft', dot: '#64748b' };
  return (
    <span className={`badge ${s.cls}`}>
      <span className="badge-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

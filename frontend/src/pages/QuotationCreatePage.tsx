import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { quotationsApi } from '../api/quotations';
import type { QuotationItemInput } from '../types';

interface LineItem extends QuotationItemInput {
  _id: number; // local key
}

const MOCK_CUSTOMERS = [
  { id: 'cust-001', companyName: 'Acme Corp' },
  { id: 'cust-002', companyName: 'TechStar Ltd' },
  { id: 'cust-003', companyName: 'Nova Solutions' },
];

const MOCK_PRODUCTS = [
  { id: 'prod-001', name: 'CRM Suite', basePrice: 5000 },
  { id: 'prod-002', name: 'HR Module', basePrice: 3500 },
  { id: 'prod-003', name: 'Analytics Pro', basePrice: 7000 },
  { id: 'prod-004', name: 'Support Desk', basePrice: 2000 },
];

const MOCK_PLANS = [
  { id: 'plan-001', name: 'Monthly Basic', billingFrequency: 'MONTHLY', price: 1000 },
  { id: 'plan-002', name: 'Monthly Pro', billingFrequency: 'MONTHLY', price: 2500 },
  { id: 'plan-003', name: 'Annual Basic', billingFrequency: 'YEARLY', price: 10000 },
  { id: 'plan-004', name: 'Annual Pro', billingFrequency: 'YEARLY', price: 24000 },
];

let _idCounter = 0;
function nextId() { return ++_idCounter; }

function defaultItem(): LineItem {
  return {
    _id: nextId(),
    productId: MOCK_PRODUCTS[0].id,
    planId: MOCK_PLANS[0].id,
    quantity: 1,
    unitPrice: MOCK_PRODUCTS[0].basePrice,
    discountPct: 0,
  };
}

function calcSubtotal(unitPrice: number, qty: number, discPct: number) {
  const gross = unitPrice * qty;
  return parseFloat((gross - (gross * discPct) / 100).toFixed(2));
}

export function QuotationCreatePage() {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState(MOCK_CUSTOMERS[0].id);
  const [notes, setNotes] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  });
  const [items, setItems] = useState<LineItem[]>([defaultItem()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((it) => {
      if (it._id !== id) return it;
      const updated = { ...it, [field]: value };
      if (field === 'productId') {
        const p = MOCK_PRODUCTS.find((p) => p.id === value);
        if (p) updated.unitPrice = p.basePrice;
      }
      return updated;
    }));
  };

  const removeItem = (id: number) => setItems((prev) => prev.filter((it) => it._id !== id));
  const addItem = () => setItems((prev) => [...prev, defaultItem()]);

  const rawSubtotal = items.reduce((s, i) => s + calcSubtotal(i.unitPrice, i.quantity, i.discountPct), 0);
  const discountAmount = parseFloat(((rawSubtotal * discountPct) / 100).toFixed(2));
  const totalAmount = parseFloat((rawSubtotal - discountAmount).toFixed(2));
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { setError('Add at least one item.'); return; }
    setLoading(true); setError('');
    try {
      const res = await quotationsApi.create({
        customerId,
        discountPct,
        notes,
        expiresAt,
        items: items.map(({ _id, ...rest }) => rest),
      });
      navigate(`/quotations/${res.data.data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <Link to="/quotations" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Quotations
        </Link>
        <h2>New Quotation</h2>
        <p>Create a quotation for a customer with products, plans and quantities.</p>
      </div>

      <div className="page-content">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>

          {/* Header Details */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><span className="card-title">Quotation Details</span></div>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label htmlFor="customerId">Customer *</label>
                <select id="customerId" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                  {MOCK_CUSTOMERS.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  ⚠ Mock data — will use real customers when Member 1 (Auth) is ready
                </span>
              </div>
              <div className="form-group">
                <label htmlFor="expiresAt">Expiry Date</label>
                <input id="expiresAt" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="discountPct">Overall Discount (%)</label>
                <input id="discountPct" type="number" min={0} max={100} step={0.01}
                  value={discountPct} onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <input id="notes" type="text" placeholder="Optional internal notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">Line Items</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} id="btn-add-item">
                + Add Item
              </button>
            </div>

            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 80px 120px 100px 80px 36px', gap: 10, padding: '0 12px 8px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>
              <span>Product</span><span>Plan</span><span>Qty</span><span>Unit Price (₹)</span><span>Disc%</span><span>Subtotal</span><span></span>
            </div>

            {items.map((item) => {
              const sub = calcSubtotal(item.unitPrice, item.quantity, item.discountPct);
              return (
                <div key={item._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 80px 120px 100px 80px 36px', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
                  <select value={item.productId} onChange={(e) => updateItem(item._id, 'productId', e.target.value)}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, padding: '7px 10px', fontSize: 13 }}>
                    {MOCK_PRODUCTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={item.planId} onChange={(e) => updateItem(item._id, 'planId', e.target.value)}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, padding: '7px 10px', fontSize: 13 }}>
                    {MOCK_PLANS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" min={1} value={item.quantity}
                    onChange={(e) => updateItem(item._id, 'quantity', parseInt(e.target.value) || 1)}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, padding: '7px 10px', fontSize: 13, width: '100%' }} />
                  <input type="number" min={0} step={0.01} value={item.unitPrice}
                    onChange={(e) => updateItem(item._id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, padding: '7px 10px', fontSize: 13, width: '100%' }} />
                  <input type="number" min={0} max={100} step={0.01} value={item.discountPct}
                    onChange={(e) => updateItem(item._id, 'discountPct', parseFloat(e.target.value) || 0)}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, padding: '7px 10px', fontSize: 13, width: '100%' }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                    {fmt(sub)}
                  </span>
                  <button type="button" onClick={() => removeItem(item._id)} disabled={items.length === 1}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', fontSize: 18, padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ×
                  </button>
                </div>
              );
            })}

            {/* Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <div className="totals-panel">
                <div className="totals-row"><span>Subtotal</span><span>{fmt(rawSubtotal)}</span></div>
                <div className="totals-row"><span>Discount ({discountPct}%)</span><span style={{ color: 'var(--success)' }}>−{fmt(discountAmount)}</span></div>
                <div className="totals-row total"><span>Total</span><span>{fmt(totalAmount)}</span></div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Link to="/quotations" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading} id="btn-create-quotation">
              {loading ? 'Creating…' : 'Create Quotation'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { User } from '../types';
import { formatINR } from '../utils/currency';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  FileText,
  AlertCircle,
  Calculator,
  Layers,
  Sparkles,
} from 'lucide-react';

interface LineItemForm {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
}

export const QuotationCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<User[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [validUntil, setValidUntil] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [lines, setLines] = useState<LineItemForm[]>([
    {
      productId: 'prod-001',
      productName: 'Brightloop Core ERP',
      variantId: 'var-001',
      variantName: 'Standard Edition',
      quantity: 1,
      unitPrice: 300,
      taxRate: 10,
      discount: 0,
    },
    {
      productId: 'prod-002',
      productName: 'User License Seat',
      quantity: 5,
      unitPrice: 35,
      taxRate: 10,
      discount: 0,
    },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [custData, prodData, planData] = await Promise.all([
          api.subscriptions.getCustomers().catch(() => []),
          api.products.getAll().catch(() => []),
          api.products.getPlans().catch(() => []),
        ]);

        setCustomers(custData);
        if (custData.length > 0) {
          setSelectedCustomerId(custData[0].id);
        }

        setProducts(prodData);
        setPlans(planData);
        if (planData.length > 0) {
          setSelectedPlanId(planData[0].id);
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch catalogue data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleProductChange = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      productId: prod.id,
      productName: prod.name,
      variantId: prod.variants?.[0]?.id || undefined,
      variantName: prod.variants?.[0]?.name || undefined,
      unitPrice: prod.salesPrice + (prod.variants?.[0]?.priceAdjustment || 0),
    };
    setLines(newLines);
  };

  const handleVariantChange = (index: number, variantId: string) => {
    const prod = products.find((p) => p.id === lines[index].productId);
    const variant = prod?.variants?.find((v: any) => v.id === variantId);

    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      variantId: variant ? variant.id : undefined,
      variantName: variant ? variant.name : undefined,
      unitPrice: (prod?.salesPrice || 0) + (variant?.priceAdjustment || 0),
    };
    setLines(newLines);
  };

  const handleLineFieldChange = (
    index: number,
    field: 'quantity' | 'unitPrice' | 'taxRate' | 'discount',
    val: number
  ) => {
    const newLines = [...lines];
    newLines[index] = {
      ...newLines[index],
      [field]: val,
    };
    setLines(newLines);
  };

  const addLine = () => {
    const defaultProd = products[0] || {
      id: 'prod-001',
      name: 'Brightloop Core ERP',
      salesPrice: 300,
    };
    setLines([
      ...lines,
      {
        productId: defaultProd.id,
        productName: defaultProd.name,
        quantity: 1,
        unitPrice: defaultProd.salesPrice || 100,
        taxRate: 10,
        discount: 0,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const totalDiscount = lines.reduce((sum, l) => sum + (l.discount || 0), 0);
  const totalTax = lines.reduce((sum, l) => {
    const taxable = Math.max(0, l.quantity * l.unitPrice - (l.discount || 0));
    return sum + (taxable * (l.taxRate || 0)) / 100;
  }, 0);
  const totalAmount = Math.max(0, subtotal - totalDiscount + totalTax);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }
    if (lines.length === 0) {
      setError('At least one item is required in the quotation.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const selectedPlan = plans.find((p) => p.id === selectedPlanId);

      const quotation = await api.quotations.create({
        customerId: selectedCustomerId,
        planId: selectedPlanId || 'plan-001',
        planName: selectedPlan?.name || 'Brightloop Enterprise Cloud Suite',
        validUntil: new Date(validUntil).toISOString(),
        notes,
        lines: lines.map((l) => ({
          productId: l.productId,
          productName: l.productName,
          variantId: l.variantId,
          variantName: l.variantName,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          taxRate: Number(l.taxRate),
          discount: Number(l.discount),
        })),
      });

      navigate(`/quotations/${quotation.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create quotation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to="/quotations"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quotations</span>
        </Link>
      </div>

      {/* Header */}
      <div className="pb-4 border-b border-zinc-150">
        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-tight bg-pastel-yellow text-amber-950 inline-block mb-2">
          New Sales Proposal
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
          Create Customer Quotation
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Prepare a tailored proposal with software base units, plan frequency, add-on seats, and agreed pricing snapshots.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Customer & Package Info Card */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
              Customer &amp; Subscription Plan Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Customer Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                Client Organization *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName ? `${c.companyName} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                Subscription Plan *
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                required
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.billingFrequency})
                  </option>
                ))}
              </select>
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
                Proposal Expiry Date
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">
              Proposal Notes &amp; Payment Terms
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Net 15 terms. Includes 24/7 dedicated support SLA and setup fee waiver."
              className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>
        </div>

        {/* Step 2: Line Items Builder Card */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h2 className="text-lg font-bold text-zinc-950 tracking-tight">
                Products, Variants &amp; User Quantities
              </h2>
            </div>

            <button
              type="button"
              onClick={addLine}
              className="px-4 py-2 rounded-full border border-zinc-200 hover:border-zinc-300 bg-zinc-50 text-xs font-bold text-zinc-800 hover:bg-zinc-100 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="space-y-4">
            {lines.map((line, index) => {
              const currentProd = products.find((p) => p.id === line.productId);
              const hasVariants = currentProd?.variants && currentProd.variants.length > 0;
              const lineSub = line.quantity * line.unitPrice;
              const lineDiscount = line.discount || 0;
              const lineTax = (Math.max(0, lineSub - lineDiscount) * (line.taxRate || 0)) / 100;
              const lineFinal = Math.max(0, lineSub - lineDiscount) + lineTax;

              return (
                <div
                  key={index}
                  className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
                >
                  {/* Product */}
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Product / Module
                    </label>
                    <select
                      value={line.productId}
                      onChange={(e) => handleProductChange(index, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({formatINR(p.salesPrice)})
                        </option>
                      ))}
                    </select>

                    {/* Variant dropdown if available */}
                    {hasVariants && (
                      <div className="mt-2">
                        <select
                          value={line.variantId || ''}
                          onChange={(e) => handleVariantChange(index, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 text-[11px] font-medium text-indigo-900 focus:outline-none"
                        >
                          {currentProd.variants.map((v: any) => (
                            <option key={v.id} value={v.id}>
                              Variant: {v.name} (+{formatINR(v.priceAdjustment)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Qty */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) =>
                        handleLineFieldChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  {/* Unit Price */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Unit Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) =>
                        handleLineFieldChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  {/* Discount */}
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Disc (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={line.discount}
                      onChange={(e) =>
                        handleLineFieldChange(index, 'discount', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 text-center"
                    />
                  </div>

                  {/* Tax Rate */}
                  <div className="md:col-span-1">
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                      Tax %
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={line.taxRate}
                      onChange={(e) =>
                        handleLineFieldChange(index, 'taxRate', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-2 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 text-center"
                    />
                  </div>

                  {/* Line Total */}
                  <div className="md:col-span-1 text-right">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Total
                    </label>
                    <span className="text-xs font-bold font-mono text-zinc-950 block py-2">
                      {formatINR(lineFinal)}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <div className="md:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      disabled={lines.length <= 1}
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition disabled:opacity-30"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Quotation Totals & Actions (Reference 1 Aesthetic) */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Pricing Breakdown
            </span>
            <div className="space-y-1 text-xs text-zinc-600">
              <div className="flex items-center gap-4">
                <span className="w-28 text-zinc-500">Items Subtotal:</span>
                <span className="font-mono font-bold">{formatINR(subtotal)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-28 text-zinc-500">Total Discounts:</span>
                <span className="font-mono font-bold text-emerald-600">-{formatINR(totalDiscount)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-28 text-zinc-500">Total Taxes:</span>
                <span className="font-mono font-bold">+{formatINR(totalTax)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-right">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Agreed Total Amount
              </span>
              <span className="text-3xl font-black font-mono text-zinc-950 tracking-tight">
                {formatINR(totalAmount)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/quotations')}
                className="px-6 py-3.5 rounded-full border border-zinc-200 hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <span>Generating Proposal...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Save Draft Quotation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

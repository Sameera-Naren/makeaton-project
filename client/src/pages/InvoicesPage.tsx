import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CustomerInvoice } from '../types';
import { formatINR } from '../utils/currency';
import {
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Printer,
  ArrowUpRight,
  Zap,
  Tag,
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<CustomerInvoice | null>(null);
  const [payMethod, setPayMethod] = useState<'CREDIT_CARD' | 'BANK_TRANSFER' | 'STRIPE'>('CREDIT_CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CONFIRMED' | 'PAID'>('ALL');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await api.customer.getInvoices();
      setInvoices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePay = async () => {
    if (!payingInvoice) return;
    try {
      setIsProcessing(true);
      await api.customer.payInvoice({
        invoiceId: payingInvoice.id,
        paymentMethod: payMethod,
        note: `Settled via customer portal (${payMethod})`,
      });
      setPayingInvoice(null);
      await fetchInvoices();
      setSuccessToast(`Payment recorded for Invoice ${payingInvoice.invoiceNumber}!`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (e: any) {
      alert(`Payment failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredInvoices = invoices.filter((i) => {
    if (filter === 'ALL') return true;
    if (filter === 'CONFIRMED') return i.status === 'CONFIRMED' || i.status === 'OVERDUE';
    return i.status === filter;
  });

  const outstandingTotal = invoices
    .filter((i) => i.status === 'CONFIRMED' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {successToast && (
        <div className="p-4 rounded-2xl bg-zinc-900 text-white text-sm font-semibold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Billing &amp; Receivables
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
            Customer Invoices
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Review detailed invoice line items, tax breakdowns, discount credits, and remit payments online.
          </p>
        </div>

        {/* Outstanding Total Badge */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl px-5 py-3 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-lg">
            ₹
          </div>
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              Total Outstanding
            </span>
            <span className="text-xl font-extrabold text-zinc-950 font-mono">
              {formatINR(outstandingTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-zinc-100 p-1 rounded-full text-xs font-semibold w-fit">
        {(['ALL', 'CONFIRMED', 'PAID'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-full transition ${
              filter === tab ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {tab === 'CONFIRMED' ? 'OUTSTANDING / DUE' : tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-zinc-400 mt-2 font-medium">Fetching invoices...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvoices.map((inv) => {
            const isPaid = inv.status === 'PAID';
            return (
              <div
                key={inv.id}
                className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-800 font-mono">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPaid ? 'PAID' : 'DUE / CONFIRMED'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-zinc-950 tracking-tight mb-1">
                    {formatINR(inv.totalAmount)}
                  </h3>
                  <p className="text-xs text-zinc-500 mb-4 line-clamp-2">
                    {inv.notes || `Invoice generated for ${inv.subscriptionNumber || 'recurring plan'}`}
                  </p>

                  <div className="space-y-2 py-3 border-y border-zinc-100 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Issue Date:</span>
                      <span className="font-semibold text-zinc-800">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Due Date:</span>
                      <span className="font-semibold text-zinc-800">
                        {new Date(inv.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {inv.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" /> Discount:
                        </span>
                        <span>-{formatINR(inv.discountAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="flex-1 py-2.5 rounded-full border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-800 transition"
                  >
                    View Details
                  </button>

                  {!isPaid && (
                    <button
                      onClick={() => setPayingInvoice(inv)}
                      className="flex-1 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <span>Pay Now</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-zinc-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Brightloop Invoice
                </span>
                <h3 className="text-2xl font-black text-zinc-950 font-mono">
                  {selectedInvoice.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            {/* Quick Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-50 text-xs">
              <div>
                <span className="text-zinc-400 font-semibold block">Issue Date</span>
                <span className="font-bold text-zinc-900 mt-0.5 block">
                  {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 font-semibold block">Due Date</span>
                <span className="font-bold text-zinc-900 mt-0.5 block">
                  {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 font-semibold block">Status</span>
                <span
                  className={`font-extrabold mt-0.5 block ${
                    selectedInvoice.status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {selectedInvoice.status}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 font-semibold block">Plan Reference</span>
                <span className="font-bold text-zinc-900 mt-0.5 block font-mono">
                  {selectedInvoice.subscriptionNumber || 'Direct Package'}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-zinc-150 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 font-bold text-zinc-500 border-b border-zinc-150 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Item Description</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Tax Rate</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {selectedInvoice.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="py-3 px-4 font-semibold text-zinc-900">{line.description}</td>
                      <td className="py-3 px-4 text-center text-zinc-600">{line.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-700">
                        {formatINR(line.unitPrice)}
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-500">{line.taxRate}%</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-zinc-950">
                        {formatINR(line.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Calculation (Subtotal, Tax, Discount, Total) */}
            <div className="bg-zinc-50 rounded-2xl p-4 space-y-2 text-xs border border-zinc-150">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal (Pre-tax):</span>
                <span className="font-mono">{formatINR(selectedInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Calculated Tax:</span>
                <span className="font-mono">+{formatINR(selectedInvoice.taxAmount)}</span>
              </div>
              {selectedInvoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-{formatINR(selectedInvoice.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-zinc-200 pt-2 flex justify-between font-extrabold text-sm text-zinc-950">
                <span>Total Amount:</span>
                <span className="font-mono text-base text-indigo-700">
                  {formatINR(selectedInvoice.totalAmount)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2.5 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Close
              </button>
              {selectedInvoice.status !== 'PAID' && (
                <button
                  onClick={() => {
                    setPayingInvoice(selectedInvoice);
                    setSelectedInvoice(null);
                  }}
                  className="px-6 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white text-xs font-bold transition"
                >
                  Pay Invoice Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-zinc-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Payment Remittance
                </span>
                <h3 className="text-2xl font-extrabold text-zinc-950">
                  Pay Invoice {payingInvoice.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setPayingInvoice(null)}
                className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-4 text-sm font-semibold flex justify-between items-center border border-zinc-150">
              <span className="text-zinc-600">Amount Due:</span>
              <span className="text-xl font-black font-mono text-zinc-950">
                {formatINR(payingInvoice.totalAmount)}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
                  { id: 'BANK_TRANSFER', label: 'Bank Wire / NEFT', icon: Zap },
                  { id: 'STRIPE', label: 'UPI / Online', icon: CreditCard },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id as any)}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                        payMethod === m.id
                          ? 'border-black bg-zinc-950 text-white'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPayingInvoice(null)}
                className="flex-1 px-4 py-3 rounded-full border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePay}
                className="flex-1 px-4 py-3 rounded-full bg-black hover:bg-zinc-800 text-white text-sm font-bold transition flex items-center justify-center gap-2"
              >
                {isProcessing ? 'Processing...' : `Pay ${formatINR(payingInvoice.totalAmount)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

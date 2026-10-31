import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CustomerInvoice, CustomerPayment, PaymentMethod } from '../types';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  DollarSign,
  Plus,
  Printer,
  Search,
  Filter,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const BillingPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<CustomerPayment | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form
  const [payInvoiceId, setPayInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [payRefNote, setPayRefNote] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const [payList, invList] = await Promise.all([
        api.billing.getPayments({
          paymentMethod: methodFilter === 'ALL' ? undefined : methodFilter,
        }),
        api.billing.getInvoices(),
      ]);
      setPayments(payList);
      setInvoices(invList);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [methodFilter]);

  const totalVolume = payments.reduce((acc, p) => acc + p.amount, 0);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payInvoiceId || !payAmount) return;
    try {
      const res = await api.billing.recordPayment({
        invoiceId: payInvoiceId,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        referenceNote: payRefNote,
      });
      showToast(`Payment ${res.payment.paymentNumber} (₹${res.payment.amount}) recorded!`);
      setIsPayModalOpen(false);
      setPayInvoiceId('');
      setPayAmount('');
      setPayRefNote('');
      loadPayments();
    } catch (err: any) {
      alert(err.message || 'Payment recording failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-zinc-700 animate-fade-in text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-950 text-white tracking-wide">
              SETTLEMENTS
            </span>
            <span className="text-xs text-zinc-400 font-medium">Payment Ledger & Receipts</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight mt-2">
            Payments Ledger & Audit Trail
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Immutable log of received remittances, instant settlements, and payment vouchers.
          </p>
        </div>

        <div>
          <button
            onClick={() => setIsPayModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-800 rounded-full shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Record Payment Remittance</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Volume Logged</div>
          <div className="text-3xl font-extrabold text-zinc-950 mt-2">₹{totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-emerald-600 mt-1.5 font-semibold">100% Verified Receipts</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Completed Transactions</div>
          <div className="text-3xl font-extrabold text-zinc-950 mt-2">{payments.length}</div>
          <div className="text-xs text-zinc-500 mt-1.5 font-medium">Across all registered rails</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Avg Transaction Size</div>
          <div className="text-3xl font-extrabold text-zinc-950 mt-2">₹{payments.length > 0 ? (totalVolume / payments.length).toFixed(2) : '0.00'}
          </div>
          <div className="text-xs text-zinc-500 mt-1.5 font-medium">Per cleared transaction</div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-zinc-400 font-medium mr-1">Method:</span>
          {['ALL', 'CREDIT_CARD', 'BANK_TRANSFER', 'STRIPE', 'CASH', 'UPI'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                methodFilter === m
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-sm">Loading payments ledger...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">No payments recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200/80 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-6">Payment Number</th>
                  <th className="py-3 px-6">Invoice #</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Channel</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Reference Note</th>
                  <th className="py-3 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-zinc-950">{p.paymentNumber}</td>
                    <td className="py-3.5 px-6 font-semibold text-indigo-600">{p.invoiceNumber}</td>
                    <td className="py-3.5 px-6 text-zinc-600">{new Date(p.paymentDate).toLocaleString()}</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 text-[11px] font-semibold">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-extrabold text-emerald-600 text-sm">₹{p.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-zinc-500 text-[11px] italic">
                      {p.referenceNote || 'Processed successfully'}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="px-3.5 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl">
            <h3 className="font-extrabold text-zinc-950 text-lg mb-4">Record Payment Remittance</h3>
            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-800 mb-1.5">Target Invoice</label>
                <select
                  value={payInvoiceId}
                  onChange={(e) => {
                    setPayInvoiceId(e.target.value);
                    const inv = invoices.find((i) => i.id === e.target.value);
                    if (inv) setPayAmount(String(inv.totalAmount));
                  }}
                  className="w-full p-3 border border-zinc-200 rounded-2xl font-semibold"
                  required
                >
                  <option value="">Select Invoice...</option>
                  {invoices
                    .filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED')
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — ₹${inv.totalAmount.toFixed(2)} ({inv.status})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 mb-1.5">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full p-2.5 border border-zinc-200 rounded-2xl font-bold text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 mb-1.5">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2.5 border border-zinc-200 rounded-2xl font-semibold"
                  >
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Wire</option>
                    <option value="STRIPE">Stripe</option>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-800 mb-1.5">Reference / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Check #294 or Wire Ref ACH-99182"
                  value={payRefNote}
                  onChange={(e) => setPayRefNote(e.target.value)}
                  className="w-full p-2.5 border border-zinc-200 rounded-2xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-5 py-2.5 text-zinc-600 rounded-full font-semibold hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700"
                >
                  Confirm Remittance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-zinc-200">
            <div className="text-center pb-5 border-b border-zinc-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-zinc-950 text-xl">Official Payment Receipt</h3>
              <p className="text-xs text-zinc-400 mt-1">Brightloop Subscription Management Platform</p>
            </div>

            <div className="my-6 space-y-3.5 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500 font-medium">Receipt Voucher #</span>
                <span className="font-mono font-bold text-zinc-950">{selectedReceipt.paymentNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500 font-medium">Settled Invoice #</span>
                <span className="font-semibold text-indigo-600">{selectedReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500 font-medium">Timestamp</span>
                <span className="font-medium text-zinc-700">{new Date(selectedReceipt.paymentDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500 font-medium">Payment Rail</span>
                <span className="font-bold text-zinc-900">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-100">
                <span className="text-zinc-500 font-medium">Reference Memo</span>
                <span className="text-zinc-600 italic">{selectedReceipt.referenceNote || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-extrabold text-zinc-950 pt-3">
                <span>Amount Cleared</span>
                <span className="text-emerald-600">₹{selectedReceipt.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-zinc-300 rounded-full text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                <Printer className="w-4 h-4" />
                Print Voucher
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 py-2.5 bg-zinc-950 text-white rounded-full text-xs font-bold hover:bg-zinc-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CustomerInvoice, CustomerSubscription, InvoiceStatus, PaymentMethod } from '../types';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  CreditCard,
  Printer,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';

export const BillingInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Generate Modal state
  const [genSubId, setGenSubId] = useState('');
  const [genDueDate, setGenDueDate] = useState('');
  const [genDiscountPercent, setGenDiscountPercent] = useState('0');
  const [genNotes, setGenNotes] = useState('');

  // Payment Modal state
  const [payTargetInvoice, setPayTargetInvoice] = useState<CustomerInvoice | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [payRefNote, setPayRefNote] = useState('');

  // Manual Modal state
  const [manDesc, setManDesc] = useState('');
  const [manQty, setManQty] = useState('1');
  const [manPrice, setManPrice] = useState('100');
  const [manTax, setManTax] = useState('10');
  const [manDiscount, setManDiscount] = useState('0');
  const [manDueDate, setManDueDate] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const [invList, subList] = await Promise.all([
        api.billing.getInvoices({
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          search: search || undefined,
        }),
        api.customer.getSubscriptions().catch(() => []),
      ]);
      setInvoices(invList);
      setSubscriptions(subList);
      if (subList.length > 0 && !genSubId) {
        setGenSubId(subList[0].id);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadInvoices();
  };

  const handleStatusChange = async (id: string, newStatus: InvoiceStatus) => {
    try {
      await api.billing.updateInvoiceStatus(id, newStatus);
      showToast(`Invoice updated to ${newStatus}`);
      loadInvoices();
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genSubId) return;
    try {
      const inv = await api.billing.generateInvoice({
        subscriptionId: genSubId,
        dueDate: genDueDate ? new Date(genDueDate).toISOString() : undefined,
        discountPercent: Number(genDiscountPercent) || 0,
        notes: genNotes || undefined,
        status: 'CONFIRMED',
      });
      showToast(`Generated ${inv.invoiceNumber} ($${inv.totalAmount.toFixed(2)})`);
      setIsGenerateModalOpen(false);
      loadInvoices();
    } catch (err: any) {
      alert(err.message || 'Generation failed.');
    }
  };

  const handleManualInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const inv = await api.billing.createInvoice({
        customerId: 'cust-uuid-001',
        dueDate: manDueDate ? new Date(manDueDate).toISOString() : undefined,
        lines: [
          {
            description: manDesc || 'General Subscription Charge',
            quantity: Number(manQty) || 1,
            unitPrice: Number(manPrice) || 0,
            taxRate: Number(manTax) || 0,
          },
        ],
        discountAmount: Number(manDiscount) || 0,
        status: 'CONFIRMED',
      });
      showToast(`Created invoice ${inv.invoiceNumber}`);
      setIsManualModalOpen(false);
      loadInvoices();
    } catch (err: any) {
      alert(err.message || 'Failed creating manual invoice.');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTargetInvoice) return;
    try {
      const res = await api.billing.recordPayment({
        invoiceId: payTargetInvoice.id,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        referenceNote: payRefNote,
      });
      showToast(`Recorded payment ${res.payment.paymentNumber} ($${res.payment.amount})`);
      setIsPayModalOpen(false);
      setPayTargetInvoice(null);
      loadInvoices();
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              Staff Billing Console
            </span>
            <span className="text-xs text-zinc-400">Lifecycle Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
            Invoices & Accounts Receivable
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Generate recurring customer bills, monitor due dates, and update statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-zinc-500" />
            + Manual Invoice
          </button>
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Zap className="w-4 h-4" />
            Auto-Generate from Sub
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice #, sub #, or memo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">Filter:</span>
          {['ALL', 'CONFIRMED', 'PAID', 'OVERDUE', 'DRAFT', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400 text-sm">Loading invoice portfolio...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            No invoices found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-200/80 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-6">Invoice #</th>
                  <th className="py-3 px-6">Dates</th>
                  <th className="py-3 px-6">Subscription</th>
                  <th className="py-3 px-6">Subtotal</th>
                  <th className="py-3 px-6">Tax / Disc</th>
                  <th className="py-3 px-6">Net Amount</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-zinc-950 font-mono">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-zinc-400 truncate max-w-[140px]">
                        {inv.notes || 'Subscription billing'}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-zinc-600">
                      <div>Issued: {new Date(inv.issueDate).toLocaleDateString()}</div>
                      <div className="text-[10px] text-zinc-400">Due: {new Date(inv.dueDate).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      {inv.subscriptionNumber ? (
                        <span className="font-mono text-indigo-600 font-semibold">{inv.subscriptionNumber}</span>
                      ) : (
                        <span className="text-zinc-400 italic">Manual Ad-Hoc</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-zinc-700 font-medium">${inv.subtotal.toFixed(2)}</td>
                    <td className="py-3.5 px-6 text-zinc-500">
                      <div>Tax: ${inv.taxAmount.toFixed(2)}</div>
                      {inv.discountAmount > 0 && (
                        <div className="text-emerald-600 text-[10px] font-semibold">
                          -Disc: ${inv.discountAmount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-6 font-extrabold text-zinc-900 text-sm">
                      ${inv.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'OVERDUE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : inv.status === 'CONFIRMED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : inv.status === 'DRAFT'
                            ? 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                            : 'bg-zinc-100 text-zinc-400'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold transition"
                      >
                        Inspect
                      </button>

                      {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                        <button
                          onClick={() => {
                            setPayTargetInvoice(inv);
                            setPayAmount(String(inv.totalAmount));
                            setIsPayModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition"
                        >
                          Record Pay
                        </button>
                      )}

                      <select
                        value={inv.status}
                        onChange={(e) => handleStatusChange(inv.id, e.target.value as InvoiceStatus)}
                        className="px-1.5 py-1 text-[11px] bg-white border border-zinc-200 rounded font-medium text-zinc-700"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="PAID">Paid</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-zinc-200">
            <div className="flex items-start justify-between pb-6 border-b border-zinc-200">
              <div>
                <div className="text-xl font-extrabold text-zinc-950">
                  {selectedInvoice.invoiceNumber}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Issued: {new Date(selectedInvoice.issueDate).toLocaleDateString()} • Due:{' '}
                  {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-zinc-400 hover:text-zinc-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Tax</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {selectedInvoice.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-2.5 font-medium text-zinc-900">{l.description}</td>
                      <td className="py-2.5 text-center text-zinc-600">{l.quantity}</td>
                      <td className="py-2.5 text-right text-zinc-600">${l.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-right text-zinc-600">{l.taxRate}%</td>
                      <td className="py-2.5 text-right font-semibold text-zinc-900">${l.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-200 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-${selectedInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>Tax:</span>
                  <span className="font-semibold">${selectedInvoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-zinc-950 pt-2 border-t border-zinc-200">
                  <span>Net Total:</span>
                  <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-bold text-zinc-900 text-base mb-4">Generate Invoice from Subscription</h3>
            <form onSubmit={handleGenerateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Subscription</label>
                <select
                  value={genSubId}
                  onChange={(e) => setGenSubId(e.target.value)}
                  className="w-full p-2 border border-zinc-200 rounded-lg"
                  required
                >
                  {subscriptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subscriptionNumber} — {s.planName} (${s.totalAmount.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={genDueDate}
                    onChange={(e) => setGenDueDate(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={genDiscountPercent}
                    onChange={(e) => setGenDiscountPercent(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 border rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold"
                >
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Payment Modal */}
      {isPayModalOpen && payTargetInvoice && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-bold text-zinc-900 text-base mb-4">
              Record Payment: {payTargetInvoice.invoiceNumber}
            </h3>
            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Payment Channel</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 border border-zinc-200 rounded-lg"
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
                <label className="block font-semibold text-zinc-700 mb-1">Note / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Wire check #488"
                  value={payRefNote}
                  onChange={(e) => setPayRefNote(e.target.value)}
                  className="w-full p-2 border border-zinc-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 border rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-semibold"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Ad-Hoc Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="font-bold text-zinc-900 text-base mb-4">Create Manual Invoice</h3>
            <form onSubmit={handleManualInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Infrastructure Setup Services"
                  value={manDesc}
                  onChange={(e) => setManDesc(e.target.value)}
                  className="w-full p-2 border border-zinc-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={manQty}
                    onChange={(e) => setManQty(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={manPrice}
                    onChange={(e) => setManPrice(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Tax (%)</label>
                  <input
                    type="number"
                    min="0"
                    value={manTax}
                    onChange={(e) => setManTax(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 border rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

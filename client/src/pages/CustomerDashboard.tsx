import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CustomerDashboardSummary, CustomerInvoice } from '../types';
import { CardWithArrow } from '../components/CardWithArrow';
import {
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Send,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<CustomerDashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [quickActionInput, setQuickActionInput] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Payment modal state
  const [payingInvoice, setPayingInvoice] = useState<CustomerInvoice | null>(null);
  const [payMethod, setPayMethod] = useState<'CREDIT_CARD' | 'BANK_TRANSFER' | 'STRIPE'>('CREDIT_CARD');
  const [isProcessingPay, setIsProcessingPay] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.customer.getDashboard();
      setDashboard(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Could not load customer dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handlePayInvoice = async () => {
    if (!payingInvoice) return;
    try {
      setIsProcessingPay(true);
      await api.customer.payInvoice({
        invoiceId: payingInvoice.id,
        paymentMethod: payMethod,
        note: `Self-service portal settlement via ${payMethod}`,
      });
      setPayingInvoice(null);
      setFeedbackMsg(`Invoice ${payingInvoice.invoiceNumber} paid successfully!`);
      setTimeout(() => setFeedbackMsg(null), 4000);
      await fetchDashboard();
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setIsProcessingPay(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 text-sm font-medium">Loading customer portal...</p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 flex items-center gap-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h4 className="font-bold">Unable to load dashboard</h4>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchDashboard}
              className="mt-3 px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { metrics, activeSubscriptions, recentInvoices } = dashboard;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{feedbackMsg}</span>
        </div>
      )}

      {/* Hero Section matching the reference layout & bold typography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 pb-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Customer Self-Service Hub</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-zinc-950 tracking-tight leading-[1.08]">
            Grow Bold.<br />
            Move Free.<br />
            Scale Hard.
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg max-w-xl leading-relaxed">
            Welcome back, <strong className="text-zinc-900">{user?.name}</strong> ({user?.companyName || 'Brightloop Partner'}).
            Manage active subscriptions, view recurring billing cycles, and settle outstanding invoices in one click.
          </p>

          {/* Quick Subscribe / Action bar matching reference UI */}
          <div className="pt-2 max-w-md">
            <label className="text-xs font-medium text-zinc-500 block mb-1.5">
              Quick subscription inquiry or promo code
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter plan code or query..."
                value={quickActionInput}
                onChange={(e) => setQuickActionInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-full border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
              <button
                onClick={() => {
                  setFeedbackMsg(`Inquiry received for: "${quickActionInput || 'Enterprise Plan'}"`);
                  setQuickActionInput('');
                  setTimeout(() => setFeedbackMsg(null), 3500);
                }}
                className="bg-black hover:bg-zinc-800 text-white px-6 py-3 rounded-full text-sm font-semibold transition flex items-center gap-2 shadow-sm"
              >
                <span>Inquire</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Hero Right: Modern High-Impact Metrics */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {/* Metric 1: Active Subscriptions */}
          <div className="bg-indigo-50/80 rounded-3xl p-6 border border-indigo-100/80 flex flex-col justify-between">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
              Active Plans
            </span>
            <div className="my-4">
              <span className="text-4xl font-extrabold text-zinc-950">
                {metrics.activeSubscriptionsCount}
              </span>
              <p className="text-xs text-indigo-600 mt-1">Healthy & Running</p>
            </div>
            <button
              onClick={() => navigate('/subscriptions')}
              className="text-xs font-bold text-zinc-900 hover:text-indigo-600 inline-flex items-center gap-1"
            >
              <span>View Plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Metric 2: Outstanding Balance */}
          <div className="bg-amber-50/90 rounded-3xl p-6 border border-amber-100 flex flex-col justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Outstanding Due
            </span>
            <div className="my-4">
              <span className="text-3xl font-extrabold text-zinc-950">
                ${metrics.outstandingAmount.toFixed(2)}
              </span>
              <p className="text-xs text-amber-700 mt-1">
                {metrics.outstandingAmount > 0 ? 'Payment Pending' : 'All Settled'}
              </p>
            </div>
            <button
              onClick={() => navigate('/invoices')}
              className="text-xs font-bold text-zinc-900 hover:text-amber-700 inline-flex items-center gap-1"
            >
              <span>Review Invoices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Metric 3: Next Renewal */}
          <div className="bg-purple-50/80 rounded-3xl p-6 border border-purple-100 flex flex-col justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
              Next Renewal
            </span>
            <div className="my-4">
              <span className="text-xl font-bold text-zinc-950 block truncate">
                {metrics.nextRenewalDate
                  ? new Date(metrics.nextRenewalDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </span>
              <p className="text-xs text-purple-600 mt-1">Auto-renew enabled</p>
            </div>
            <span className="text-xs text-zinc-500 font-medium">Automatic billing</span>
          </div>

          {/* Metric 4: Paid Invoices */}
          <div className="bg-emerald-50/80 rounded-3xl p-6 border border-emerald-100 flex flex-col justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Paid Invoices
            </span>
            <div className="my-4">
              <span className="text-4xl font-extrabold text-zinc-950">
                {metrics.paidInvoicesCount}
              </span>
              <p className="text-xs text-emerald-700 mt-1">Of {metrics.totalInvoicesCount} Total</p>
            </div>
            <button
              onClick={() => navigate('/payments')}
              className="text-xs font-bold text-zinc-900 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              <span>Payment History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Outstanding Alert Banner if any balance */}
      {metrics.outstandingAmount > 0 && (
        <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-xl flex-shrink-0">
              $
            </div>
            <div>
              <h3 className="text-lg font-bold">Outstanding Invoices Awaiting Settlement</h3>
              <p className="text-zinc-400 text-sm mt-0.5">
                You have ${metrics.outstandingAmount.toFixed(2)} pending payment. Settle now to maintain uninterrupted cloud services.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const pending = recentInvoices.find((i) => i.status === 'CONFIRMED' || i.status === 'OVERDUE');
              if (pending) {
                setPayingInvoice(pending);
              } else {
                navigate('/invoices');
              }
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-100 transition whitespace-nowrap"
          >
            Pay Balance Now
          </button>
        </div>
      )}

      {/* SECTION 1: Active Subscriptions Cards (Reference UI Layout) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">
              Active Subscriptions
            </h2>
            <p className="text-zinc-500 text-sm">
              Your ongoing Brightloop software plans, add-ons, and service terms
            </p>
          </div>
          <button
            onClick={() => navigate('/subscriptions')}
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1 border border-zinc-200 px-3 py-1.5 rounded-full"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSubscriptions.map((sub, idx) => {
            const pastelBgs = ['bg-[#c7d2fe]', 'bg-[#fef08a]', 'bg-[#ddd6fe]'];
            const bg = pastelBgs[idx % pastelBgs.length];

            return (
              <CardWithArrow
                key={sub.id}
                pillText={`${sub.billingFrequency} BILLING`}
                pillColor="bg-zinc-950 text-white"
                title={sub.planName}
                description={
                  sub.notes ||
                  'Enterprise-grade subscription with automated renewals and premium support.'
                }
                bottomBgColor={bg}
                onArrowClick={() => navigate('/subscriptions')}
                bottomContent={
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                        {sub.subscriptionNumber}
                      </span>
                      <span className="text-sm font-extrabold text-zinc-950">
                        ${sub.totalAmount.toFixed(2)}
                        <span className="text-xs font-normal text-zinc-700">
                          /{sub.billingFrequency.toLowerCase()}
                        </span>
                      </span>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-xs space-y-1.5 border border-black/5">
                      {sub.lines.slice(0, 2).map((line) => (
                        <div key={line.id} className="flex justify-between items-center text-zinc-800">
                          <span className="truncate pr-2 font-medium">
                            {line.quantity}x {line.productName}
                          </span>
                          <span className="font-semibold text-zinc-950 whitespace-nowrap">
                            ${line.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {sub.lines.length > 2 && (
                        <div className="text-[11px] text-zinc-500 italic pt-1">
                          + {sub.lines.length - 2} additional variant lines
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-800 font-medium">
                      <span>Terms: {sub.paymentTerms}</span>
                      <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Auto-Renew On
                      </span>
                    </div>
                  </div>
                }
              />
            );
          })}
        </div>
      </section>

      {/* SECTION 2: Invoices & Billing Quick View */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">
              Recent Invoices
            </h2>
            <p className="text-zinc-500 text-sm">
              Track invoices, tax calculations, discounts, and payment receipts
            </p>
          </div>
          <button
            onClick={() => navigate('/invoices')}
            className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1 border border-zinc-200 px-3 py-1.5 rounded-full"
          >
            <span>All Invoices</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-150 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-100 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Invoice #</th>
                  <th className="py-4 px-6">Issue Date</th>
                  <th className="py-4 px-6">Due Date</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50/60 transition">
                    <td className="py-4 px-6 font-semibold text-zinc-950 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-zinc-400" />
                      <span>{inv.invoiceNumber}</span>
                    </td>
                    <td className="py-4 px-6 text-zinc-600">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-zinc-600">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 font-bold text-zinc-950">
                      ${inv.totalAmount.toFixed(2)}
                      {inv.discountAmount > 0 && (
                        <span className="block text-[10px] text-emerald-600 font-normal">
                          -${inv.discountAmount.toFixed(2)} discount applied
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'CONFIRMED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {inv.status !== 'PAID' ? (
                        <button
                          onClick={() => setPayingInvoice(inv)}
                          className="px-3 py-1.5 bg-black hover:bg-zinc-800 text-white rounded-full text-xs font-semibold transition"
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Quick Pay Invoice Modal */}
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

            <div className="bg-zinc-50 rounded-2xl p-4 space-y-2 text-sm border border-zinc-100">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span>${payingInvoice.subtotal.toFixed(2)}</span>
              </div>
              {payingInvoice.taxAmount > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>Taxes:</span>
                  <span>+${payingInvoice.taxAmount.toFixed(2)}</span>
                </div>
              )}
              {payingInvoice.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount Applied:</span>
                  <span>-${payingInvoice.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-zinc-200 pt-2 flex justify-between font-extrabold text-zinc-950 text-base">
                <span>Total Due:</span>
                <span>${payingInvoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
                  { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Zap },
                  { id: 'STRIPE', label: 'Stripe Pay', icon: DollarSign },
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
                disabled={isProcessingPay}
                onClick={handlePayInvoice}
                className="flex-1 px-4 py-3 rounded-full bg-black hover:bg-zinc-800 text-white text-sm font-bold transition flex items-center justify-center gap-2"
              >
                {isProcessingPay ? (
                  <span>Recording...</span>
                ) : (
                  <span>Confirm & Pay ${payingInvoice.totalAmount.toFixed(2)}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

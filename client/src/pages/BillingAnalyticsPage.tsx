import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  BillingAnalytics,
  CustomerInvoice,
  CustomerPayment,
  CustomerSubscription,
  InvoiceStatus,
  PaymentMethod,
} from '../types';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  CreditCard,
  Plus,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Building,
  User,
  Hash,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';

export const BillingAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<BillingAnalytics | null>(null);
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<CustomerInvoice | null>(null);

  // Form states for Generate Invoice
  const [genSubId, setGenSubId] = useState('');
  const [genDueDate, setGenDueDate] = useState('');
  const [genDiscountPercent, setGenDiscountPercent] = useState('0');
  const [genNotes, setGenNotes] = useState('');
  const [isSubmittingGen, setIsSubmittingGen] = useState(false);

  // Form states for Manual Payment
  const [payInvoiceId, setPayInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [payRefNote, setPayRefNote] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Form states for Manual Invoice
  const [manualCustomerId, setManualCustomerId] = useState('cust-uuid-001');
  const [manualDescription, setManualDescription] = useState('Custom Enterprise Advisory Session');
  const [manualQuantity, setManualQuantity] = useState('1');
  const [manualUnitPrice, setManualUnitPrice] = useState('450');
  const [manualTaxRate, setManualTaxRate] = useState('10');
  const [manualDiscount, setManualDiscount] = useState('0');
  const [manualDueDate, setManualDueDate] = useState('');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, subsData] = await Promise.all([
        api.billing.getAnalytics(),
        api.customer.getSubscriptions().catch(() => []),
      ]);
      setAnalytics(analyticsData);
      setSubscriptions(subsData);
      if (subsData.length > 0 && !genSubId) {
        setGenSubId(subsData[0].id);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load billing analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Generate Invoice
  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genSubId) return;
    try {
      setIsSubmittingGen(true);
      const invoice = await api.billing.generateInvoice({
        subscriptionId: genSubId,
        dueDate: genDueDate ? new Date(genDueDate).toISOString() : undefined,
        discountPercent: Number(genDiscountPercent) || 0,
        notes: genNotes || undefined,
        status: 'CONFIRMED',
      });
      showToast(`Invoice ${invoice.invoiceNumber} auto-generated for $${invoice.totalAmount.toFixed(2)}`);
      setIsGenerateModalOpen(false);
      setGenNotes('');
      setGenDiscountPercent('0');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error generating invoice.');
    } finally {
      setIsSubmittingGen(false);
    }
  };

  // Handle Manual Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payInvoiceId || !payAmount) return;
    try {
      setIsSubmittingPay(true);
      const res = await api.billing.recordPayment({
        invoiceId: payInvoiceId,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        referenceNote: payRefNote || `Manual receipt logged via staff console`,
      });
      showToast(
        `Payment ${res.payment.paymentNumber} ($${res.payment.amount}) recorded! ${
          res.remainingBalance === 0 ? 'Invoice settled in full.' : `Remaining: $${res.remainingBalance}`
        }`
      );
      setIsPaymentModalOpen(false);
      setPayInvoiceId('');
      setPayAmount('');
      setPayRefNote('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error recording payment.');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  // Handle Manual Ad-hoc Invoice
  const handleCreateManualInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingManual(true);
      const invoice = await api.billing.createInvoice({
        customerId: manualCustomerId,
        dueDate: manualDueDate ? new Date(manualDueDate).toISOString() : undefined,
        lines: [
          {
            description: manualDescription,
            quantity: Number(manualQuantity) || 1,
            unitPrice: Number(manualUnitPrice) || 0,
            taxRate: Number(manualTaxRate) || 0,
          },
        ],
        discountAmount: Number(manualDiscount) || 0,
        status: 'CONFIRMED',
      });
      showToast(`Manual invoice ${invoice.invoiceNumber} created for $${invoice.totalAmount.toFixed(2)}`);
      setIsManualModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error creating manual invoice.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Handle Status Update
  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    try {
      await api.billing.updateInvoiceStatus(invoiceId, newStatus);
      showToast(`Invoice updated to ${newStatus}`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Could not update status.');
    }
  };

  if (loading && !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-zinc-500 font-medium">Loading Billing & Revenue Analytics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-zinc-700 animate-fade-in text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              Member 4 Module
            </span>
            <span className="text-xs text-zinc-400 font-medium">Real-time Revenue Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
            Billing, Payments & Executive Analytics
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Automated recurring invoice generation, payment processing ledger, and revenue metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadData}
            title="Refresh metrics"
            className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg border border-zinc-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-50 rounded-lg shadow-sm transition"
          >
            <FileText className="w-4 h-4 text-zinc-500" />
            + Custom Invoice
          </button>

          <button
            onClick={() => {
              if (analytics && analytics.recentInvoices.length > 0) {
                const dueInv = analytics.recentInvoices.find(
                  (i) => i.status === 'CONFIRMED' || i.status === 'OVERDUE'
                );
                if (dueInv) {
                  setPayInvoiceId(dueInv.id);
                  setPayAmount(String(dueInv.totalAmount));
                }
              }
              setIsPaymentModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition"
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            Record Payment
          </button>

          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
          >
            <Zap className="w-4 h-4" />
            Auto-Generate Invoice
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: MRR & ARR */}
          <div className="bg-gradient-to-br from-indigo-50/60 to-white p-5 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-indigo-900">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Monthly Recurring Revenue
              </span>
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                ${analytics.mrr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <span className="px-2 py-0.5 rounded-full bg-indigo-100/70 text-indigo-700 font-semibold">
                  ARR: ${(analytics.arr).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
                <span>• {analytics.totalActiveSubscriptions} active subs</span>
              </div>
            </div>
          </div>

          {/* Card 2: Total Revenue Collected */}
          <div className="bg-gradient-to-br from-emerald-50/60 to-white p-5 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-emerald-900">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Total Revenue Collected
              </span>
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                ${analytics.totalRevenueCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <span className="text-emerald-700 font-semibold">{analytics.paidInvoicesCount} invoices paid</span>
                <span>• {analytics.recentPayments.length} recorded payments</span>
              </div>
            </div>
          </div>

          {/* Card 3: Outstanding Receivables */}
          <div className="bg-gradient-to-br from-amber-50/60 to-white p-5 rounded-2xl border border-amber-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-amber-900">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Outstanding Receivables
              </span>
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                ${analytics.outstandingReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <span>Pending invoices awaiting remittance</span>
              </div>
            </div>
          </div>

          {/* Card 4: Overdue Alert */}
          <div className={`p-5 rounded-2xl border shadow-sm relative overflow-hidden ${
            analytics.overdueInvoicesCount > 0
              ? 'bg-gradient-to-br from-rose-50 to-white border-rose-200'
              : 'bg-zinc-50/60 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                analytics.overdueInvoicesCount > 0 ? 'text-rose-700' : 'text-zinc-500'
              }`}>
                Overdue Invoices
              </span>
              <div className={`p-2 rounded-xl ${
                analytics.overdueInvoicesCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-zinc-200 text-zinc-600'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                ${analytics.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs font-semibold">
                <span className={analytics.overdueInvoicesCount > 0 ? 'text-rose-600' : 'text-zinc-500'}>
                  {analytics.overdueInvoicesCount} invoices past due
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Breakdown Row: Payment Methods & Status Distribution */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Method Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-zinc-900 text-sm">Revenue by Payment Channel</h3>
              </div>
              <span className="text-xs text-zinc-400">Total: ${analytics.totalRevenueCollected.toFixed(2)}</span>
            </div>

            <div className="mt-5 space-y-4">
              {analytics.paymentMethodsBreakdown.map((pm) => {
                const percent =
                  analytics.totalRevenueCollected > 0
                    ? Math.round((pm.amount / analytics.totalRevenueCollected) * 100)
                    : 0;

                const labelMap: Record<string, string> = {
                  CREDIT_CARD: 'Credit Card',
                  BANK_TRANSFER: 'ACH / Wire Transfer',
                  STRIPE: 'Stripe Gateway',
                  CASH: 'Direct Cash',
                  UPI: 'Instant UPI',
                };

                return (
                  <div key={pm.method} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-700">
                      <span className="font-semibold">{labelMap[pm.method] || pm.method}</span>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <span>{pm.count} txns</span>
                        <span className="font-bold text-zinc-900">${pm.amount.toFixed(2)}</span>
                        <span className="text-[10px] text-zinc-400">({percent}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invoices Status Funnel */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-zinc-900 text-sm">Invoice Portfolio Status</h3>
              </div>
              <span className="text-xs text-zinc-400">{analytics.totalInvoicesCount} Invoices Total</span>
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Draft */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80">
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Draft</div>
                <div className="text-lg font-extrabold text-zinc-900 mt-1">
                  {analytics.invoicesByStatus.DRAFT.count}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  ${analytics.invoicesByStatus.DRAFT.amount.toFixed(2)}
                </div>
              </div>

              {/* Confirmed / Due */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Confirmed (Due)</div>
                <div className="text-lg font-extrabold text-amber-900 mt-1">
                  {analytics.invoicesByStatus.CONFIRMED.count}
                </div>
                <div className="text-xs text-amber-700 font-medium mt-0.5">
                  ${analytics.invoicesByStatus.CONFIRMED.amount.toFixed(2)}
                </div>
              </div>

              {/* Paid */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Paid</div>
                <div className="text-lg font-extrabold text-emerald-900 mt-1">
                  {analytics.invoicesByStatus.PAID.count}
                </div>
                <div className="text-xs text-emerald-700 font-medium mt-0.5">
                  ${analytics.invoicesByStatus.PAID.amount.toFixed(2)}
                </div>
              </div>

              {/* Overdue */}
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Overdue</div>
                <div className="text-lg font-extrabold text-rose-900 mt-1">
                  {analytics.invoicesByStatus.OVERDUE.count}
                </div>
                <div className="text-xs text-rose-700 font-medium mt-0.5">
                  ${analytics.invoicesByStatus.OVERDUE.amount.toFixed(2)}
                </div>
              </div>

              {/* Cancelled */}
              <div className="p-3.5 rounded-xl bg-zinc-100 border border-zinc-200">
                <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Cancelled</div>
                <div className="text-lg font-extrabold text-zinc-700 mt-1">
                  {analytics.invoicesByStatus.CANCELLED.count}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  ${analytics.invoicesByStatus.CANCELLED.amount.toFixed(2)}
                </div>
              </div>

              {/* Recovery rate */}
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">Collection Rate</div>
                <div className="text-lg font-extrabold text-indigo-900 mt-1">
                  {analytics.totalInvoicesCount > 0
                    ? `${Math.round((analytics.paidInvoicesCount / analytics.totalInvoicesCount) * 100)}%`
                    : '100%'}
                </div>
                <div className="text-xs text-indigo-600 font-medium mt-0.5">Paid vs Created</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Invoices Table (Management view) */}
      {analytics && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Recent Invoices Management</h3>
              <p className="text-xs text-zinc-500">
                View line-item taxes, change billing status, or remit payments directly.
              </p>
            </div>
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
            >
              + Generate New from Active Subscription <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/80 text-zinc-500 font-semibold border-b border-zinc-100 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-6">Invoice #</th>
                  <th className="py-3 px-6">Issue / Due Date</th>
                  <th className="py-3 px-6">Linked Subscription</th>
                  <th className="py-3 px-6">Subtotal</th>
                  <th className="py-3 px-6">Tax / Disc</th>
                  <th className="py-3 px-6">Net Total</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {analytics.recentInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-zinc-900">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-zinc-400 font-normal truncate max-w-[150px]">
                        {inv.notes || 'Standard recurring invoice'}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="text-zinc-700">{new Date(inv.issueDate).toLocaleDateString()}</div>
                      <div className="text-[10px] text-zinc-400">Due: {new Date(inv.dueDate).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 px-6 text-zinc-600">
                      {inv.subscriptionNumber ? (
                        <span className="font-mono text-indigo-600 font-semibold">{inv.subscriptionNumber}</span>
                      ) : (
                        <span className="text-zinc-400 italic">Ad-Hoc / Custom</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-zinc-600">${inv.subtotal.toFixed(2)}</td>
                    <td className="py-3.5 px-6">
                      <div className="text-zinc-600">Tax: ${inv.taxAmount.toFixed(2)}</div>
                      {inv.discountAmount > 0 && (
                        <div className="text-emerald-600 text-[10px] font-semibold">
                          -Disc: ${inv.discountAmount.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-bold text-zinc-950 text-sm">${inv.totalAmount.toFixed(2)}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
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
                      {/* View Details / Print */}
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold transition"
                      >
                        Inspect
                      </button>

                      {/* If unpaid, quick record payment */}
                      {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                        <button
                          onClick={() => {
                            setPayInvoiceId(inv.id);
                            setPayAmount(String(inv.totalAmount));
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition"
                        >
                          Pay
                        </button>
                      )}

                      {/* Status changer dropdown */}
                      <select
                        value={inv.status}
                        onChange={(e) => handleStatusChange(inv.id, e.target.value as InvoiceStatus)}
                        className="px-1.5 py-1 text-[11px] bg-white border border-zinc-200 rounded font-medium text-zinc-700 focus:outline-none"
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
        </div>
      )}

      {/* Recent Payments Ledger */}
      {analytics && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Recent Payment Ledger (Audit Trail)</h3>
              <p className="text-xs text-zinc-500">
                Official transaction confirmations logged across payment channels.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              {analytics.recentPayments.length} Transactions Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/80 text-zinc-500 font-semibold border-b border-zinc-100 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-6">Payment Number</th>
                  <th className="py-3 px-6">Invoice #</th>
                  <th className="py-3 px-6">Date & Time</th>
                  <th className="py-3 px-6">Channel</th>
                  <th className="py-3 px-6">Amount</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Reference Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {analytics.recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-zinc-900">{p.paymentNumber}</td>
                    <td className="py-3.5 px-6 font-semibold text-indigo-600">{p.invoiceNumber}</td>
                    <td className="py-3.5 px-6 text-zinc-600">{new Date(p.paymentDate).toLocaleString()}</td>
                    <td className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-semibold">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-emerald-600 text-sm">${p.amount.toFixed(2)}</td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-zinc-500 text-[11px] italic">
                      {p.referenceNote || 'Processed successfully'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Auto-Generate Invoice from Subscription */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Generate Recurring Invoice</h3>
                  <p className="text-xs text-zinc-500">Auto-calculate taxes and line items from subscription</p>
                </div>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Select Active Subscription</label>
                <select
                  value={genSubId}
                  onChange={(e) => setGenSubId(e.target.value)}
                  className="w-full p-2.5 border border-zinc-200 rounded-xl bg-white text-zinc-900 font-medium focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {subscriptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subscriptionNumber} — {s.planName} (${s.totalAmount.toFixed(2)} / {s.billingFrequency})
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
                    className="w-full p-2 border border-zinc-200 rounded-xl bg-white text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Promotional Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={genDiscountPercent}
                    onChange={(e) => setGenDiscountPercent(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-xl bg-white text-zinc-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Invoice Notes / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. October monthly cycle with promotional coupon"
                  value={genNotes}
                  onChange={(e) => setGenNotes(e.target.value)}
                  className="w-full p-2 border border-zinc-200 rounded-xl bg-white text-zinc-900"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGen}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md flex items-center gap-1.5"
                >
                  {isSubmittingGen ? 'Generating...' : 'Confirm & Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Record Manual Payment */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Record Payment Remittance</h3>
                  <p className="text-xs text-zinc-500">Record a customer wire, card, or manual cash receipt</p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Target Invoice</label>
                <select
                  value={payInvoiceId}
                  onChange={(e) => {
                    setPayInvoiceId(e.target.value);
                    const inv = analytics?.recentInvoices.find((i) => i.id === e.target.value);
                    if (inv) setPayAmount(String(inv.totalAmount));
                  }}
                  className="w-full p-2.5 border border-zinc-200 rounded-xl bg-white text-zinc-900 font-medium"
                  required
                >
                  <option value="">Select Invoice...</option>
                  {analytics?.recentInvoices
                    .filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED')
                    .map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNumber} — ${inv.totalAmount.toFixed(2)} ({inv.status})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Payment Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-xl bg-white text-zinc-900 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Payment Channel</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 border border-zinc-200 rounded-xl bg-white text-zinc-900 font-medium"
                  >
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Wire / ACH</option>
                    <option value="STRIPE">Stripe</option>
                    <option value="CASH">Cash / Check</option>
                    <option value="UPI">UPI Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Reference / Transaction Note</label>
                <input
                  type="text"
                  placeholder="e.g. Wire confirmation ref ACH-99214 or check #412"
                  value={payRefNote}
                  onChange={(e) => setPayRefNote(e.target.value)}
                  className="w-full p-2 border border-zinc-200 rounded-xl bg-white text-zinc-900"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPay}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md"
                >
                  {isSubmittingPay ? 'Recording...' : 'Register Payment Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Custom / Ad-hoc Invoice */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-base">Create Ad-hoc / Custom Invoice</h3>
                  <p className="text-xs text-zinc-500">Manual billing for consulting, add-on seats, or fees</p>
                </div>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualInvoice} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Item Description</label>
                <input
                  type="text"
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  className="w-full p-2 border border-zinc-200 rounded-xl bg-white text-zinc-900 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={manualQuantity}
                    onChange={(e) => setManualQuantity(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-xl bg-white text-zinc-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualUnitPrice}
                    onChange={(e) => setManualUnitPrice(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-xl bg-white text-zinc-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    value={manualTaxRate}
                    onChange={(e) => setManualTaxRate(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-xl bg-white text-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Discount Amount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualDiscount}
                    onChange={(e) => setManualDiscount(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-xl bg-white text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={manualDueDate}
                    onChange={(e) => setManualDueDate(e.target.value)}
                    className="w-full p-2 border border-zinc-200 rounded-xl bg-white text-zinc-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md"
                >
                  {isSubmittingManual ? 'Creating...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Invoice Inspector & Printable Preview */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-6 border-b border-zinc-200">
              <div>
                <div className="text-xl font-extrabold text-zinc-950">
                  INVOICE: {selectedInvoice.invoiceNumber}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Issued: {new Date(selectedInvoice.issueDate).toLocaleDateString()} • Due:{' '}
                  {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedInvoice.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedInvoice.status}
                </span>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-zinc-400 hover:text-zinc-700 font-bold text-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Line items table */}
            <div className="mt-6">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Itemized Breakdown</div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Tax Rate</th>
                    <th className="py-2 text-right">Amount</th>
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

            {/* Calculations Summary */}
            <div className="mt-6 pt-4 border-t border-zinc-200 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount:</span>
                    <span>-${selectedInvoice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>Tax Amount:</span>
                  <span className="font-semibold">${selectedInvoice.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-zinc-950 pt-2 border-t border-zinc-200">
                  <span>Net Total:</span>
                  <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center pt-4 border-t border-zinc-100">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

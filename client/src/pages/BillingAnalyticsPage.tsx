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
import { CardWithArrow } from '../components/CardWithArrow';
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
  ArrowRight,
  Sparkles,
  Send,
  PieChart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BillingAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<BillingAnalytics | null>(null);
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [quickQueryInput, setQuickQueryInput] = useState('');

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
  const [manualDescription, setManualDescription] = useState('Enterprise Cloud Architecture Advisory');
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

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payInvoiceId || !payAmount) return;
    try {
      setIsSubmittingPay(true);
      const res = await api.billing.recordPayment({
        invoiceId: payInvoiceId,
        amount: Number(payAmount),
        paymentMethod: payMethod,
        referenceNote: payRefNote || `Manual receipt logged`,
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
      showToast(`Invoice ${invoice.invoiceNumber} created for $${invoice.totalAmount.toFixed(2)}`);
      setIsManualModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error creating invoice.');
    } finally {
      setIsSubmittingManual(false);
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-zinc-500 font-medium">Loading revenue platform...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-zinc-800 animate-bounce text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Section matching the Dribbble Playground interaction reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 pb-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Revenue Engine & Billing Command Center</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-zinc-950 tracking-tight leading-[1.08]">
            Track Revenue.<br />
            Settle Invoices.<br />
            Scale Recurring.
          </h1>

          <p className="text-zinc-600 text-base sm:text-lg max-w-xl leading-relaxed">
            Manage your high-velocity recurring billing, trigger automated subscription invoice runs,
            record multi-channel remittances, and monitor live revenue velocity in real time.
          </p>

          {/* Playground Quick Action Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="bg-black hover:bg-zinc-800 text-white px-6 py-3 rounded-full text-sm font-semibold transition flex items-center gap-2 shadow-sm"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Auto-Generate Invoice</span>
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
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-6 py-3 rounded-full text-sm font-semibold transition flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Record Payment</span>
            </button>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 px-5 py-3 rounded-full text-sm font-semibold transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4 text-zinc-500" />
              <span>Custom Bill</span>
            </button>

            <button
              onClick={loadData}
              title="Refresh"
              className="p-3 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-full border border-zinc-200 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hero Right: Modern High-Impact Metrics Grid */}
        {analytics && (
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            {/* Metric 1: Monthly Recurring Revenue */}
            <div className="bg-indigo-50/80 rounded-3xl p-6 border border-indigo-100/80 flex flex-col justify-between">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Monthly Recurring
              </span>
              <div className="my-4">
                <span className="text-3xl sm:text-4xl font-extrabold text-zinc-950">
                  ${analytics.mrr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <p className="text-xs text-indigo-600 mt-1 font-medium">
                  ARR: ${(analytics.arr).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <button
                onClick={() => navigate('/billing/invoices')}
                className="text-xs font-bold text-zinc-900 hover:text-indigo-600 inline-flex items-center gap-1"
              >
                <span>View Portfolio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metric 2: Total Revenue Collected */}
            <div className="bg-emerald-50/90 rounded-3xl p-6 border border-emerald-100 flex flex-col justify-between">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                Revenue Collected
              </span>
              <div className="my-4">
                <span className="text-3xl sm:text-4xl font-extrabold text-zinc-950">
                  ${analytics.totalRevenueCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-xs text-emerald-700 mt-1 font-medium">
                  {analytics.paidInvoicesCount} invoices cleared
                </p>
              </div>
              <button
                onClick={() => navigate('/billing/payments')}
                className="text-xs font-bold text-zinc-900 hover:text-emerald-700 inline-flex items-center gap-1"
              >
                <span>Payments Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metric 3: Outstanding Receivables */}
            <div className="bg-amber-50/90 rounded-3xl p-6 border border-amber-100 flex flex-col justify-between">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                Outstanding Due
              </span>
              <div className="my-4">
                <span className="text-3xl font-extrabold text-zinc-950">
                  ${analytics.outstandingReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-xs text-amber-700 mt-1 font-medium">
                  {analytics.overdueInvoicesCount > 0
                    ? `${analytics.overdueInvoicesCount} overdue bills`
                    : 'Awaiting remittance'}
                </p>
              </div>
              <button
                onClick={() => navigate('/billing/invoices')}
                className="text-xs font-bold text-zinc-900 hover:text-amber-700 inline-flex items-center gap-1"
              >
                <span>Settle Bills</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metric 4: Active Subscriptions */}
            <div className="bg-purple-50/80 rounded-3xl p-6 border border-purple-100 flex flex-col justify-between">
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                Active Contracts
              </span>
              <div className="my-4">
                <span className="text-4xl font-extrabold text-zinc-950">
                  {analytics.totalActiveSubscriptions}
                </span>
                <p className="text-xs text-purple-600 mt-1 font-medium">
                  Of {analytics.totalSubscriptions} total
                </p>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(true)}
                className="text-xs font-bold text-zinc-900 hover:text-purple-700 inline-flex items-center gap-1"
              >
                <span>Bill Active Sub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Outstanding Receivables Alert Banner */}
      {analytics && analytics.outstandingReceivables > 0 && (
        <div className="bg-zinc-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-zinc-950 flex items-center justify-center font-bold text-xl flex-shrink-0">
              $
            </div>
            <div>
              <h3 className="text-lg font-bold">Outstanding Customer Receivables</h3>
              <p className="text-zinc-400 text-sm mt-0.5">
                ${analytics.outstandingReceivables.toFixed(2)} in confirmed bills awaiting payment clearance.
                {analytics.overdueInvoicesCount > 0 && (
                  <span className="text-rose-400 ml-1 font-semibold">
                    ({analytics.overdueInvoicesCount} invoices are currently overdue).
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const pending = analytics.recentInvoices.find(
                (i) => i.status === 'CONFIRMED' || i.status === 'OVERDUE'
              );
              if (pending) {
                setPayInvoiceId(pending.id);
                setPayAmount(String(pending.totalAmount));
              }
              setIsPaymentModalOpen(true);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-100 transition whitespace-nowrap shadow-sm"
          >
            Record Instant Settlement
          </button>
        </div>
      )}

      {/* SECTION: 3 Dribbble Playground Showcase Cards using CardWithArrow */}
      {analytics && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">
                Billing & Liquidity Playground
              </h2>
              <p className="text-zinc-500 text-sm">
                Interactive automated invoicing, channel collection volumes, and receivables status
              </p>
            </div>
            <button
              onClick={() => navigate('/billing/invoices')}
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1 border border-zinc-200 px-3.5 py-1.5 rounded-full transition"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Recurring Invoicing Engine */}
            <CardWithArrow
              pillText="AUTOMATED BILLING"
              pillColor="bg-zinc-950 text-white"
              title="Recurring Invoicing"
              description="Automatically transform active subscription cycles into itemized customer bills with accurate tax computations."
              bottomBgColor="bg-[#c7d2fe]"
              onArrowClick={() => setIsGenerateModalOpen(true)}
              bottomContent={
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                      Active Subscriptions
                    </span>
                    <span className="text-sm font-extrabold text-zinc-950">
                      {analytics.totalActiveSubscriptions} Running
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-700 font-medium">
                    <span>MRR Yield</span>
                    <span className="font-bold text-zinc-950">${analytics.mrr.toFixed(2)} / mo</span>
                  </div>
                  <button
                    onClick={() => setIsGenerateModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Run Billing Cycle Now</span>
                  </button>
                </div>
              }
            />

            {/* Card 2: Payment Rails */}
            <CardWithArrow
              pillText="PAYMENT RAILS"
              pillColor="bg-zinc-950 text-white"
              title="Channel Collection"
              description="Track cleared settlements across Credit Card, Bank Wire, Stripe, Cash, and instant UPI payment rails."
              bottomBgColor="bg-[#fef08a]"
              onArrowClick={() => navigate('/billing/payments')}
              bottomContent={
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                      Total Cleared
                    </span>
                    <span className="text-sm font-extrabold text-zinc-950">
                      ${analytics.totalRevenueCollected.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {analytics.paymentMethodsBreakdown.slice(0, 3).map((pm) => {
                      const pct =
                        analytics.totalRevenueCollected > 0
                          ? Math.round((pm.amount / analytics.totalRevenueCollected) * 100)
                          : 0;
                      return (
                        <div key={pm.method} className="flex items-center justify-between text-[11px] font-semibold text-zinc-800">
                          <span>{pm.method.replace('_', ' ')}</span>
                          <span>${pm.amount.toFixed(0)} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => navigate('/billing/payments')}
                    className="w-full py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition flex items-center justify-center gap-1.5 mt-2"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Inspect Payments Ledger</span>
                  </button>
                </div>
              }
            />

            {/* Card 3: Receivables & Recovery */}
            <CardWithArrow
              pillText="PORTFOLIO RISK"
              pillColor="bg-zinc-950 text-white"
              title="Receivables Health"
              description="Monitor collection rate, overdue debt exposures, and trigger instant settlements against confirmed bills."
              bottomBgColor="bg-[#ddd6fe]"
              onArrowClick={() => navigate('/billing/invoices')}
              bottomContent={
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                      Settlement Rate
                    </span>
                    <span className="text-sm font-extrabold text-zinc-950">
                      {analytics.totalInvoicesCount > 0
                        ? `${Math.round((analytics.paidInvoicesCount / analytics.totalInvoicesCount) * 100)}%`
                        : '100%'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white/70 font-semibold text-emerald-800">
                      <div>${analytics.invoicesByStatus.PAID.amount.toFixed(0)}</div>
                      <span className="text-[10px] text-zinc-500 font-normal">Paid</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/70 font-semibold text-amber-800">
                      <div>${analytics.invoicesByStatus.CONFIRMED.amount.toFixed(0)}</div>
                      <span className="text-[10px] text-zinc-500 font-normal">Due</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (analytics.recentInvoices.length > 0) {
                        const due = analytics.recentInvoices.find(
                          (i) => i.status === 'CONFIRMED' || i.status === 'OVERDUE'
                        );
                        if (due) {
                          setPayInvoiceId(due.id);
                          setPayAmount(String(due.totalAmount));
                        }
                      }
                      setIsPaymentModalOpen(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-zinc-950 text-white text-xs font-bold hover:bg-zinc-800 transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Record Remittance</span>
                  </button>
                </div>
              }
            />
          </div>
        </section>
      )}

      {/* SECTION: Recent Invoices Management Table */}
      {analytics && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-950 tracking-tight">
                Invoices Portfolio
              </h2>
              <p className="text-zinc-500 text-sm">
                Generated bills, itemized line items, status workflows, and printable invoice documents
              </p>
            </div>
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="text-xs font-semibold text-zinc-700 hover:text-zinc-950 flex items-center gap-1 border border-zinc-200 px-3.5 py-1.5 rounded-full"
            >
              <span>+ Issue Invoice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50/80 text-zinc-500 font-semibold border-b border-zinc-100 uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-6">Invoice #</th>
                    <th className="py-4 px-6">Dates</th>
                    <th className="py-4 px-6">Linked Contract</th>
                    <th className="py-4 px-6">Subtotal</th>
                    <th className="py-4 px-6">Tax / Disc</th>
                    <th className="py-4 px-6">Net Total</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {analytics.recentInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-zinc-50/70 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-zinc-950 font-mono">{inv.invoiceNumber}</div>
                        <div className="text-[10px] text-zinc-400 font-normal truncate max-w-[150px]">
                          {inv.notes || 'Automated recurring billing'}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-zinc-600">
                        <div>{new Date(inv.issueDate).toLocaleDateString()}</div>
                        <div className="text-[10px] text-zinc-400">Due: {new Date(inv.dueDate).toLocaleDateString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        {inv.subscriptionNumber ? (
                          <span className="font-mono text-indigo-600 font-semibold">{inv.subscriptionNumber}</span>
                        ) : (
                          <span className="text-zinc-400 italic">Custom Bill</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-zinc-700">${inv.subtotal.toFixed(2)}</td>
                      <td className="py-4 px-6 text-zinc-500">
                        <div>Tax: ${inv.taxAmount.toFixed(2)}</div>
                        {inv.discountAmount > 0 && (
                          <div className="text-emerald-600 text-[10px] font-semibold">
                            -Disc: ${inv.discountAmount.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-extrabold text-zinc-950 text-sm">${inv.totalAmount.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
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
                      <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition"
                        >
                          Inspect
                        </button>

                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                          <button
                            onClick={() => {
                              setPayInvoiceId(inv.id);
                              setPayAmount(String(inv.totalAmount));
                              setIsPaymentModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold transition shadow-sm"
                          >
                            Pay
                          </button>
                        )}

                        <select
                          value={inv.status}
                          onChange={(e) => handleStatusChange(inv.id, e.target.value as InvoiceStatus)}
                          className="px-2 py-1 text-xs bg-white border border-zinc-200 rounded-lg font-medium text-zinc-700 focus:outline-none"
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
        </section>
      )}

      {/* MODAL 1: Auto-Generate Recurring Invoice */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-zinc-150 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-zinc-950 text-lg">Generate Recurring Invoice</h3>
                  <p className="text-xs text-zinc-500">Calculate line items and tax rules from subscription</p>
                </div>
              </div>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-800 mb-1.5">Select Active Subscription</label>
                <select
                  value={genSubId}
                  onChange={(e) => setGenSubId(e.target.value)}
                  className="w-full p-3 border border-zinc-200 rounded-2xl bg-white text-zinc-900 font-semibold focus:ring-2 focus:ring-zinc-950"
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
                  <label className="block font-bold text-zinc-800 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={genDueDate}
                    onChange={(e) => setGenDueDate(e.target.value)}
                    className="w-full p-2.5 border border-zinc-200 rounded-2xl bg-white text-zinc-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 mb-1.5">Promotional Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={genDiscountPercent}
                    onChange={(e) => setGenDiscountPercent(e.target.value)}
                    className="w-full p-2.5 border border-zinc-200 rounded-2xl bg-white text-zinc-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-800 mb-1.5">Invoice Notes / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly recurring service cycle with promotional discount"
                  value={genNotes}
                  onChange={(e) => setGenNotes(e.target.value)}
                  className="w-full p-2.5 border border-zinc-200 rounded-2xl bg-white text-zinc-900"
                />
              </div>

              <div className="pt-5 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-5 py-2.5 text-zinc-600 hover:bg-zinc-100 rounded-full font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGen}
                  className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full font-bold shadow-md flex items-center gap-2"
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
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-zinc-150 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-zinc-950 text-lg">Record Payment Remittance</h3>
                  <p className="text-xs text-zinc-500">Record a customer wire, card, or check payment receipt</p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-800 mb-1.5">Target Invoice</label>
                <select
                  value={payInvoiceId}
                  onChange={(e) => {
                    setPayInvoiceId(e.target.value);
                    const inv = analytics?.recentInvoices.find((i) => i.id === e.target.value);
                    if (inv) setPayAmount(String(inv.totalAmount));
                  }}
                  className="w-full p-3 border border-zinc-200 rounded-2xl bg-white text-zinc-900 font-semibold"
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
                  <label className="block font-bold text-zinc-800 mb-1.5">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full p-2.5 border border-zinc-200 rounded-2xl bg-white text-zinc-900 font-bold text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 mb-1.5">Payment Rail</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2.5 border border-zinc-200 rounded-2xl bg-white text-zinc-900 font-semibold"
                  >
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Wire / ACH</option>
                    <option value="STRIPE">Stripe Gateway</option>
                    <option value="CASH">Direct Cash</option>
                    <option value="UPI">Instant UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-zinc-800 mb-1.5">Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Wire confirmation ref ACH-99214 or check #412"
                  value={payRefNote}
                  onChange={(e) => setPayRefNote(e.target.value)}
                  className="w-full p-2.5 border border-zinc-200 rounded-2xl bg-white text-zinc-900"
                />
              </div>

              <div className="pt-5 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-5 py-2.5 text-zinc-600 hover:bg-zinc-100 rounded-full font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPay}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-md"
                >
                  {isSubmittingPay ? 'Recording...' : 'Register Payment Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Custom Invoice */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-zinc-150 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-zinc-950 text-lg">Create Custom Invoice</h3>
                  <p className="text-xs text-zinc-500">Manual bill for consulting, custom seats, or services</p>
                </div>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualInvoice} className="mt-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-zinc-800 mb-1.5">Description</label>
                <input
                  type="text"
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  className="w-full p-2.5 border border-zinc-200 rounded-2xl bg-white text-zinc-900 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 mb-1.5">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={manualQuantity}
                    onChange={(e) => setManualQuantity(e.target.value)}
                    className="w-full p-2.5 border border-zinc-200 rounded-2xl bg-white text-zinc-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 mb-1.5">Unit Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualUnitPrice}
                    onChange={(e) => setManualUnitPrice(e.target.value)}
                    className="w-full p-2.5 border border-zinc-200 rounded-2xl bg-white text-zinc-900 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 mb-1.5">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    value={manualTaxRate}
                    onChange={(e) => setManualTaxRate(e.target.value)}
                    className="w-full p-2.5 border border-zinc-200 rounded-2xl bg-white text-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-800 mb-1.5">Discount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualDiscount}
                    onChange={(e) => setManualDiscount(e.target.value)}
                    className="w-full p-2.5 border border-zinc-200 rounded-2xl bg-white text-zinc-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-800 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={manualDueDate}
                    onChange={(e) => setManualDueDate(e.target.value)}
                    className="w-full p-2.5 border border-zinc-200 rounded-2xl bg-white text-zinc-900"
                  />
                </div>
              </div>

              <div className="pt-5 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-5 py-2.5 text-zinc-600 hover:bg-zinc-100 rounded-full font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full font-bold shadow-md"
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
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-6 border-b border-zinc-200">
              <div>
                <div className="text-2xl font-extrabold text-zinc-950">
                  {selectedInvoice.invoiceNumber}
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
                  className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">Itemized Breakdown</div>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="py-2.5">Description</th>
                    <th className="py-2.5 text-center">Qty</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-right">Tax Rate</th>
                    <th className="py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {selectedInvoice.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="py-3 font-semibold text-zinc-900">{l.description}</td>
                      <td className="py-3 text-center text-zinc-600">{l.quantity}</td>
                      <td className="py-3 text-right text-zinc-600">${l.unitPrice.toFixed(2)}</td>
                      <td className="py-3 text-right text-zinc-600">{l.taxRate}%</td>
                      <td className="py-3 text-right font-extrabold text-zinc-950">${l.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-200 flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
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
                className="flex items-center gap-1.5 px-4 py-2.5 border border-zinc-300 rounded-full text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-6 py-2.5 bg-zinc-950 text-white rounded-full text-xs font-bold hover:bg-zinc-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  CustomerSubscription,
  Quotation,
  QuotationStatus,
  SubscriptionStatus,
} from '../types';
import {
  Layers,
  CheckCircle,
  Clock,
  PauseCircle,
  XCircle,
  FileText,
  RefreshCw,
  Search,
  Plus,
  Send,
  UserCheck,
  ShieldCheck,
  Building,
  User,
  Calendar,
  DollarSign,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

export const SubscriptionsPage: React.FC = () => {
  const { user } = useAuth();

  // RBAC Helpers
  const isCustomer = user?.role === 'CUSTOMER';
  const isStaff = user?.role === 'STAFF';
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'subscriptions' | 'quotations'>('subscriptions');

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [selectedSub, setSelectedSub] = useState<CustomerSubscription | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Quotations state
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [quoteSearchQuery, setQuoteSearchQuery] = useState('');

  // Modals state
  const [showQuoteRequestModal, setShowQuoteRequestModal] = useState(false);
  const [quoteRequestForm, setQuoteRequestForm] = useState({
    planName: 'Enterprise Cloud Custom Tier',
    notes: '',
    estimatedAmount: 950,
    quantity: 1,
  });

  const [showStaffQuoteModal, setShowStaffQuoteModal] = useState(false);
  const [staffQuoteForm, setStaffQuoteForm] = useState({
    customerId: 'cust-uuid-001',
    customerName: 'Alex Rivera (Apex Retail Solutions Ltd.)',
    planName: 'Enterprise Customized Suite',
    totalAmount: 1450,
    validDays: 30,
    notes: 'Commercial discount applied by staff for annual commitment.',
  });

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsData, quotesData] = await Promise.all([
        isCustomer ? api.customer.getSubscriptions() : api.subscriptions.getAll(),
        api.subscriptions.getQuotations(isCustomer ? user?.id : undefined),
      ]);
      setSubscriptions(subsData);
      setQuotations(quotesData);
      if (subsData.length > 0 && !selectedSub) {
        setSelectedSub(subsData[0]);
      }
      if (quotesData.length > 0 && !selectedQuote) {
        setSelectedQuote(quotesData[0]);
      }
    } catch (err: any) {
      console.error(err);
      showNotice(err.message || 'Error loading subscriptions data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.role, user?.id]);

  // Filtered Subscriptions
  const filteredSubs = subscriptions.filter((sub) => {
    const matchesFilter = filterStatus === 'ALL' || sub.status === filterStatus;
    const matchesSearch =
      sub.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.subscriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.customerName && sub.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Filtered Quotations
  const filteredQuotes = quotations.filter((q) => {
    const qStr = quoteSearchQuery.toLowerCase();
    return (
      !qStr ||
      q.quotationNumber.toLowerCase().includes(qStr) ||
      (q.planName && q.planName.toLowerCase().includes(qStr)) ||
      (q.customerName && q.customerName.toLowerCase().includes(qStr)) ||
      (q.customerEmail && q.customerEmail.toLowerCase().includes(qStr))
    );
  });

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5" /> Active
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <PauseCircle className="w-3.5 h-3.5" /> Paused
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-200 text-zinc-700">
            <XCircle className="w-3.5 h-3.5" /> Closed
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            <Clock className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700">
            {status}
          </span>
        );
    }
  };

  const getQuoteStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            Drafting
          </span>
        );
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
            Sent to Customer
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
            Declined
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700">
            {status}
          </span>
        );
    }
  };

  const handleAction = (action: string) => {
    showNotice(`Subscription ${action} request registered with Brightloop management.`);
  };

  // Submit Quotation Request (Customer)
  const handleSubmitQuoteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.subscriptions.requestQuotation({
        planName: quoteRequestForm.planName,
        notes: quoteRequestForm.notes,
        estimatedAmount: quoteRequestForm.estimatedAmount,
        items: [
          {
            productName: quoteRequestForm.planName,
            quantity: quoteRequestForm.quantity,
            unitPrice: quoteRequestForm.estimatedAmount,
            amount: quoteRequestForm.estimatedAmount,
          },
        ],
      });
      setQuotations((prev) => [res, ...prev]);
      setSelectedQuote(res);
      setShowQuoteRequestModal(false);
      showNotice(`Quotation request ${res.quotationNumber} submitted to sales staff.`);
    } catch (err: any) {
      alert(err.message || 'Error creating quotation request');
    }
  };

  // Prepare Quotation (Staff & Admin)
  const handleSubmitStaffQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.subscriptions.prepareQuotation({
        customerId: staffQuoteForm.customerId,
        planName: staffQuoteForm.planName,
        totalAmount: Number(staffQuoteForm.totalAmount),
        validDays: Number(staffQuoteForm.validDays) || 30,
        notes: staffQuoteForm.notes,
        items: [
          {
            productName: staffQuoteForm.planName,
            quantity: 1,
            unitPrice: Number(staffQuoteForm.totalAmount),
            amount: Number(staffQuoteForm.totalAmount),
          },
        ],
      });
      setQuotations((prev) => [res, ...prev]);
      setSelectedQuote(res);
      setShowStaffQuoteModal(false);
      showNotice(`Quotation ${res.quotationNumber} prepared and recorded for customer.`);
    } catch (err: any) {
      alert(err.message || 'Error preparing quotation');
    }
  };

  // Update Quotation Status (Staff & Admin)
  const handleUpdateQuoteStatus = async (quoteId: string, status: QuotationStatus) => {
    try {
      const updated = await api.subscriptions.updateQuotationStatus(quoteId, status);
      setQuotations((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
      if (selectedQuote?.id === updated.id) {
        setSelectedQuote(updated);
      }
      showNotice(`Quotation ${updated.quotationNumber} updated to ${status}.`);
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {notice && (
        <div className="p-4 rounded-2xl bg-zinc-900 text-white text-sm font-medium flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isCustomer && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                Customer Self-Service
              </span>
            )}
            {isStaff && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                Staff Operations Desk
              </span>
            )}
            {isAdmin && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
                Admin Management
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
            {isCustomer
              ? 'My Subscriptions & Quotations'
              : 'Customer Subscriptions & Quotations Desk'}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isCustomer
              ? 'View your active contracts, plan frequency, pricing variants, and quotation requests.'
              : 'Monitor customer accounts across the organization, review subscription lifecycles, and prepare custom quotations.'}
          </p>
        </div>

        {/* Action Header Button */}
        <div className="flex items-center gap-3">
          {isCustomer && (
            <button
              onClick={() => setShowQuoteRequestModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow transition"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Ask for Custom Quotation</span>
            </button>
          )}

          {(isStaff || isAdmin) && (
            <button
              onClick={() => setShowStaffQuoteModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow transition"
            >
              <FileText className="w-4 h-4 text-white" />
              <span>Prepare Customer Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs: Subscriptions vs Quotations Desk */}
      <div className="flex items-center gap-3 border-b border-zinc-200 pb-4">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'subscriptions'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>
            {isCustomer ? 'Active Subscriptions' : 'Customer Subscriptions'} ({subscriptions.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('quotations')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'quotations'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Quotations Desk ({quotations.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-zinc-400 mt-2 font-medium">Loading records...</p>
        </div>
      ) : activeTab === 'subscriptions' ? (
        /* ================= TAB 1: SUBSCRIPTIONS VIEW ================= */
        <div className="space-y-6">
          {/* Subscriptions Search & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/80">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder={
                  isCustomer
                    ? 'Search my subscriptions...'
                    : 'Search by plan or customer name...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="flex bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
              {['ALL', 'ACTIVE', 'PAUSED', 'CLOSED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    filterStatus === status
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Subscriptions List */}
            <div className="lg:col-span-5 space-y-4">
              {filteredSubs.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-zinc-200 text-center text-zinc-500 text-sm">
                  No subscriptions found matching your query.
                </div>
              ) : (
                filteredSubs.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`cursor-pointer rounded-3xl p-6 transition-all border ${
                        isSelected
                          ? 'bg-zinc-950 text-white border-zinc-900 shadow-md scale-[1.01]'
                          : 'bg-white hover:bg-zinc-50/80 text-zinc-900 border-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {sub.subscriptionNumber}
                        </span>
                        {getStatusBadge(sub.status)}
                      </div>

                      {/* Customer attribution for Staff & Admin */}
                      {!isCustomer && sub.customerName && (
                        <div
                          className={`text-xs font-semibold flex items-center gap-1.5 mb-2 ${
                            isSelected ? 'text-indigo-300' : 'text-indigo-600'
                          }`}
                        >
                          <Building className="w-3.5 h-3.5" />
                          <span>{sub.customerName}</span>
                        </div>
                      )}

                      <h3 className="text-xl font-bold tracking-tight mb-1">{sub.planName}</h3>
                      <p
                        className={`text-xs line-clamp-2 mb-4 ${
                          isSelected ? 'text-zinc-400' : 'text-zinc-500'
                        }`}
                      >
                        {sub.notes}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-200/20 text-xs">
                        <span className={isSelected ? 'text-zinc-400' : 'text-zinc-500'}>
                          Frequency: <strong>{sub.billingFrequency}</strong>
                        </span>
                        <span className="text-sm font-extrabold">
                          ${sub.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Subscriptions Detail View */}
            <div className="lg:col-span-7">
              {selectedSub ? (
                <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
                        {selectedSub.subscriptionNumber}
                      </span>
                      <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
                        {selectedSub.planName}
                      </h2>
                      {!isCustomer && selectedSub.customerName && (
                        <p className="text-xs text-indigo-600 font-semibold mt-1">
                          Subscriber: {selectedSub.customerName} ({selectedSub.customerEmail || 'Customer Account'})
                        </p>
                      )}
                    </div>
                    <div>{getStatusBadge(selectedSub.status)}</div>
                  </div>

                  {/* Subscription Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 text-xs">
                    <div>
                      <span className="text-zinc-400 block font-medium">Billing Period</span>
                      <span className="font-bold text-zinc-900 mt-0.5 block">
                        {selectedSub.billingFrequency}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-medium">Start Date</span>
                      <span className="font-bold text-zinc-900 mt-0.5 block">
                        {new Date(selectedSub.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-medium">Next Renewal</span>
                      <span className="font-bold text-zinc-900 mt-0.5 block">
                        {selectedSub.expiryDate
                          ? new Date(selectedSub.expiryDate).toLocaleDateString()
                          : 'Continuous'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-medium">Payment Terms</span>
                      <span className="font-bold text-zinc-900 mt-0.5 block">
                        {selectedSub.paymentTerms}
                      </span>
                    </div>
                  </div>

                  {/* Line Items Breakdown (Products, Variants, Seats) */}
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">
                      Subscription Line Items & Variants
                    </h4>
                    <div className="border border-zinc-150 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 border-b border-zinc-150 font-bold text-zinc-500 uppercase tracking-wider">
                          <tr>
                            <th className="py-3 px-4">Product / Add-on</th>
                            <th className="py-3 px-4 text-center">Qty</th>
                            <th className="py-3 px-4 text-right">Unit Price</th>
                            <th className="py-3 px-4 text-right">Tax</th>
                            <th className="py-3 px-4 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {selectedSub.lines.map((line) => (
                            <tr key={line.id} className="hover:bg-zinc-50/50">
                              <td className="py-3 px-4 font-semibold text-zinc-900">
                                {line.productName}
                                {line.variantName && (
                                  <span className="block text-[11px] text-indigo-600 font-normal">
                                    Variant: {line.variantName}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center text-zinc-600">
                                {line.quantity}
                              </td>
                              <td className="py-3 px-4 text-right text-zinc-600 font-mono">
                                ${line.unitPrice.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right text-zinc-500">
                                {line.taxRate}%
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-zinc-950 font-mono">
                                ${line.amount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-zinc-50 font-extrabold text-zinc-950 border-t border-zinc-150">
                          <tr>
                            <td colSpan={4} className="py-3 px-4 text-right uppercase text-xs text-zinc-500">
                              Total Recurring Amount:
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-mono font-black text-indigo-600">
                              ${selectedSub.totalAmount.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Lifecycle Actions */}
                  <div className="pt-4 border-t border-zinc-150 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleAction('Renewal')}
                      className="px-5 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Request Early Renewal</span>
                    </button>

                    <button
                      onClick={() => handleAction('Pause')}
                      className="px-5 py-2.5 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold transition flex items-center gap-2"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Request Pause</span>
                    </button>

                    <button
                      onClick={() => handleAction('Modify Add-ons')}
                      className="px-5 py-2.5 rounded-full border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold transition"
                    >
                      Change Add-on Quantities
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-zinc-200 p-8 text-center text-zinc-400">
                  Select a subscription from the list to view its configuration.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= TAB 2: QUOTATIONS DESK ================= */
        <div className="space-y-6">
          {/* Quotations Header & Search */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Search quotations by number, plan or customer..."
                value={quoteSearchQuery}
                onChange={(e) => setQuoteSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 text-xs bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="text-xs text-zinc-500 font-medium">
              Showing <strong>{filteredQuotes.length}</strong> commercial quotations
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Quotations List */}
            <div className="lg:col-span-5 space-y-4">
              {filteredQuotes.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 border border-zinc-200 text-center text-zinc-500 text-sm">
                  No quotation records found.
                </div>
              ) : (
                filteredQuotes.map((q) => {
                  const isSelected = selectedQuote?.id === q.id;
                  return (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuote(q)}
                      className={`cursor-pointer rounded-3xl p-6 transition-all border ${
                        isSelected
                          ? 'bg-zinc-950 text-white border-zinc-900 shadow-md scale-[1.01]'
                          : 'bg-white hover:bg-zinc-50/80 text-zinc-900 border-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {q.quotationNumber}
                        </span>
                        {getQuoteStatusBadge(q.status)}
                      </div>

                      <div className="text-xs font-semibold flex items-center gap-1.5 mb-1 text-indigo-400">
                        <User className="w-3.5 h-3.5" />
                        <span>{q.customerName}</span>
                      </div>

                      <h3 className="text-lg font-bold tracking-tight mb-2">{q.planName}</h3>
                      <p
                        className={`text-xs line-clamp-2 mb-4 ${
                          isSelected ? 'text-zinc-400' : 'text-zinc-500'
                        }`}
                      >
                        {q.notes || 'No extended quotation terms specified.'}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-200/20 text-xs">
                        <span className={isSelected ? 'text-zinc-400' : 'text-zinc-500'}>
                          Valid Until: <strong>{new Date(q.validUntil).toLocaleDateString()}</strong>
                        </span>
                        <span className="text-base font-black text-emerald-400">
                          ${q.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quotation Detail View */}
            <div className="lg:col-span-7">
              {selectedQuote ? (
                <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-150 pb-6">
                    <div>
                      <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
                        {selectedQuote.quotationNumber}
                      </span>
                      <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
                        {selectedQuote.planName}
                      </h2>
                      <p className="text-xs text-zinc-500 mt-1">
                        Client: <strong>{selectedQuote.customerName}</strong> ({selectedQuote.customerEmail})
                      </p>
                    </div>
                    <div>{getQuoteStatusBadge(selectedQuote.status)}</div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 text-xs">
                    <div>
                      <span className="text-zinc-400 block font-medium">Issue Date</span>
                      <span className="font-bold text-zinc-900 mt-0.5 block">
                        {new Date(selectedQuote.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-medium">Expiration</span>
                      <span className="font-bold text-zinc-900 mt-0.5 block">
                        {new Date(selectedQuote.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-medium">Total Quoted Value</span>
                      <span className="font-extrabold text-emerald-600 text-sm mt-0.5 block">
                        ${selectedQuote.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Terms */}
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/80 text-xs space-y-1">
                    <span className="font-bold text-indigo-950 block">Commercial Notes & Specifications</span>
                    <p className="text-zinc-700 leading-relaxed">
                      {selectedQuote.notes || 'Standard terms and configuration apply.'}
                    </p>
                  </div>

                  {/* Items breakdown if present */}
                  {selectedQuote.items && selectedQuote.items.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3">
                        Included Products & Variants
                      </h4>
                      <div className="border border-zinc-150 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-zinc-50 border-b border-zinc-150 font-bold text-zinc-500 uppercase tracking-wider">
                            <tr>
                              <th className="py-3 px-4">Item</th>
                              <th className="py-3 px-4 text-center">Qty</th>
                              <th className="py-3 px-4 text-right">Unit Price</th>
                              <th className="py-3 px-4 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {selectedQuote.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-zinc-50/50">
                                <td className="py-3 px-4 font-semibold text-zinc-900">
                                  {item.productName}
                                  {item.variantName && (
                                    <span className="block text-[11px] text-indigo-600 font-normal">
                                      Edition: {item.variantName}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center text-zinc-600">{item.quantity}</td>
                                <td className="py-3 px-4 text-right text-zinc-600 font-mono">
                                  ${item.unitPrice.toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-right font-bold text-zinc-950 font-mono">
                                  ${item.amount.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Staff & Admin Status Controls */}
                  {(isStaff || isAdmin) && (
                    <div className="pt-4 border-t border-zinc-150 flex flex-wrap items-center gap-3">
                      <span className="text-xs font-semibold text-zinc-500 mr-2">Update Quotation Status:</span>
                      <button
                        onClick={() => handleUpdateQuoteStatus(selectedQuote.id, 'SENT')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                      >
                        Mark as Sent
                      </button>
                      <button
                        onClick={() => handleUpdateQuoteStatus(selectedQuote.id, 'ACCEPTED')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                      >
                        Accept Quotation
                      </button>
                      <button
                        onClick={() => handleUpdateQuoteStatus(selectedQuote.id, 'REJECTED')}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition"
                      >
                        Decline Quotation
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-zinc-200 p-8 text-center text-zinc-400">
                  Select a quotation to view detailed terms and line items.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CUSTOMER QUOTATION REQUEST ================= */}
      {showQuoteRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
              <h3 className="text-lg font-bold text-zinc-950">Ask for Custom Quotation</h3>
              <button
                onClick={() => setShowQuoteRequestModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuoteRequest} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Plan or Package Title *</label>
                <input
                  type="text"
                  required
                  value={quoteRequestForm.planName}
                  onChange={(e) =>
                    setQuoteRequestForm({ ...quoteRequestForm, planName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Target Quantity / Units</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quoteRequestForm.quantity}
                    onChange={(e) =>
                      setQuoteRequestForm({
                        ...quoteRequestForm,
                        quantity: Math.max(1, Number(e.target.value)),
                      })
                    }
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Estimated Budget ($)</label>
                  <input
                    type="number"
                    value={quoteRequestForm.estimatedAmount}
                    onChange={(e) =>
                      setQuoteRequestForm({
                        ...quoteRequestForm,
                        estimatedAmount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">
                  Customization Requirements & Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail your requirements (e.g. 50 user seats, multi-currency support, custom integration)..."
                  value={quoteRequestForm.notes}
                  onChange={(e) =>
                    setQuoteRequestForm({ ...quoteRequestForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={() => setShowQuoteRequestModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow hover:bg-indigo-700 transition"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: STAFF PREPARE QUOTATION ================= */}
      {showStaffQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
              <h3 className="text-lg font-bold text-zinc-950">Prepare Customer Quotation</h3>
              <button
                onClick={() => setShowStaffQuoteModal(false)}
                className="text-zinc-400 hover:text-zinc-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitStaffQuote} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Customer</label>
                <select
                  value={staffQuoteForm.customerId}
                  onChange={(e) =>
                    setStaffQuoteForm({
                      ...staffQuoteForm,
                      customerId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="cust-uuid-001">Alex Rivera (Apex Retail Solutions Ltd.)</option>
                  <option value="cust-external-002">Enterprise Client (client@enterprise.com)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Plan / Package Title *</label>
                <input
                  type="text"
                  required
                  value={staffQuoteForm.planName}
                  onChange={(e) =>
                    setStaffQuoteForm({ ...staffQuoteForm, planName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Agreed Quotation Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={staffQuoteForm.totalAmount}
                    onChange={(e) =>
                      setStaffQuoteForm({
                        ...staffQuoteForm,
                        totalAmount: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={staffQuoteForm.validDays}
                    onChange={(e) =>
                      setStaffQuoteForm({
                        ...staffQuoteForm,
                        validDays: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Staff Commercial Terms</label>
                <textarea
                  rows={3}
                  placeholder="Payment milestone, SLA coverage, or bundle terms..."
                  value={staffQuoteForm.notes}
                  onChange={(e) =>
                    setStaffQuoteForm({ ...staffQuoteForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={() => setShowStaffQuoteModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 text-white font-bold shadow hover:bg-amber-700 transition"
                >
                  Save & Dispatch Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;

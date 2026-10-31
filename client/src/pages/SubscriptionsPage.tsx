import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  CustomerSubscription,
  Quotation,
  QuotationStatus,
  SubscriptionStatus,
} from '../types';
import { formatINR } from '../utils/currency';
import {
  Calendar,
  Layers,
  CheckCircle,
  Clock,
  PauseCircle,
  XCircle,
  FileText,
  RefreshCw,
  Search,
  Filter,
  PlayCircle,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Plus,
  Send,
  UserCheck,
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
  const isStaffOrAdmin = isStaff || isAdmin;

  // Tabs: 'subscriptions' or 'quotations'
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'quotations'>('subscriptions');

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [selectedSub, setSelectedSub] = useState<CustomerSubscription | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Quotations state
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [quoteFilterStatus, setQuoteFilterStatus] = useState<string>('ALL');
  const [quoteSearchQuery, setQuoteSearchQuery] = useState('');

  // Modals state
  const [showQuoteRequestModal, setShowQuoteRequestModal] = useState(false);
  const [quoteRequestPlan, setQuoteRequestPlan] = useState('');
  const [quoteRequestNotes, setQuoteRequestNotes] = useState('');
  const [quoteRequestAmount, setQuoteRequestAmount] = useState<number>(0);

  const [showStaffQuoteModal, setShowStaffQuoteModal] = useState(false);
  const [staffQuoteCustomerEmail, setStaffQuoteCustomerEmail] = useState('');
  const [staffQuotePlanName, setStaffQuotePlanName] = useState('');
  const [staffQuoteTotalAmount, setStaffQuoteTotalAmount] = useState<number>(0);
  const [staffQuoteNotes, setStaffQuoteNotes] = useState('');
  const [staffQuoteValidDays, setStaffQuoteValidDays] = useState(30);

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsData, quotesData] = await Promise.all([
        isCustomer ? api.customer.getSubscriptions() : api.subscriptions.getAll(),
        api.subscriptions.getQuotations(isCustomer ? user?.id : undefined),
      ]);

      setSubscriptions(subsData || []);
      if (subsData && subsData.length > 0) {
        if (!selectedSub) {
          setSelectedSub(subsData[0]);
        } else {
          const found = subsData.find((s) => s.id === selectedSub.id);
          if (found) setSelectedSub(found);
        }
      }

      setQuotations(quotesData || []);
      if (quotesData && quotesData.length > 0) {
        if (!selectedQuote) {
          setSelectedQuote(quotesData[0]);
        } else {
          const found = quotesData.find((q) => q.id === selectedQuote.id);
          if (found) setSelectedQuote(found);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.role, user?.id]);

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesFilter = filterStatus === 'ALL' || sub.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      sub.planName.toLowerCase().includes(query) ||
      sub.subscriptionNumber.toLowerCase().includes(query) ||
      (sub.customerCompany && sub.customerCompany.toLowerCase().includes(query)) ||
      (sub.customerName && sub.customerName.toLowerCase().includes(query)) ||
      (sub.quotationNumber && sub.quotationNumber.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  const filteredQuotes = quotations.filter((q) => {
    const matchesFilter = quoteFilterStatus === 'ALL' || q.status === quoteFilterStatus;
    const query = quoteSearchQuery.toLowerCase();
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(query) ||
      (q.planName && q.planName.toLowerCase().includes(query)) ||
      (q.customerName && q.customerName.toLowerCase().includes(query)) ||
      (q.customerCompany && q.customerCompany.toLowerCase().includes(query)) ||
      (q.notes && q.notes.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600">
            <Clock className="w-3 h-3" /> Draft
          </span>
        );
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            <Send className="w-3 h-3" /> Sent to Customer
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'CONVERTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            <ShieldCheck className="w-3 h-3" /> Active Subscription
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-200 text-zinc-500">
            Expired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-600">
            {status}
          </span>
        );
    }
  };

  // Lifecycle handlers for Subscriptions
  const handlePause = async () => {
    if (!selectedSub) return;
    try {
      setActionLoading(true);
      const updated = await api.subscriptions.pause(selectedSub.id);
      setSelectedSub(updated);
      setSubscriptions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setNotice(`Subscription ${updated.subscriptionNumber} has been paused.`);
    } catch (err: any) {
      setNotice(`Failed to pause: ${err.message}`);
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  const handleResume = async () => {
    if (!selectedSub) return;
    try {
      setActionLoading(true);
      const updated = await api.subscriptions.resume(selectedSub.id);
      setSelectedSub(updated);
      setSubscriptions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setNotice(`Subscription ${updated.subscriptionNumber} has been resumed to ACTIVE.`);
    } catch (err: any) {
      setNotice(`Failed to resume: ${err.message}`);
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  const handleClose = async () => {
    if (!selectedSub) return;
    if (!window.confirm(`Are you sure you want to permanently CLOSE subscription ${selectedSub.subscriptionNumber}?`)) {
      return;
    }
    try {
      setActionLoading(true);
      const updated = await api.subscriptions.close(selectedSub.id);
      setSelectedSub(updated);
      setSubscriptions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setNotice(`Subscription ${updated.subscriptionNumber} has been closed.`);
    } catch (err: any) {
      setNotice(`Failed to close: ${err.message}`);
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  const handleEarlyRenewal = () => {
    if (!selectedSub) return;
    setNotice(`Early renewal invoice request queued for subscription ${selectedSub.subscriptionNumber}.`);
    setTimeout(() => setNotice(null), 5000);
  };

  // Quotation handlers
  const handleSubmitQuoteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const newQuote = await api.subscriptions.requestQuotation({
        planName: quoteRequestPlan || 'Custom Enterprise Tier',
        notes: quoteRequestNotes,
        estimatedAmount: Number(quoteRequestAmount) || 0,
      });
      setNotice(`Quotation request submitted successfully: ${newQuote.quotationNumber}`);
      setShowQuoteRequestModal(false);
      setQuoteRequestPlan('');
      setQuoteRequestNotes('');
      setQuoteRequestAmount(0);
      await fetchData();
      setActiveTab('quotations');
      setSelectedQuote(newQuote);
    } catch (err: any) {
      setNotice(`Failed to submit request: ${err.message}`);
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotice(null), 6000);
    }
  };

  const handleSubmitStaffQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffQuoteCustomerEmail || !staffQuotePlanName || !staffQuoteTotalAmount) {
      alert('Please fill out all required fields');
      return;
    }
    try {
      setActionLoading(true);
      const newQuote = await api.subscriptions.prepareQuotation({
        customerId: staffQuoteCustomerEmail,
        planName: staffQuotePlanName,
        totalAmount: Number(staffQuoteTotalAmount),
        notes: staffQuoteNotes,
        validDays: Number(staffQuoteValidDays) || 30,
      });
      setNotice(`Commercial quotation prepared and sent: ${newQuote.quotationNumber}`);
      setShowStaffQuoteModal(false);
      setStaffQuoteCustomerEmail('');
      setStaffQuotePlanName('');
      setStaffQuoteTotalAmount(0);
      setStaffQuoteNotes('');
      await fetchData();
      setActiveTab('quotations');
      setSelectedQuote(newQuote);
    } catch (err: any) {
      setNotice(`Failed to prepare quotation: ${err.message}`);
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotice(null), 6000);
    }
  };

  const handleUpdateQuoteStatus = async (quoteId: string, status: QuotationStatus) => {
    try {
      setActionLoading(true);
      const updated = await api.subscriptions.updateQuotationStatus(quoteId, status);
      setNotice(`Quotation ${updated.quotationNumber} updated to ${status}`);
      await fetchData();
      setSelectedQuote(updated);
    } catch (err: any) {
      setNotice(`Failed to update quotation: ${err.message}`);
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotice(null), 6000);
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

      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-150">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isCustomer && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                Customer Self-Service
              </span>
            )}
            {isStaff && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                Staff Operations Desk
              </span>
            )}
            {isAdmin && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
                Admin Control Center
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pastel-yellow text-amber-950">
              Commercial Engine
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            {isStaffOrAdmin ? 'Subscriptions & Quotations' : 'My Subscriptions & Quotations'}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isCustomer
              ? 'Review your active recurring plans and request or view custom commercial quotations.'
              : 'Oversee all client subscription lifecycles and draft custom enterprise quotations.'}
          </p>
        </div>

        {/* View Switcher Tabs & Role Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-zinc-100 p-1.5 rounded-2xl flex items-center gap-1 border border-zinc-200">
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'subscriptions'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Subscriptions</span>
              <span className="ml-1 px-1.5 py-0.2 bg-zinc-200 rounded-full text-[10px]">
                {subscriptions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('quotations')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'quotations'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Quotations Desk</span>
              <span className="ml-1 px-1.5 py-0.2 bg-indigo-100 text-indigo-700 rounded-full text-[10px]">
                {quotations.length}
              </span>
            </button>
          </div>

          {/* Contextual Action Button */}
          {isCustomer && (
            <button
              onClick={() => setShowQuoteRequestModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 shadow-sm transition"
            >
              <Send className="w-3.5 h-3.5" /> Request Quotation
            </button>
          )}
          {isStaffOrAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStaffQuoteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" /> Quick Prepare Quote
              </button>
              <Link
                to="/quotations/new"
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition border border-zinc-200"
              >
                Full Quotation Hub <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-zinc-400">Loading records...</span>
        </div>
      ) : activeTab === 'subscriptions' ? (
        /* ================= TAB 1: SUBSCRIPTIONS VIEW ================= */
        <div className="space-y-6">
          {/* Subscriptions Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder={
                  isCustomer
                    ? 'Search your plans or IDs...'
                    : 'Search customer name, company, or subscription...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {['ALL', 'ACTIVE', 'PAUSED', 'CLOSED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    filterStatus === status
                      ? 'bg-zinc-950 text-white shadow-sm'
                      : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200/60'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {filteredSubs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-3">
              <Layers className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="text-base font-bold text-zinc-800">No subscriptions found</h3>
              <p className="text-zinc-500 text-xs">
                {isCustomer
                  ? 'You do not have any active subscriptions matching this filter. Browse products to pick a plan.'
                  : 'No customer subscriptions match the filter. Convert an approved quotation to create one.'}
              </p>
              {isCustomer ? (
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold mt-2"
                >
                  Explore Products & Plans
                </Link>
              ) : (
                <button
                  onClick={() => setActiveTab('quotations')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold mt-2"
                >
                  Check Quotations Desk
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Subscriptions List (Left Column) */}
              <div className="lg:col-span-5 space-y-4">
                {filteredSubs.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-zinc-900 bg-white shadow-lg ring-1 ring-zinc-900'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 shadow-sm'
                      }`}
                    >
                      {/* Customer attribution for Staff & Admin */}
                      {!isCustomer && (sub.customerName || sub.customerCompany) && (
                        <div className="text-xs font-semibold flex items-center gap-1.5 mb-2 text-indigo-700 bg-indigo-50/70 px-2.5 py-1 rounded-xl w-fit">
                          <Building className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{sub.customerCompany || sub.customerName}</span>
                          {sub.customerName && sub.customerCompany && (
                            <span className="text-indigo-400 font-normal">({sub.customerName})</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">
                            {sub.subscriptionNumber}
                          </span>
                          <h3 className="text-base font-bold text-zinc-900 mt-0.5">{sub.planName}</h3>
                        </div>
                        {getStatusBadge(sub.status)}
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Billed {sub.billingFrequency.toLowerCase()}</span>
                        </div>
                        <span className="font-extrabold text-zinc-900 text-sm">
                          {formatINR(sub.totalPrice || sub.planPrice)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subscription Detail View (Right Column) */}
              {selectedSub && (
                <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
                  {/* Customer context banner for Staff/Admin */}
                  {!isCustomer && (
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <UserCheck className="w-5 h-5 text-indigo-600" />
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">
                            Account Profile
                          </span>
                          <span className="text-sm font-extrabold text-zinc-900">
                            {selectedSub.customerCompany || selectedSub.customerName || 'Subscriber Account'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded-xl text-indigo-700 border border-indigo-200 shadow-xs">
                        ID: {selectedSub.customerId.slice(0, 10)}...
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-150">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        {selectedSub.subscriptionNumber}
                      </span>
                      <h2 className="text-2xl font-extrabold text-zinc-950 mt-1">
                        {selectedSub.planName}
                      </h2>
                    </div>
                    {getStatusBadge(selectedSub.status)}
                  </div>

                  {/* Key Metrics / Snapshot */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-150 text-xs">
                    <div>
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[10px]">
                        Monthly / Term
                      </span>
                      <span className="font-extrabold text-zinc-900 text-sm mt-0.5 block">
                        {formatINR(selectedSub.totalPrice || selectedSub.planPrice)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[10px]">
                        Billing Cycle
                      </span>
                      <span className="font-extrabold text-zinc-900 mt-0.5 block">
                        {selectedSub.billingFrequency}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[10px]">
                        Next Billing Date
                      </span>
                      <span className="font-extrabold text-zinc-900 mt-0.5 block">
                        {selectedSub.nextBillingDate ? new Date(selectedSub.nextBillingDate).toLocaleDateString() : 'Active Renewal'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[10px]">
                        Source Agreement
                      </span>
                      {selectedSub.quotationNumber ? (
                        <Link
                          to={`/quotations/${selectedSub.quotationId}`}
                          className="font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-0.5"
                        >
                          {selectedSub.quotationNumber}
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="font-extrabold text-zinc-500 mt-0.5 block">Direct Catalog</span>
                      )}
                    </div>
                  </div>

                  {/* Pricing Breakdown & Add-ons */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Pricing Breakdown & Line Items
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-zinc-200 text-zinc-400 font-semibold">
                            <th className="pb-2">Component</th>
                            <th className="pb-2">Qty</th>
                            <th className="pb-2 text-right">Unit Rate</th>
                            <th className="pb-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 text-zinc-700">
                          <tr>
                            <td className="py-2.5 font-bold text-zinc-900">
                              {selectedSub.planName} (Core Subscription)
                            </td>
                            <td className="py-2.5">1</td>
                            <td className="py-2.5 text-right font-medium">
                              {formatINR(selectedSub.planPrice)}
                            </td>
                            <td className="py-2.5 text-right font-bold text-zinc-900">
                              {formatINR(selectedSub.planPrice)}
                            </td>
                          </tr>
                          {selectedSub.variants &&
                            selectedSub.variants.map((v, i) => (
                              <tr key={i} className="text-zinc-600">
                                <td className="py-2 pl-4">
                                  <div className="font-semibold text-zinc-800">{v.name}</div>
                                  <div className="text-[11px] text-zinc-400">{v.type} variant</div>
                                </td>
                                <td className="py-2">{v.quantity}</td>
                                <td className="py-2 text-right font-medium">
                                  {formatINR(v.priceModifier)}
                                </td>
                                <td className="py-2 text-right font-bold text-zinc-900">
                                  {formatINR(v.priceModifier * v.quantity)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-zinc-200 font-extrabold text-zinc-950">
                            <td colSpan={3} className="pt-3 text-right text-xs uppercase tracking-wider">
                              Recurring Total ({selectedSub.billingFrequency.toLowerCase()}):
                            </td>
                            <td className="pt-3 text-right text-sm text-indigo-700">
                              {formatINR(selectedSub.totalPrice || selectedSub.planPrice)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Staff / Admin Lifecycle Controls */}
                  {isStaffOrAdmin && (
                    <div className="pt-6 border-t border-zinc-150 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Lifecycle Control Actions
                        </span>
                        <span className="text-[11px] text-zinc-400 font-medium">
                          Authorized Role: {user?.role}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {selectedSub.status === 'ACTIVE' && (
                          <button
                            disabled={actionLoading}
                            onClick={handlePause}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition disabled:opacity-50"
                          >
                            <PauseCircle className="w-4 h-4 text-amber-600" />
                            Pause Subscription
                          </button>
                        )}

                        {selectedSub.status === 'PAUSED' && (
                          <button
                            disabled={actionLoading}
                            onClick={handleResume}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition disabled:opacity-50"
                          >
                            <PlayCircle className="w-4 h-4 text-emerald-600" />
                            Resume to Active
                          </button>
                        )}

                        <button
                          disabled={actionLoading}
                          onClick={handleEarlyRenewal}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-zinc-100 text-zinc-800 border border-zinc-200 text-xs font-bold hover:bg-zinc-200 transition disabled:opacity-50"
                        >
                          <RefreshCw className="w-4 h-4 text-zinc-600" />
                          Trigger Early Renewal
                        </button>

                        {selectedSub.status !== 'CLOSED' && (
                          <button
                            disabled={actionLoading}
                            onClick={handleClose}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4 text-rose-600" />
                            Close Permanently
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Customer Portal notice if self-service */}
                  {isCustomer && (
                    <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                      <span>Need changes to your subscription plan or add-on seats?</span>
                      <button
                        onClick={() => {
                          setQuoteRequestPlan(selectedSub.planName);
                          setShowQuoteRequestModal(true);
                        }}
                        className="font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Request Plan Amendment &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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
                placeholder={
                  isCustomer
                    ? 'Search quotation # or plan...'
                    : 'Search quote #, customer, company...'
                }
                value={quoteSearchQuery}
                onChange={(e) => setQuoteSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Status:
              </span>
              {['ALL', 'DRAFT', 'SENT', 'CONFIRMED', 'CONVERTED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setQuoteFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    quoteFilterStatus === st
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200/60'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {filteredQuotes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-3">
              <FileText className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="text-base font-bold text-zinc-800">No commercial quotations found</h3>
              <p className="text-zinc-500 text-xs">
                {isCustomer
                  ? 'You have not requested any custom quotations yet. Browse products or submit a custom quote request.'
                  : 'No quotation proposals match this filter. Staff can prepare custom proposals for interested clients.'}
              </p>
              {isCustomer ? (
                <button
                  onClick={() => setShowQuoteRequestModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold mt-2"
                >
                  Request a Quotation Now
                </button>
              ) : (
                <button
                  onClick={() => setShowStaffQuoteModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold mt-2"
                >
                  Draft New Proposal
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Quotations List (Left Column) */}
              <div className="lg:col-span-5 space-y-4">
                {filteredQuotes.map((q) => {
                  const isSelected = selectedQuote?.id === q.id;
                  return (
                    <div
                      key={q.id}
                      onClick={() => setSelectedQuote(q)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-white shadow-lg ring-1 ring-indigo-600'
                          : 'border-zinc-200 bg-white hover:border-zinc-300 shadow-sm'
                      }`}
                    >
                      {/* Customer attribution if Staff/Admin */}
                      {!isCustomer && (q.customerCompany || q.customerName) && (
                        <div className="text-xs font-semibold flex items-center gap-1.5 mb-2 text-indigo-700 bg-indigo-50/70 px-2.5 py-1 rounded-xl w-fit">
                          <Building className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{q.customerCompany || q.customerName}</span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">
                            {q.quotationNumber}
                          </span>
                          <h3 className="text-base font-bold text-zinc-900 mt-0.5">
                            {q.planName || 'Custom Commercial Tier'}
                          </h3>
                        </div>
                        {getQuoteStatusBadge(q.status)}
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Expires {new Date(q.validUntil).toLocaleDateString()}</span>
                        </div>
                        <span className="font-extrabold text-zinc-900 text-sm">
                          {formatINR(q.totalAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quotation Detail View (Right Column) */}
              {selectedQuote && (
                <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
                  {/* Account attribution banner for Staff */}
                  {!isCustomer && (
                    <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <UserCheck className="w-5 h-5 text-indigo-600" />
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">
                            Quotation Target Account
                          </span>
                          <span className="text-sm font-extrabold text-zinc-900">
                            {selectedQuote.customerCompany || selectedQuote.customerName || selectedQuote.customerId}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded-xl text-indigo-700 border border-indigo-200">
                        {new Date(selectedQuote.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-150">
                    <div>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        {selectedQuote.quotationNumber}
                      </span>
                      <h2 className="text-2xl font-extrabold text-zinc-950 mt-1">
                        {selectedQuote.planName || 'Custom Commercial Proposal'}
                      </h2>
                    </div>
                    {getQuoteStatusBadge(selectedQuote.status)}
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-150 text-xs">
                    <div>
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[10px]">
                        Quotation Value
                      </span>
                      <span className="font-extrabold text-indigo-700 text-base mt-0.5 block">
                        {formatINR(selectedQuote.totalAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[10px]">
                        Validity Period
                      </span>
                      <span className="font-extrabold text-zinc-900 mt-0.5 block">
                        Until {new Date(selectedQuote.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[10px]">
                        Lifecycle State
                      </span>
                      <span className="font-extrabold text-zinc-900 mt-0.5 block">
                        {selectedQuote.status}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Special Terms */}
                  {selectedQuote.notes && (
                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-700 space-y-1">
                      <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] block">
                        Commercial Terms & Notes
                      </span>
                      <p className="whitespace-pre-line leading-relaxed">{selectedQuote.notes}</p>
                    </div>
                  )}

                  {/* Line Items if available */}
                  {selectedQuote.lines && selectedQuote.lines.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        Proposed Line Items
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-zinc-200 text-zinc-400 font-semibold">
                              <th className="pb-2">Description</th>
                              <th className="pb-2">Qty</th>
                              <th className="pb-2 text-right">Unit Price</th>
                              <th className="pb-2 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 text-zinc-700">
                            {selectedQuote.lines.map((item, idx) => (
                              <tr key={idx}>
                                <td className="py-2.5 font-bold text-zinc-900">{item.productName}</td>
                                <td className="py-2.5">{item.quantity}</td>
                                <td className="py-2.5 text-right font-medium">{formatINR(item.unitPrice)}</td>
                                <td className="py-2.5 text-right font-bold text-zinc-900">
                                  {formatINR(item.unitPrice * item.quantity)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-6 border-t border-zinc-150 flex flex-wrap items-center justify-between gap-3">
                    <Link
                      to={`/quotations/${selectedQuote.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Open in Quotations Hub <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Customer Actions */}
                      {isCustomer && selectedQuote.status === 'SENT' && (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateQuoteStatus(selectedQuote.id, 'CONFIRMED')}
                            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
                          >
                            Accept & Confirm Quotation
                          </button>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleUpdateQuoteStatus(selectedQuote.id, 'REJECTED')}
                            className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition disabled:opacity-50"
                          >
                            Decline Proposal
                          </button>
                        </>
                      )}

                      {/* Staff / Admin Actions */}
                      {isStaffOrAdmin && (
                        <>
                          {selectedQuote.status === 'DRAFT' && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleUpdateQuoteStatus(selectedQuote.id, 'SENT')}
                              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" /> Dispatch to Customer
                            </button>
                          )}
                          {selectedQuote.status === 'CONFIRMED' && (
                            <button
                              disabled={actionLoading}
                              onClick={() => handleUpdateQuoteStatus(selectedQuote.id, 'CONVERTED')}
                              className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Convert to Active Subscription
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: CUSTOMER QUOTATION REQUEST ================= */}
      {showQuoteRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-150">
              <h3 className="text-lg font-extrabold text-zinc-950 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" /> Request Custom Quotation
              </h3>
              <button
                onClick={() => setShowQuoteRequestModal(false)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitQuoteRequest} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Requested Plan / Tier</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Cloud Annual with 50 seats"
                  value={quoteRequestPlan}
                  onChange={(e) => setQuoteRequestPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Estimated Budget (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={quoteRequestAmount || ''}
                  onChange={(e) => setQuoteRequestAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  Requirements & Specifications *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Specify custom storage, concurrent user licenses, SLA needs..."
                  value={quoteRequestNotes}
                  onChange={(e) => setQuoteRequestNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={() => setShowQuoteRequestModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 font-bold hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-zinc-950 text-white font-bold hover:bg-zinc-800 disabled:opacity-50"
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
            <div className="flex items-center justify-between pb-3 border-b border-zinc-150">
              <h3 className="text-lg font-extrabold text-zinc-950 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" /> Prepare Commercial Quotation
              </h3>
              <button
                onClick={() => setShowStaffQuoteModal(false)}
                className="text-zinc-400 hover:text-zinc-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitStaffQuote} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-700 block mb-1">
                  Customer Email or Client ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. client@enterprise.com"
                  value={staffQuoteCustomerEmail}
                  onChange={(e) => setStaffQuoteCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Plan / Package Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Tier + Dedicated Support"
                  value={staffQuotePlanName}
                  onChange={(e) => setStaffQuotePlanName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Total Agreed Rate (INR) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 75000"
                    value={staffQuoteTotalAmount || ''}
                    onChange={(e) => setStaffQuoteTotalAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Valid Days</label>
                  <input
                    type="number"
                    min={1}
                    value={staffQuoteValidDays}
                    onChange={(e) => setStaffQuoteValidDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Commercial Notes & Terms</label>
                <textarea
                  rows={3}
                  placeholder="Includes 24/7 dedicated account manager, 99.99% uptime guarantee..."
                  value={staffQuoteNotes}
                  onChange={(e) => setStaffQuoteNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={() => setShowStaffQuoteModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-600 font-bold hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  Create & Send Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

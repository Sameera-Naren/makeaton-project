import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CustomerSubscription, SubscriptionStatus } from '../types';
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
} from 'lucide-react';

export const SubscriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [selectedSub, setSelectedSub] = useState<CustomerSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN';

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      // If Staff/Admin, fetch all subscriptions; if Customer, fetch customer subscriptions
      const data = isStaffOrAdmin
        ? await api.subscriptions.getAll()
        : await api.customer.getSubscriptions();

      setSubscriptions(data);
      if (data.length > 0) {
        setSelectedSub(data[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [user?.role]);

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesFilter = filterStatus === 'ALL' || sub.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      sub.planName.toLowerCase().includes(query) ||
      sub.subscriptionNumber.toLowerCase().includes(query) ||
      (sub.customerCompany && sub.customerCompany.toLowerCase().includes(query)) ||
      (sub.quotationNumber && sub.quotationNumber.toLowerCase().includes(query));
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {notice && (
        <div className="p-4 rounded-2xl bg-zinc-900 text-white text-sm font-medium flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-zinc-150">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              {isStaffOrAdmin ? 'Staff Operations & Lifecycle' : 'Customer Portal'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pastel-yellow text-amber-950">
              Lifecycle Engine
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
            {isStaffOrAdmin ? 'Subscription Management' : 'My Subscriptions & Plans'}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isStaffOrAdmin
              ? 'View all active customer accounts, review source quotation agreements, and execute lifecycle state transitions.'
              : 'View active contracts, plan frequency, pricing variants, and lifecycle status.'}
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
            />
          </div>

          <div className="flex bg-zinc-100 p-1 rounded-full text-xs font-bold">
            {['ALL', 'ACTIVE', 'PAUSED', 'CLOSED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full transition ${
                  filterStatus === status
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-zinc-400">Loading subscriptions...</span>
        </div>
      ) : filteredSubs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center space-y-3">
          <Layers className="w-8 h-8 text-zinc-400 mx-auto" />
          <h3 className="text-base font-bold text-zinc-800">No subscriptions found</h3>
          <p className="text-zinc-500 text-xs">
            Convert a confirmed quotation to generate a new active subscription.
          </p>
          {isStaffOrAdmin && (
            <Link
              to="/quotations"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold mt-2"
            >
              Go to Quotations Hub
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Subscriptions List (Left column) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-2">
              <span>{filteredSubs.length} Subscription(s)</span>
              <span>Select to inspect</span>
            </div>

            {filteredSubs.map((sub) => {
              const isSelected = selectedSub?.id === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSub(sub)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-zinc-900 shadow-md ring-2 ring-zinc-900/5'
                      : 'bg-white border-zinc-200/80 hover:border-zinc-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-indigo-600 block">
                        {sub.subscriptionNumber}
                      </span>
                      <h3 className="font-bold text-zinc-900 text-sm leading-tight mt-0.5">
                        {sub.planName}
                      </h3>
                      {sub.customerCompany && (
                        <span className="text-xs text-zinc-500 block mt-0.5">
                          {sub.customerCompany}
                        </span>
                      )}
                    </div>
                    {getStatusBadge(sub.status)}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">
                      Frequency: <span className="font-semibold text-zinc-800">{sub.billingFrequency}</span>
                    </span>
                    <span className="font-mono font-bold text-zinc-950 text-sm">
                      {formatINR(sub.totalAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subscription Inspector Detail View (Right column) */}
          <div className="lg:col-span-7">
            {selectedSub ? (
              <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-8 sticky top-28">
                {/* Header with Status and ID */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-zinc-150">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-zinc-100 text-zinc-800">
                        {selectedSub.subscriptionNumber}
                      </span>
                      {getStatusBadge(selectedSub.status)}
                    </div>
                    <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
                      {selectedSub.planName}
                    </h2>
                    {selectedSub.customerCompany && (
                      <span className="text-sm font-semibold text-zinc-600 block mt-0.5">
                        Client: {selectedSub.customerCompany} {selectedSub.customerName && `(${selectedSub.customerName})`}
                      </span>
                    )}
                  </div>

                  {/* Source Quotation Tag */}
                  {selectedSub.quotationNumber && (
                    <Link
                      to={`/quotations/${selectedSub.quotationId || selectedSub.quotationNumber}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-200 bg-indigo-50/60 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                      title="View origin quotation"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Quote: {selectedSub.quotationNumber}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {/* Key Metrics / Snapshot */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-150 text-xs">
                  <div>
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[10px]">
                      Billing
                    </span>
                    <span className="font-bold text-zinc-900 mt-0.5 block">
                      {selectedSub.billingFrequency}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[10px]">
                      Start Date
                    </span>
                    <span className="font-bold text-zinc-900 mt-0.5 block">
                      {selectedSub.startDate ? new Date(selectedSub.startDate).toLocaleDateString() : '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[10px]">
                      Renewal Date
                    </span>
                    <span className="font-bold text-indigo-600 mt-0.5 block">
                      {selectedSub.expiryDate ? new Date(selectedSub.expiryDate).toLocaleDateString() : 'Auto-renewing'}
                    </span>
                  </div>

                  <div>
                    <span className="text-zinc-400 font-semibold uppercase tracking-wider block text-[10px]">
                      Payment Terms
                    </span>
                    <span className="font-bold text-zinc-900 mt-0.5 block">
                      {selectedSub.paymentTerms}
                    </span>
                  </div>
                </div>

                {/* Line Items Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Contract Line Items &amp; Active Seats
                  </h4>
                  <div className="border border-zinc-150 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 border-b border-zinc-150 font-bold text-zinc-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">Product / Add-on</th>
                          <th className="py-3 px-4 text-center">Qty</th>
                          <th className="py-3 px-4 text-right">Agreed Price</th>
                          <th className="py-3 px-4 text-right">Tax</th>
                          <th className="py-3 px-4 text-right">Subtotal</th>
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
                            <td className="py-3 px-4 text-center font-bold text-zinc-700">
                              {line.quantity}
                            </td>
                            <td className="py-3 px-4 text-right text-zinc-600 font-mono">
                              {formatINR(line.unitPrice)}
                            </td>
                            <td className="py-3 px-4 text-right text-zinc-500">
                              {line.taxRate}%
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-zinc-950">
                              {formatINR(line.amount)}
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
                            {formatINR(selectedSub.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Staff / Admin Lifecycle Controls */}
                <div className="pt-6 border-t border-zinc-150 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Lifecycle Management Controls
                    </span>
                    {actionLoading && (
                      <span className="text-xs text-indigo-600 font-bold flex items-center gap-1.5 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing transition...
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {/* Pause / Resume Controls */}
                    {selectedSub.status === 'ACTIVE' && (
                      <button
                        onClick={handlePause}
                        disabled={actionLoading}
                        className="px-5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        <PauseCircle className="w-4 h-4" />
                        <span>Pause Subscription</span>
                      </button>
                    )}

                    {selectedSub.status === 'PAUSED' && (
                      <button
                        onClick={handleResume}
                        disabled={actionLoading}
                        className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Resume Subscription</span>
                      </button>
                    )}

                    {/* Early Renewal */}
                    {selectedSub.status !== 'CLOSED' && (
                      <button
                        onClick={handleEarlyRenewal}
                        disabled={actionLoading}
                        className="px-5 py-2.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Request Early Renewal</span>
                      </button>
                    )}

                    {/* Close Subscription */}
                    {selectedSub.status !== 'CLOSED' && (
                      <button
                        onClick={handleClose}
                        disabled={actionLoading}
                        className="px-5 py-2.5 rounded-full border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Close Subscription</span>
                      </button>
                    )}

                    {selectedSub.status === 'CLOSED' && (
                      <div className="text-xs text-zinc-500 font-medium py-1">
                        This subscription contract has been closed. Historical records are preserved.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-zinc-200 p-8 text-center text-zinc-400">
                Select a subscription from the list to view its configuration.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CustomerSubscription, SubscriptionStatus } from '../types';
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
} from 'lucide-react';

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [selectedSub, setSelectedSub] = useState<CustomerSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await api.customer.getSubscriptions();
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
  }, []);

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesFilter = filterStatus === 'ALL' || sub.status === filterStatus;
    const matchesSearch =
      sub.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.subscriptionNumber.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleAction = (action: string) => {
    setNotice(`Subscription ${action} request registered with Brightloop management.`);
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {notice && (
        <div className="p-4 rounded-2xl bg-zinc-900 text-white text-sm font-medium flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Customer Portal
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
            My Subscriptions & Plans
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            View active contracts, plan frequency, pricing variants, and lifecycle status.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full border border-zinc-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div className="flex bg-zinc-100 p-1 rounded-full text-xs font-semibold">
            {['ALL', 'ACTIVE', 'PAUSED', 'CLOSED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full transition ${
                  filterStatus === status ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-zinc-400 mt-2 font-medium">Loading subscriptions...</p>
        </div>
      ) : (
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

                {/* Self Service Lifecycle Actions */}
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
      )}
    </div>
  );
};

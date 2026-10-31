import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Quotation, QuotationStatus } from '../types';
import { CardWithArrow } from '../components/CardWithArrow';
import { formatINR, formatINRCompact } from '../utils/currency';
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Layers,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.quotations.getAll(filterStatus);
      setQuotations(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [filterStatus]);

  const filtered = quotations.filter((q) => {
    const query = searchQuery.toLowerCase();
    return (
      q.quotationNumber.toLowerCase().includes(query) ||
      (q.customerName && q.customerName.toLowerCase().includes(query)) ||
      (q.customerCompany && q.customerCompany.toLowerCase().includes(query)) ||
      (q.planName && q.planName.toLowerCase().includes(query))
    );
  });

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
            <Clock className="w-3.5 h-3.5 text-zinc-500" /> Draft
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Confirmed
          </span>
        );
      case 'CONVERTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Converted
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

  const draftCount = quotations.filter((q) => q.status === 'DRAFT').length;
  const confirmedCount = quotations.filter((q) => q.status === 'CONFIRMED').length;
  const convertedCount = quotations.filter((q) => q.status === 'CONVERTED').length;
  const totalValue = quotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Visual Reference Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-zinc-150">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-tight bg-pastel-blue text-indigo-950">
              Enterprise Sales &amp; Proposals Engine
            </span>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Brightloop Platform
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-none mb-3">
            Propose Bold. <br className="hidden sm:inline" />
            <span className="text-indigo-600">Convert Swift.</span> Scale Up.
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base max-w-2xl leading-relaxed">
            Configure custom software packages, configure product variants and user seats, 
            apply discounts, and transform confirmed customer quotations directly into recurring subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/quotations/new"
            className="px-6 py-3.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-bold shadow-sm transition flex items-center gap-2 group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>Create New Quotation</span>
          </Link>
        </div>
      </div>

      {/* Feature Cards Showcase (Aesthetic inspired by Reference 1) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardWithArrow
          pillText={`${draftCount} Proposals`}
          pillColor="bg-zinc-100 text-zinc-800 font-bold"
          title="Draft Quotes"
          description="Flexible pricing proposals being negotiated or awaiting customer review."
          bottomBgColor="bg-pastel-blue"
          onArrowClick={() => setFilterStatus('DRAFT')}
          bottomContent={
            <div className="flex items-center justify-between text-indigo-950">
              <span className="text-xs font-bold uppercase tracking-wider">Status: Draft</span>
              <span className="text-2xl font-black font-mono">{draftCount}</span>
            </div>
          }
        />

        <CardWithArrow
          pillText={`${confirmedCount} Actionable`}
          pillColor="bg-amber-100 text-amber-900 font-bold"
          title="Confirmed Quotes"
          description="Approved customer quotations primed for 1-click subscription activation."
          bottomBgColor="bg-pastel-yellow"
          onArrowClick={() => setFilterStatus('CONFIRMED')}
          bottomContent={
            <div className="flex items-center justify-between text-amber-950">
              <span className="text-xs font-bold uppercase tracking-wider">Ready to Convert</span>
              <span className="text-2xl font-black font-mono">{confirmedCount}</span>
            </div>
          }
        />

        <CardWithArrow
          pillText={`${formatINRCompact(totalValue)} Pipeline`}
          pillColor="bg-pastel-green text-emerald-950 font-bold"
          title="Converted Subscriptions"
          description="Live contracts seamlessly spawned from accepted quotations without duplicate re-entry."
          bottomBgColor="bg-pastel-purple"
          onArrowClick={() => setFilterStatus('CONVERTED')}
          bottomContent={
            <div className="flex items-center justify-between text-purple-950">
              <span className="text-xs font-bold uppercase tracking-wider">Converted Count</span>
              <span className="text-2xl font-black font-mono">{convertedCount}</span>
            </div>
          }
        />
      </div>

      {/* Main Quotations Table Area */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Table Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-2">Filter:</span>
            {['ALL', 'DRAFT', 'CONFIRMED', 'CONVERTED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                  filterStatus === st
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by quote #, client, or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border border-zinc-200 text-sm bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 w-full sm:w-80 transition"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            <span className="text-xs font-semibold text-zinc-400">Loading quotations...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-800">No quotations found</h3>
            <p className="text-zinc-500 text-xs max-w-sm mx-auto">
              {searchQuery
                ? `No quotation matches your search query "${searchQuery}".`
                : 'Create your first quotation to start the subscription lifecycle.'}
            </p>
            <Link
              to="/quotations/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold mt-2"
            >
              <Plus className="w-3.5 h-3.5" /> Create Quotation
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50/80 border-b border-zinc-150 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">Quotation</th>
                  <th className="py-3.5 px-4">Client Organization</th>
                  <th className="py-3.5 px-4">Plan / Package</th>
                  <th className="py-3.5 px-4">Valid Until</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-zinc-50/60 transition group cursor-pointer"
                    onClick={() => navigate(`/quotations/${q.id}`)}
                  >
                    <td className="py-4 px-4 font-mono font-bold text-zinc-950">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        <span>{q.quotationNumber}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-zinc-900 block">{q.customerCompany || 'Direct Client'}</span>
                      <span className="text-xs text-zinc-500">{q.customerName}</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-medium text-zinc-800">{q.planName || 'Enterprise'}</span>
                      <span className="block text-xs text-zinc-400">{q.lines?.length || 0} line item(s)</span>
                    </td>

                    <td className="py-4 px-4 text-xs text-zinc-600 font-mono">
                      {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '—'}
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-black text-zinc-950 text-base">
                      {formatINR(q.totalAmount)}
                    </td>

                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(q.status)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-xs font-bold text-zinc-800 group-hover:bg-zinc-950 group-hover:text-white transition">
                        <span>Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

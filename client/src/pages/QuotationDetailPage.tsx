import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Quotation, QuotationStatus } from '../types';
import { formatINR } from '../utils/currency';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Sparkles,
  FileText,
  AlertCircle,
  Building,
  User,
  Calendar,
  Layers,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

export const QuotationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchQuotation = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.quotations.getById(id);
      setQuotation(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load quotation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const handleConfirm = async () => {
    if (!quotation) return;
    try {
      setActionLoading(true);
      setError(null);
      const updated = await api.quotations.confirm(quotation.id);
      setQuotation(updated);
      setSuccessMessage(`Quotation ${updated.quotationNumber} confirmed! It is now ready for subscription activation.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to confirm quotation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!quotation) return;
    try {
      setActionLoading(true);
      setError(null);
      const result = await api.quotations.convert(quotation.id);
      setQuotation(result.quotation);
      setSuccessMessage(
        `Success! Converted into Subscription ${result.subscription.subscriptionNumber}. View under Subscriptions.`
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to convert quotation');
    } finally {
      setActionLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
        <span className="text-xs font-semibold text-zinc-400">Loading quotation details...</span>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-zinc-900">Quotation Not Found</h2>
        <p className="text-zinc-500 text-sm">The requested quotation ID could not be retrieved.</p>
        <Link to="/quotations" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-bold">
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Quotations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          to="/quotations"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-950 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quotations</span>
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Proposal Header */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-zinc-950 tracking-tight font-mono">
              {quotation.quotationNumber}
            </h1>
            {getStatusBadge(quotation.status)}
          </div>
          <p className="text-zinc-500 text-sm">
            Created on {new Date(quotation.createdAt).toLocaleDateString()} • Valid until{' '}
            {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}
          </p>
        </div>

        {/* Dynamic Action Trigger Banner */}
        <div className="flex flex-wrap items-center gap-3">
          {quotation.status === 'DRAFT' && (
            <button
              onClick={handleConfirm}
              disabled={actionLoading}
              className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-zinc-950 text-xs font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{actionLoading ? 'Confirming...' : 'Confirm Quotation'}</span>
            </button>
          )}

          {quotation.status === 'CONFIRMED' && (
            <button
              onClick={handleConvert}
              disabled={actionLoading}
              className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50 animate-pulse"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{actionLoading ? 'Activating...' : 'Convert to Active Subscription ↗'}</span>
            </button>
          )}

          {quotation.status === 'CONVERTED' && quotation.subscriptionNumber && (
            <Link
              to="/subscriptions"
              className="px-6 py-3 rounded-full bg-zinc-950 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 hover:bg-zinc-800"
            >
              <span>Subscription {quotation.subscriptionNumber}</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </Link>
          )}
        </div>
      </div>

      {/* Client & Plan Info Cards (Reference 1 Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-150">
            <Building className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Customer Account
            </h3>
          </div>
          <div>
            <span className="text-lg font-bold text-zinc-900 block">
              {quotation.customerCompany || 'Direct Client'}
            </span>
            <span className="text-sm text-zinc-600 block mt-0.5">
              Contact: {quotation.customerName}
            </span>
            {quotation.customerEmail && (
              <span className="text-xs text-zinc-400 block mt-1 font-mono">
                {quotation.customerEmail}
              </span>
            )}
          </div>
        </div>

        {/* Plan & Terms */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-150">
            <Layers className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Subscription Plan &amp; Notes
            </h3>
          </div>
          <div>
            <span className="text-lg font-bold text-zinc-900 block">
              {quotation.planName || 'Enterprise Subscription'}
            </span>
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              {quotation.notes || 'Standard Net 15 payment terms apply.'}
            </p>
          </div>
        </div>
      </div>

      {/* Line Items Table Card */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-150">
          <div>
            <h3 className="text-base font-bold text-zinc-950 tracking-tight">
              Quotation Line Items &amp; Products
            </h3>
            <p className="text-zinc-500 text-xs mt-0.5">
              Snapshot of agreed unit pricing, seat quantities, and calculated tax rates.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
            {quotation.lines?.length || 0} Item(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 border-b border-zinc-150 font-bold text-zinc-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Product Description</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-right">Tax Rate</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {quotation.lines?.map((line) => (
                <tr key={line.id} className="hover:bg-zinc-50/50">
                  <td className="py-3.5 px-4 font-semibold text-zinc-900">
                    <div>{line.productName}</div>
                    {line.variantName && (
                      <span className="text-[11px] text-indigo-600 font-normal">
                        Variant: {line.variantName}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-zinc-700">
                    {line.quantity}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-zinc-600">
                    {formatINR(line.unitPrice)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-600">
                    {(line.discount ?? 0) > 0 ? `-${formatINR(line.discount!)}` : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right text-zinc-500">
                    {line.taxRate}%
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-950">
                    {formatINR(line.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-zinc-200/80 font-bold text-zinc-700">
              <tr>
                <td colSpan={5} className="py-2.5 px-4 text-right text-zinc-500 uppercase text-[11px]">
                  Subtotal:
                </td>
                <td className="py-2.5 px-4 text-right font-mono">
                  {formatINR(quotation.subtotal)}
                </td>
              </tr>
              {(quotation.discountAmount ?? 0) > 0 && (
                <tr>
                  <td colSpan={5} className="py-2 px-4 text-right text-emerald-600 uppercase text-[11px]">
                    Total Discounts:
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-emerald-600">
                    -{formatINR(quotation.discountAmount!)}
                  </td>
                </tr>
              )}
              {(quotation.taxAmount ?? 0) > 0 && (
                <tr>
                  <td colSpan={5} className="py-2 px-4 text-right text-zinc-500 uppercase text-[11px]">
                    Total Taxes:
                  </td>
                  <td className="py-2 px-4 text-right font-mono">
                    +{formatINR(quotation.taxAmount!)}
                  </td>
                </tr>
              )}
              <tr className="border-t border-zinc-200 text-sm">
                <td colSpan={5} className="py-3 px-4 text-right uppercase font-black text-zinc-900">
                  Agreed Total Quotation Amount:
                </td>
                <td className="py-3 px-4 text-right font-mono font-black text-indigo-600 text-base">
                  {formatINR(quotation.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Lifecycle Workflow Banner (Aesthetic from Reference 1 pastel compartment) */}
      <div className="w-full rounded-3xl p-6 sm:p-8 bg-pastel-blue text-indigo-950 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider block opacity-75 mb-1">
            Subscription Lifecycle State
          </span>
          <h4 className="text-xl font-bold tracking-tight">
            {quotation.status === 'DRAFT' && 'Proposal in Draft — Confirm with Customer'}
            {quotation.status === 'CONFIRMED' && 'Ready for Instant Activation'}
            {quotation.status === 'CONVERTED' && 'Contract Successfully Activated'}
          </h4>
          <p className="text-xs opacity-85 mt-1 max-w-lg">
            {quotation.status === 'DRAFT' &&
              'Review line items and pricing adjustments. Once approved by the customer, confirm the proposal to enable subscription conversion.'}
            {quotation.status === 'CONFIRMED' &&
              'Click below to atomically generate an active subscription with scheduled renewal tracking and invoice hooks.'}
            {quotation.status === 'CONVERTED' &&
              'This quotation is locked and bound to active subscription records. No duplicate subscriptions can be spawned.'}
          </p>
        </div>

        <div className="flex-shrink-0">
          {quotation.status === 'DRAFT' && (
            <button
              onClick={handleConfirm}
              disabled={actionLoading}
              className="px-6 py-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-md transition"
            >
              Confirm Proposal
            </button>
          )}

          {quotation.status === 'CONFIRMED' && (
            <button
              onClick={handleConvert}
              disabled={actionLoading}
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              <span>Activate Subscription</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}

          {quotation.status === 'CONVERTED' && (
            <Link
              to="/subscriptions"
              className="px-6 py-3 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shadow-md transition inline-flex items-center gap-2"
            >
              <span>Open in Subscriptions</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CustomerPayment } from '../types';
import { formatINR } from '../utils/currency';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  FileText,
  Receipt,
  Download,
  Zap,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await api.customer.getPayments();
      setPayments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalSettled = payments.reduce((sum, p) => sum + p.amount, 0);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
        return <CreditCard className="w-4 h-4 text-indigo-600" />;
      case 'BANK_TRANSFER':
        return <Zap className="w-4 h-4 text-amber-600" />;
      default:
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Ledger &amp; Remittance
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">
            Payment History &amp; Receipts
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Complete transaction history for all subscription charges and settled invoices.
          </p>
        </div>

        {/* Total Settled Badge */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl px-5 py-3 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-400 text-zinc-950 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              Total Settled Payments
            </span>
            <span className="text-xl font-extrabold text-zinc-950 font-mono">
              {formatINR(totalSettled)}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-800 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-zinc-400 mt-2 font-medium">Fetching payment records...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center text-zinc-400">
          No payments recorded yet.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50/80 border-b border-zinc-150 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6 rounded-l-xl">Receipt ID</th>
                  <th className="py-3 px-6">Invoice Ref</th>
                  <th className="py-3 px-6">Payment Method</th>
                  <th className="py-3 px-6">Processed Date</th>
                  <th className="py-3 px-6">Reference / Gateway</th>
                  <th className="py-3 px-6 text-right">Amount Paid</th>
                  <th className="py-3 px-6 text-center rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50">
                    <td className="py-4 px-6 font-mono font-bold text-zinc-950">
                      {p.paymentNumber}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-medium text-indigo-600">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700">
                        {getMethodIcon(p.paymentMethod)}
                        <span>{p.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-zinc-600">
                      {new Date(p.paymentDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-4 px-6 text-xs text-zinc-500 font-mono">
                      {p.referenceNote || 'Direct bank settlement'}
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-zinc-950 text-sm">
                      {formatINR(p.amount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

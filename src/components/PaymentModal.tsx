'use client';

import React, { useState, useEffect } from 'react';
import { MemberSummary, Payment } from '@/lib/types';
import { MONTH_NAMES, getCurrentYearMonth, formatCurrency } from '@/lib/utils';
import { X, CheckCircle, IndianRupee, Calendar, User, CreditCard, FileText } from 'lucide-react';

interface PaymentModalProps {
  members: MemberSummary[];
  preSelectedMemberId?: string;
  onClose: () => void;
  onSuccess: (newPayment: Payment) => void;
}

export default function PaymentModal({
  members,
  preSelectedMemberId,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const { year: curYear, month: curMonth } = getCurrentYearMonth();
  const todayStr = new Date().toISOString().split('T')[0];

  const [memberId, setMemberId] = useState(preSelectedMemberId || (members[0]?.id || ''));
  const [forMonth, setForMonth] = useState<number>(curMonth);
  const [forYear, setForYear] = useState<number>(curYear);
  const [amount, setAmount] = useState<string>('50');
  const [paymentDate, setPaymentDate] = useState<string>(todayStr);
  const [paymentMode, setPaymentMode] = useState<string>('Cash');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update default amount when member, month, or year is selected
  useEffect(() => {
    const selected = members.find((m) => m.id === memberId);
    if (selected) {
      const isFutureOrNext = forYear > curYear || (forYear === curYear && forMonth > curMonth);
      if (isFutureOrNext && selected.nextMonthFee) {
        setAmount(String(selected.nextMonthFee));
      } else {
        setAmount(String(selected.currentMonthFee || selected.monthlyFee || 50));
      }
    }
  }, [memberId, forMonth, forYear, members, curYear, curMonth]);


  const selectedMember = members.find((m) => m.id === memberId);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amount || Number(amount) <= 0) {
      setError('Please select a member and enter a valid payment amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          amount: Number(amount),
          paymentDate,
          forMonth,
          forYear,
          paymentMode,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      onSuccess(data.payment);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-emerald-300" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold">വരിസംഖ്യ സ്വീകരിക്കുക</h2>
              <p className="text-xs text-emerald-200">Record Member Monthly Payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Member Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center">
              <User className="w-4 h-4 mr-1 text-emerald-700" />
              അംഗത്തെ തിരഞ്ഞെടുക്കുക (Select Member) *
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden font-medium text-gray-900 bg-white"
              required
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.memberCode} - {m.name} ({m.phone || 'No phone'}) - {formatCurrency(m.monthlyFee)}/mo
                </option>
              ))}
            </select>
            {selectedMember && (
              <div className="mt-1.5 flex justify-between text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <span>മാസ വരിസംഖ്യ: <strong>{formatCurrency(selectedMember.monthlyFee)}</strong></span>
                <span>നിലവിലെ ബാക്കി: <strong className={selectedMember.pendingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                  {formatCurrency(selectedMember.pendingBalance)}
                </strong></span>
              </div>
            )}
          </div>

          {/* Month & Year Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-emerald-700" />
                ഏത് മാസം (For Month) *
              </label>
              <select
                value={forMonth}
                onChange={(e) => setForMonth(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden font-medium text-gray-900"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name} ({idx + 1})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                വർഷം (Year) *
              </label>
              <select
                value={forYear}
                onChange={(e) => setForYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden font-medium text-gray-900"
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount and Payment Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center">
                <IndianRupee className="w-4 h-4 mr-1 text-emerald-700" />
                തുക (Amount in ₹) *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden font-bold text-lg text-emerald-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                തീയതി (Payment Date) *
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden font-medium text-gray-900"
                required
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center">
              <CreditCard className="w-4 h-4 mr-1 text-emerald-700" />
              പേയ്മെന്റ് രീതി (Payment Mode)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Cash', 'GPay / UPI', 'Bank Transfer'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition text-center ${
                    paymentMode === mode
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center">
              <FileText className="w-4 h-4 mr-1 text-emerald-700" />
              കുറിപ്പ് / Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Remarks or payment notes (optional)"
              className="w-full px-3.5 py-2 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden text-sm"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-md disabled:opacity-50 text-base min-h-[44px]"
            >
              {isSubmitting ? 'രേഖപ്പെടുത്തുന്നു...' : 'പണം രേഖപ്പെടുത്തുക (Record Payment)'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto order-2 sm:order-1 px-4 py-2.5 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

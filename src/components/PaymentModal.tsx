'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MemberSummary, Payment } from '@/lib/types';
import {
  MONTH_NAMES,
  getCurrentYearMonth,
  formatCurrency,
  calculateAdvanceDistribution,
  findFirstUnpaidMonth,
  getRequiredFeeForMonth,
  AdvanceMonthItem,
} from '@/lib/utils';
import {
  X,
  CheckCircle,
  IndianRupee,
  Calendar,
  User,
  CreditCard,
  FileText,
  FastForward,
  Layers,
  AlertTriangle,
  ArrowRight,
  Info,
  Check,
  Loader2,
} from 'lucide-react';

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

  const [existingPaidMap, setExistingPaidMap] = useState<Record<string, number>>({});
  const [feeSchedule, setFeeSchedule] = useState<{ amount: number; effectiveFrom: string }[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  const selectedMember = members.find((m) => m.id === memberId);
  const memberFee = selectedMember?.monthlyFee || 50;

  // Fetch fee schedule once
  useEffect(() => {
    fetch('/api/settings/fee')
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.feeSchedule) {
          setFeeSchedule(data.settings.feeSchedule);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch member existing payments whenever memberId changes and auto-select earliest unpaid month
  useEffect(() => {
    if (!memberId) return;
    setIsLoadingPayments(true);
    fetch(`/api/payments?memberId=${memberId}`)
      .then((res) => res.json())
      .then((data) => {
        const map: Record<string, number> = {};
        if (Array.isArray(data?.payments)) {
          for (const p of data.payments) {
            const k = `${p.forYear}-${p.forMonth < 10 ? '0' + p.forMonth : p.forMonth}`;
            map[k] = (map[k] || 0) + p.amount;
          }
        }
        setExistingPaidMap(map);

        const currentMem = members.find((m) => m.id === memberId);
        let startY = curYear;
        let startM = curMonth;
        if (currentMem?.joiningDate) {
          const [jY, jM] = currentMem.joiningDate.split('-').map(Number);
          if (!isNaN(jY) && !isNaN(jM) && jM >= 1 && jM <= 12) {
            startY = jY;
            startM = jM;
          }
        }
        const unpaid = findFirstUnpaidMonth(
          startY,
          startM,
          currentMem?.monthlyFee || 50,
          map,
          feeSchedule
        );
        setForYear(unpaid.year);
        setForMonth(unpaid.month);
      })
      .catch(() => {})
      .finally(() => {
        setIsLoadingPayments(false);
      });
  }, [memberId]);

  // Selected month calculations
  const selectedKey = `${forYear}-${forMonth < 10 ? '0' + forMonth : forMonth}`;
  const requiredFeeForSelected = getRequiredFeeForMonth(memberFee, forYear, forMonth, feeSchedule);
  const alreadyPaidForSelected = existingPaidMap[selectedKey] || 0;
  const isFullyPaid = alreadyPaidForSelected >= requiredFeeForSelected;
  const isPartiallyPaid = alreadyPaidForSelected > 0 && alreadyPaidForSelected < requiredFeeForSelected;
  const remainingDeficit = Math.max(0, requiredFeeForSelected - alreadyPaidForSelected);

  // Find earliest unpaid month to offer a quick switch
  const firstUnpaid = useMemo(() => {
    let startY = curYear;
    let startM = curMonth;
    if (selectedMember?.joiningDate) {
      const [jY, jM] = selectedMember.joiningDate.split('-').map(Number);
      if (!isNaN(jY) && !isNaN(jM) && jM >= 1 && jM <= 12) {
        startY = jY;
        startM = jM;
      }
    }
    return findFirstUnpaidMonth(
      startY,
      startM,
      memberFee,
      existingPaidMap,
      feeSchedule
    );
  }, [selectedMember, memberFee, existingPaidMap, feeSchedule, curYear, curMonth]);

  const isSelectionDifferentFromUnpaid =
    forYear !== firstUnpaid.year || forMonth !== firstUnpaid.month;

  // Auto-set default amount when target month, year, or member changes
  const lastTargetRef = useRef<string>('');
  useEffect(() => {
    const targetKey = `${memberId}_${forYear}_${forMonth}`;
    if (lastTargetRef.current !== targetKey && selectedMember) {
      lastTargetRef.current = targetKey;
      if (isPartiallyPaid && remainingDeficit > 0) {
        setAmount(String(remainingDeficit));
      } else {
        setAmount(String(requiredFeeForSelected));
      }
    }
  }, [memberId, forYear, forMonth, selectedMember, isPartiallyPaid, remainingDeficit, requiredFeeForSelected]);

  const numAmount = Math.round(Number(amount) || 0);

  // Dynamic advance distribution plan across upcoming months
  const advancePlan: AdvanceMonthItem[] = useMemo(() => {
    if (numAmount <= 0) return [];
    return calculateAdvanceDistribution(
      numAmount,
      forMonth,
      forYear,
      memberFee,
      feeSchedule,
      existingPaidMap
    );
  }, [numAmount, forMonth, forYear, memberFee, feeSchedule, existingPaidMap]);

  // If amount covers multiple months, or if selected month is already paid, or exceeds deficit:
  // Advance payment is mandatory and automatically active — cannot be unchecked.
  const canBeAdvance = advancePlan.length > 1 || (isFullyPaid && advancePlan.length > 0) || (numAmount > remainingDeficit && remainingDeficit > 0);
  const shouldDistributeAdvance = canBeAdvance && advancePlan.length > 0;

  // Determine if submission should be blocked
  const isBlockedDuplicate = !shouldDistributeAdvance && isFullyPaid;
  const isBlockedOverpay = !shouldDistributeAdvance && numAmount > remainingDeficit;
  const isSubmitDisabled =
    isSubmitting ||
    isLoadingPayments ||
    numAmount <= 0 ||
    isBlockedDuplicate ||
    isBlockedOverpay ||
    (shouldDistributeAdvance && advancePlan.length === 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amount || Number(amount) <= 0) {
      setError('Please select a member and enter a valid payment amount');
      return;
    }

    if (isBlockedDuplicate) {
      setError(
        `${selectedMember?.name || 'This member'} has already fully paid (₹${alreadyPaidForSelected}) for ${MONTH_NAMES[forMonth - 1]} ${forYear}. Duplicate payments are not allowed.`
      );
      return;
    }

    if (isBlockedOverpay) {
      setError(
        `Only ₹${remainingDeficit} remains due for ${MONTH_NAMES[forMonth - 1]} ${forYear}. Overpaying a single month is not allowed.`
      );
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
          isAdvance: shouldDistributeAdvance,
          distribution: shouldDistributeAdvance ? advancePlan : undefined,
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
              <h2 className="text-lg sm:text-xl font-bold">Record Monthly Payment</h2>
              <p className="text-xs text-emerald-200">Collect member subscription</p>
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-bold text-gray-800 flex items-center">
                <User className="w-4 h-4 mr-1 text-emerald-700" />
                Select Member *
              </label>
              {isLoadingPayments && (
                <span className="flex items-center space-x-1 text-xs text-emerald-700">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Checking records...</span>
                </span>
              )}
            </div>
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
                <span>
                  Monthly Fee: <strong>{formatCurrency(selectedMember.monthlyFee)}</strong>
                </span>
                <span>
                  Current Due:{' '}
                  <strong className={selectedMember.pendingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                    {formatCurrency(selectedMember.pendingBalance)}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Start Month & Year Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-emerald-700" />
                Start Month *
              </label>
              <select
                value={forMonth}
                onChange={(e) => setForMonth(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden font-medium text-gray-900"
              >
                {MONTH_NAMES.map((name, idx) => {
                  const m = idx + 1;
                  const mKey = `${forYear}-${m < 10 ? '0' + m : m}`;
                  const paid = existingPaidMap[mKey] || 0;
                  const req = getRequiredFeeForMonth(memberFee, forYear, m, feeSchedule);
                  const isPaid = paid >= req;
                  const isPart = paid > 0 && paid < req;

                  let badge = '';
                  if (isPaid) badge = ` ✓ Paid (₹${paid})`;
                  else if (isPart) badge = ` (Paid ₹${paid}/₹${req})`;

                  return (
                    <option key={m} value={m}>
                      {name} ({m}){badge}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Year *
              </label>
              <select
                value={forYear}
                onChange={(e) => setForYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden font-medium text-gray-900"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Warning Banner: Selected Month is Already Paid */}
          {isFullyPaid && (
            <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start space-x-3 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-amber-950">
                    This month is already fully paid!
                  </h4>
                  <span className="text-xs font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    Paid: ₹{alreadyPaidForSelected}
                  </span>
                </div>
                <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                  {selectedMember?.name || 'Member'} has already paid (₹{alreadyPaidForSelected}) for {MONTH_NAMES[forMonth - 1]} {forYear}. Duplicate payments for the same month are not allowed.
                </p>
                {isSelectionDifferentFromUnpaid && (
                  <button
                    type="button"
                    onClick={() => {
                      setForYear(firstUnpaid.year);
                      setForMonth(firstUnpaid.month);
                    }}
                    className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    <span>Switch to unpaid month ({MONTH_NAMES[firstUnpaid.month - 1]} {firstUnpaid.year})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Info Banner: Selected Month is Partially Paid */}
          {isPartiallyPaid && (
            <div className="p-3.5 bg-blue-50 border-2 border-blue-300 rounded-2xl flex items-start space-x-3 shadow-2xs">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-blue-950">
                    Partially Paid Month
                  </h4>
                  <span className="text-xs font-black bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                    Paid: ₹{alreadyPaidForSelected} / ₹{requiredFeeForSelected}
                  </span>
                </div>
                <p className="text-xs text-blue-900/90 mt-1 leading-relaxed">
                  Received ₹{alreadyPaidForSelected} for this month so far. Remaining balance: <strong>₹{remainingDeficit}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Amount and Payment Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center">
                <IndianRupee className="w-4 h-4 mr-1 text-emerald-700" />
                Amount (₹) *
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
                Payment Date *
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

          {/* Quick Amount Presets */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-1.5">
              <span>Quick Presets:</span>
              <span className="text-emerald-700 font-bold">₹{memberFee}/month</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '1 Month', multiplier: 1 },
                { label: '3 Months', multiplier: 3 },
                { label: '6 Months', multiplier: 6 },
                { label: '10 Months', multiplier: 10 },
                { label: '1 Year', multiplier: 12 },
              ].map((p) => {
                const presetVal = memberFee * p.multiplier;
                const isSelected = numAmount === presetVal;
                return (
                  <button
                    key={p.multiplier}
                    type="button"
                    onClick={() => {
                      setAmount(String(presetVal));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {p.label} (₹{presetVal})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pay In Advance Info & Breakdown Card - Permanently active when amount covers multiple months */}
          {canBeAdvance && (
            <div className="p-3.5 sm:p-4 rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-50 shadow-xs">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-md bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 font-black text-emerald-950 text-sm">
                      <FastForward className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Pay in Advance (Active)</span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                      Auto-Allocated
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
                    Advance payment of <strong>₹{numAmount}</strong> is automatically distributed across{' '}
                    <strong>{advancePlan.length} months</strong>. Already fully paid months are skipped automatically.
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-emerald-300/60 space-y-2">
                {isFullyPaid && (
                  <div className="text-xs font-semibold text-emerald-900 bg-emerald-100/90 px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      {MONTH_NAMES[forMonth - 1]} {forYear} is already paid and was skipped. Amount allocated starting from {advancePlan[0]?.label}.
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                  <span className="flex items-center space-x-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Covered Period ({advancePlan.length} Months):</span>
                  </span>
                  <span className="bg-emerald-700 text-white px-2.5 py-0.5 rounded-full text-xs font-extrabold shadow-2xs">
                    {advancePlan[0]?.label} – {advancePlan[advancePlan.length - 1]?.label}
                  </span>
                </div>

                {/* Month Chips preview */}
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-white/90 rounded-xl border border-emerald-300/80">
                  {advancePlan.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300/70"
                    >
                      {item.label}: ₹{item.amount}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center">
              <CreditCard className="w-4 h-4 mr-1 text-emerald-700" />
              Payment Mode
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
              Notes / Remarks (Optional)
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
              disabled={isSubmitDisabled}
              className="w-full sm:w-auto order-1 sm:order-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-base min-h-[44px]"
            >
              {isSubmitting
                ? 'Recording...'
                : isBlockedDuplicate
                ? 'Already Paid for this Month'
                : isBlockedOverpay
                ? `Max Payable ₹${remainingDeficit}`
                : shouldDistributeAdvance && advancePlan.length > 1
                ? `Record Advance Payment (${advancePlan.length} Months)`
                : 'Record Payment'}
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

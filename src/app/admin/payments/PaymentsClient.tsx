'use client';

import React, { useState, useEffect } from 'react';
import { Payment, MemberSummary } from '@/lib/types';
import { formatCurrency, formatDate, MONTH_NAMES_SHORT, MONTH_NAMES } from '@/lib/utils';
import PaymentModal from '@/components/PaymentModal';
import ReceiptModal from '@/components/ReceiptModal';
import StatusBadge from '@/components/StatusBadge';
import FixedFeeModal from '@/components/FixedFeeModal';
import AdminMobileBottomNav from '@/components/AdminMobileBottomNav';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  PlusCircle,
  Table as TableIcon,
  List,
  Printer,
  Calendar,
  Search,
  Trash2,
  Check,
  X as XIcon,
  Clock,
  Download,
  IndianRupee,
} from 'lucide-react';

interface PaymentsClientProps {
  initialPayments: Payment[];
  members: MemberSummary[];
  currentPeriod: { year: number; month: number; key: string };
}

export default function PaymentsClient({
  initialPayments,
  members,
  currentPeriod,
}: PaymentsClientProps) {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [membersList, setMembersList] = useState<MemberSummary[]>(members);
  const [activeTab, setActiveTab] = useState<'matrix' | 'history'>('matrix');
  const [selectedYear, setSelectedYear] = useState<number>(currentPeriod.year);
  const [searchMember, setSearchMember] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFixedFeeModal, setShowFixedFeeModal] = useState(false);
  const [preSelectedMemberId, setPreSelectedMemberId] = useState<string | undefined>(undefined);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  useEffect(() => {
    setPayments(initialPayments);
    setMembersList(members);
  }, [initialPayments, members]);

  const reloadPaymentsAndMembers = async () => {
    try {
      const [resPay, resMem] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/members'),
      ]);
      if (resPay.ok) {
        const dPay = await resPay.json();
        if (dPay.payments) setPayments(dPay.payments);
      }
      if (resMem.ok) {
        const dMem = await resMem.json();
        if (dMem.members) setMembersList(dMem.members);
      }
    } catch (e) {
      console.error('Failed to reload payments data:', e);
    }
    router.refresh();
  };

  // Filter payments for the selected year
  const yearPayments = payments.filter((p) => p.forYear === selectedYear);

  // Build a lookup map: memberId -> month (1-12) -> total paid for that month
  const paymentMatrix: Record<string, Record<number, number>> = {};
  yearPayments.forEach((p) => {
    if (!paymentMatrix[p.memberId]) {
      paymentMatrix[p.memberId] = {};
    }
    paymentMatrix[p.memberId][p.forMonth] =
      (paymentMatrix[p.memberId][p.forMonth] || 0) + p.amount;
  });

  const filteredMembers = membersList.filter((m) =>
    m.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    m.memberCode.toLowerCase().includes(searchMember.toLowerCase())
  );

  const handleDeletePayment = async (p: Payment) => {
    const isAdv = Boolean(p.isAdvance && p.advanceTotalMonths);
    const promptMsg = isAdv
      ? `This payment is part of a ₹${p.advanceTotalAmount} advance payment (${p.advanceTotalMonths} months: ${p.advancePeriodLabel}).\n\nDeleting it will cancel the entire advance payment across all covered months. Do you want to proceed?`
      : `Are you sure you want to delete payment ${p.receiptNumber}?`;

    if (!window.confirm(promptMsg)) {
      return;
    }

    try {
      const res = await fetch(`/api/payments/${p.id}`, { method: 'DELETE' });
      if (res.ok) {
        if (p.advanceBatchId) {
          setPayments((prev) => prev.filter((item) => item.advanceBatchId !== p.advanceBatchId));
        } else {
          setPayments((prev) => prev.filter((item) => item.id !== p.id));
        }
        await reloadPaymentsAndMembers();
      } else {
        alert('Failed to delete payment');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting payment');
    }
  };

  const openPaymentForCell = (memberId: string) => {
    setPreSelectedMemberId(memberId);
    setShowPaymentModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex mb-1.5">
            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
            <span>Subscription Collections Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Payments & Monthly Grid
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Track who paid and who has pending dues at a glance.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={() => setShowFixedFeeModal(true)}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-600 font-bold transition text-xs sm:text-sm"
          >
            <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
            <span>Monthly Fee ({formatCurrency(members[0]?.currentMonthFee || 50)})</span>
          </button>

          <button
            onClick={() => {
              setPreSelectedMemberId(undefined);
              setShowPaymentModal(true);
            }}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Record Payment</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Tabs, Year Selector, Search */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* View Toggle Tabs */}
        <div className="grid grid-cols-2 sm:flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'matrix'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Payment Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
              activeTab === 'history'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Receipts Log</span>
          </button>
        </div>

        {/* Year & Search Filters */}
        <div className="flex items-center gap-2">
          {/* Year selector */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-xl border border-gray-300 focus:border-emerald-600 focus:outline-hidden font-bold text-gray-900 text-xs sm:text-sm bg-white"
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Member Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              placeholder="Search member..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-300 focus:border-emerald-600 focus:outline-hidden text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* VIEW 1: MONTHLY MATRIX GRID */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-3xl shadow-md border-2 border-gray-200 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                {selectedYear} Annual Payment Grid (Who Paid & Who Did Not)
              </h2>
              <p className="text-xs text-gray-500">
                Green: Paid | Red: Pending Due
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 text-xs font-bold">
              <span className="flex items-center text-emerald-800">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block mr-1"></span>
                Paid
              </span>
              <span className="flex items-center text-rose-800">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-400 inline-block mr-1"></span>
                Pending Due
              </span>
              <span className="flex items-center text-gray-400">
                <span className="w-3.5 h-3.5 rounded-full bg-gray-200 inline-block mr-1"></span>
                Before Joining
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-3 text-left rounded-l-xl min-w-[180px]">Member</th>
                  <th className="py-3 px-2 min-w-[70px]">Fee</th>
                  {MONTH_NAMES_SHORT.map((m, idx) => (
                    <th key={m} className="py-3 px-1 min-w-[55px]">
                      {m}
                    </th>
                  ))}
                  <th className="py-3 px-3 rounded-r-xl min-w-[90px] text-right">Total Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
                {filteredMembers.map((m) => {
                  const joinYear = Number(m.joiningDate.slice(0, 4));
                  const joinMonth = Number(m.joiningDate.slice(5, 7)) || 1;

                  return (
                    <tr key={m.id} className="hover:bg-emerald-50/30 transition">
                      {/* Member Info */}
                      <td className="py-3 px-3 text-left">
                        <div className="font-bold text-gray-900 text-sm">{m.name}</div>
                        <div className="text-[11px] font-mono text-emerald-800 font-semibold">
                          {m.memberCode}
                        </div>
                      </td>

                      {/* Monthly Fee */}
                      <td className="py-3 px-2 font-bold text-gray-700">
                        {formatCurrency(m.monthlyFee)}
                      </td>

                      {/* 12 Months Cells */}
                      {MONTH_NAMES_SHORT.map((_, idx) => {
                        const monthNum = idx + 1;
                        const paidAmount = paymentMatrix[m.id]?.[monthNum] || 0;
                        const isJoined =
                          selectedYear > joinYear ||
                          (selectedYear === joinYear && monthNum >= joinMonth);

                        const isFuture =
                          selectedYear > currentPeriod.year ||
                          (selectedYear === currentPeriod.year && monthNum > currentPeriod.month);

                        if (!isJoined) {
                          return (
                            <td key={monthNum} className="py-3 px-1 text-gray-300 font-bold">
                              -
                            </td>
                          );
                        }

                        const monthTargetFee =
                          isFuture && m.nextMonthFee ? m.nextMonthFee : (m.currentMonthFee || m.monthlyFee);

                        if (paidAmount >= monthTargetFee) {
                          return (
                            <td key={monthNum} className="py-2 px-1">
                              <span
                                onClick={() => openPaymentForCell(m.id)}
                                title={`Paid: ₹${paidAmount} for ${MONTH_NAMES[idx]}`}
                                className="inline-flex items-center justify-center w-full py-1.5 px-1 bg-emerald-100 text-emerald-900 font-bold rounded-lg border border-emerald-300 cursor-pointer hover:bg-emerald-200 transition"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-700 inline" />
                              </span>
                            </td>
                          );
                        }

                        if (paidAmount > 0) {
                          return (
                            <td key={monthNum} className="py-2 px-1">
                              <span
                                onClick={() => openPaymentForCell(m.id)}
                                title={`Partial: ₹${paidAmount} of ₹${monthTargetFee}`}
                                className="inline-flex items-center justify-center w-full py-1.5 px-0.5 bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-300 cursor-pointer hover:bg-amber-200 transition text-[10px]"
                              >
                                ₹{paidAmount}
                              </span>
                            </td>
                          );
                        }


                        // Not paid
                        return (
                          <td key={monthNum} className="py-2 px-1">
                            <span
                              onClick={() => openPaymentForCell(m.id)}
                              title={isFuture ? 'Future Month' : 'Pending - Click to record payment'}
                              className={`inline-flex items-center justify-center w-full py-1.5 px-1 font-bold rounded-lg border cursor-pointer transition ${
                                isFuture
                                  ? 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                  : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                              }`}
                            >
                              {isFuture ? '·' : <XIcon className="w-3.5 h-3.5 text-rose-600 inline" />}
                            </span>
                          </td>
                        );
                      })}

                      {/* Total Pending Balance */}
                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-black text-sm ${
                            m.pendingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {formatCurrency(m.pendingBalance)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: RECEIPTS & HISTORY TABLE */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl shadow-md border-2 border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Payment Receipts Log
              </h2>
              <p className="text-xs text-gray-500">
                Complete records of all subscription payments
              </p>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {yearPayments.length} Payments ({selectedYear})
            </span>
          </div>

          {/* Mobile View: Cards */}
          <div className="sm:hidden space-y-2.5">
            {yearPayments.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">
                No payments recorded for {selectedYear}.
              </p>
            ) : (
              yearPayments.map((p) => {
                const mName = MONTH_NAMES[p.forMonth - 1] || `Month ${p.forMonth}`;
                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{p.memberName}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 flex-wrap">
                          <span>{mName} {p.forYear} • {formatDate(p.paymentDate)}</span>
                          {p.isAdvance && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                              Advance {p.advanceMonthIndex}/{p.advanceTotalMonths}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-emerald-800 font-mono font-bold mt-0.5">
                          {p.receiptNumber}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-emerald-800">
                          {formatCurrency(p.amount)}
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
                          {p.paymentMode}
                        </span>
                      </div>
                    </div>

                    {p.notes && (
                      <div className="text-xs text-gray-500 italic bg-white p-2 rounded-lg border border-gray-100">
                        {p.notes}
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-2 pt-1 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="flex-1 inline-flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
                      </button>
                      <button
                        onClick={() => handleDeletePayment(p)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                        title="Delete Payment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3 rounded-l-lg">Receipt No</th>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">For Month</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {yearPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500 font-medium">
                      No payments recorded for {selectedYear}.
                    </td>
                  </tr>
                ) : (
                  yearPayments.map((p) => {
                    const mName = MONTH_NAMES[p.forMonth - 1] || `Month ${p.forMonth}`;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-emerald-900 text-xs">
                          {p.receiptNumber}
                        </td>
                        <td className="py-3 px-3 font-bold text-gray-900">
                          {p.memberName}
                        </td>
                        <td className="py-3 px-3 text-gray-600 text-xs font-medium">
                          {formatDate(p.paymentDate)}
                        </td>
                        <td className="py-3 px-3 font-semibold text-gray-900 text-xs">
                          <div>{mName} {p.forYear}</div>
                          {p.isAdvance && (
                            <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-300 mt-0.5">
                              Advance {p.advanceMonthIndex}/{p.advanceTotalMonths}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-black text-emerald-800">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 border">
                            {p.paymentMode}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-gray-500 italic">
                          {p.notes || '-'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedReceipt(p)}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print</span>
                            </button>
                            <button
                              onClick={() => handleDeletePayment(p)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                              title="Delete Payment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Bottom Thumb Navigation */}
      <AdminMobileBottomNav onQuickPayment={() => { setPreSelectedMemberId(undefined); setShowPaymentModal(true); }} />

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          members={membersList}
          preSelectedMemberId={preSelectedMemberId}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={async (newP) => {
            setShowPaymentModal(false);
            setSelectedReceipt(newP);
            await reloadPaymentsAndMembers();
          }}
        />
      )}

      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {showFixedFeeModal && (
        <FixedFeeModal
          currentFee={membersList[0]?.currentMonthFee || 50}
          upcomingFee={
            membersList[0]?.nextMonthFee && membersList[0]?.nextMonthFee !== (membersList[0]?.currentMonthFee || 50)
              ? { amount: membersList[0].nextMonthFee, effectiveFrom: `${currentPeriod.year}-${String(currentPeriod.month + 1).padStart(2, '0')}` }
              : undefined
          }
          onClose={() => setShowFixedFeeModal(false)}

          onSuccess={async () => {
            setShowFixedFeeModal(false);
            await reloadPaymentsAndMembers();
          }}
        />
      )}
    </div>
  );
}


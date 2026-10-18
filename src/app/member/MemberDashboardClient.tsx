'use client';

import React, { useState } from 'react';
import { MemberSummary, Payment, Announcement } from '@/lib/types';
import { formatCurrency, formatDate, MONTH_NAMES } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import ReceiptModal from '@/components/ReceiptModal';
import {
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Calendar,
  FileText,
  Printer,
  Megaphone,
  Pin,
  Clock,
  Building2,
  Phone,
  HelpCircle,
  CreditCard,
} from 'lucide-react';

interface MemberDashboardClientProps {
  member: MemberSummary;
  payments: Payment[];
  announcements: Announcement[];
  currentPeriod: { year: number; month: number; key: string };
}

export default function MemberDashboardClient({
  member,
  payments,
  announcements,
  currentPeriod,
}: MemberDashboardClientProps) {
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const currentMonthName = MONTH_NAMES[currentPeriod.month - 1];

  const isCurrentPaid = member.currentMonthPaid;
  const hasPending = member.pendingBalance > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold bg-emerald-950/60 text-emerald-200 px-3 py-1 rounded-full border border-emerald-700">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ - കിഴക്കേത്തല ശാഖ</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              അസ്സലാമു അലൈക്കും, {member.name}
            </h1>
            <p className="text-emerald-100 text-base sm:text-lg font-medium">
              അംഗത്വം നമ്പർ (Member Code): <span className="font-mono font-bold text-amber-300">{member.memberCode}</span>
              {member.phone && <span className="ml-3">| ഫോൺ: {member.phone}</span>}
            </p>
          </div>

          {/* Quick status pill in banner */}
          <div className="flex items-center space-x-3 bg-emerald-950/80 p-4 rounded-2xl border border-emerald-600/60">
            <div className="text-right">
              <span className="text-xs text-emerald-300 block uppercase tracking-wider font-semibold">
                {currentMonthName} {currentPeriod.year} സ്റ്റാറ്റസ്
              </span>
              <span className="text-lg font-black text-white">
                {isCurrentPaid ? 'അടച്ചിട്ടുണ്ട് (Paid)' : 'അടയ്ക്കാനുണ്ട് (Pending)'}
              </span>
            </div>
            {isCurrentPaid ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            ) : (
              <AlertCircle className="w-10 h-10 text-rose-400" />
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Fee Notice Banner (if admin changed fee for next month) */}
      {member.nextMonthFee && member.nextMonthFee !== (member.currentMonthFee || member.monthlyFee) && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm flex items-start space-x-3 text-amber-950">
          <Megaphone className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-base text-amber-900">
              മദ്റസ കമ്മിറ്റി അറിയിപ്പ്: അടുത്ത മാസം മുതൽ പുതിയ നിശ്ചിത വരിസംഖ്യ
            </h3>
            <p className="text-sm text-amber-800 leading-relaxed font-medium">
              അടുത്ത മാസം മുതൽ പ്രതിമാസ നിശ്ചിത വരിസംഖ്യ <strong>{formatCurrency(member.nextMonthFee)}</strong> ആയിരിക്കും. (ഈ മാസത്തെ വരിസംഖ്യ: {formatCurrency(member.currentMonthFee || member.monthlyFee)}).
            </p>
          </div>
        </div>
      )}

      {/* Main Status Hero Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border-4 shadow-xl transition ${
          isCurrentPaid && !hasPending
            ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
            : hasPending
            ? 'bg-rose-50 border-rose-400 text-rose-950'
            : 'bg-amber-50 border-amber-400 text-amber-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {isCurrentPaid ? (
                <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
              )}
              <h2 className="text-2xl sm:text-3xl font-black">
                {isCurrentPaid
                  ? `ഈ മാസത്തെ (${currentMonthName}) വരിസംഖ്യ അടച്ചിട്ടുണ്ട്`
                  : `ഈ മാസത്തെ (${currentMonthName}) വരിസംഖ്യ അടയ്ക്കാനുണ്ട്`}
              </h2>
            </div>

            <p className="text-base sm:text-lg leading-relaxed font-medium">
              {isCurrentPaid && !hasPending && (
                <span className="text-emerald-800 font-bold">
                  അൽഹംദുലില്ലാഹ്! താങ്കൾക്ക് നിലവിൽ മദ്റസയിൽ വരിസംഖ്യ കുടിശ്ശികയൊന്നും ശേഷിക്കുന്നില്ല.
                </span>
              )}
              {hasPending && (
                <span className="text-rose-900 font-bold">
                  ആകെ അടയ്ക്കാനുള്ള ബാക്കി തുക: {formatCurrency(member.pendingBalance)}{' '}
                  {member.unpaidMonthsCount > 0 && `(ഏകദേശം ${member.unpaidMonthsCount} മാസത്തെ വരിസംഖ്യ)`}.
                </span>
              )}
            </p>
          </div>

          <div className="bg-white px-6 py-4 rounded-2xl shadow-md border border-gray-200 text-center min-w-[200px]">
            <span className="text-xs text-gray-500 block font-semibold uppercase tracking-wider">
              നിലവിലെ ബാക്കി (Balance Due)
            </span>
            <span
              className={`text-3xl font-black ${
                hasPending ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {formatCurrency(member.pendingBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Monthly Subscription */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-200">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-bold uppercase tracking-wider">പ്രതിമാസ നിശ്ചിത തുക</span>
            <Calendar className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-gray-900">
            {formatCurrency(member.currentMonthFee || member.monthlyFee)}
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            എല്ലാ അംഗങ്ങൾക്കും ഒരേ നിശ്ചിത തുക (Fixed standard fee)
          </p>
          {member.nextMonthFee && member.nextMonthFee !== (member.currentMonthFee || member.monthlyFee) && (
            <div className="mt-3 text-xs font-bold text-amber-800 bg-amber-100/80 p-2 rounded-xl border border-amber-300">
              അടുത്ത മാസം മുതൽ: {formatCurrency(member.nextMonthFee)}
            </div>
          )}
        </div>


        {/* Total Paid Till Date */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-200">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-bold uppercase tracking-wider">ആകെ അടച്ച തുക</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="text-3xl font-black text-emerald-800">
            {formatCurrency(member.totalPaid)}
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            തുടങ്ങിയത് മുതൽ ഇതുവരെ അടച്ച മൊത്തം തുക (Total contributed)
          </p>
        </div>

        {/* Last Payment Date */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-200">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-bold uppercase tracking-wider">അവസാനം നൽകിയ തീയതി</span>
            <Clock className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-gray-900">
            {formatDate(member.lastPaymentDate)}
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            ഏറ്റവും ഒടുവിൽ രേഖപ്പെടുത്തിയ പേയ്മെന്റ് (Latest payment)
          </p>
        </div>
      </div>

      {/* Announcements Section */}
      <div id="announcements" className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-gray-200 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">മദ്റസ അറിയിപ്പുകൾ</h2>
              <p className="text-xs text-gray-500">Madrasa Announcements & Notices</p>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {announcements.length} അറിയിപ്പുകൾ
          </span>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            നിലവിൽ പുതിയ അറിയിപ്പുകൾ ഒന്നുമില്ല.
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-5 rounded-2xl border-2 transition ${
                  ann.isPinned
                    ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center space-x-2">
                    {ann.isPinned && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-200 text-amber-900">
                        <Pin className="w-3 h-3 mr-1" />
                        പ്രധാനം (Pinned)
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900">{ann.title}</h3>
                  </div>
                  <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">
                    {formatDate(ann.date)}
                  </span>
                </div>
                <p className="text-base text-gray-800 leading-relaxed font-normal">
                  {ann.content}
                </p>
                <div className="mt-3 text-xs text-gray-500 font-semibold">
                  അറിയിച്ചത്: {ann.author}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History & Receipts */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-gray-200 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">പേയ്മെന്റ് ചരിത്രവും രസീതുകളും</h2>
              <p className="text-xs text-gray-500">Payment History & Printable Receipts</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {payments.length} രസീതുകൾ
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            ഇതുവരെ പേയ്മെന്റുകൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">രസീത് നമ്പർ</th>
                  <th className="py-3 px-4">തീയതി</th>
                  <th className="py-3 px-4">വരിസംഖ്യ മാസം</th>
                  <th className="py-3 px-4">തുക</th>
                  <th className="py-3 px-4">രീതി</th>
                  <th className="py-3 px-4 rounded-r-xl text-right">രസീത്</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-base">
                {payments.map((p) => {
                  const mName = MONTH_NAMES[p.forMonth - 1] || `Month ${p.forMonth}`;
                  return (
                    <tr key={p.id} className="hover:bg-emerald-50/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-900 text-sm">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 text-gray-800 font-medium">
                        {formatDate(p.paymentDate)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        {mName} {p.forYear}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-800">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 border border-gray-200">
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition"
                        >
                          <Printer className="w-4 h-4" />
                          <span>രസീത് കാണുക / പ്രിന്റ്</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}

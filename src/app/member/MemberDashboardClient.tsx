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
  Share2,
  MessageCircle,
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

  const handleShareWhatsApp = (p: Payment) => {
    const mName = MONTH_NAMES[p.forMonth - 1] || `Month ${p.forMonth}`;
    const text = `*നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ - കിഴക്കേത്തല ശാഖ*\n*NASRUTHUL ISLAM MADRASA (KIYAKETHALA)*\n-------------------------------\n*രസീത് നമ്പർ / Receipt No:* ${p.receiptNumber}\n*അംഗത്തിന്റെ പേര് / Member:* ${member.name} (${member.memberCode})\n*തുക / Amount Paid:* ${formatCurrency(p.amount)}\n*മാസം / Month:* ${mName} ${p.forYear}\n*തീയതി / Date:* ${formatDate(p.paymentDate)}\n*പേയ്മെന്റ് രീതി / Mode:* ${p.paymentMode}\n-------------------------------\nJazakallahu Khairan for your sincere contribution!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleContactOfficeWhatsApp = () => {
    const text = `അസ്സലാമു അലൈക്കും. ഞാൻ ${member.name} (Member Code: ${member.memberCode}). എന്റെ വരിസംഖ്യ സംബന്ധിച്ച വിവരങ്ങൾക്ക് ബന്ധപ്പെടുന്നു.`;
    const url = `https://api.whatsapp.com/send?phone=919745781373&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-8 pb-24 lg:pb-8">
      {/* Welcome Banner */}
      <div id="status" className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-lg border border-emerald-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 text-xs font-semibold bg-emerald-950/70 text-emerald-200 px-3 py-1 rounded-full border border-emerald-600/60">
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ - കിഴക്കേത്തല</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
              അസ്സലാമു അലൈക്കും, {member.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm font-medium text-emerald-100">
              <span className="bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-700/60">
                അംഗത്വം നമ്പർ: <strong className="text-amber-300 font-mono">{member.memberCode}</strong>
              </span>
              {member.phone && (
                <span className="bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-700/60 flex items-center">
                  <Phone className="w-3 h-3 mr-1 text-emerald-400" />
                  {member.phone}
                </span>
              )}
            </div>
          </div>

          {/* Quick status pill in banner */}
          <div className="flex items-center justify-between sm:justify-start space-x-3 bg-emerald-950/90 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-600/70">
            <div>
              <span className="text-[11px] text-emerald-300 block uppercase tracking-wider font-semibold">
                {currentMonthName} {currentPeriod.year} സ്റ്റാറ്റസ്
              </span>
              <span className="text-base sm:text-lg font-black text-white">
                {isCurrentPaid ? 'അടച്ചിട്ടുണ്ട് (Paid)' : 'അടയ്ക്കാനുണ്ട് (Pending)'}
              </span>
            </div>
            {isCurrentPaid ? (
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Fee Notice Banner (if admin changed fee for next month) */}
      {member.nextMonthFee && member.nextMonthFee !== (member.currentMonthFee || member.monthlyFee) && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-xs flex items-start space-x-3 text-amber-950">
          <Megaphone className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm sm:text-base text-amber-900">
              മദ്റസ കമ്മിറ്റി അറിയിപ്പ്: അടുത്ത മാസം മുതൽ പുതിയ നിശ്ചിത വരിസംഖ്യ
            </h3>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
              അടുത്ത മാസം മുതൽ പ്രതിമാസ നിശ്ചിത വരിസംഖ്യ <strong>{formatCurrency(member.nextMonthFee)}</strong> ആയിരിക്കും. (ഈ മാസത്തെ വരിസംഖ്യ: {formatCurrency(member.currentMonthFee || member.monthlyFee)}).
            </p>
          </div>
        </div>
      )}

      {/* Main Status Hero Card */}
      <div
        className={`rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 sm:border-4 shadow-md transition ${
          isCurrentPaid && !hasPending
            ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
            : hasPending
            ? 'bg-rose-50 border-rose-400 text-rose-950'
            : 'bg-amber-50 border-amber-400 text-amber-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2.5">
              {isCurrentPaid ? (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              )}
              <h2 className="text-lg sm:text-2xl font-black leading-tight">
                {isCurrentPaid
                  ? `ഈ മാസത്തെ (${currentMonthName}) വരിസംഖ്യ അടച്ചിട്ടുണ്ട്`
                  : `ഈ മാസത്തെ (${currentMonthName}) വരിസംഖ്യ അടയ്ക്കാനുണ്ട്`}
              </h2>
            </div>

            <p className="text-sm sm:text-base leading-relaxed font-medium">
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

            {/* Quick Contact Buttons on Hero Card */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleContactOfficeWhatsApp}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs min-h-[40px]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>ഓഫീസിലേക്ക് WhatsApp ചെയ്യുക</span>
              </button>
              <a
                href="tel:9745781373"
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 text-xs font-bold transition shadow-xs min-h-[40px]"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>വിളിക്കുക (9745781373)</span>
              </a>
            </div>
          </div>

          {/* Balance Due Box */}
          <div className="w-full sm:w-auto bg-white px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 text-center shrink-0">
            <span className="text-[11px] text-gray-500 block font-semibold uppercase tracking-wider">
              നിലവിലെ ബാക്കി (Balance Due)
            </span>
            <span
              className={`text-2xl sm:text-3xl font-black ${
                hasPending ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {formatCurrency(member.pendingBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Summary Cards (2x2 on Mobile, 3-col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
        {/* Monthly Subscription */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm sm:shadow-md border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 mb-1 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">പ്രതിമാസ തുക</span>
              <Calendar className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-xl sm:text-3xl font-black text-gray-900">
              {formatCurrency(member.currentMonthFee || member.monthlyFee)}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1 font-medium">
            നിശ്ചിത തുക (Fixed)
          </p>
        </div>

        {/* Total Paid Till Date */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm sm:shadow-md border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 mb-1 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">ആകെ അടച്ചത്</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-xl sm:text-3xl font-black text-emerald-800">
              {formatCurrency(member.totalPaid)}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1 font-medium">
            ആകെ നൽകിയ വരിസംഖ്യ
          </p>
        </div>

        {/* Last Payment Date */}
        <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-sm sm:shadow-md border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-500 mb-1 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">അവസാന തീയതി</span>
              <Clock className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-base sm:text-2xl font-black text-gray-900">
              {formatDate(member.lastPaymentDate)}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-1 font-medium">
            ഏറ്റവും ഒടുവിൽ രേഖപ്പെടുത്തിയത്
          </p>
        </div>
      </div>

      {/* Announcements Section */}
      <div id="announcements" className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm sm:shadow-md border border-gray-200 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-gray-900">മദ്റസ അറിയിപ്പുകൾ</h2>
              <p className="text-[11px] sm:text-xs text-gray-500">Madrasa Notices</p>
            </div>
          </div>
          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
            {announcements.length} അറിയിപ്പുകൾ
          </span>
        </div>

        {announcements.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            നിലവിൽ പുതിയ അറിയിപ്പുകൾ ഒന്നുമില്ല.
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition ${
                  ann.isPinned
                    ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ann.isPinned && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-amber-200 text-amber-900">
                        <Pin className="w-3 h-3 mr-1" />
                        പ്രധാനം (Pinned)
                      </span>
                    )}
                    <h3 className="text-sm sm:text-lg font-bold text-gray-900">{ann.title}</h3>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500 font-semibold whitespace-nowrap">
                    {formatDate(ann.date)}
                  </span>
                </div>
                <p className="text-xs sm:text-base text-gray-800 leading-relaxed font-normal whitespace-pre-wrap">
                  {ann.content}
                </p>
                <div className="mt-2 text-[10px] sm:text-xs text-gray-500 font-semibold">
                  അറിയിച്ചത്: {ann.author}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History & Receipts */}
      <div id="receipts" className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm sm:shadow-md border border-gray-200 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-gray-900">രസീതുകൾ (Receipts)</h2>
              <p className="text-[11px] sm:text-xs text-gray-500">Payment History & Printable Receipts</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {payments.length} രസീതുകൾ
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            ഇതുവരെ പേയ്മെന്റുകൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.
          </div>
        ) : (
          <>
            {/* Mobile Native Card View (sm:hidden) */}
            <div className="sm:hidden space-y-3">
              {payments.map((p) => {
                const mName = MONTH_NAMES[p.forMonth - 1] || `Month ${p.forMonth}`;
                return (
                  <div
                    key={p.id}
                    className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                        {p.receiptNumber}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-200 text-gray-800">
                        {p.paymentMode}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">
                          {mName} {p.forYear}
                        </span>
                        <span className="text-[11px] text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                          {formatDate(p.paymentDate)}
                        </span>
                      </div>
                      <div className="text-xl font-black text-emerald-800">
                        {formatCurrency(p.amount)}
                      </div>
                    </div>

                    {/* Touch Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-200/60">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(p)}
                        className="flex items-center justify-center space-x-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs min-h-[38px]"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>രസീത് കാണുക</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShareWhatsApp(p)}
                        className="flex items-center justify-center space-x-1 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-lg font-bold text-xs min-h-[38px]"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>ഷെയർ ചെയ്യുക</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-l-xl">രസീത് നമ്പർ</th>
                    <th className="py-3 px-4">തീയതി</th>
                    <th className="py-3 px-4">വരിസംഖ്യ മാസം</th>
                    <th className="py-3 px-4">തുക</th>
                    <th className="py-3 px-4">രീതി</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">രസീത്</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {payments.map((p) => {
                    const mName = MONTH_NAMES[p.forMonth - 1] || `Month ${p.forMonth}`;
                    return (
                      <tr key={p.id} className="hover:bg-emerald-50/40 transition">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-900 text-xs">
                          {p.receiptNumber}
                        </td>
                        <td className="py-3 px-4 text-gray-800 font-medium text-xs">
                          {formatDate(p.paymentDate)}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {mName} {p.forYear}
                        </td>
                        <td className="py-3 px-4 font-black text-emerald-800">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-800 border border-gray-200">
                            {p.paymentMode}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>രസീത് കാണുക</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Member Mobile Sticky Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 lg:hidden shadow-lg no-print">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between text-center">
          <a
            href="#status"
            className="flex flex-col items-center justify-center flex-1 py-1 text-emerald-800 font-bold"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">സ്റ്റാറ്റസ്</span>
          </a>
          <a
            href="#receipts"
            className="flex flex-col items-center justify-center flex-1 py-1 text-gray-600 hover:text-emerald-800 font-medium"
          >
            <FileText className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">രസീതുകൾ</span>
          </a>
          <a
            href="#announcements"
            className="flex flex-col items-center justify-center flex-1 py-1 text-gray-600 hover:text-emerald-800 font-medium"
          >
            <Megaphone className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">അറിയിപ്പ്</span>
          </a>
          <button
            type="button"
            onClick={handleContactOfficeWhatsApp}
            className="flex flex-col items-center justify-center flex-1 py-1 text-emerald-700 font-bold"
          >
            <MessageCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] mt-0.5">സഹായം</span>
          </button>
        </div>
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

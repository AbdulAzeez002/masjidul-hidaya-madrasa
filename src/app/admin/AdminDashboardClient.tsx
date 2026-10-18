'use client';

import React, { useState } from 'react';
import { DashboardStats, MemberSummary, Payment, Announcement, SessionUser } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';

import PaymentModal from '@/components/PaymentModal';
import MemberModal from '@/components/MemberModal';
import AnnouncementModal from '@/components/AnnouncementModal';
import ReceiptModal from '@/components/ReceiptModal';
import FixedFeeModal from '@/components/FixedFeeModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  CreditCard,
  PlusCircle,
  Megaphone,
  UserPlus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  Printer,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  IndianRupee,
  Settings,
} from 'lucide-react';
import { formatCurrency, formatDate, MONTH_NAMES, formatMonthYear } from '@/lib/utils';

interface AdminDashboardClientProps {
  initialStats: DashboardStats;
  members: MemberSummary[];
  currentPeriod: { year: number; month: number; key: string };
  adminUser: SessionUser;
}

export default function AdminDashboardClient({
  initialStats,
  members,
  currentPeriod,
  adminUser,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showFixedFeeModal, setShowFixedFeeModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);


  const currentMonthName = MONTH_NAMES[currentPeriod.month - 1];
  const paidPercent = stats.totalMembers > 0
    ? Math.round((stats.membersPaidThisMonth / stats.totalMembers) * 100)
    : 0;

  const handlePaymentSuccess = (newPayment: Payment) => {
    setShowPaymentModal(false);
    setSelectedReceipt(newPayment); // Immediately show receipt to print/share!
    router.refresh();
  };

  const handleMemberSuccess = () => {
    setShowMemberModal(false);
    router.refresh();
  };

  const handleAnnouncementSuccess = () => {
    setShowAnnouncementModal(false);
    router.refresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Admin Control Panel</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            അഡ്മിൻ ഡാഷ്‌ബോർഡ്
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            മാസ വരിസംഖ്യ കളക്ഷനും അംഗങ്ങളുടെ വിവരങ്ങളും
          </p>
        </div>

        {/* 3 Clean Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ വരിസംഖ്യ ചേർക്കുക</span>
          </button>

          <button
            onClick={() => setShowMemberModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-emerald-900 border border-emerald-600 font-bold transition shadow-xs text-sm"
          >
            <UserPlus className="w-4 h-4 text-emerald-700" />
            <span>+ പുതിയ അംഗം</span>
          </button>

          <button
            onClick={() => setShowAnnouncementModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold transition shadow-xs text-sm"
          >
            <Megaphone className="w-4 h-4 text-amber-700" />
            <span>+ അറിയിപ്പ്</span>
          </button>
        </div>
      </div>

      {/* Madrasa Standard Fixed Monthly Fee Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            <span>നിശ്ചിത പ്രതിമാസ നിരക്ക് (Monthly Subscription)</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {formatCurrency(stats.fixedMonthlyFee || 50)}
            </span>
            <span className="text-emerald-200 text-xs font-semibold">
              / മാസം (Fixed for all members)
            </span>
          </div>
          {stats.upcomingFee ? (
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-lg mt-1">
              <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>
                ഷെഡ്യൂൾ ചെയ്ത മാറ്റം: <strong>{formatMonthYear(stats.upcomingFee.effectiveFrom)}</strong> മുതൽ നിരക്ക്{' '}
                <strong>{formatCurrency(stats.upcomingFee.amount)}</strong> ആകും.
              </span>
            </div>
          ) : (
            <p className="text-[11px] text-emerald-200/80">
              അഡ്മിൻ തുക മാറ്റിയാൽ അടുത്ത മാസം 1 മുതൽ പുതിയ നിരക്ക് നിലവിൽ വരും.
            </p>
          )}
        </div>

        <button
          onClick={() => setShowFixedFeeModal(true)}
          className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold transition shadow-xs text-sm shrink-0 border border-emerald-300"
        >
          <IndianRupee className="w-4 h-4 text-emerald-700" />
          <span>Change Monthly Fee</span>
        </button>
      </div>

      {/* KPI Cards Grid */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Collected this Month */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-emerald-200">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {currentMonthName} കളക്ഷൻ
            </span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-900">
            {formatCurrency(stats.totalCollectedThisMonth)}
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            പ്രതീക്ഷിക്കുന്നത്: {formatCurrency(stats.totalExpectedThisMonth)}
          </p>
        </div>

        {/* Paid Members vs Pending this Month */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-200">
          <div className="flex items-center justify-between text-gray-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              ഈ മാസം അടച്ചവർ / ബാക്കി
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-gray-900">
              {stats.membersPaidThisMonth}
            </span>
            <span className="text-lg text-gray-500 font-bold">
              / {stats.totalMembers} പേർ ({paidPercent}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${paidPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Total Overall Pending Arrears */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-rose-200">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              ആകെ പിരിയാനുള്ള കുടിശ്ശിക
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-700">
            {formatCurrency(stats.totalOverallPending)}
          </div>
          <p className="text-xs text-rose-800 font-semibold mt-2">
            {stats.membersPendingThisMonth} അംഗങ്ങൾക്ക് കുടിശ്ശികയുണ്ട്
          </p>
        </div>

        {/* Total Overall Collected */}
        <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-200">
          <div className="flex items-center justify-between text-gray-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              ആകെ ഫണ്ട് ശേഖരണം (All-Time)
            </span>
            <CreditCard className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-3xl font-black text-gray-900">
            {formatCurrency(stats.totalOverallCollected)}
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            സജീവ അംഗങ്ങൾ: {stats.activeMembers}
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/members"
          className="bg-white hover:bg-emerald-50/50 p-6 rounded-3xl border-2 border-gray-200 hover:border-emerald-500 shadow-sm transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-700 transition" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mt-4">അംഗങ്ങളുടെ പട്ടിക (Members)</h3>
          <p className="text-xs text-gray-600 mt-1">
            അംഗങ്ങളെ ചേർക്കുക, യൂസർ നെയിം / പാസ്‌വേഡ് നൽകുക, അടച്ചതും ബാക്കിയുള്ളതും പരിശോധിക്കുക.
          </p>
        </Link>

        <Link
          href="/admin/payments"
          className="bg-white hover:bg-emerald-50/50 p-6 rounded-3xl border-2 border-gray-200 hover:border-emerald-500 shadow-sm transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center group-hover:scale-110 transition">
              <CreditCard className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-700 transition" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mt-4">വരിസംഖ്യ ചാർട്ട് (Monthly Grid)</h3>
          <p className="text-xs text-gray-600 mt-1">
            ജനുവരി മുതൽ ഡിസംബർ വരെയുള്ള മാസങ്ങളിലെ അടവ് നില ഒറ്റനോട്ടത്തിൽ ഗ്രീൻ / റെഡ് ബാഡ്ജിൽ കാണാം.
          </p>
        </Link>

        <Link
          href="/admin/reports"
          className="bg-white hover:bg-rose-50/50 p-6 rounded-3xl border-2 border-gray-200 hover:border-rose-400 shadow-sm transition group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center group-hover:scale-110 transition">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-rose-700 transition" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mt-4">കുടിശ്ശിക റിപ്പോർട്ട് (Defaulters)</h3>
          <p className="text-xs text-gray-600 mt-1">
            പണം നൽകാൻ ബാക്കിയുള്ളവരുടെ ലിസ്റ്റ് പ്രിന്റ് ചെയ്യാനും വാട്സാപ്പ് ഓർമ്മപ്പെടുത്തൽ അയക്കാനും.
          </p>
        </Link>
      </div>

      {/* Recent Payments Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-gray-200 space-y-5">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900">അടുത്തിടെ സ്വീകരിച്ച വരിസംഖ്യകൾ</h2>
            <p className="text-xs text-gray-500">Recently Recorded Payments & Receipts</p>
          </div>
          <Link
            href="/admin/payments"
            className="text-sm font-bold text-emerald-800 hover:underline flex items-center"
          >
            മുഴുവൻ കാണുക <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-xl">രസീത് നമ്പർ</th>
                <th className="py-3 px-4">അംഗം (Member)</th>
                <th className="py-3 px-4">തീയതി</th>
                <th className="py-3 px-4">മാസം</th>
                <th className="py-3 px-4">തുക</th>
                <th className="py-3 px-4">രീതി</th>
                <th className="py-3 px-4 rounded-r-xl text-right">രസീത്</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {stats.recentPayments.map((p) => {
                const mName = MONTH_NAMES[p.forMonth - 1] || `Month ${p.forMonth}`;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-900">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 text-base">
                      {p.memberName}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 font-medium">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-800 font-semibold">
                      {mName} {p.forYear}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-800 text-base">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 border">
                        {p.paymentMode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>പ്രിന്റ് രസീത്</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          members={members}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {showMemberModal && (
        <MemberModal
          onClose={() => setShowMemberModal(false)}
          onSuccess={handleMemberSuccess}
        />
      )}

      {showAnnouncementModal && (
        <AnnouncementModal
          onClose={() => setShowAnnouncementModal(false)}
          onSuccess={handleAnnouncementSuccess}
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
          currentFee={stats.fixedMonthlyFee || 50}
          upcomingFee={stats.upcomingFee}
          onClose={() => setShowFixedFeeModal(false)}

          onSuccess={() => {
            setShowFixedFeeModal(false);
            router.refresh();
          }}
        />
      )}
    </div>

  );
}

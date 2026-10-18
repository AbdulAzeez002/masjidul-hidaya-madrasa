'use client';

import React, { useState, useEffect } from 'react';
import { DashboardStats, MemberSummary, Payment, SessionUser } from '@/lib/types';
import PaymentModal from '@/components/PaymentModal';
import MemberModal from '@/components/MemberModal';
import AnnouncementModal from '@/components/AnnouncementModal';
import ReceiptModal from '@/components/ReceiptModal';
import FixedFeeModal from '@/components/FixedFeeModal';
import AdminMobileBottomNav from '@/components/AdminMobileBottomNav';
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
  ArrowRight,
  ShieldCheck,
  IndianRupee,
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
  const [membersList, setMembersList] = useState<MemberSummary[]>(members);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showFixedFeeModal, setShowFixedFeeModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  useEffect(() => {
    setStats(initialStats);
    setMembersList(members);
  }, [initialStats, members]);

  const refreshDashboardData = async () => {
    try {
      const [resStats, resMembers] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/members'),
      ]);
      if (resStats.ok) {
        const dStats = await resStats.json();
        if (dStats.stats) setStats(dStats.stats);
      }
      if (resMembers.ok) {
        const dMembers = await resMembers.json();
        if (dMembers.members) setMembersList(dMembers.members);
      }
    } catch (e) {
      console.error('Failed to auto-refresh dashboard data:', e);
    }
    router.refresh();
  };

  const currentMonthName = MONTH_NAMES[currentPeriod.month - 1];
  const paidPercent =
    stats.totalMembers > 0
      ? Math.round((stats.membersPaidThisMonth / stats.totalMembers) * 100)
      : 0;

  const handlePaymentSuccess = async (newPayment: Payment) => {
    setShowPaymentModal(false);
    setSelectedReceipt(newPayment);
    await refreshDashboardData();
  };

  const handleMemberSuccess = async () => {
    setShowMemberModal(false);
    await refreshDashboardData();
  };

  const handleAnnouncementSuccess = async () => {
    setShowAnnouncementModal(false);
    await refreshDashboardData();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-24 lg:pb-8">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
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

        {/* Action Buttons: Prominent on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center justify-center space-x-2 px-4 py-3 sm:py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs text-sm sm:text-base"
          >
            <PlusCircle className="w-5 h-5 sm:w-4 sm:h-4" />
            <span>+ വരിസംഖ്യ ചേർക്കുക</span>
          </button>

          <div className="grid grid-cols-2 sm:flex gap-2">
            <button
              onClick={() => setShowMemberModal(true)}
              className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-emerald-900 border border-emerald-600 font-bold transition text-xs sm:text-sm"
            >
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>+ പുതിയ അംഗം</span>
            </button>

            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold transition text-xs sm:text-sm"
            >
              <Megaphone className="w-4 h-4 text-amber-700" />
              <span>+ അറിയിപ്പ്</span>
            </button>
          </div>
        </div>
      </div>

      {/* Madrasa Standard Fixed Monthly Fee Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-emerald-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            <span>നിശ്ചിത പ്രതിമാസ നിരക്ക് (Monthly Subscription)</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">
              {formatCurrency(stats.fixedMonthlyFee || 50)}
            </span>
            <span className="text-emerald-200 text-xs font-semibold">
              / മാസം (Fixed for all members)
            </span>
          </div>
          {stats.upcomingFee ? (
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2.5 py-1 rounded-lg mt-1">
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
          className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold transition shadow-xs text-sm shrink-0 border border-emerald-300"
        >
          <IndianRupee className="w-4 h-4 text-emerald-700" />
          <span>Change Monthly Fee</span>
        </button>
      </div>

      {/* KPI Cards: 2x2 on Mobile, 4x1 on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Collected this Month */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-emerald-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider truncate">
                {currentMonthName} കളക്ഷൻ
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-1">
              {formatCurrency(stats.totalCollectedThisMonth)}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-2 font-medium truncate">
            പ്രതീക്ഷിക്കുന്നത്: {formatCurrency(stats.totalExpectedThisMonth)}
          </p>
        </div>

        {/* Paid Members vs Pending this Month */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-600 mb-1">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider truncate">
                ഈ മാസം അടച്ചവർ
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-xl sm:text-2xl font-black text-gray-900">
                {stats.membersPaidThisMonth}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 font-bold">
                / {stats.totalMembers} ({paidPercent}%)
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${paidPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Total Overall Pending Arrears */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-rose-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-rose-700 mb-1">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider truncate">
                ആകെ കുടിശ്ശിക
              </span>
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-700 mt-1">
              {formatCurrency(stats.totalOverallPending)}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-rose-800 font-semibold mt-2 truncate">
            {stats.membersPendingThisMonth} അംഗങ്ങൾക്ക് ബാക്കി
          </p>
        </div>

        {/* Total Overall Collected */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-600 mb-1">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider truncate">
                ആകെ ഫണ്ട് ശേഖരണം
              </span>
              <CreditCard className="w-4 h-4 text-gray-600 shrink-0" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
              {formatCurrency(stats.totalOverallCollected)}
            </div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-2 font-medium truncate">
            സജീവ അംഗങ്ങൾ: {stats.activeMembers}
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards: 3 columns on tablet/desktop, 1 column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <Link
          href="/admin/members"
          className="bg-white hover:bg-emerald-50/40 p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs transition group flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">അംഗങ്ങളുടെ പട്ടിക (Members)</h3>
              <p className="text-[11px] sm:text-xs text-gray-500">അംഗങ്ങളെ ചേർക്കാനും പരിശോധിക്കാനും</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 shrink-0" />
        </Link>

        <Link
          href="/admin/payments"
          className="bg-white hover:bg-emerald-50/40 p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs transition group flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">വരിസംഖ്യ ചാർട്ട് (Grid)</h3>
              <p className="text-[11px] sm:text-xs text-gray-500">12 മാസത്തെ അടവ് നില ഒറ്റനോട്ടത്തിൽ</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-700 shrink-0" />
        </Link>

        <Link
          href="/admin/reports"
          className="bg-white hover:bg-rose-50/40 p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs transition group flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">കുടിശ്ശിക റിപ്പോർട്ട് (Dues)</h3>
              <p className="text-[11px] sm:text-xs text-gray-500">ബാക്കിയുള്ളവരുടെ ലിസ്റ്റും വാട്സാപ്പും</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-rose-700 shrink-0" />
        </Link>
      </div>

      {/* Recent Payments Section: Desktop Table + Mobile Native Cards */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-200 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base sm:text-xl font-black text-gray-900">അടുത്തിടെ സ്വീകരിച്ച വരിസംഖ്യകൾ</h2>
            <p className="text-[11px] sm:text-xs text-gray-500">Recent Payment Records & Receipts</p>
          </div>
          <Link
            href="/admin/payments"
            className="text-xs sm:text-sm font-bold text-emerald-800 hover:underline flex items-center shrink-0"
          >
            എല്ലാം കാണുക <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* Mobile View: Cards */}
        <div className="sm:hidden space-y-2.5">
          {stats.recentPayments.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">പേയ്മെന്റുകൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.</p>
          ) : (
            stats.recentPayments.map((p) => {
              const mName = MONTH_NAMES[p.forMonth - 1] || `Month ${p.forMonth}`;
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-xl border border-gray-200 bg-gray-50/50 flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">{p.memberName}</div>
                    <div className="text-[11px] text-gray-500 flex items-center space-x-1.5">
                      <span>{mName} {p.forYear}</span>
                      <span>•</span>
                      <span>{formatDate(p.paymentDate)}</span>
                    </div>
                    <div className="text-[10px] text-emerald-800 font-mono font-semibold">{p.receiptNumber}</div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <div className="text-base font-black text-emerald-800">
                      {formatCurrency(p.amount)}
                    </div>
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] transition"
                    >
                      <Printer className="w-3 h-3" />
                      <span>രസീത്</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3 rounded-l-lg">രസീത് നമ്പർ</th>
                <th className="py-2.5 px-3">അംഗം (Member)</th>
                <th className="py-2.5 px-3">തീയതി</th>
                <th className="py-2.5 px-3">മാസം</th>
                <th className="py-2.5 px-3">തുക</th>
                <th className="py-2.5 px-3">രീതി</th>
                <th className="py-2.5 px-3 rounded-r-lg text-right">രസീത്</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {stats.recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-gray-500 text-xs">
                    പേയ്മെന്റുകൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.
                  </td>
                </tr>
              ) : (
                stats.recentPayments.map((p) => {
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
                      <td className="py-3 px-3 text-gray-800 text-xs font-semibold">
                        {mName} {p.forYear}
                      </td>
                      <td className="py-3 px-3 font-black text-emerald-800">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-800 border">
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Bottom Thumb Navigation */}
      <AdminMobileBottomNav onQuickPayment={() => setShowPaymentModal(true)} />

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          members={membersList}
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
          onSuccess={async () => {
            setShowFixedFeeModal(false);
            await refreshDashboardData();
          }}
        />
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { MemberSummary, DashboardStats, Payment } from '@/lib/types';
import { formatCurrency, formatDate, MONTH_NAMES } from '@/lib/utils';
import PaymentModal from '@/components/PaymentModal';
import ReceiptModal from '@/components/ReceiptModal';
import AdminMobileBottomNav from '@/components/AdminMobileBottomNav';
import {
  AlertTriangle,
  Printer,
  Share2,
  Phone,
  CreditCard,
  Download,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReportsClientProps {
  members: MemberSummary[];
  stats: DashboardStats;
  currentPeriod: { year: number; month: number; key: string };
}

export default function ReportsClient({ members, stats, currentPeriod }: ReportsClientProps) {
  const router = useRouter();
  const currentMonthName = MONTH_NAMES[currentPeriod.month - 1];
  const [membersList, setMembersList] = useState<MemberSummary[]>(members);
  const [currentStats, setCurrentStats] = useState<DashboardStats>(stats);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payMemberId, setPayMemberId] = useState<string | undefined>(undefined);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  useEffect(() => {
    setMembersList(members);
    setCurrentStats(stats);
  }, [members, stats]);

  const reloadReports = async () => {
    try {
      const [resMembers, resStats] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/stats'),
      ]);
      if (resMembers.ok) {
        const dMembers = await resMembers.json();
        if (dMembers.members) setMembersList(dMembers.members);
      }
      if (resStats.ok) {
        const dStats = await resStats.json();
        if (dStats.stats) setCurrentStats(dStats.stats);
      }
    } catch (e) {
      console.error('Failed to reload reports:', e);
    }
    router.refresh();
  };

  // Filter members who have pending dues
  const defaulters = membersList.filter((m) => m.pendingBalance > 0);
  const totalPendingAmount = defaulters.reduce((sum, m) => sum + m.pendingBalance, 0);

  const handleSendReminder = (m: MemberSummary) => {
    const text = `*നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ - കിഴക്കേത്തല ശാഖ*\n-------------------------------\nഅസ്സലാമു അലൈക്കും ${m.name},\n\nമദ്റസയിലെ താങ്കളുടെ മാസ വരിസംഖ്യയിൽ *${formatCurrency(m.pendingBalance)}* (${m.unpaidMonthsCount} മാസത്തെ കുടിശ്ശിക) അടയ്ക്കാനുണ്ട്. സ്ഥാപനത്തിന്റെ സുഗമമായ നടത്തിപ്പിനായി ഈ തുക എത്രയും വേഗം നൽകി സഹകരിക്കണമെന്ന് അഭ്യർത്ഥിക്കുന്നു.\n\nജസാക്കല്ലാഹു ഖൈർ,\n*മദ്റസ കമ്മിറ്റി, കിഴക്കേത്തല*`;
    const cleanPhone = m.phone.replace(/[^0-9]/g, '');
    const phoneParam = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleDownloadBackup = () => {
    window.open('/api/export', '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 inline-flex mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
            <span>കുടിശ്ശിക വിവരങ്ങൾ (Pending Arrears)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            വരിസംഖ്യ കുടിശ്ശിക പട്ടിക (Dues List)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            മാസ വരിസംഖ്യ നൽകാൻ ബാക്കിയുള്ള അംഗങ്ങളുടെ പട്ടികയും ഓർമ്മപ്പെടുത്തലും.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold transition shadow-xs text-xs sm:text-sm"
          >
            <Printer className="w-4 h-4" />
            <span>പ്രിന്റ് ലിസ്റ്റ് (Print)</span>
          </button>
          <button
            onClick={handleDownloadBackup}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs text-xs sm:text-sm"
            title="Download full database backup JSON"
          >
            <Download className="w-4 h-4" />
            <span>ബാക്കപ്പ് (Backup)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 no-print">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5">
          <span className="text-[11px] sm:text-xs font-bold text-rose-800 uppercase tracking-wider block">
            ആകെ പിരിയാനുള്ള കുടിശ്ശിക
          </span>
          <div className="text-2xl sm:text-3xl font-black text-rose-900 mt-1">
            {formatCurrency(totalPendingAmount)}
          </div>
          <p className="text-xs text-rose-700 mt-1.5 font-semibold">
            {defaulters.length} അംഗങ്ങൾക്ക് കുടിശ്ശികയുണ്ട്
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider block">
            മുഴുവൻ തുകയും അടച്ച അംഗങ്ങൾ
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 mt-1">
            {members.length - defaulters.length} പേർ
          </div>
          <p className="text-xs text-gray-500 mt-1.5 font-medium">
            കൃത്യമായി നൽകിയവർ
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider block">
            വരിസംഖ്യ പിരിവ് ശതമാനം
          </span>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
            {members.length > 0
              ? `${Math.round(((members.length - defaulters.length) / members.length) * 100)}%`
              : '0%'}
          </div>
          <p className="text-xs text-gray-500 mt-1.5 font-medium">
            {currentMonthName} {currentPeriod.year} കണക്ക്
          </p>
        </div>
      </div>

      {/* Defaulters: Mobile Cards (< sm) + Desktop Table (>= sm) */}
      <div id="printable-receipt" className="bg-white rounded-2xl shadow-xs border border-gray-200 p-4 sm:p-6 space-y-4">
        {/* Printable Official Header */}
        <div className="border-b-2 border-emerald-900 pb-3 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
            നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ - കിഴക്കേത്തല ശാഖ
          </h2>
          <p className="text-xs sm:text-sm font-bold text-gray-700">
            NASRUTHUL ISLAM MADRASA - KIYAKETHALA BRANCH
          </p>
          <div className="mt-1 inline-block px-2.5 py-0.5 bg-rose-100 text-rose-900 text-xs font-bold rounded-md uppercase tracking-wider">
            മാസ വരിസംഖ്യ കുടിശ്ശിക പട്ടിക ({currentMonthName} {currentPeriod.year})
          </div>
        </div>

        {defaulters.length === 0 ? (
          <div className="py-10 text-center text-emerald-800 font-bold text-base">
            🎉 മാഷാ അല്ലാഹ്! എല്ലാ അംഗങ്ങളും ഈ മാസം വരെയുള്ള വരിസംഖ്യ കൃത്യമായി അടച്ചിട്ടുണ്ട്. നിലവിൽ ആർക്കും കുടിശ്ശികയില്ല.
          </div>
        ) : (
          <>
            {/* Mobile Cards (< sm) */}
            <div className="sm:hidden space-y-3 no-print">
              {defaulters.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-xl p-3.5 border border-rose-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-gray-900 text-base">{m.name}</div>
                      <div className="text-xs font-mono font-semibold text-emerald-800">
                        {m.memberCode}
                      </div>
                      {m.phone && (
                        <a
                          href={`tel:${m.phone}`}
                          className="text-xs text-gray-600 hover:text-emerald-700 flex items-center mt-0.5"
                        >
                          <Phone className="w-3 h-3 mr-1 text-gray-400" />
                          {m.phone}
                        </a>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-rose-700">
                        {formatCurrency(m.pendingBalance)}
                      </div>
                      {m.unpaidMonthsCount > 0 && (
                        <div className="text-[10px] text-rose-800 font-semibold">
                          {m.unpaidMonthsCount} മാസത്തെ കുടിശ്ശിക
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                    <span className="text-gray-500">മാസ വരിസംഖ്യ: <strong>{formatCurrency(m.monthlyFee)}</strong></span>
                    <span className="text-gray-500">ആകെ നൽകിയത്: <strong className="text-emerald-800">{formatCurrency(m.totalPaid)}</strong></span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center space-x-2 pt-1 border-t border-gray-100">
                    {m.phone && (
                      <button
                        onClick={() => handleSendReminder(m)}
                        className="flex-1 flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp അയക്കുക</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setPayMemberId(m.id);
                        setShowPaymentModal(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-xs transition"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>വരിസംഖ്യ ചേർക്കുക</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (>= sm) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3 rounded-l-lg">നമ്പർ</th>
                    <th className="py-2.5 px-3">അംഗത്തിന്റെ പേര്</th>
                    <th className="py-2.5 px-3">ഫോൺ നമ്പർ</th>
                    <th className="py-2.5 px-3">മാസ വരിസംഖ്യ</th>
                    <th className="py-2.5 px-3">അടച്ച തുക</th>
                    <th className="py-2.5 px-3">ബാക്കി കുടിശ്ശിക</th>
                    <th className="py-2.5 px-3 rounded-r-lg text-right no-print">നടപടി</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {defaulters.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-rose-50/30 transition">
                      <td className="py-3 px-3 font-mono font-bold text-gray-600 text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900">{m.name}</div>
                        <div className="text-xs font-mono font-semibold text-emerald-800">
                          {m.memberCode}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-xs">
                        {m.phone ? (
                          <a href={`tel:${m.phone}`} className="text-gray-700 hover:text-emerald-700 font-semibold">
                            {m.phone}
                          </a>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900">
                        {formatCurrency(m.monthlyFee)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-emerald-800">
                        {formatCurrency(m.totalPaid)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-black text-rose-700">
                          {formatCurrency(m.pendingBalance)}
                        </span>
                        {m.unpaidMonthsCount > 0 && (
                          <div className="text-[11px] text-rose-800 font-semibold">
                            ({m.unpaidMonthsCount} മാസത്തെ തുക)
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right no-print">
                        <div className="flex items-center justify-end space-x-1.5">
                          {m.phone && (
                            <button
                              onClick={() => handleSendReminder(m)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                              title="Send WhatsApp reminder"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setPayMemberId(m.id);
                              setShowPaymentModal(true);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-xs transition"
                            title="Record payment now"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>അടയ്ക്കുക</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Mobile Bottom Thumb Navigation */}
      <AdminMobileBottomNav onQuickPayment={() => { setPayMemberId(undefined); setShowPaymentModal(true); }} />

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          members={membersList}
          preSelectedMemberId={payMemberId}
          onClose={() => {
            setShowPaymentModal(false);
            setPayMemberId(undefined);
          }}
          onSuccess={async (p) => {
            setShowPaymentModal(false);
            setSelectedReceipt(p);
            await reloadReports();
          }}
        />
      )}

      {selectedReceipt && (
        <ReceiptModal
          payment={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}

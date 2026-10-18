'use client';

import React, { useState } from 'react';
import { MemberSummary, DashboardStats, Payment } from '@/lib/types';
import { formatCurrency, formatDate, MONTH_NAMES } from '@/lib/utils';
import PaymentModal from '@/components/PaymentModal';
import ReceiptModal from '@/components/ReceiptModal';
import {
  AlertTriangle,
  Printer,
  Share2,
  Phone,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payMemberId, setPayMemberId] = useState<string | undefined>(undefined);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Filter members who have pending dues
  const defaulters = members.filter((m) => m.pendingBalance > 0);
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
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-rose-100 flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 inline-flex mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-700" />
            <span>കുടിശ്ശിക വിവരങ്ങൾ (Pending Arrears)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            വരിസംഖ്യ കുടിശ്ശിക റിപ്പോർട്ട് (Defaulters List)
          </h1>
          <p className="text-sm text-gray-600 font-medium mt-1">
            മാസ വരിസംഖ്യ നൽകാൻ ബാക്കിയുള്ള അംഗങ്ങളുടെ പട്ടികയും ഓർമ്മപ്പെടുത്തൽ സൗകര്യവും.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold transition shadow-md text-sm"
          >
            <Printer className="w-4 h-4" />
            <span>റിപ്പോർട്ട് പ്രിന്റ് ചെയ്യുക (Print List)</span>
          </button>
          <button
            onClick={handleDownloadBackup}
            className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-sm text-sm"
            title="Download full database backup JSON"
          >
            <Download className="w-4 h-4" />
            <span>ഡാറ്റാ ബാക്കപ്പ് (Backup)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-6">
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
            ആകെ പിരിയാനുള്ള കുടിശ്ശിക
          </span>
          <div className="text-3xl font-black text-rose-900 mt-1">
            {formatCurrency(totalPendingAmount)}
          </div>
          <p className="text-xs text-rose-700 mt-2 font-semibold">
            {defaulters.length} അംഗങ്ങൾക്ക് കുടിശ്ശികയുണ്ട്
          </p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            മുഴുവൻ തുകയും അടച്ച അംഗങ്ങൾ
          </span>
          <div className="text-3xl font-black text-emerald-800 mt-1">
            {members.length - defaulters.length} പേർ
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            Alhamdulillah! കൃത്യമായി നൽകിയവർ
          </p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            വരിസംഖ്യ പിരിവ് ശതമാനം
          </span>
          <div className="text-3xl font-black text-gray-900 mt-1">
            {members.length > 0
              ? `${Math.round(((members.length - defaulters.length) / members.length) * 100)}%`
              : '0%'}
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            {currentMonthName} {currentPeriod.year} കണക്ക്
          </p>
        </div>
      </div>

      {/* Printable Report View */}
      <div id="printable-receipt" className="bg-white rounded-3xl shadow-md border-2 border-gray-200 p-6 sm:p-8 space-y-6">
        {/* Madrasa Official Header for Print */}
        <div className="border-b-2 border-emerald-900 pb-4 text-center">
          <h2 className="text-2xl font-black text-emerald-950">
            നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ - കിഴക്കേത്തല ശാഖ
          </h2>
          <p className="text-sm font-bold text-gray-800">
            NASRUTHUL ISLAM MADRASA - KIYAKETHALA BRANCH
          </p>
          <div className="mt-1 inline-block px-3 py-1 bg-rose-100 text-rose-900 text-xs font-bold rounded-md uppercase tracking-wider">
            മാസ വരിസംഖ്യ കുടിശ്ശിക പട്ടിക / Outstanding Arrears Statement ({currentMonthName} {currentPeriod.year})
          </div>
        </div>

        {defaulters.length === 0 ? (
          <div className="py-12 text-center text-emerald-800 font-bold text-lg">
            🎉 മാഷാ അല്ലാഹ്! എല്ലാ അംഗങ്ങളും ഈ മാസം വരെയുള്ള വരിസംഖ്യ കൃത്യമായി അടച്ചിട്ടുണ്ട്. നിലവിൽ ആർക്കും കുടിശ്ശികയില്ല.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">നമ്പർ</th>
                  <th className="py-3 px-4">അംഗത്തിന്റെ പേര്</th>
                  <th className="py-3 px-4">ഫോൺ നമ്പർ</th>
                  <th className="py-3 px-4">മാസ വരിസംഖ്യ</th>
                  <th className="py-3 px-4">അടച്ച തുക</th>
                  <th className="py-3 px-4">ബാക്കി കുടിശ്ശിക</th>
                  <th className="py-3 px-4 rounded-r-xl text-right no-print">നടപടി</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {defaulters.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-rose-50/30 transition">
                    <td className="py-4 px-4 font-mono font-bold text-gray-600">
                      {idx + 1}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900 text-base">{m.name}</div>
                      <div className="text-xs font-mono font-semibold text-emerald-800">
                        {m.memberCode}
                      </div>
                      {m.address && (
                        <div className="text-xs text-gray-500">{m.address}</div>
                      )}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-800">
                      {m.phone || '-'}
                    </td>
                    <td className="py-4 px-4 font-bold text-gray-900">
                      {formatCurrency(m.monthlyFee)}
                    </td>
                    <td className="py-4 px-4 font-semibold text-emerald-800">
                      {formatCurrency(m.totalPaid)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-black text-lg text-rose-700">
                        {formatCurrency(m.pendingBalance)}
                      </span>
                      {m.unpaidMonthsCount > 0 && (
                        <div className="text-xs text-rose-800 font-semibold">
                          ({m.unpaidMonthsCount} മാസത്തെ തുക)
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right no-print">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Send WhatsApp Reminder */}
                        {m.phone && (
                          <button
                            onClick={() => handleSendReminder(m)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                            title="Send WhatsApp reminder"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        )}

                        {/* Pay Now Button */}
                        <button
                          onClick={() => {
                            setPayMemberId(m.id);
                            setShowPaymentModal(true);
                          }}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs shadow-xs transition"
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
              <tfoot>
                <tr className="bg-gray-100 font-black text-gray-900 text-base">
                  <td colSpan={5} className="py-4 px-4 rounded-l-xl text-right">
                    ആകെ കുടിശ്ശിക തുക (Total Arrears):
                  </td>
                  <td className="py-4 px-4 text-rose-700 text-xl font-black">
                    {formatCurrency(totalPendingAmount)}
                  </td>
                  <td className="py-4 px-4 rounded-r-xl no-print"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Committee Signature Stamp Line for Meeting Printout */}
        <div className="pt-10 flex justify-between items-end text-xs text-gray-500">
          <div>
            <p>റിപ്പോർട്ട് തീയതി: {formatDate(new Date().toISOString())}</p>
            <p className="text-[11px] text-gray-400">Madrasa Accounting & Tracking System</p>
          </div>
          <div className="flex space-x-8 text-center">
            <div>
              <div className="w-32 border-b border-gray-400 mb-1"></div>
              <p className="font-semibold text-gray-700">ജനറൽ സെക്രട്ടറി</p>
            </div>
            <div>
              <div className="w-32 border-b border-gray-400 mb-1"></div>
              <p className="font-semibold text-gray-700">ട്രഷറർ</p>
            </div>
            <div>
              <div className="w-32 border-b border-gray-400 mb-1"></div>
              <p className="font-semibold text-gray-700">പ്രസിഡന്റ്</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          members={members}
          preSelectedMemberId={payMemberId}
          onClose={() => {
            setShowPaymentModal(false);
            setPayMemberId(undefined);
          }}
          onSuccess={(newP) => {
            setShowPaymentModal(false);
            setSelectedReceipt(newP);
            router.refresh();
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

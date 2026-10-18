'use client';

import React, { useState } from 'react';
import { MemberSummary, Payment } from '@/lib/types';
import { formatCurrency, formatDate, MONTH_NAMES } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import MemberModal from '@/components/MemberModal';
import PaymentModal from '@/components/PaymentModal';
import ReceiptModal from '@/components/ReceiptModal';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Phone,
  Home,
  KeyRound,
  IndianRupee,
} from 'lucide-react';
import FixedFeeModal from '@/components/FixedFeeModal';


interface MembersClientProps {
  initialMembers: MemberSummary[];
  currentPeriod: { year: number; month: number; key: string };
}

export default function MembersClient({ initialMembers, currentPeriod }: MembersClientProps) {
  const router = useRouter();
  const [members, setMembers] = useState<MemberSummary[]>(initialMembers);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showFixedFeeModal, setShowFixedFeeModal] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<MemberSummary | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [payTargetMemberId, setPayTargetMemberId] = useState<string | undefined>(undefined);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  const currentMonthName = MONTH_NAMES[currentPeriod.month - 1];

  const togglePasswordReveal = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.memberCode.toLowerCase().includes(search.toLowerCase()) ||
      m.username.toLowerCase().includes(search.toLowerCase()) ||
      (m.address && m.address.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === 'paid') return m.currentMonthPaid;
    if (filter === 'pending') return !m.currentMonthPaid || m.pendingBalance > 0;
    return true;
  });

  const totalMembers = members.length;
  const paidMembersCount = members.filter((m) => m.currentMonthPaid).length;
  const pendingMembersCount = members.filter((m) => !m.currentMonthPaid || m.pendingBalance > 0).length;

  const handleDeleteMember = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete member "${name}"? This will also remove their payment history.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
        router.refresh();
      } else {
        alert('Failed to delete member');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting member');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex mb-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <span>മദ്റസ അംഗങ്ങളുടെ വിവരങ്ങൾ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            അംഗങ്ങളുടെ പട്ടിക (Madrasa Members Directory)
          </h1>
          <p className="text-sm text-gray-600 font-medium mt-1">
            അംഗങ്ങളെ ചേർക്കുക, യൂസർ നെയിം & പാസ്‌വേഡ് മാനേജ് ചെയ്യുക, വരിസംഖ്യ നില പരിശോധിക്കുക.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFixedFeeModal(true)}
            className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 border-2 border-emerald-600 font-bold transition text-sm"
          >
            <IndianRupee className="w-4 h-4 text-emerald-700" />
            <span>നിശ്ചിത വരിസംഖ്യ ({formatCurrency(members[0]?.currentMonthFee || 50)})</span>
          </button>


          <button
            onClick={() => {
              setMemberToEdit(null);
              setShowMemberModal(true);
            }}
            className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-md text-base"
          >
            <UserPlus className="w-5 h-5" />
            <span>പുതിയ അംഗത്തെ ചേർക്കുക (Add Member)</span>
          </button>
        </div>
      </div>


      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-gray-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                filter === 'all'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              മുഴുവൻ അംഗങ്ങൾ ({totalMembers})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-1.5 ${
                filter === 'paid'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ഈ മാസം അടച്ചവർ ({paidMembersCount})</span>
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center space-x-1.5 ${
                filter === 'pending'
                  ? 'bg-rose-700 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span>ബാക്കിയുള്ളവർ ({pendingMembersCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-5 h-5 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="പേര്, ഫോൺ, അല്ലെങ്കിൽ കോഡ് തിരയുക..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-emerald-600 focus:outline-hidden text-sm font-medium"
            />
          </div>
        </div>

        {/* Notice for Elder Assistance */}
        <div className="text-xs text-emerald-900 bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center space-x-2">
          <KeyRound className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>
            💡 <strong>മുതിർന്ന അംഗങ്ങൾക്ക് സഹായം:</strong> പ്രായമുള്ള അംഗങ്ങൾ പാസ്‌വേഡ് മറന്നുപോയാൽ അഡ്മിന് താഴെയുള്ള പട്ടികയിൽ "പാസ്‌വേഡ് കാണുക" ക്ലിക്ക് ചെയ്ത് അവർക്ക് പറഞ്ഞു നൽകാവുന്നതാണ്.
          </span>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl shadow-md border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-4">അംഗം / കോഡ്</th>
                <th className="py-4 px-4">ബന്ധപ്പെടേണ്ട നമ്പർ</th>
                <th className="py-4 px-4">മാസ വരിസംഖ്യ</th>
                <th className="py-4 px-4">{currentMonthName} സ്റ്റാറ്റസ്</th>
                <th className="py-4 px-4">ആകെ അടച്ചത്</th>
                <th className="py-4 px-4">ബാക്കി തുക</th>
                <th className="py-4 px-4">ലോഗിൻ വിവരങ്ങൾ</th>
                <th className="py-4 px-4 text-right">നടപടികൾ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 font-medium">
                    അംഗങ്ങളെ കണ്ടെത്തിയില്ല.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => {
                  const isRevealed = revealedPasswords[m.id];
                  return (
                    <tr key={m.id} className="hover:bg-emerald-50/30 transition">
                      {/* Name & Code */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900 text-base">{m.name}</div>
                        <div className="text-xs font-mono font-semibold text-emerald-800">
                          {m.memberCode}
                        </div>
                        {m.address && (
                          <div className="text-xs text-gray-500 mt-0.5 flex items-center">
                            <Home className="w-3 h-3 mr-1 text-gray-400" />
                            {m.address}
                          </div>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4">
                        {m.phone ? (
                          <a
                            href={`tel:${m.phone}`}
                            className="font-semibold text-gray-800 hover:text-emerald-700 flex items-center"
                          >
                            <Phone className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            {m.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Monthly Fee */}
                      <td className="py-4 px-4 font-bold text-gray-900">
                        {formatCurrency(m.monthlyFee)}
                      </td>

                      {/* Current Month Status Badge */}
                      <td className="py-4 px-4">
                        <StatusBadge
                          status={m.currentMonthPaid ? 'paid' : 'pending'}
                          label={m.currentMonthPaid ? 'PAID / അടച്ചു' : 'PENDING / ബാക്കി'}
                          size="sm"
                        />
                      </td>

                      {/* Total Paid */}
                      <td className="py-4 px-4 font-semibold text-emerald-800">
                        {formatCurrency(m.totalPaid)}
                      </td>

                      {/* Remaining Balance */}
                      <td className="py-4 px-4">
                        <span
                          className={`font-black text-base ${
                            m.pendingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {formatCurrency(m.pendingBalance)}
                        </span>
                        {m.unpaidMonthsCount > 0 && (
                          <div className="text-[11px] text-rose-700 font-semibold">
                            ({m.unpaidMonthsCount} mo. due)
                          </div>
                        )}
                      </td>

                      {/* Login Credentials & Password Reveal */}
                      <td className="py-4 px-4">
                        <div className="text-xs font-mono text-gray-800">
                          <span className="text-gray-400">User:</span> {m.username}
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-[11px] text-gray-400 font-mono">Pass:</span>
                          <span className="text-xs font-mono font-bold text-emerald-950">
                            {isRevealed
                              ? m.plainPasswordHint || '••••••'
                              : '••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordReveal(m.id)}
                            className="text-gray-400 hover:text-emerald-700 ml-1 p-0.5"
                            title={isRevealed ? 'Hide Password' : 'Show Password for Elder'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Record Payment Button */}
                          <button
                            onClick={() => {
                              setPayTargetMemberId(m.id);
                              setShowPaymentModal(true);
                            }}
                            className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold transition flex items-center space-x-1 text-xs"
                            title="Record Payment for this member"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">പണം അടയ്ക്കുക</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setMemberToEdit(m);
                              setShowMemberModal(true);
                            }}
                            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                            title="Edit Member"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteMember(m.id, m.name)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition"
                            title="Delete Member"
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

      {/* Modals */}
      {showMemberModal && (
        <MemberModal
          memberToEdit={memberToEdit}
          onClose={() => {
            setShowMemberModal(false);
            setMemberToEdit(null);
          }}
          onSuccess={() => {
            setShowMemberModal(false);
            setMemberToEdit(null);
            router.refresh();
          }}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          members={members}
          preSelectedMemberId={payTargetMemberId}
          onClose={() => {
            setShowPaymentModal(false);
            setPayTargetMemberId(undefined);
          }}
          onSuccess={(p) => {
            setShowPaymentModal(false);
            setSelectedReceipt(p);
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

      {showFixedFeeModal && (
        <FixedFeeModal
          currentFee={members[0]?.currentMonthFee || 50}
          upcomingFee={
            members[0]?.nextMonthFee && members[0]?.nextMonthFee !== (members[0]?.currentMonthFee || 50)
              ? { amount: members[0].nextMonthFee, effectiveFrom: `${currentPeriod.year}-${String(currentPeriod.month + 1).padStart(2, '0')}` }
              : undefined
          }
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


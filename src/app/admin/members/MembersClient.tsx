'use client';

import React, { useState } from 'react';
import { MemberSummary, Payment } from '@/lib/types';
import { formatCurrency, formatDate, MONTH_NAMES } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import MemberModal from '@/components/MemberModal';
import PaymentModal from '@/components/PaymentModal';
import ReceiptModal from '@/components/ReceiptModal';
import AdminMobileBottomNav from '@/components/AdminMobileBottomNav';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Search,
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-flex mb-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>മദ്റസ അംഗങ്ങളുടെ വിവരങ്ങൾ</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            അംഗങ്ങളുടെ പട്ടിക (Members Directory)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            അംഗങ്ങളെ ചേർക്കുക, വരിസംഖ്യ നില പരിശോധിക്കുക, അക്കൗണ്ട് വിവരങ്ങൾ നൽകുക.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={() => setShowFixedFeeModal(true)}
            className="flex items-center justify-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-600 font-bold transition text-xs sm:text-sm"
          >
            <IndianRupee className="w-3.5 h-3.5 text-emerald-700" />
            <span>നിശ്ചിത വരിസംഖ്യ ({formatCurrency(members[0]?.currentMonthFee || 50)})</span>
          </button>

          <button
            onClick={() => {
              setMemberToEdit(null);
              setShowMemberModal(true);
            }}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ പുതിയ അംഗത്തെ ചേർക്കുക</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Scrollable Tabs on Mobile */}
          <div className="flex overflow-x-auto no-scrollbar items-center gap-1.5 pb-1 md:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              എല്ലാം ({totalMembers})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1 whitespace-nowrap ${
                filter === 'paid'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>അടച്ചവർ ({paidMembersCount})</span>
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center space-x-1 whitespace-nowrap ${
                filter === 'pending'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>ബാക്കിയുള്ളവർ ({pendingMembersCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="പേര്, ഫോൺ, അംഗത്വം നമ്പർ..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-300 focus:border-emerald-600 focus:outline-hidden text-xs sm:text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Mobile Card Feed (< md) */}
      <div className="md:hidden space-y-3">
        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 text-sm border border-gray-200">
            അംഗങ്ങളെ കണ്ടെത്തിയില്ല.
          </div>
        ) : (
          filteredMembers.map((m) => {
            const isRevealed = revealedPasswords[m.id];
            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-4 shadow-xs border border-gray-200 space-y-3"
              >
                {/* Header: Name, Code & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{m.name}</h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                      <span className="font-mono font-bold text-emerald-800">{m.memberCode}</span>
                      {m.phone && (
                        <>
                          <span>•</span>
                          <a
                            href={`tel:${m.phone}`}
                            className="text-emerald-700 font-semibold hover:underline flex items-center"
                          >
                            <Phone className="w-3 h-3 mr-0.5" />
                            {m.phone}
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                  <StatusBadge isPaid={m.currentMonthPaid} size="sm" />
                </div>

                {/* Financial Summary Pill */}
                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">മാസ വരിസംഖ്യ</span>
                    <span className="font-black text-gray-900">{formatCurrency(m.monthlyFee)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">ആകെ അടച്ചത്</span>
                    <span className="font-black text-emerald-800">{formatCurrency(m.totalPaid)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">ബാക്കി തുക</span>
                    <span
                      className={`font-black ${
                        m.pendingBalance > 0 ? 'text-rose-700' : 'text-gray-400'
                      }`}
                    >
                      {formatCurrency(m.pendingBalance)}
                    </span>
                  </div>
                </div>

                {/* Login Credentials Box */}
                <div className="flex items-center justify-between text-xs bg-emerald-50/50 px-3 py-2 rounded-xl border border-emerald-100">
                  <div className="flex items-center space-x-1.5 font-mono">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                    <span className="font-bold text-emerald-950">{m.username}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-800">
                      {isRevealed ? m.plainPasswordHint || 'user123' : '••••••••'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePasswordReveal(m.id)}
                    className="text-emerald-800 hover:text-emerald-950 text-xs font-bold"
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100 gap-2">
                  <button
                    onClick={() => {
                      setPayTargetMemberId(m.id);
                      setShowPaymentModal(true);
                    }}
                    className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>വരിസംഖ്യ ചേർക്കുക</span>
                  </button>

                  <button
                    onClick={() => {
                      setMemberToEdit(m);
                      setShowMemberModal(true);
                    }}
                    className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteMember(m.id, m.name)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table (>= md) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4">അംഗം / കോഡ്</th>
                <th className="py-3 px-4">ഫോൺ നമ്പർ</th>
                <th className="py-3 px-4">മാസ വരിസംഖ്യ</th>
                <th className="py-3 px-4">{currentMonthName} സ്റ്റാറ്റസ്</th>
                <th className="py-3 px-4">ആകെ അടച്ചത്</th>
                <th className="py-3 px-4">ബാക്കി തുക</th>
                <th className="py-3 px-4">ലോഗിൻ വിവരങ്ങൾ</th>
                <th className="py-3 px-4 text-right">നടപടികൾ</th>
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
                    <tr key={m.id} className="hover:bg-emerald-50/20 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{m.name}</div>
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

                      <td className="py-3.5 px-4">
                        {m.phone ? (
                          <a
                            href={`tel:${m.phone}`}
                            className="font-semibold text-gray-800 hover:text-emerald-700 flex items-center text-xs"
                          >
                            <Phone className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            {m.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-black text-gray-900">
                        {formatCurrency(m.monthlyFee)}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge isPaid={m.currentMonthPaid} size="sm" />
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-800">
                        {formatCurrency(m.totalPaid)}
                      </td>

                      <td className="py-3.5 px-4 font-bold">
                        {m.pendingBalance > 0 ? (
                          <span className="text-rose-700 font-black">
                            {formatCurrency(m.pendingBalance)}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold text-xs">ബാക്കിയില്ല (Nil)</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs font-mono bg-gray-50 p-1.5 rounded-lg border flex items-center justify-between space-x-1">
                          <span className="text-gray-700">
                            {m.username} / {isRevealed ? m.plainPasswordHint || 'user123' : '••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordReveal(m.id)}
                            className="text-emerald-700 hover:text-emerald-900"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              setPayTargetMemberId(m.id);
                              setShowPaymentModal(true);
                            }}
                            className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                            title="Collect Fee"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setMemberToEdit(m);
                              setShowMemberModal(true);
                            }}
                            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m.id, m.name)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            title="Delete"
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

      {/* Mobile Bottom Thumb Navigation */}
      <AdminMobileBottomNav onQuickPayment={() => { setPayTargetMemberId(undefined); setShowPaymentModal(true); }} />

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

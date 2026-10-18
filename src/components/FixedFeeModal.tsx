'use client';

import React, { useState } from 'react';
import { formatCurrency, formatMonthYear, getNextYearMonth, getCurrentYearMonth, MONTH_NAMES } from '@/lib/utils';
import { X, IndianRupee, Calendar, AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

interface FixedFeeModalProps {
  currentFee: number;
  upcomingFee?: {
    amount: number;
    effectiveFrom: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function FixedFeeModal({
  currentFee,
  upcomingFee,
  onClose,
  onSuccess,
}: FixedFeeModalProps) {
  const currentPeriod = getCurrentYearMonth();
  const nextPeriod = getNextYearMonth();
  const currentMonthName = MONTH_NAMES[currentPeriod.month - 1];
  const nextMonthName = MONTH_NAMES[nextPeriod.month - 1];

  const [newAmount, setNewAmount] = useState<string>(
    upcomingFee ? String(upcomingFee.amount) : String(currentFee)
  );
  const [effectiveMonthKey, setEffectiveMonthKey] = useState<string>(nextPeriod.key);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(newAmount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid monthly fee amount (greater than ₹0)');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/settings/fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: val,
          effectiveFrom: effectiveMonthKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update fixed monthly fee');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700/80 flex items-center justify-center border border-emerald-500/40">
              <IndianRupee className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold">നിശ്ചിത വരിസംഖ്യ മാറ്റുക</h2>
              <p className="text-xs text-emerald-200">Change Madrasa Fixed Monthly Fee</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 text-sm font-semibold flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Status Badge */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block">
                ഈ മാസത്തെ നിരക്ക് ({currentMonthName} {currentPeriod.year})
              </span>
              <span className="text-2xl font-black text-gray-900 mt-0.5 block">
                {formatCurrency(currentFee)} <span className="text-xs font-normal text-gray-500">/ മാസം (Fixed)</span>
              </span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                നിലവിൽ സജീവം
              </span>
            </div>
          </div>

          {/* Upcoming change notice if already scheduled */}
          {upcomingFee && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start space-x-3">
              <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-bold block text-sm">
                  നേരത്തെ ഷെഡ്യൂൾ ചെയ്ത മാറ്റം: {formatCurrency(upcomingFee.amount)} / മാസം
                </span>
                <span>
                  <strong>{formatMonthYear(upcomingFee.effectiveFrom)}</strong> മുതൽ നിലവിൽ വരാൻ നിശ്ചയിച്ചിട്ടുണ്ട്.
                  താഴെ പുതിയ തുക നൽകി ഇത് മാറ്റാവുന്നതാണ്.
                </span>
              </div>
            </div>
          )}

          {/* New Fixed Fee Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1.5 flex items-center">
              <IndianRupee className="w-4 h-4 mr-1 text-emerald-700" />
              പുതിയ നിശ്ചിത പ്രതിമാസ തുക (New Fixed Amount ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="10"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="50"
                className="w-full pl-9 pr-4 py-3 rounded-2xl border-2 border-emerald-300 focus:border-emerald-600 focus:outline-hidden text-2xl font-black text-emerald-950 bg-emerald-50/30"

                required
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              എല്ലാ അംഗങ്ങൾക്കും ഈ ഒരൊറ്റ തുകയായിരിക്കും നിശ്ചിത വരിസംഖ്യ (Fixed for all members).
            </p>
          </div>

          {/* Effective Month Rule Indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
              <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
              <span>പ്രാബല്യത്തിൽ വരുന്ന സമയം (Comes into Action)</span>
            </div>
            <div className="flex items-center space-x-2 text-sm font-semibold text-blue-950 bg-white p-2.5 rounded-xl border border-blue-200">
              <span className="text-gray-500">{currentMonthName} {currentPeriod.year} (₹{currentFee})</span>
              <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-emerald-700 font-bold">
                {nextMonthName} {nextPeriod.year} മുതൽ: ₹{newAmount || '...'}
              </span>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              ℹ️ <strong>ശ്രദ്ധിക്കുക:</strong> ഈ മാറ്റം അടുത്ത മാസം (<strong>{nextMonthName} {nextPeriod.year}</strong>)
              മുതൽ മാത്രമേ പ്രാബല്യത്തിൽ വരൂ. നിലവിലെ മാസത്തെയും മുൻപത്തെ മാസങ്ങളിലെയും കുടിശ്ശിക കണക്കുകൾ പഴയ നിരക്കിൽ തന്നെയായിരിക്കും.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition text-sm"
            >
              റദ്ദാക്കുക (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-md flex items-center space-x-2 text-sm disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'സേവ് ചെയ്യുന്നു...' : 'അടുത്ത മാസം മുതൽ നടപ്പിലാക്കുക'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

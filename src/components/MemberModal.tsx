'use client';

import React, { useState } from 'react';
import { Member, MemberSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { X, UserPlus, KeyRound, Phone, Home, IndianRupee, ShieldCheck } from 'lucide-react';


interface MemberModalProps {
  memberToEdit?: Member | MemberSummary | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MemberModal({ memberToEdit, onClose, onSuccess }: MemberModalProps) {
  const isEditing = Boolean(memberToEdit);

  const [name, setName] = useState(memberToEdit?.name || '');
  const [memberCode, setMemberCode] = useState(memberToEdit?.memberCode || '');
  const [phone, setPhone] = useState(memberToEdit?.phone || '');
  const [address, setAddress] = useState(memberToEdit?.address || '');
  const [monthlyFee, setMonthlyFee] = useState<string>(
    memberToEdit ? String(memberToEdit.monthlyFee) : '50'
  );

  const [joiningDate, setJoiningDate] = useState(memberToEdit?.joiningDate || '2026-01');
  const [username, setUsername] = useState(memberToEdit?.username || '');
  const [password, setPassword] = useState(
    memberToEdit?.plainPasswordHint || (isEditing ? '' : 'user123')
  );
  const [status, setStatus] = useState<'active' | 'inactive'>(memberToEdit?.status || 'active');
  const [notes, setNotes] = useState(memberToEdit?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate username suggestion if typing name on new member
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing && !username) {
      const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
      if (clean) setUsername(`${clean}${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      setError('Name and Username are required');
      return;
    }
    if (!isEditing && !password.trim()) {
      setError('Password is required for new member login');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = isEditing ? `/api/members/${memberToEdit!.id}` : '/api/members';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          memberCode: memberCode.trim(),
          phone: phone.trim(),
          address: address.trim(),
          monthlyFee: Number(monthlyFee) || 50,
          joiningDate,
          username: username.trim().toLowerCase(),
          password: password.trim(),
          status,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save member');
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
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-6 h-6 text-emerald-300" />
            <div>
              <h2 className="text-xl font-bold">
                {isEditing ? 'അംഗത്തിന്റെ വിവരങ്ങൾ പുതുക്കുക' : 'പുതിയ അംഗത്തെ ചേർക്കുക'}
              </h2>
              <p className="text-xs text-emerald-200">
                {isEditing ? 'Edit Madrasa Member Details' : 'Add New Madrasa Member (Admin Created)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-sm font-semibold">
              {error}
            </div>
          )}

          {/* Member Name */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              അംഗത്തിന്റെ പേര് (Full Name) *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter full name"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden font-medium text-gray-900"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Member Code */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center justify-between">
                <span>അംഗത്വം നമ്പർ (Member Code)</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 uppercase font-bold">
                  {isEditing ? 'Permanent' : 'Auto'}
                </span>
              </label>
              <input
                type="text"
                value={isEditing ? memberCode : 'Auto-generated (NI-101...)'}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 font-mono text-sm cursor-not-allowed select-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                ഫോൺ നമ്പർ (Phone)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden text-sm"
              />
            </div>
          </div>

          {/* House Address */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center">
              <Home className="w-3.5 h-3.5 mr-1 text-emerald-700" />
              വീട്ടുപേര് / സ്ഥലം (Address / House Name)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House name / address"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden text-sm"
            />
          </div>

          {/* Monthly Subscription & Joining Month */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center">
                <IndianRupee className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                നിശ്ചിത വരിസംഖ്യ (Fixed Monthly Fee)
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-xl border-2 border-emerald-200 bg-emerald-50/60 font-black text-emerald-900 flex items-center justify-between">
                <span>{formatCurrency(Number(monthlyFee) || 50)} / മാസം</span>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                  നിശ്ചിത തുക (Fixed)
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                എല്ലാ അംഗങ്ങൾക്കും ഒരേ നിശ്ചിത തുകയായിരിക്കും.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                തുടങ്ങിയ മാസം (Joined Month)
              </label>
              <input
                type="month"
                value={joiningDate.slice(0, 7)}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden text-sm"
              />
            </div>
          </div>

          {/* Member Login Credentials Section */}
          <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <span>അംഗത്തിനുള്ള ലോഗിൻ വിവരങ്ങൾ (Member Login Credentials)</span>
            </div>
            <p className="text-xs text-gray-600">
              അംഗങ്ങൾക്ക് സ്വന്തമായി രജിസ്റ്റർ ചെയ്യാൻ കഴിയില്ല. അഡ്മിൻ നൽകുന്ന ഈ യൂസർ നെയിമും പാസ്‌വേഡും ഉപയോഗിച്ച് അവർക്ക് സ്റ്റാറ്റസ് കാണാം.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  യൂസർ നെയിം (Username) *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-600 focus:outline-hidden font-mono text-sm bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  പാസ്‌വേഡ് (Password) {isEditing ? '(മാറ്റാൻ മാത്രം നൽകുക)' : '*'}
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? 'Leave blank to keep unchanged' : 'Password'}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-600 focus:outline-hidden font-mono text-sm bg-white"
                  required={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Status & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                സ്റ്റാറ്റസ് (Account Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden text-sm"
              >
                <option value="active">Active (സജീവം)</option>
                <option value="inactive">Inactive (നിഷ്ക്രിയം)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                കുറിപ്പുകൾ (Notes)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-md disabled:opacity-50 text-base min-h-[44px]"
            >
              {isSubmitting
                ? 'സേവ് ചെയ്യുന്നു...'
                : isEditing
                ? 'സേവ് ചെയ്യുക (Update Member)'
                : 'അംഗത്തെ ചേർക്കുക (Add Member)'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto order-2 sm:order-1 px-4 py-2.5 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

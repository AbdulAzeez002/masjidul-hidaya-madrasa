'use client';

import React, { useState, useEffect } from 'react';
import { Announcement } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import AnnouncementModal from '@/components/AnnouncementModal';
import AdminMobileBottomNav from '@/components/AdminMobileBottomNav';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  PlusCircle,
  Pin,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  User,
} from 'lucide-react';

interface AnnouncementsClientProps {
  initialAnnouncements: Announcement[];
}

export default function AnnouncementsClient({ initialAnnouncements }: AnnouncementsClientProps) {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<Announcement | null>(null);

  useEffect(() => {
    setAnnouncements(initialAnnouncements);
  }, [initialAnnouncements]);

  const reloadAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const data = await res.json();
        if (data.announcements) setAnnouncements(data.announcements);
      }
    } catch (e) {
      console.error('Failed to reload announcements:', e);
    }
    router.refresh();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete notice "${title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        await reloadAnnouncements();
      } else {
        alert('Failed to delete announcement');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting announcement');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-8 pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm sm:shadow-md border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex mb-2">
            <Megaphone className="w-4 h-4 text-emerald-700" />
            <span>മദ്റസ അറിയിപ്പുകൾ</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">
            അറിയിപ്പ് ബോർഡ് (Announcements)
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
            യോഗങ്ങൾ, വരിസംഖ്യ കളക്ഷൻ അറിയിപ്പുകൾ, മദ്റസ വിശേഷങ്ങൾ അംഗങ്ങളുമായി പങ്കുവെക്കുക.
          </p>
        </div>

        <button
          onClick={() => {
            setAnnouncementToEdit(null);
            setShowModal(true);
          }}
          className="flex items-center justify-center space-x-2 w-full md:w-auto px-5 py-3 rounded-xl sm:rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-sm text-sm sm:text-base min-h-[44px]"
        >
          <PlusCircle className="w-5 h-5" />
          <span>പുതിയ അറിയിപ്പ് നൽകുക</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center text-gray-500 shadow-sm border border-gray-200 text-sm sm:text-base">
            നിലവിൽ അറിയിപ്പുകൾ ഒന്നുമില്ല. മുകളിൽ കാണുന്ന ബട്ടൺ വഴി പുതിയ അറിയിപ്പുകൾ നൽകാം.
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-sm sm:shadow-md border transition ${
                ann.isPinned
                  ? 'border-amber-400 bg-amber-50/20 shadow-amber-100'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {ann.isPinned && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <Pin className="w-3.5 h-3.5 mr-1 text-amber-700" />
                        പ്രധാനം (Pinned)
                      </span>
                    )}

                    {ann.priority === 'urgent' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                        അടിയന്തിരം (Urgent)
                      </span>
                    )}

                    <span className="text-xs text-gray-500 font-semibold flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-gray-400" />
                      {formatDate(ann.date)}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                    {ann.title}
                  </h2>

                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-normal whitespace-pre-wrap">
                    {ann.content}
                  </p>

                  <div className="text-xs text-gray-500 font-semibold pt-2 flex items-center">
                    <User className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    അറിയിപ്പ് നൽകിയത്: <span className="text-gray-800 font-bold ml-1">{ann.author}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 justify-end">
                  <button
                    onClick={() => {
                      setAnnouncementToEdit(ann);
                      setShowModal(true);
                    }}
                    className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
                    title="Edit notice"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(ann.id, ann.title)}
                    className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold transition"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <AnnouncementModal
          announcementToEdit={announcementToEdit}
          onClose={() => {
            setShowModal(false);
            setAnnouncementToEdit(null);
          }}
          onSuccess={async () => {
            setShowModal(false);
            setAnnouncementToEdit(null);
            await reloadAnnouncements();
          }}
        />
      )}

      {/* Mobile Bottom Sticky Navigation */}
      <AdminMobileBottomNav onQuickPayment={() => router.push('/admin/payments')} />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Announcement } from '@/lib/types';
import { X, Megaphone, Pin, AlertTriangle } from 'lucide-react';

interface AnnouncementModalProps {
  announcementToEdit?: Announcement | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AnnouncementModal({
  announcementToEdit,
  onClose,
  onSuccess,
}: AnnouncementModalProps) {
  const isEditing = Boolean(announcementToEdit);

  const [title, setTitle] = useState(announcementToEdit?.title || '');
  const [content, setContent] = useState(announcementToEdit?.content || '');
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>(
    announcementToEdit?.priority || 'normal'
  );
  const [isPinned, setIsPinned] = useState<boolean>(announcementToEdit?.isPinned || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = isEditing ? `/api/announcements/${announcementToEdit!.id}` : '/api/announcements';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          priority,
          isPinned,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save announcement');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Megaphone className="w-6 h-6 text-emerald-300" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                {isEditing ? 'അറിയിപ്പ് മാറ്റം വരുത്തുക' : 'പുതിയ അറിയിപ്പ് നൽകുക'}
              </h2>
              <p className="text-xs text-emerald-200">Post Madrasa Announcement for Members</p>
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 text-sm font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              അറിയിപ്പിന്റെ തലക്കെട്ട് (Title) *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notice title"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden font-bold text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1">
              വിശദവിവരങ്ങൾ (Announcement Content) *
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write announcement details here..."
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden text-sm leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                പ്രാധാന്യം (Priority)
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden text-sm font-medium"
              >
                <option value="normal">Normal (സാധാരണ)</option>
                <option value="important">Important (പ്രധാനം)</option>
                <option value="urgent">Urgent (അടിയന്തിരം)</option>
              </select>
            </div>

            <div className="pt-5">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                />
                <span className="text-sm font-bold text-gray-800 flex items-center">
                  <Pin className="w-4 h-4 mr-1 text-emerald-600" />
                  മുകളിൽ പിൻ ചെയ്യുക (Pin to Top)
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-md disabled:opacity-50 text-base min-h-[44px]"
            >
              {isSubmitting ? 'പോസ്റ്റ് ചെയ്യുന്നു...' : 'പ്രസിദ്ധീകരിക്കുക (Publish Notice)'}
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

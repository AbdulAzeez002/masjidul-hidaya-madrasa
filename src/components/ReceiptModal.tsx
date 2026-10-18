'use client';

import React from 'react';
import { Payment } from '@/lib/types';
import { formatCurrency, formatDate, MONTH_NAMES } from '@/lib/utils';
import { Printer, Share2, X, CheckCircle, Building2 } from 'lucide-react';

interface ReceiptModalProps {
  payment: Payment;
  onClose: () => void;
}

export default function ReceiptModal({ payment, onClose }: ReceiptModalProps) {
  const monthName = MONTH_NAMES[payment.forMonth - 1] || `Month ${payment.forMonth}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `*നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ - കിഴക്കേത്തല ശാഖ*\n*NASRUTHUL ISLAM MADRASA (KIYAKETHALA)*\n-------------------------------\n*രസീത് നമ്പർ / Receipt No:* ${payment.receiptNumber}\n*അംഗത്തിന്റെ പേര് / Member:* ${payment.memberName}\n*തുക / Amount Paid:* ${formatCurrency(payment.amount)}\n*മാസം / Month:* ${monthName} ${payment.forYear}\n*തീയതി / Date:* ${formatDate(payment.paymentDate)}\n*പേയ്മെന്റ് രീതി / Mode:* ${payment.paymentMode}\n-------------------------------\nJazakallahu Khairan for your sincere contribution!`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar (Hidden in print) */}
        <div className="no-print bg-emerald-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-300" />
            <h2 className="text-lg font-bold">മദ്റസ രസീത് / Payment Receipt</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-4 sm:p-8 space-y-4 sm:space-y-6 text-gray-900 overflow-y-auto">
          {/* Madrasa Letterhead Header */}
          <div className="border-b-2 border-emerald-800 pb-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mb-2">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-emerald-900 tracking-wide">
              നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ
            </h1>
            <p className="text-lg font-bold text-gray-800">
              NASRUTHUL ISLAM MADRASA
            </p>
            <p className="text-sm font-semibold text-emerald-700">
              കിഴക്കേത്തല ശാഖ / KIYAKETHALA BRANCH
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-md text-xs font-bold uppercase tracking-wider">
              മാസ വരിസംഖ്യ രസീത് / Monthly Subscription Receipt
            </span>
          </div>

          {/* Receipt Meta info */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">രസീത് നമ്പർ / Receipt No:</span>
              <span className="font-mono font-bold text-gray-900 text-base">{payment.receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-500 block text-xs">തീയതി / Date:</span>
              <span className="font-semibold text-gray-900">{formatDate(payment.paymentDate)}</span>
            </div>
          </div>

          {/* Receipt Details Table */}
          <div className="space-y-3 text-base">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">അംഗത്തിന്റെ പേര് (Member):</span>
              <span className="font-bold text-gray-900 text-lg">{payment.memberName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">വരിസംഖ്യ മാസം (For Month):</span>
              <span className="font-semibold text-gray-900">
                {monthName} {payment.forYear}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">പണമടച്ച രീതി (Payment Mode):</span>
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                {payment.paymentMode}
              </span>
            </div>
            {payment.notes && (
              <div className="flex justify-between py-2 border-b border-gray-100 text-sm">
                <span className="text-gray-500">കുറിപ്പ് (Notes):</span>
                <span className="text-gray-700 italic">{payment.notes}</span>
              </div>
            )}
          </div>

          {/* Big Amount Box */}
          <div className="bg-emerald-50 border-2 border-emerald-600 p-4 rounded-xl flex items-center justify-between">
            <span className="text-emerald-900 font-bold text-lg">
              സ്വീകരിച്ച തുക / Received Amount:
            </span>
            <span className="text-3xl font-black text-emerald-800">
              {formatCurrency(payment.amount)}
            </span>
          </div>

          {/* Signature / Footer */}
          <div className="pt-8 flex justify-between items-end text-xs text-gray-500">
            <div>
              <p>രേഖപ്പെടുത്തിയത്: {payment.recordedBy || 'Admin'}</p>
              <p className="text-[11px] text-gray-400">Computer Generated Receipt</p>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-gray-400 mb-1"></div>
              <p className="font-semibold text-gray-700">അധികൃത ഒപ്പ് / Auth. Signature</p>
              <p className="text-[10px]">Madrasa Committee, Kiyakethala</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons (Hidden in print) */}
        <div className="no-print bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm text-sm min-h-[44px]"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp-ൽ അയക്കുക</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition shadow-sm text-sm min-h-[44px]"
            >
              <Printer className="w-4 h-4" />
              <span>പ്രിന്റ് / Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition text-sm min-h-[44px]"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

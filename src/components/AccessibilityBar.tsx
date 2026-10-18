'use client';

import React, { useEffect, useState } from 'react';
import { Eye, Type, Phone, HelpCircle } from 'lucide-react';

export default function AccessibilityBar() {
  const [fontSize, setFontSize] = useState<'normal' | 'lg' | 'xl'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // Read saved preferences from localStorage
    const savedSize = localStorage.getItem('ni_font_size') as 'normal' | 'lg' | 'xl' | null;
    const savedContrast = localStorage.getItem('ni_contrast') === 'true';

    if (savedSize) setFontSize(savedSize);
    if (savedContrast) setHighContrast(savedContrast);
  }, []);

  useEffect(() => {
    // Apply classes to document body
    document.body.classList.remove('font-lg', 'font-xl');
    if (fontSize === 'lg') document.body.classList.add('font-lg');
    if (fontSize === 'xl') document.body.classList.add('font-xl');
    localStorage.setItem('ni_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('ni_contrast', String(highContrast));
  }, [highContrast]);

  return (
    <>
      <div className="bg-emerald-900 text-white text-sm py-1.5 px-4 no-print border-b border-emerald-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Madrasa branch identifier */}
          <div className="flex items-center space-x-2 font-medium">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ - കിഴക്കേത്തല ശാഖ (Kiyakethala Branch)</span>
          </div>

          {/* Accessibility controls */}
          <div className="flex items-center space-x-4">
            {/* Font Size Selector */}
            <div className="flex items-center space-x-1 bg-emerald-950/70 rounded-lg px-2 py-0.5 border border-emerald-700/60">
              <span className="text-xs text-emerald-200 mr-1 flex items-center">
                <Type className="w-3.5 h-3.5 mr-0.5" />
                Text Size:
              </span>
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                  fontSize === 'normal' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-200 hover:text-white'
                }`}
                title="Normal text size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 rounded text-sm font-bold transition ${
                  fontSize === 'lg' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-200 hover:text-white'
                }`}
                title="Large text size (for easier reading)"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xl')}
                className={`px-2 py-0.5 rounded text-base font-bold transition ${
                  fontSize === 'xl' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-200 hover:text-white'
                }`}
                title="Extra large text size"
              >
                A++
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md transition font-medium border ${
                highContrast
                  ? 'bg-amber-400 text-black border-amber-300 font-bold'
                  : 'bg-emerald-950/60 text-emerald-200 border-emerald-700/60 hover:text-white'
              }`}
              title="Toggle High Contrast for sharp visibility"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{highContrast ? 'High Contrast: ON' : 'High Contrast'}</span>
            </button>

            {/* Elder Help Button */}
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center space-x-1 text-xs text-emerald-100 hover:text-white bg-emerald-800 hover:bg-emerald-700 px-2 py-1 rounded border border-emerald-600 transition"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>സഹായം / Help</span>
            </button>
          </div>
        </div>
      </div>

      {/* Elder Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-emerald-600">
            <div className="flex items-center space-x-3 text-emerald-800 mb-4">
              <Phone className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold">മദ്റസ സഹായ വിഭാഗം</h3>
                <p className="text-sm text-gray-600">Madrasa Support & Helpline</p>
              </div>
            </div>

            <div className="space-y-4 text-gray-800 text-base">
              <p className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 leading-relaxed">
                താങ്കളുടെ <strong>യൂസർ നെയിം</strong> അല്ലെങ്കിൽ <strong>പാസ്‌വേഡ്</strong> മറന്നുപോവുകയോ, പണം അടച്ചതിൽ സംശയങ്ങൾ ഉണ്ടെങ്കിലോ മദ്റസ ഓഫീസുമായി താഴെ കാണുന്ന നമ്പറിൽ ബന്ധപ്പെടുക.
              </p>

              <div className="bg-gray-100 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">General Secretary:</span>
                  <a href="tel:9847000001" className="text-emerald-700 font-bold hover:underline">
                    +91 98470 00001
                  </a>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Treasurer:</span>
                  <a href="tel:9847123456" className="text-emerald-700 font-bold hover:underline">
                    +91 98471 23456
                  </a>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold text-gray-700">Madrasa Office:</span>
                  <span className="text-gray-900 font-medium">Kiyakethala Branch</span>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                💡 <strong>Tip for Elders:</strong> മുകളിലെ <strong>A+</strong> അല്ലെങ്കിൽ <strong>A++</strong> ബട്ടൺ അമർത്തിയാൽ അക്ഷരങ്ങൾ കൂടുതൽ വലുതായി വായിക്കാൻ സാധിക്കും.
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow transition text-lg"
            >
              ശരി / Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

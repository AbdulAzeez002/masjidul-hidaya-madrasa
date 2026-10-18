import React from 'react';
import { Building2, Heart, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-white mt-auto border-t-4 border-emerald-700 no-print">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Madrasa details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-emerald-300">
              <Building2 className="w-6 h-6" />
              <span className="text-lg font-black tracking-wide">നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ</span>
            </div>
            <p className="text-sm text-emerald-100 font-semibold">
              കിഴക്കേത്തല ശാഖ (Nasruthul Islam Kiyakethala Branch)
            </p>
            <p className="text-xs text-emerald-200/80 leading-relaxed">
              മദ്റസയുടെ പ്രവർത്തനങ്ങൾക്കും ദീനീ സ്ഥാപനത്തിന്റെ പുരോഗതിക്കും വേണ്ടിയുള്ള പ്രതിമാസ വരിസംഖ്യ ശേഖരണ സംവിധാനം.
            </p>
          </div>

          {/* Quick Help & Contact for Elders */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
              സഹായ നമ്പർ / Helpline
            </h4>
            <div className="space-y-1.5 text-sm text-emerald-100">
              <p className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>ഓഫീസ്: +91 98470 00001 / 98471 23456</span>
              </p>
              <p className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>കിഴക്കേത്തല, മലപ്പുറം ജില്ല, കേരളം</span>
              </p>
            </div>
          </div>

          {/* Du'a and blessings */}
          <div className="space-y-2 md:text-right">
            <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
              പ്രാർത്ഥനയോടെ
            </h4>
            <p className="text-sm italic text-emerald-200">
              "അല്ലാഹു നമ്മുടെ സ്വദഖകളും സേവനങ്ങളും സ്വീകരിക്കുമാറാകട്ടെ - ആമീൻ."
            </p>
            <p className="text-xs text-emerald-400/80 pt-2">
              Nasruthul Islam Kiyakethala Branch © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

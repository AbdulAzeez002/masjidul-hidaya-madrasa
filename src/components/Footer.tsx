import React from 'react';
import { Building2, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-emerald-950 text-white mt-auto border-t-4 border-emerald-700 no-print">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Madrasa details */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5 text-emerald-300">
              <Building2 className="w-6 h-6" />
              <span className="text-xl font-black tracking-wide">നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ</span>
            </div>
            <p className="text-sm text-emerald-100 font-semibold">
              കിഴക്കേത്തല ശാഖ (Nasruthul Islam Kiyakethala Branch)
            </p>
            <p className="text-xs text-emerald-200/80 leading-relaxed max-w-lg">
              മദ്റസയുടെ പ്രവർത്തനങ്ങൾക്കും ദീനീ സ്ഥാപനത്തിന്റെ പുരോഗതിക്കും വേണ്ടിയുള്ള പ്രതിമാസ വരിസംഖ്യ ശേഖരണ സംവിധാനം.
            </p>
            <p className="text-xs text-emerald-400/80 pt-1">
              Nasruthul Islam Kiyakethala Branch © {new Date().getFullYear()}
            </p>
          </div>

          {/* Contact & Location */}
          <div className="space-y-2 md:pl-8">
            <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
              ബന്ധപ്പെടുക / Contact & Location
            </h4>
            <div className="space-y-2.5 text-sm text-emerald-100">
              <p className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:9745781373" className="hover:underline font-bold text-emerald-200">
                  +91 97457 81373
                </a>
              </p>
              <div className="flex items-start space-x-2 text-xs text-emerald-200/90 leading-relaxed">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Pullancheri Kizhakkethala Masjid and Madrasa</div>
                  <div>35V3+9H8, Pullancheri - Nellikkuth - Pandikkad Rd</div>
                  <div>Pullancheri, Keralam 676122</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

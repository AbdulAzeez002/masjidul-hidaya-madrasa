'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Users, CreditCard, AlertTriangle, PlusCircle } from 'lucide-react';

interface AdminMobileBottomNavProps {
  onQuickPayment?: () => void;
}

export default function AdminMobileBottomNav({ onQuickPayment }: AdminMobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Home', icon: BarChart3 },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/reports', label: 'Dues', icon: AlertTriangle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 lg:hidden shadow-lg no-print">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
                isActive ? 'text-emerald-800 font-bold' : 'text-gray-500 hover:text-gray-900 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-emerald-100 text-emerald-800' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}

        {onQuickPayment && (
          <button
            type="button"
            onClick={onQuickPayment}
            className="flex flex-col items-center justify-center flex-1 py-1 text-emerald-700 font-bold"
            title="Record Payment"
          >
            <div className="p-1 rounded-xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 text-emerald-900">+ Pay</span>
          </button>
        )}
      </div>
    </div>
  );
}

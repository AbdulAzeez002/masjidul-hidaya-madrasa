'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SessionUser } from '@/lib/types';
import {
  Building2,
  Users,
  CreditCard,
  Megaphone,
  BarChart3,
  LogOut,
  Menu,
  X,
  UserCheck,
  Shield,
} from 'lucide-react';

interface NavbarProps {
  currentUser?: SessionUser | null;
}

export default function Navbar({ currentUser }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.replace('/login');
    } catch (e) {
      console.error(e);
      window.location.replace('/login');
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/announcements', label: 'Notices', icon: Megaphone },
    { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  ];

  const memberLinks = [
    { href: '/member', label: 'My Status', icon: UserCheck },
  ];

  const links = isAdmin ? adminLinks : currentUser ? memberLinks : [];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          {/* Brand Logo & Name */}
          <Link
            href={isAdmin ? '/admin' : currentUser ? '/member' : '/login'}
            className="flex items-center space-x-3 group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black text-emerald-950 tracking-tight leading-tight">
                നസ്‌റത്തുൽ ഇസ്‌ലാം
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 tracking-wide">
                കിഴക്കേത്തല ശാഖ
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {currentUser && (
            <nav className="hidden lg:flex items-center space-x-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-900 font-bold'
                        : 'text-gray-600 hover:text-emerald-900 hover:bg-emerald-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-800' : 'text-gray-500'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Profile & Right Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            {currentUser ? (
              <>
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-slate-100/90 px-2.5 py-1.5 rounded-xl border border-slate-200/60">
                    <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                      {isAdmin ? <Shield className="w-3.5 h-3.5" /> : currentUser.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-gray-800 max-w-[120px] truncate">
                      {currentUser.name}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                    title="Logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>

                {/* Mobile hamburger menu */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-xl text-gray-700 hover:text-emerald-900 hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Toggle Navigation Menu"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-xs min-h-[40px] flex items-center"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && currentUser && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          <div className="p-3 bg-emerald-50 rounded-xl mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-sm font-bold">
                {isAdmin ? <Shield className="w-4 h-4" /> : currentUser.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-emerald-950 text-sm">{currentUser.name}</div>
                <div className="text-xs text-emerald-700 font-mono">
                  {currentUser.role === 'admin' ? 'Administrator' : currentUser.memberCode}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-bold transition ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

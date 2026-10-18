'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, KeyRound, User, Eye, EyeOff, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('ദയവായി യൂസർ നെയിമും പാസ്‌വേഡും നൽകുക (Please enter username and password)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Hard redirect ensures the newly set auth cookie is sent immediately on first load without stale router cache
      const targetUrl = data.user.role === 'admin' ? '/admin' : '/member';
      window.location.replace(targetUrl);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
      <div className="max-w-md w-full space-y-5 sm:space-y-6">
        {/* Madrasa Title Header */}
        <div className="text-center space-y-1.5 sm:space-y-2">
          <div className="inline-flex p-3 sm:p-3.5 bg-gradient-to-tr from-emerald-800 to-emerald-600 rounded-2xl sm:rounded-3xl text-white shadow-md sm:shadow-lg mb-1">
            <Building2 className="w-9 h-9 sm:w-12 sm:h-12" />
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-emerald-950 tracking-tight leading-tight">
            നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ
          </h1>
          <p className="text-sm sm:text-base font-bold text-emerald-700">
            കിഴക്കേത്തല ശാഖ (Kiyakethala Branch)
          </p>
          <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            മാസ വരിസംഖ്യ പോർട്ടൽ / Monthly Fee Tracker
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-md sm:shadow-xl border border-emerald-100 space-y-4 sm:space-y-6">
          <div className="border-b border-gray-100 pb-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">ലോഗിൻ / Sign In</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              അംഗങ്ങൾക്കും അഡ്മിനും ഇവിടെ ലോഗിൻ ചെയ്യാം
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl sm:rounded-2xl flex items-start space-x-2.5 text-rose-800">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div className="text-xs sm:text-sm font-semibold leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 flex items-center">
                <User className="w-4 h-4 mr-1 text-emerald-700" />
                യൂസർ നെയിം (Username)
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-3.5 py-3 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden text-base font-semibold text-gray-900 min-h-[48px]"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1 flex items-center justify-between">
                <span className="flex items-center">
                  <KeyRound className="w-4 h-4 mr-1 text-emerald-700" />
                  പാസ്‌വേഡ് (Password)
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center p-1"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 mr-0.5" /> മറയ്ക്കുക (Hide)
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 mr-0.5" /> കാണിക്കുക (Show)
                    </>
                  )}
                </button>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-3 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden text-base font-semibold text-gray-900 min-h-[48px]"
                  required
                />
              </div>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-black text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-md transition duration-150 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center space-x-2 min-h-[50px]"
            >
              {isLoading ? (
                <span>പരിശോധിക്കുന്നു...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  <span>തുടങ്ങുക / Log In</span>
                </>
              )}
            </button>
          </form>

          {/* Help Contact Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 text-xs text-gray-600 leading-relaxed text-center">
            <p className="mb-2">
              ലോഗിൻ വിവരങ്ങൾ ലഭിക്കാനോ സഹായത്തിനോ മദ്റസ ഓഫീസുമായി ബന്ധപ്പെടുക:
            </p>
            <div className="flex items-center justify-center space-x-2">
              <a
                href="tel:9745781373"
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs min-h-[36px]"
              >
                <span>ഫോൺ: 9745781373</span>
              </a>
              <a
                href="https://api.whatsapp.com/send?phone=919745781373&text=Assalamu%20Alaikum%2C%20I%20need%20help%20with%20my%20Madrasa%20login"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 rounded-lg font-bold text-xs min-h-[36px]"
              >
                <span>WhatsApp സഹായം</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

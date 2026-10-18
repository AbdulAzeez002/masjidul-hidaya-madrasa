'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, KeyRound, User, Eye, EyeOff, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

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

      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/member');
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Madrasa Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 bg-gradient-to-tr from-emerald-800 to-emerald-600 rounded-3xl text-white shadow-lg mb-2">
            <Building2 className="w-12 h-12" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
            നസ്‌റത്തുൽ ഇസ്‌ലാം മദ്റസ
          </h1>
          <p className="text-base font-bold text-emerald-700">
            കിഴക്കേത്തല ശാഖ (Kiyakethala Branch)
          </p>
          <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold uppercase tracking-wider">
            മാസ വരിസംഖ്യ പോർട്ടൽ / Monthly Fee Tracker
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border-2 border-emerald-100 space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-xl font-bold text-gray-900">ലോഗിൻ / Sign In</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              അംഗങ്ങൾക്കും അഡ്മിനും ഇവിടെ ലോഗിൻ ചെയ്യാം
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start space-x-3 text-rose-800">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <div className="text-sm font-semibold leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center">
                <User className="w-4 h-4 mr-1 text-emerald-700" />
                യൂസർ നെയിം (Username)
              </label>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. kunju101 or admin"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden text-base font-semibold text-gray-900"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center justify-between">
                <span className="flex items-center">
                  <KeyRound className="w-4 h-4 mr-1 text-emerald-700" />
                  പാസ്‌വേഡ് (Password)
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center"
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
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-emerald-600 focus:outline-hidden text-base font-semibold text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-black text-lg rounded-2xl shadow-lg transition duration-150 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center space-x-2"
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

          {/* Policy Notice: No Self Registration */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 leading-relaxed">
            <span className="font-bold block mb-0.5">ശ്രദ്ധിക്കുക (Notice):</span>
            വ്യക്തികൾക്ക് സ്വന്തമായി പുതിയ അക്കൗണ്ട് ഉണ്ടാക്കാൻ സാധ്യമല്ല. അഡ്മിൻ നൽകുന്ന വിവരങ്ങൾ ഉപയോഗിച്ചാണ് ലോഗിൻ ചെയ്യേണ്ടത്. ലോഗിൻ സംശയങ്ങൾക്ക് മദ്റസ ഓഫീസുമായി ബന്ധപ്പെടുക.
          </div>
        </div>

        {/* Demo Fast-Testing Accounts Card */}
        <div className="bg-white/90 border border-emerald-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>ടെസ്റ്റ് അക്കൗണ്ടുകൾ (Quick Demo Logins):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Admin */}
            <button
              type="button"
              onClick={() => fillCredentials('admin', 'admin123')}
              className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-left transition"
            >
              <div className="font-bold text-emerald-900 text-sm">Administrator</div>
              <div className="text-emerald-700 font-mono text-xs">admin / admin123</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Admin Management Portal</div>
            </button>

            {/* Test Member */}
            <button
              type="button"
              onClick={() => fillCredentials('user', 'user123')}
              className="p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-left transition"
            >
              <div className="font-bold text-gray-900 text-sm">Test Member (NI-001)</div>
              <div className="text-gray-700 font-mono text-xs">user / user123</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">₹50/mo • Member Portal</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

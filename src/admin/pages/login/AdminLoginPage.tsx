import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { storeDb } from '../../../database/store';
import { AdminUser } from '../../../types';

interface AdminLoginPageProps {
  onLoginSuccess: (admin: AdminUser) => void;
  onBackToStore: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToStore
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('कृपया अपना एडमिन यूज़रनेम और पासवर्ड दोनों दर्ज करें। (Please enter both username and password)');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = storeDb.verifyAdminLogin(username, password);
      setIsSubmitting(false);

      if (res.success && res.admin) {
        onLoginSuccess(res.admin);
      } else {
        setErrorMsg(res.message || 'अमान्य एडमिन यूज़रनेम या पासवर्ड। (Invalid admin credentials)');
      }
    }, 300);
  };

  const handleQuickFillDefault = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      {/* Top Bar */}
      <header className="border-b border-neutral-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-black font-black flex items-center justify-center text-sm font-serif">
            FP
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white font-serif">FASHION POINT</h1>
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 block">
              Store Administration System
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToStore}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-neutral-800 hover:border-neutral-700 bg-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Storefront (ग्राहक स्टोर पर जाएं)</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-300" />

          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black font-serif text-white tracking-tight">
              Admin Portal Sign In
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              सुरक्षित एडमिनिस्ट्रेटर लॉगिन • Restricted Store Management Portal
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                Admin Username (यूज़रनेम)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5 uppercase tracking-wider">
                Password (पासवर्ड)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-11 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Log In to Admin Panel (लॉगइन करें)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Default Credentials Helper Box */}
          <div className="mt-6 pt-5 border-t border-neutral-800">
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 text-xs">
              <div className="flex items-center justify-between text-neutral-400 font-semibold mb-1.5">
                <span className="flex items-center gap-1.5 text-neutral-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Default Owner Account:</span>
                </span>
                <button
                  type="button"
                  onClick={handleQuickFillDefault}
                  className="text-amber-400 hover:underline font-bold text-[11px]"
                >
                  Auto Fill (स्वतः भरें)
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-neutral-300 font-mono text-[11px] bg-neutral-900/60 p-2 rounded-lg border border-neutral-800">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-sans">Username:</span>
                  <span className="text-amber-300 font-bold">admin</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-sans">Password:</span>
                  <span className="text-amber-300 font-bold">admin123</span>
                </div>
              </div>
              <p className="text-[10px] text-neutral-500 mt-2 text-center">
                * लॉगिन करने के बाद आप नए एडमिन जोड़ सकते हैं और पासवर्ड भी बदल सकते हैं।
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Notice */}
      <footer className="py-4 text-center text-xs text-neutral-500 border-t border-neutral-900">
        Fashion Point Internal ERP • Authorized Personnel Only • IP Monitored
      </footer>
    </div>
  );
};

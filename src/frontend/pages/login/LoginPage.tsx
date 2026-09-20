import React, { useState } from 'react';
import { ShieldCheck, Sparkles, KeyRound, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { OtpVerificationView } from './OtpVerificationView';
import { PasswordVerificationView } from './PasswordVerificationView';
import { RegisterView } from './RegisterView';
import { GlassmorphicAuthStats } from './GlassmorphicAuthStats';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

type AuthTab = 'OTP' | 'PASSWORD' | 'REGISTER';

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('OTP');
  const [prefillName, setPrefillName] = useState('');
  const [prefillMobile, setPrefillMobile] = useState('');

  const handleLoginSuccess = (_user: any) => {
    // Navigate to customer account or previous destination
    onNavigate('/account');
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#09090b] text-white flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-hidden selection:bg-amber-400 selection:text-black">
      {/* AMBIENT GLOW SPHERES (Creating authentic frosted glass refractions) */}
      <div className="absolute top-1/4 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-amber-500/15 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute -top-10 right-1/3 w-72 h-72 rounded-full bg-rose-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* MAIN CONTAINER */}
      <div className="relative z-10 w-full max-w-5xl mx-auto">
        {/* Navigation & Brand Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 px-2">
          <button
            type="button"
            onClick={() => onNavigate('/home')}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 backdrop-blur-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Boutique</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-300 text-neutral-950 font-black flex items-center justify-center font-serif text-sm shadow-md shadow-amber-400/20">
              FP
            </div>
            <div>
              <span className="font-serif font-black tracking-tight text-sm text-white block">
                FASHION POINT
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300 block -mt-0.5">
                Privé Client Authentication
              </span>
            </div>
          </div>

          <div className="w-24 sm:w-28" />
        </div>

        {/* SPLIT GLASS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: BRAND PRIVILEGES & PERKS (Desktop only) */}
          <div className="hidden lg:block lg:col-span-6 p-8 rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <GlassmorphicAuthStats />
          </div>

          {/* RIGHT: PREMIUM GLASSMORPHISM AUTHENTICATION CARD */}
          <div className="lg:col-span-6 max-w-lg mx-auto w-full">
            <div className="relative p-6 sm:p-8 rounded-3xl bg-neutral-900/50 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/80">
              {/* Glass Card Specular Highlight Edge */}
              <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              {/* Card Title & Subtitle */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/[0.07] border border-white/20 text-amber-300 shadow-inner mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
                  {activeTab === 'OTP'
                    ? 'Instant OTP Sign In'
                    : activeTab === 'PASSWORD'
                    ? 'Secure Password Access'
                    : 'Create Verified Account'}
                </h1>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  {activeTab === 'OTP'
                    ? 'Passwordless 6-digit authentication generated and verified by backend'
                    : activeTab === 'PASSWORD'
                    ? 'Cryptographically verified with salted bcrypt password hash'
                    : 'Register for orders, address book, and exclusive member sales'}
                </p>
              </div>

              {/* GLASS TAB SWITCHER */}
              <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/10 mb-6 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setActiveTab('OTP')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'OTP'
                      ? 'bg-gradient-to-r from-white/[0.15] to-white/[0.08] text-amber-300 border border-white/20 shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>OTP Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('PASSWORD')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'PASSWORD'
                      ? 'bg-gradient-to-r from-white/[0.15] to-white/[0.08] text-amber-300 border border-white/20 shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('REGISTER')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'REGISTER'
                      ? 'bg-gradient-to-r from-white/[0.15] to-white/[0.08] text-amber-300 border border-white/20 shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>

              {/* ACTIVE AUTH VIEW */}
              <div className="min-h-[280px]">
                {activeTab === 'OTP' && (
                  <OtpVerificationView
                    onSuccess={handleLoginSuccess}
                    onSwitchToPassword={() => setActiveTab('PASSWORD')}
                  />
                )}

                {activeTab === 'PASSWORD' && (
                  <PasswordVerificationView
                    onSuccess={handleLoginSuccess}
                    onSwitchToOtp={() => setActiveTab('OTP')}
                    onSwitchToRegister={(input) => {
                      if (input) {
                        const digits = input.replace(/\D/g, '');
                        if (digits.length >= 10) {
                          setPrefillMobile(digits.slice(-10));
                        } else if (!input.includes('@')) {
                          setPrefillName(input);
                        }
                      }
                      setActiveTab('REGISTER');
                    }}
                  />
                )}

                {activeTab === 'REGISTER' && (
                  <RegisterView
                    key={`${prefillName}-${prefillMobile}`}
                    initialFullName={prefillName}
                    initialMobile={prefillMobile}
                    onSuccess={handleLoginSuccess}
                    onSwitchToLogin={() => setActiveTab('PASSWORD')}
                  />
                )}
              </div>

              {/* Bottom Security Trust Seal */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Strict Backend Verification</span>
                </span>
                <span className="font-mono text-neutral-400">AES-256 / SHA-2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

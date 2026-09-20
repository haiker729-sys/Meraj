import React, { useState } from 'react';
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../../../api/client';

interface RegisterViewProps {
  onSuccess: (user: any) => void;
  onSwitchToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onSuccess,
  onSwitchToLogin
}) => {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (!fullName.trim() || cleanMobile.length !== 10) {
      setErrorMsg('Please enter your full name and valid 10-digit mobile number.');
      return;
    }

    if (password && password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Real backend POST /api/auth/register
      const res = await apiClient.auth.register({
        fullName: fullName.trim(),
        mobile: cleanMobile,
        email: email.trim() || undefined,
        password: password ? password.trim() : undefined
      });

      if (res?.success && res.token) {
        setIsSuccess(true);
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#f59e0b', '#ffffff']
        });

        setTimeout(() => {
          onSuccess(res.user);
        }, 1200);
      } else {
        setErrorMsg((res as any)?.error || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Mobile number already registered or server error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      {isSuccess ? (
        <div className="py-10 text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-[1px] shadow-lg shadow-emerald-500/30">
              <div className="w-full h-full rounded-2xl bg-neutral-900/90 backdrop-blur-xl flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold font-serif text-white">Welcome to Fashion Point</h3>
            <p className="text-xs text-emerald-400 font-mono">
              Account created and cryptographically signed
            </p>
            <p className="text-[11px] text-neutral-400 mt-2">
              Logging you into your new Privé profile...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Full Name
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-neutral-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                disabled={isSubmitting}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Meraj Alam"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/15 focus:border-amber-400 rounded-xl text-white placeholder:text-neutral-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-mono text-neutral-400 select-none border-r border-white/10 pr-2">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                maxLength={10}
                required
                disabled={isSubmitting}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                className="w-full pl-22 pr-4 py-2.5 text-sm font-mono bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/15 focus:border-amber-400 rounded-xl text-white placeholder:text-neutral-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Email Address <span className="text-neutral-500 lowercase">(Optional)</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-neutral-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                disabled={isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="meraj@fashionpoint.in"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/15 focus:border-amber-400 rounded-xl text-white placeholder:text-neutral-500 focus:outline-hidden transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Create Password <span className="text-neutral-500 lowercase">(Optional, min 6 chars)</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2.5 text-sm bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/15 focus:border-amber-400 rounded-xl text-white placeholder:text-neutral-500 focus:outline-hidden transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 p-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !fullName.trim() || mobile.length < 10}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Hashing & Registering...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Create Verified Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Already have an account? <span className="underline font-semibold text-amber-300">Sign in</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

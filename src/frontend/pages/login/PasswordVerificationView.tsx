import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../../../api/client';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface PasswordVerificationViewProps {
  onSuccess: (user: any) => void;
  onSwitchToOtp: () => void;
  onSwitchToRegister?: (initialName?: string) => void;
}

export const PasswordVerificationView: React.FC<PasswordVerificationViewProps> = ({
  onSuccess,
  onSwitchToOtp,
  onSwitchToRegister
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('Please enter both your registered mobile/email and password.');
      return;
    }

    setIsVerifying(true);

    try {
      // Real backend POST /api/auth/login
      const res = await apiClient.auth.login(identifier.trim(), password.trim());

      if (res?.success && res.token) {
        // Backend verification succeeded!
        setIsVerified(true);

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
        setErrorMsg((res as any)?.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect credentials or rate limit exceeded.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="relative">
      {/* SUCCESS STATE ANIMATION */}
      {isVerified ? (
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
            <h3 className="text-xl font-bold font-serif text-white">Verified Successfully</h3>
            <p className="text-xs text-emerald-400 font-mono">
              Password cryptographic signature matched
            </p>
            <p className="text-[11px] text-neutral-400 mt-2">
              Redirecting to your Fashion Point account...
            </p>
          </div>
        </div>
      ) : (
        /* PASSWORD LOGIN FORM */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Mobile Number, Email, or Admin ID
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-neutral-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                disabled={isVerifying}
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="e.g. 9876543210 or name@example.com"
                className="w-full pl-10 pr-4 py-3 text-sm bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-white placeholder:text-neutral-500 focus:outline-hidden transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              />
            </div>
            <p className="text-[11px] text-neutral-400 pl-1">
              अपना 10-अंकों का मोबाइल नंबर या ईमेल दर्ज करें (Enter 10-digit mobile or email)
            </p>
          </div>

          {/* Password field with Show/Hide toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-amber-300 hover:text-amber-200 font-medium transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isVerifying}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 text-sm bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-white placeholder:text-neutral-500 focus:outline-hidden transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 p-1 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error message with Action Buttons */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2.5 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMsg}</span>
              </div>
              
              {/* Contextual Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-500/20">
                {onSwitchToRegister && (
                  <button
                    type="button"
                    onClick={() => onSwitchToRegister(identifier.trim())}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>✨ Create New Account</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onSwitchToOtp}
                  className="px-3 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-semibold text-[11px] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Login with OTP</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Button with Loading State */}
          <button
            type="submit"
            disabled={isVerifying || !identifier.trim() || !password.trim()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Verifying Credentials with Server...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Switch to OTP */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onSwitchToOtp}
              className="text-xs text-neutral-400 hover:text-amber-300 transition-colors font-medium cursor-pointer"
            >
              Don't remember your password? <span className="underline font-semibold text-white">Sign in with 6-Digit OTP</span>
            </button>
          </div>
        </form>
      )}

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onSuccess={() => {
          setErrorMsg(null);
        }}
        initialIdentifier={identifier}
      />
    </div>
  );
};

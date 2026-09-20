import React, { useState, useEffect, useRef } from 'react';
import { X, KeyRound, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../../../api/client';
import confetti from 'canvas-confetti';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialIdentifier?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialIdentifier = ''
}) => {
  const [step, setStep] = useState<'IDENTIFIER' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS'>('IDENTIFIER');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [devSimulatedCode, setDevSimulatedCode] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialIdentifier) setIdentifier(initialIdentifier);
  }, [initialIdentifier]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'OTP' && countdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            setCanResend(true);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Step 1: Request Password Reset OTP
  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your registered mobile number or email.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiClient.auth.forgotPasswordRequestOtp(identifier.trim());
      if (res?.success) {
        setStep('OTP');
        setOtpValues(['', '', '', '', '', '']);
        setCountdown(60);
        setCanResend(false);

        // Check dev sandbox assist
        try {
          const devRes = await apiClient.auth.getDevSandboxOtp(identifier.trim(), 'forgot');
          if (devRes?.simulatedCode) setDevSimulatedCode(devRes.simulatedCode);
        } catch {
          // Ignore
        }

        setTimeout(() => inputRefs.current[0]?.focus(), 150);
      } else {
        setErrorMsg(res?.message || 'Failed to initiate password reset.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'No account matching this identifier or request limit reached.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle OTP input
  const handleDigitChange = (index: number, val: string) => {
    setErrorMsg(null);
    const cleanDigit = val.replace(/\D/g, '').slice(-1);

    const newValues = [...otpValues];
    newValues[index] = cleanDigit;
    setOtpValues(newValues);

    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newValues.join('').length === 6 && cleanDigit) {
      setStep('NEW_PASSWORD');
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Step 3: Verify OTP and Save New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP.');
      setStep('OTP');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please re-type.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient.auth.forgotPasswordReset({
        identifier: identifier.trim(),
        otp: otpCode,
        newPassword: newPassword.trim()
      });

      if (res?.success) {
        setStep('SUCCESS');
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10b981', '#f59e0b', '#ffffff']
        });

        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1800);
      } else {
        setErrorMsg(res?.message || 'Password reset failed.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect or expired reset OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-neutral-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/80 text-white animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif text-white">Reset Secure Password</h3>
          <p className="text-xs text-neutral-400 mt-1">
            Fashion Point cryptographic account recovery
          </p>
        </div>

        {/* STEP: IDENTIFIER */}
        {step === 'IDENTIFIER' && (
          <form onSubmit={handleRequestResetOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Registered Mobile or Email
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="10-digit mobile or email address"
                className="w-full px-4 py-3 text-sm bg-white/[0.06] border border-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-white placeholder:text-neutral-500 focus:outline-hidden"
              />
              <p className="text-[11px] text-neutral-400">
                We'll verify this account on the backend and dispatch a one-time reset code.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !identifier.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking Vault...</span>
                </>
              ) : (
                <>
                  <span>Request Reset OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP: OTP INPUT */}
        {step === 'OTP' && (
          <div className="space-y-5">
            <div className="text-center">
              <p className="text-xs text-neutral-300">
                Enter the 6-digit code sent for <strong className="text-amber-300 font-mono">{identifier}</strong>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              {otpValues.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-10 h-12 sm:w-11 sm:h-13 rounded-xl text-center text-xl font-mono font-bold bg-white/[0.08] border border-white/20 text-white focus:border-amber-400 focus:outline-hidden"
                />
              ))}
            </div>

            {devSimulatedCode && (
              <div className="p-2 bg-amber-500/10 border border-amber-400/20 rounded-lg text-[11px] text-amber-300 text-center">
                Dev Preview code: <strong className="font-mono text-white">{devSimulatedCode}</strong>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              disabled={otpValues.join('').length !== 6}
              onClick={() => setStep('NEW_PASSWORD')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Continue to New Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP: NEW PASSWORD */}
        {step === 'NEW_PASSWORD' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                New Secure Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-4 pr-10 py-3 text-sm bg-white/[0.06] border border-white/15 focus:border-amber-400 rounded-xl text-white placeholder:text-neutral-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-neutral-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 text-sm bg-white/[0.06] border border-white/15 focus:border-amber-400 rounded-xl text-white placeholder:text-neutral-500 focus:outline-hidden"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || newPassword.length < 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password in Vault...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save New Password</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP: SUCCESS */}
        {step === 'SUCCESS' && (
          <div className="py-6 text-center space-y-3 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Password Reset Successfully!</h4>
            <p className="text-xs text-neutral-300">
              Your credentials have been securely updated. You can now log in with your new password.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

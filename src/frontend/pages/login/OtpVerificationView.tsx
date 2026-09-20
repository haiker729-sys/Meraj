import React, { useState, useEffect, useRef } from 'react';
import { Phone, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, Sparkles, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { apiClient } from '../../../api/client';

interface OtpVerificationViewProps {
  onSuccess: (user: any) => void;
  onSwitchToPassword: () => void;
}

export const OtpVerificationView: React.FC<OtpVerificationViewProps> = ({
  onSuccess,
  onSwitchToPassword
}) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [shakeInputs, setShakeInputs] = useState(false);
  const [devSimulatedCode, setDevSimulatedCode] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && countdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  // Check dev sandbox OTP in non-production environments
  const checkDevOtp = async (cleanNum: string) => {
    try {
      const res = await apiClient.auth.getDevSandboxOtp(cleanNum, 'otp');
      if (res?.simulatedCode) {
        setDevSimulatedCode(res.simulatedCode);
      }
    } catch {
      // Ignore
    }
  };

  // 1. Request OTP from Real Backend
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const clean = mobileNumber.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await apiClient.auth.requestOtp(clean);
      if (res?.success) {
        setOtpSent(true);
        setOtpValues(['', '', '', '', '', '']);
        setCountdown(60);
        setCanResend(false);
        setErrorMsg(null);

        // Fetch dev test helper if available
        checkDevOtp(clean);

        // Focus first OTP input after DOM renders
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 150);
      } else {
        setErrorMsg(res?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to request OTP code. Please check your connection.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 2. Handle OTP input changes
  const handleDigitChange = (index: number, val: string) => {
    setErrorMsg(null);
    const cleanDigit = val.replace(/\D/g, '').slice(-1);

    const newValues = [...otpValues];
    newValues[index] = cleanDigit;
    setOtpValues(newValues);

    // Auto-advance to next input
    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits filled, trigger auto-submit
    const combined = newValues.join('');
    if (combined.length === 6 && cleanDigit) {
      handleVerifyOtp(combined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        // Move focus backward if current box is empty
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Paste handler for 6 digits
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newValues = ['', '', '', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      newValues[i] = pastedData[i];
    }
    setOtpValues(newValues);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      handleVerifyOtp(pastedData);
    }
  };

  // 3. Verify OTP via Backend
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = codeToVerify || otpValues.join('');
    if (code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code.');
      triggerShake();
      return;
    }

    const clean = mobileNumber.replace(/\D/g, '').slice(-10);
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      // Real backend POST /api/auth/verify-otp
      const res = await apiClient.auth.verifyOtp(clean, code, fullName.trim() || undefined);

      if (res?.success && res.token) {
        // Real verification succeeded!
        setIsVerified(true);

        // Green verified success confetti
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
        triggerShake();
        setErrorMsg((res as any)?.error || 'Verification failed. Please check the OTP code.');
      }
    } catch (err: any) {
      triggerShake();
      setErrorMsg(err.message || 'Incorrect or expired OTP code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const triggerShake = () => {
    setShakeInputs(true);
    setTimeout(() => setShakeInputs(false), 500);
  };

  // Formatting seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Auto-fill dev code helper for testers in dev sandbox
  const applyDevCode = () => {
    if (devSimulatedCode && devSimulatedCode.length === 6) {
      const split = devSimulatedCode.split('');
      setOtpValues(split);
      handleVerifyOtp(devSimulatedCode);
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
              Secure authentication token verified by server
            </p>
            <p className="text-[11px] text-neutral-400 mt-2">
              Redirecting to your Fashion Point account...
            </p>
          </div>
        </div>
      ) : !otpSent ? (
        /* STEP 1: ENTER MOBILE NUMBER */
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-mono text-neutral-400 select-none border-r border-white/10 pr-2.5">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                maxLength={10}
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                className="w-full pl-24 pr-4 py-3 text-sm font-mono bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-white placeholder:text-neutral-500 focus:outline-hidden transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
              />
            </div>
            <p className="text-[11px] text-neutral-400">
              We will send a cryptographically secure 6-digit OTP code.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Full Name <span className="text-neutral-500 font-normal lowercase">(Optional for new user)</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Meraj Alam"
              className="w-full px-4 py-2.5 text-xs bg-white/[0.05] hover:bg-white/[0.08] focus:bg-white/[0.1] border border-white/15 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 rounded-xl text-white placeholder:text-neutral-500 focus:outline-hidden transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
            />
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSendingOtp || mobileNumber.length < 10}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isSendingOtp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Generating Secure OTP...</span>
              </>
            ) : (
              <>
                <span>Send 6-Digit OTP</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Switch to Password */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onSwitchToPassword}
              className="text-xs text-neutral-400 hover:text-amber-300 transition-colors font-medium cursor-pointer"
            >
              Prefer password login? <span className="underline font-semibold text-white">Sign in with Password</span>
            </button>
          </div>
        </form>
      ) : (
        /* STEP 2: 6-DIGIT OTP VERIFICATION */
        <div className="space-y-6">
          {/* Header indicator */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setErrorMsg(null);
              }}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Number</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-neutral-400 block">Sent to</span>
              <span className="text-xs font-mono font-bold text-amber-300">+91 {mobileNumber}</span>
            </div>
          </div>

          {/* 6-Digit OTP Boxes */}
          <div className="space-y-2">
            <label className="block text-center text-xs font-bold uppercase tracking-widest text-neutral-300">
              Enter 6-Digit Verification Code
            </label>

            <div
              className={`flex items-center justify-center gap-2 sm:gap-2.5 transition-transform ${
                shakeInputs ? 'animate-shake' : ''
              }`}
            >
              {otpValues.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  disabled={isVerifying || isVerified}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  className={`w-11 h-13 sm:w-12 sm:h-14 rounded-xl text-center text-xl sm:text-2xl font-mono font-bold transition-all focus:outline-hidden ${
                    errorMsg
                      ? 'bg-rose-500/10 border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                      : digit
                      ? 'bg-white/[0.12] border-amber-400/80 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-white/[0.05] border-white/15 text-white hover:bg-white/[0.08]'
                  } border focus:border-amber-400 focus:bg-white/[0.12] focus:ring-2 focus:ring-amber-400/30`}
                />
              ))}
            </div>
          </div>

          {/* Dev sandbox test assistant banner */}
          {devSimulatedCode && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/25 flex items-center justify-between text-xs text-amber-300 animate-in fade-in">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Dev Sandbox: Generated code is <strong className="font-mono text-white text-xs">{devSimulatedCode}</strong></span>
              </span>
              <button
                type="button"
                onClick={applyDevCode}
                className="px-2 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 rounded-lg text-[10px] font-mono font-bold uppercase cursor-pointer"
              >
                Auto-Fill
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Countdown Timer & Resend Action */}
          <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Valid for 5 mins</span>
            </div>

            {canResend ? (
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={isSendingOtp}
                className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSendingOtp ? 'animate-spin' : ''}`} />
                <span>Resend OTP</span>
              </button>
            ) : (
              <span className="font-mono text-neutral-400">
                Resend in <strong className="text-white">{formatTime(countdown)}</strong>
              </span>
            )}
          </div>

          {/* Verify Button */}
          <button
            type="button"
            onClick={() => handleVerifyOtp()}
            disabled={isVerifying || otpValues.join('').length !== 6}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Verifying with Backend Vault...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Sign In</span>
              </>
            )}
          </button>

          {/* Switch to password */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onSwitchToPassword}
              className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              Sign in with password instead →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

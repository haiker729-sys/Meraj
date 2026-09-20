import React, { useState } from 'react';
import { ArrowRight, Lock, Phone, Mail, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [authMethod, setAuthMethod] = useState<'mobile' | 'email'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMethod === 'mobile' && (!mobileNumber || mobileNumber.length < 10)) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }
    if (authMethod === 'email' && (!email || !email.includes('@'))) {
      alert('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setOtp('1234'); // Simulated OTP for convenient testing
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) {
      alert('Please enter 4-digit OTP code');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onNavigate('/account');
      }, 700);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-200 shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-neutral-900 text-white mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-neutral-950">Welcome to Fashion Point</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Sign in to track orders, manage addresses and access exclusive club offers
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-neutral-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('mobile');
              setOtpSent(false);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'mobile' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-black'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Mobile OTP</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setOtpSent(false);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'email' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-black'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Login</span>
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">Signed In Successfully!</h3>
            <p className="text-xs text-neutral-500 mt-1">Redirecting to your account dashboard...</p>
          </div>
        ) : !otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {authMethod === 'mobile' ? (
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs font-mono font-bold text-neutral-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    required
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium focus:ring-2 focus:ring-black focus:border-black outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  We will send an instant 4-digit verification code.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium focus:ring-2 focus:ring-black focus:border-black outline-hidden"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Sending Code...</span>
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs flex items-center justify-between">
              <span className="text-neutral-500">
                OTP sent to {authMethod === 'mobile' ? `+91 ${mobileNumber}` : email}
              </span>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-black font-bold underline text-[11px]"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Enter 4-Digit Verification Code
              </label>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="1234"
                required
                className="w-full px-4 py-3 text-center tracking-[0.5em] text-lg font-mono font-bold rounded-xl border border-neutral-300 focus:ring-2 focus:ring-black focus:border-black outline-hidden"
              />
              <p className="text-[11px] text-emerald-600 mt-1 text-center font-medium">
                Demo code: <strong>1234</strong>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-neutral-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Verify & Proceed</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Secure Customer Portal</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/order-tracking')}
            className="text-neutral-600 hover:text-black hover:underline"
          >
            Track My Order →
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, Truck, RotateCcw, Award } from 'lucide-react';

const memberPerks = [
  {
    title: '100% Authentic Apparel',
    desc: 'Direct from master weavers and verified ateliers.',
    icon: <Award className="w-5 h-5 text-amber-400" />
  },
  {
    title: 'Free Express Shipping',
    desc: 'Orders above ₹999 dispatched within 24 hours.',
    icon: <Truck className="w-5 h-5 text-amber-400" />
  },
  {
    title: '7-Day Easy Exchange',
    desc: 'Hassle-free reverse pickups right from your doorstep.',
    icon: <RotateCcw className="w-5 h-5 text-amber-400" />
  },
  {
    title: 'Secure UPI & COD',
    desc: 'Encrypted payments & verified cash on delivery.',
    icon: <ShieldCheck className="w-5 h-5 text-amber-400" />
  }
];

export const GlassmorphicAuthStats: React.FC = () => {
  return (
    <div className="space-y-6 text-white select-none">
      {/* Brand & Security Badge */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-300 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Fashion Point Privé • Member Privileges</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
          Royal Heritage & Contemporary Luxury
        </h2>
        <p className="text-xs text-neutral-300 leading-relaxed max-w-md">
          Sign in to access your saved delivery addresses, track courier parcels in real-time, and unlock bespoke member discounts.
        </p>
      </div>

      {/* 4 Member Benefit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {memberPerks.map((perk, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all hover:bg-white/[0.09] hover:border-white/25"
          >
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center mb-3">
              {perk.icon}
            </div>
            <h4 className="text-sm font-bold text-white mb-1">{perk.title}</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">{perk.desc}</p>
          </div>
        ))}
      </div>

      {/* Customer Assurance Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 backdrop-blur-xl border border-amber-500/20 text-xs flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
        <span className="text-neutral-200">
          Over <strong>25,000+ happy customers</strong> across India trust Fashion Point for festive couture and daily elegance.
        </span>
      </div>
    </div>
  );
};

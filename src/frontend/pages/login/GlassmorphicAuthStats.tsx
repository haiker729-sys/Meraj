import React from 'react';
import { FiUsers, FiFolder, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Sparkles, Award } from 'lucide-react';

const stats = [
  { title: 'Total Projects', value: 12, icon: <FiFolder />, change: '+20%' },
  { title: 'Active Tasks', value: 8, icon: <FiTrendingUp />, change: '+12%' },
  { title: 'Team Members', value: 5, icon: <FiUsers />, change: '+0%' },
  { title: 'Total Revenue', value: '$2,480', icon: <FiDollarSign />, change: '+18%' },
];

const revenueTrendData = [
  { day: 'Mon', revenue: 1420 },
  { day: 'Tue', revenue: 1890 },
  { day: 'Wed', revenue: 1650 },
  { day: 'Thu', revenue: 2100 },
  { day: 'Fri', revenue: 2340 },
  { day: 'Sat', revenue: 2780 },
  { day: 'Sun', revenue: 2480 }
];

export const GlassmorphicAuthStats: React.FC = () => {
  return (
    <div className="space-y-6 text-white select-none">
      {/* Brand & Security Badge */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Fashion Point Vault • 256-Bit Cryptographic Auth</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
          Royal Heritage & Contemporary Luxury
        </h2>
        <p className="text-xs text-neutral-300 leading-relaxed max-w-md">
          Access your verified customer profile, live parcel tracking, curated couture collections, and bespoke member rewards.
        </p>
      </div>

      {/* 4 Stat Cards provided by user */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all hover:bg-white/[0.1] hover:border-white/25 group"
          >
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-medium text-neutral-300">{stat.title}</span>
              <div className="w-7 h-7 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-lg sm:text-xl font-bold font-mono text-white">{stat.value}</span>
              <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Recharts Analytics Chart Card */}
      <div className="p-4 rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-200">
              Weekly Revenue Velocity
            </span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">Live Logistics Synced</span>
        </div>

        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueTrendData}>
              <defs>
                <linearGradient id="revenueLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#ec4899" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                stroke="rgba(255,255,255,0.3)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide domain={['dataMin - 200', 'dataMax + 200']} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="px-2.5 py-1.5 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono shadow-lg">
                        <span className="text-neutral-400">{payload[0].payload.day}: </span>
                        <strong className="text-amber-400">${payload[0].value}</strong>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="url(#revenueLineGrad)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Privé Member Highlights */}
      <div className="p-3.5 rounded-2xl bg-white/[0.04] backdrop-blur-lg border border-white/10 flex items-center gap-3 text-xs text-neutral-300">
        <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
          <Award className="w-4 h-4" />
        </div>
        <div className="text-[11px] leading-relaxed">
          <strong className="text-white font-semibold">Fashion Point Privé Club:</strong> Enjoy free express courier delivery, early access to festive sales, and priority tailor fitting.
        </div>
      </div>
    </div>
  );
};

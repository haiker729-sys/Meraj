import React, { useState } from 'react';
import { STORE_CONFIG, INITIAL_COUPONS } from '../../../database/seed/productsData';
import { Store, ShieldCheck, Tag, Save, Check } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [storeName, setStoreName] = useState(STORE_CONFIG.name);
  const [gstin, setGstin] = useState(STORE_CONFIG.gstin);
  const [phone, setPhone] = useState(STORE_CONFIG.phone);
  const [email, setEmail] = useState(STORE_CONFIG.email);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Business Profile */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 font-bold text-sm text-neutral-900">
            <Store className="w-4 h-4 text-neutral-600" />
            <span>Store Profile & Tax Identity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Store Legal Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Goods & Services Tax (GSTIN)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono focus:border-black uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Support Phone Helpline</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono focus:border-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Support Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                Free Delivery Cart Threshold (₹)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl font-mono focus:border-black"
              />
            </div>
          </div>
        </div>

        {/* Coupons List */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 font-bold text-sm text-neutral-900">
            <Tag className="w-4 h-4 text-neutral-600" />
            <span>Active Discount Coupons</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {INITIAL_COUPONS.map((cp) => (
              <div key={cp.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-black uppercase bg-neutral-200 px-2 py-0.5 rounded">
                    {cp.code}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-neutral-700 mt-2 font-medium">
                  {cp.discountType === 'PERCENT' || (cp.discountType as any) === 'PERCENTAGE' ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} Flat OFF`}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Min order: ₹{cp.minOrderAmount} • Max discount: ₹{cp.maxDiscount || 'Unlimited'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="text-right">
          <button
            type="submit"
            className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 shadow-md transition-all"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Settings Saved Successfully!' : 'Save Store Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

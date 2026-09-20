import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { Store, Tag, Save, Check, Layers, AlertCircle, CheckCircle2, ShieldCheck, Database } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [storeName, setStoreName] = useState('Fashion Point');
  const [gstin, setGstin] = useState('23AAAAF8899A1Z2');
  const [phone, setPhone] = useState('+91 91131 92837');
  const [email, setEmail] = useState('care@fashionpoint.in');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [integrations, setIntegrations] = useState<Record<string, string>>({
    razorpay: 'Not configured',
    sms: 'Not configured',
    whatsapp: 'Not configured',
    email: 'Not configured',
    googleMaps: 'Not configured',
    courier: 'Not configured',
    gemini: 'Not configured',
    storage: 'Not configured'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settingsRes, couponsRes, intRes] = await Promise.all([
          apiClient.admin.getSettings(),
          apiClient.coupons.list(),
          apiClient.admin.getIntegrationsStatus().catch(() => null)
        ]);
        if (settingsRes?.settings) {
          const s = settingsRes.settings;
          if (s.storeName) setStoreName(s.storeName);
          if (s.gstin) setGstin(s.gstin);
          if (s.supportPhone) setPhone(s.supportPhone);
          if (s.contactEmail) setEmail(s.contactEmail);
          if (s.freeShippingThreshold) setFreeShippingThreshold(s.freeShippingThreshold);
        }
        if (couponsRes?.coupons) {
          setCoupons(couponsRes.coupons);
        }
        if (intRes?.services) {
          setIntegrations(intRes.services);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.admin.updateSettings({
        storeName,
        gstin,
        supportPhone: phone,
        contactEmail: email,
        freeShippingThreshold
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
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
            {coupons.map((cp) => (
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
                  {cp.discountType === 'PERCENT' || cp.discountType === 'PERCENTAGE' ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} Flat OFF`}
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Min order: ₹{cp.minOrderAmount || 0} • Max discount: ₹{cp.maxDiscount || 'Unlimited'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Low-Cost Launch v1 Architecture & External Services */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2 font-bold text-sm text-neutral-900">
              <Layers className="w-4 h-4 text-neutral-600" />
              <span>External Services & Integrations (Low-Cost Launch v1)</span>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-medium">
              Database: PostgreSQL Active
            </span>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Fashion Point is architected for zero-overhead deployment. Core e-commerce (PostgreSQL, auth, cart, checkout, COD, inventory, invoices, thermal shipping labels & QR codes) runs 100% autonomously without external API fees. External providers can be connected anytime by defining environment variables without rewriting application code.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Razorpay */}
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between">
              <div>
                <p className="font-semibold text-xs text-neutral-900">Razorpay Payment Gateway</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Online UPI, Cards & NetBanking (COD is active for all orders)
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  integrations.razorpay === 'Configured'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {integrations.razorpay || 'Not configured'}
              </span>
            </div>

            {/* SMS */}
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between">
              <div>
                <p className="font-semibold text-xs text-neutral-900">SMS / OTP Provider</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Fast2SMS / Twilio (Password authentication active)
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  integrations.sms === 'Configured'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {integrations.sms || 'Not configured'}
              </span>
            </div>

            {/* WhatsApp */}
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between">
              <div>
                <p className="font-semibold text-xs text-neutral-900">WhatsApp Business API</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Meta Cloud API (In-app order tracking active)
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  integrations.whatsapp === 'Configured'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {integrations.whatsapp || 'Not configured'}
              </span>
            </div>

            {/* Email */}
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between">
              <div>
                <p className="font-semibold text-xs text-neutral-900">Email & SMTP Provider</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Transactional mailer (Printable GST invoices active)
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  integrations.email === 'Configured'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {integrations.email || 'Not configured'}
              </span>
            </div>

            {/* Google Maps */}
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between">
              <div>
                <p className="font-semibold text-xs text-neutral-900">Google Maps Platform</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Places / Geocoding (Standard postal address validation active)
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  integrations.googleMaps === 'Configured'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {integrations.googleMaps || 'Not configured'}
              </span>
            </div>

            {/* Courier */}
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between">
              <div>
                <p className="font-semibold text-xs text-neutral-900">Courier Logistics API</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Shiprocket / Delhivery API (Manual / In-house dispatch & tracking active)
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  integrations.courier === 'Configured'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {integrations.courier || 'Not configured'}
              </span>
            </div>

            {/* AI */}
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between">
              <div>
                <p className="font-semibold text-xs text-neutral-900">External AI API</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Gemini / OpenAI (Standard rule-based search & categories active)
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  integrations.gemini === 'Configured'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {integrations.gemini || 'Not configured'}
              </span>
            </div>

            {/* Storage */}
            <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-start justify-between">
              <div>
                <p className="font-semibold text-xs text-neutral-900">Paid Cloud Storage</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  AWS S3 / GCS (Direct catalog assets & CDN active)
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  integrations.storage === 'Configured'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-neutral-200 text-neutral-700'
                }`}
              >
                {integrations.storage || 'Not configured'}
              </span>
            </div>
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

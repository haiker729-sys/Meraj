import React, { useState } from 'react';
import { X, Shield, User, Lock, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { storeDb } from '../../../database/store';
import { AdminRole } from '../../../types';

interface AdminAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAdded: () => void;
}

export const AdminAddModal: React.FC<AdminAddModalProps> = ({
  isOpen,
  onClose,
  onAdminAdded
}) => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminRole>('STORE_MANAGER');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !username.trim() || !password.trim()) {
      setErrorMsg('कृपया नाम, यूज़रनेम और पासवर्ड भरें।');
      return;
    }

    if (username.trim().length < 3) {
      setErrorMsg('यूज़रनेम कम से कम 3 अक्षरों का होना चाहिए।');
      return;
    }

    if (password.trim().length < 4) {
      setErrorMsg('पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }

    const res = storeDb.addAdmin({
      fullName: fullName.trim(),
      username: username.trim(),
      password: password.trim(),
      role,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      isActive: true
    });

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFullName('');
        setUsername('');
        setPassword('');
        setPhone('');
        setEmail('');
        setRole('STORE_MANAGER');
        onAdminAdded();
        onClose();
      }, 600);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900">Add New Store Admin (नया एडमिन जोड़ें)</h3>
              <p className="text-xs text-neutral-500">Create login credentials for store managers and staff</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-neutral-200 flex items-center justify-center text-neutral-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-bold">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>New Admin added successfully! (नया एडमिन सफलतापूर्वक जुड़ गया)</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Full Name (पूरा नाम) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Username (यूज़रनेम) *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="e.g. ramesh_admin"
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xl font-mono focus:outline-none focus:border-black"
              />
              <span className="text-[10px] text-neutral-400 block mt-0.5">बिना स्पेस के यूनिक नाम</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                Password (पासवर्ड) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 4 characters"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-xl font-mono focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Role & Permissions (पद व अधिकार) *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xl bg-white focus:outline-none focus:border-black font-medium"
            >
              <option value="SUPER_ADMIN">👑 Super Admin (Full Access: Team, Products, Orders, Invoices)</option>
              <option value="STORE_MANAGER">👔 Store Manager (Orders, Inventory, Products, Shipping)</option>
              <option value="INVENTORY_MANAGER">📦 Inventory Specialist (Stock counts & Product Updates)</option>
            </select>
          </div>

          {/* Optional Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Mobile Number (मोबाइल नं.)
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Email Address (ईमेल)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fashionpoint.store"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              Cancel (रद्द करें)
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Create Admin Account (एडमिन जोड़ें)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

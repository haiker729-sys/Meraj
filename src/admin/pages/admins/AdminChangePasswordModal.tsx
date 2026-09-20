import React, { useState } from 'react';
import { X, Lock, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../api/client';
import { AdminUser } from '../../../types';

interface AdminChangePasswordModalProps {
  admin: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const AdminChangePasswordModal: React.FC<AdminChangePasswordModalProps> = ({
  admin,
  isOpen,
  onClose,
  onUpdated
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !admin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newPassword || newPassword.trim().length < 4) {
      setErrorMsg('नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('दोनों पासवर्ड मेल नहीं खाते। (Passwords do not match)');
      return;
    }

    try {
      const res = await apiClient.admin.updateAdmin(admin.id, {
        password: newPassword.trim()
      });

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setNewPassword('');
          setConfirmPassword('');
          onUpdated();
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900">Change Password (पासवर्ड बदलें)</h3>
              <p className="text-xs text-neutral-500">For admin: <strong className="font-mono text-neutral-800">{admin.username}</strong> ({admin.fullName})</p>
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
              <span>Password updated successfully! (पासवर्ड सफलतापूर्वक बदल गया)</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              New Password (नया पासवर्ड) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-xl font-mono focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Confirm Password (पासवर्ड दोबारा दर्ज करें) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-xl font-mono focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Save New Password (पासवर्ड सेव करें)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

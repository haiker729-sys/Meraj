import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Shield,
  Search,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { storeDb } from '../../../database/store';
import { AdminUser, AdminRole } from '../../../types';
import { AdminAddModal } from './AdminAddModal';
import { AdminChangePasswordModal } from './AdminChangePasswordModal';

interface AdminManagementPageProps {
  currentAdmin?: AdminUser | null;
}

export const AdminManagementPage: React.FC<AdminManagementPageProps> = ({ currentAdmin }) => {
  const [admins, setAdmins] = useState<AdminUser[]>(storeDb.getAdmins());
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [passwordTargetAdmin, setPasswordTargetAdmin] = useState<AdminUser | null>(null);
  const [deleteTargetAdmin, setDeleteTargetAdmin] = useState<AdminUser | null>(null);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const refreshAdmins = () => {
    setAdmins(storeDb.getAdmins());
  };

  useEffect(() => {
    const unsub = storeDb.subscribe(() => {
      setAdmins(storeDb.getAdmins());
    });
    return unsub;
  }, []);

  const handleToggleStatus = (admin: AdminUser) => {
    if (currentAdmin && admin.id === currentAdmin.id) {
      setStatusNotice({
        type: 'error',
        message: 'आप अपने स्वयं के चालू एडमिन खाते को निष्क्रिय नहीं कर सकते।'
      });
      return;
    }

    const res = storeDb.updateAdmin(admin.id, {
      isActive: !admin.isActive
    });

    if (res.success) {
      setStatusNotice({
        type: 'success',
        message: `Admin "${admin.username}" status changed to ${!admin.isActive ? 'Active' : 'Inactive'}.`
      });
      refreshAdmins();
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetAdmin) return;

    const res = storeDb.deleteAdmin(deleteTargetAdmin.id, currentAdmin?.id);
    if (res.success) {
      setStatusNotice({
        type: 'success',
        message: res.message
      });
      setDeleteTargetAdmin(null);
      refreshAdmins();
    } else {
      setStatusNotice({
        type: 'error',
        message: res.message
      });
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            👑 Super Admin
          </span>
        );
      case 'STORE_MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
            👔 Store Manager
          </span>
        );
      case 'INVENTORY_MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
            📦 Inventory Specialist
          </span>
        );
      default:
        return null;
    }
  };

  const filteredAdmins = admins.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.fullName.toLowerCase().includes(q) ||
      a.username.toLowerCase().includes(q) ||
      (a.phone && a.phone.includes(q)) ||
      (a.email && a.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner with Action */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800 text-white rounded-2xl p-6 shadow-md border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider">
              Security & Team Access
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              Total {admins.length} Active Admins
            </span>
          </div>
          <h2 className="text-xl font-black font-serif tracking-tight">
            Admin Team & Access Management (व्यवस्थापक व एडमिन नियंत्रण)
          </h2>
          <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
            यहाँ से आप स्टोर के लिए नए एडमिन यूज़र बना सकते हैं, पासवर्ड बदल सकते हैं और अधिकारों (Roles) को नियंत्रित कर सकते हैं।
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-3 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add New Admin (नया एडमिन जोड़ें)</span>
        </button>
      </div>

      {/* Notice Banner */}
      {statusNotice && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 animate-fadeIn ${
            statusNotice.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <span>{statusNotice.message}</span>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-neutral-500 hover:text-black font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search & Stats Bar */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, phone..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-neutral-600 font-medium w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Active: {admins.filter((a) => a.isActive).length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
            <span>Inactive: {admins.filter((a) => !a.isActive).length}</span>
          </div>
        </div>
      </div>

      {/* Admins Table / List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-700">
            <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Admin Profile</th>
                <th className="px-4 py-3.5">Username (लॉगिन नाम)</th>
                <th className="px-4 py-3.5">Assigned Role</th>
                <th className="px-4 py-3.5">Contact Details</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Last Login</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-400">
                    No admin accounts found matching "{searchQuery}"
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const isCurrent = currentAdmin?.id === admin.id;

                  return (
                    <tr key={admin.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-neutral-900 text-amber-400 flex items-center justify-center font-bold text-xs uppercase font-serif shrink-0 shadow-xs">
                            {admin.fullName.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-neutral-900">{admin.fullName}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                                  YOU (चालू सत्र)
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 font-mono">ID: {admin.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="px-4 py-4">
                        <span className="font-mono font-bold bg-neutral-100 px-2 py-1 rounded text-neutral-800 border border-neutral-200">
                          @{admin.username}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-4">
                        {getRoleBadge(admin.role)}
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5 text-[11px]">
                          {admin.phone && (
                            <div className="flex items-center gap-1.5 text-neutral-600">
                              <Phone className="w-3 h-3 text-neutral-400" />
                              <span>{admin.phone}</span>
                            </div>
                          )}
                          {admin.email ? (
                            <div className="flex items-center gap-1.5 text-neutral-600">
                              <Mail className="w-3 h-3 text-neutral-400" />
                              <span className="truncate max-w-[150px]">{admin.email}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">No email set</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(admin)}
                          title="Click to toggle status"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                            admin.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-neutral-100 text-neutral-500 border-neutral-300 hover:bg-neutral-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              admin.isActive ? 'bg-emerald-500' : 'bg-neutral-400'
                            }`}
                          />
                          <span>{admin.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="px-4 py-4 text-neutral-500 text-[11px]">
                        {admin.lastLoginAt ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <span>{new Date(admin.lastLoginAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ) : (
                          <span className="italic text-neutral-400">Never logged in</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setPasswordTargetAdmin(admin)}
                            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Change password"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Password</span>
                          </button>

                          <button
                            type="button"
                            disabled={isCurrent}
                            onClick={() => setDeleteTargetAdmin(admin)}
                            className={`p-1.5 rounded-lg text-xs transition-colors ${
                              isCurrent
                                ? 'text-neutral-300 cursor-not-allowed'
                                : 'text-neutral-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title={isCurrent ? 'Cannot delete active session' : 'Remove Admin'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Admin Modal */}
      <AdminAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdminAdded={() => {
          setStatusNotice({
            type: 'success',
            message: 'New admin has been registered successfully! They can now log in using their credentials.'
          });
          refreshAdmins();
        }}
      />

      {/* Change Password Modal */}
      <AdminChangePasswordModal
        admin={passwordTargetAdmin}
        isOpen={!!passwordTargetAdmin}
        onClose={() => setPasswordTargetAdmin(null)}
        onUpdated={() => {
          setStatusNotice({
            type: 'success',
            message: `Password for admin "${passwordTargetAdmin?.username}" has been updated.`
          });
          refreshAdmins();
        }}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTargetAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-neutral-200 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-neutral-900">Remove Admin Account?</h3>
            <p className="text-xs text-neutral-500 mt-1 mb-4 leading-relaxed">
              Are you sure you want to remove admin <strong className="font-mono text-neutral-800">@{deleteTargetAdmin.username}</strong> ({deleteTargetAdmin.fullName})? They will no longer be able to log in to the admin panel.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetAdmin(null)}
                className="py-2.5 px-4 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

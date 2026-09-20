import React from 'react';
import { Plus, Bell, Search, ShieldCheck, UserCheck, LogOut } from 'lucide-react';
import { AdminUser } from '../../../types';

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  onOpenAddProduct?: () => void;
  onQuickSearch?: (query: string) => void;
  currentAdmin?: AdminUser | null;
  onLogout?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onOpenAddProduct,
  currentAdmin,
  onLogout
}) => {
  const getRoleTitle = () => {
    if (!currentAdmin) return 'Store Administrator';
    switch (currentAdmin.role) {
      case 'SUPER_ADMIN':
        return '👑 Super Admin';
      case 'STORE_MANAGER':
        return '👔 Store Manager';
      case 'INVENTORY_MANAGER':
        return '📦 Inventory Manager';
      default:
        return 'Store Administrator';
    }
  };

  return (
    <header className="bg-white border-b border-neutral-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black font-serif text-neutral-900">{title}</h1>
        <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {onOpenAddProduct && (
          <button
            type="button"
            onClick={onOpenAddProduct}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Garment / SKU</span>
          </button>
        )}

        <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-neutral-900 text-amber-400 flex items-center justify-center font-serif text-xs font-bold shrink-0">
            {currentAdmin ? currentAdmin.fullName.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="hidden sm:block text-left text-xs leading-tight">
            <span className="font-bold text-neutral-900 block truncate max-w-[140px]">
              {currentAdmin?.fullName || 'Store Manager'}
            </span>
            <span className="text-[10px] text-neutral-500 font-medium block">
              {getRoleTitle()}
            </span>
          </div>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Log Out Admin Session"
              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 rounded-lg transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Truck,
  FileText,
  Users,
  Settings,
  Store,
  Printer,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { AdminUser } from '../../../types';

export type AdminTab =
  | 'DASHBOARD'
  | 'PRODUCTS'
  | 'ORDERS'
  | 'INVENTORY'
  | 'SHIPPING'
  | 'INVOICES'
  | 'CUSTOMERS'
  | 'ADMINS'
  | 'SETTINGS';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onExitAdmin: () => void;
  onLogout?: () => void;
  currentAdmin?: AdminUser | null;
  pendingOrdersCount: number;
  lowStockCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  onExitAdmin,
  onLogout,
  currentAdmin,
  pendingOrdersCount,
  lowStockCount
}) => {
  const menuItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ORDERS', label: 'Orders Management', icon: Package, badge: pendingOrdersCount },
    { id: 'PRODUCTS', label: 'Product Catalog', icon: ShoppingBag },
    { id: 'INVENTORY', label: 'Inventory & Stock', icon: Layers, badge: lowStockCount },
    { id: 'SHIPPING', label: 'Shipping & Labels', icon: Truck },
    { id: 'INVOICES', label: 'GST Tax Invoices', icon: FileText },
    { id: 'CUSTOMERS', label: 'Customer Directory', icon: Users },
    { id: 'ADMINS', label: 'Admin Team & Roles', icon: ShieldCheck },
    { id: 'SETTINGS', label: 'Store Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-neutral-950 text-neutral-300 flex flex-col justify-between shrink-0 h-full border-r border-neutral-800">
      <div>
        {/* Brand Bar */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-black font-black flex items-center justify-center text-sm font-serif">
              FP
            </div>
            <div>
              <h2 className="font-black text-sm tracking-tight text-white font-serif">FASHION POINT</h2>
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400">Admin Portal</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-amber-400 text-black font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-black text-white' : 'bg-neutral-800 text-amber-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: Admin Account Info & Actions */}
      <div className="p-4 border-t border-neutral-800 space-y-2.5">
        {currentAdmin && (
          <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-black font-black flex items-center justify-center text-[10px] uppercase font-serif shrink-0">
                {currentAdmin.fullName.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate leading-tight">
                  {currentAdmin.fullName}
                </span>
                <span className="text-[10px] text-amber-400 font-mono block">
                  @{currentAdmin.username}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                title="Log Out of Admin (लॉगआउट)"
                className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onExitAdmin}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors border border-neutral-700"
        >
          <Store className="w-3.5 h-3.5 text-amber-400" />
          <span>Switch to Customer Store</span>
        </button>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out Admin (लॉगआउट)</span>
          </button>
        )}

        <p className="text-[10px] text-neutral-500 text-center font-mono">
          Fashion Point Store v2.4 • Admin Portal
        </p>
      </div>
    </aside>
  );
};

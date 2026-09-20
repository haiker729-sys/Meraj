import React, { useState, useEffect } from 'react';
import { AdminSidebar, AdminTab } from './components/sidebar/AdminSidebar';
import { AdminHeader } from './components/header/AdminHeader';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { AdminProductsList } from './pages/products/AdminProductsList';
import { AdminOrdersList } from './pages/orders/AdminOrdersList';
import { AdminInventoryPage } from './pages/inventory/AdminInventoryPage';
import { AdminShippingPage } from './pages/shipping/AdminShippingPage';
import { AdminParcelJourneyPage } from './pages/shipping/AdminParcelJourneyPage';
import { AdminInvoicesPage } from './pages/invoices/AdminInvoicesPage';
import { AdminCustomersPage } from './pages/customers/AdminCustomersPage';
import { AdminSettingsPage } from './pages/settings/AdminSettingsPage';
import { AdminManagementPage } from './pages/admins/AdminManagementPage';
import { AdminAddProductModal } from './pages/products/AdminAddProductModal';
import { AdminOrderDetailsModal } from './pages/orders/AdminOrderDetailsModal';
import { Order, AdminUser } from '../types';
import { apiClient } from '../api/client';

interface AdminLayoutProps {
  onExitAdmin: () => void;
  onLogout?: () => void;
  currentAdmin?: AdminUser | null;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onExitAdmin, onLogout, currentAdmin }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    lowStockCount: 0
  });

  const refreshStats = async () => {
    try {
      const res = await apiClient.admin.getStats();
      if (res?.stats) {
        setStats({
          pendingOrders: res.stats.pendingOrders || 0,
          lowStockCount: res.stats.lowStockCount || 0
        });
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  };

  useEffect(() => {
    refreshStats();
  }, [activeTab]);

  const getTabHeader = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return {
          title: 'Store Executive Dashboard',
          subtitle: 'Real-time sales velocity, order fulfillment status, and low stock warnings'
        };
      case 'PRODUCTS':
        return {
          title: 'Apparel Catalog & Product Management',
          subtitle: 'Create, edit, duplicate, and configure garment sizes, colors, and pricing'
        };
      case 'ORDERS':
        return {
          title: 'Order Processing & Fulfillment Pipeline',
          subtitle: 'Manage live customer orders, update tracking AWBs, and issue invoices'
        };
      case 'INVENTORY':
        return {
          title: 'Inventory & Stock Level Controller',
          subtitle: 'Monitor stock counts across all SKUs and manage replenishment thresholds'
        };
      case 'SHIPPING':
        return {
          title: 'Printable Shipping Labels (4x6 & A4)',
          subtitle: 'Thermal barcode labels formatted with recipient addresses and COD amounts'
        };
      case 'PARCEL_JOURNEY':
        return {
          title: 'Single QR & Barcode Parcel Journey Tracker',
          subtitle: 'One permanent Tracking ID verified across Admin, Warehouse, Hubs, and Doorstep Delivery'
        };
      case 'INVOICES':
        return {
          title: 'GST Tax Invoices & Compliance',
          subtitle: 'Generate standard Indian GST tax invoices with HSN breakdown and CGST/SGST'
        };
      case 'CUSTOMERS':
        return {
          title: 'Customer Directory & Order History',
          subtitle: 'Track buyer contacts, delivery destinations, and lifetime customer volume'
        };
      case 'ADMINS':
        return {
          title: 'Admin Team & Roles (व्यवस्थापक व एडमिन प्रबंधन)',
          subtitle: 'Add new administrators, assign security roles, manage passwords, and oversee team access'
        };
      case 'SETTINGS':
        return {
          title: 'Store Settings & Promotional Coupons',
          subtitle: 'Configure GSTIN, store physical address, customer care, and active discount codes'
        };
    }
  };

  const headerInfo = getTabHeader();

  return (
    <div className="flex h-screen bg-neutral-100 overflow-hidden font-sans antialiased text-neutral-900">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onExitAdmin={onExitAdmin}
        onLogout={onLogout}
        currentAdmin={currentAdmin}
        pendingOrdersCount={stats.pendingOrders}
        lowStockCount={stats.lowStockCount}
      />

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onOpenAddProduct={() => setIsAddProductModalOpen(true)}
          currentAdmin={currentAdmin}
          onLogout={onLogout}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto bg-neutral-50/50">
          {activeTab === 'DASHBOARD' && (
            <AdminDashboard
              onNavigateTab={setActiveTab}
              onSelectOrder={setSelectedOrder}
            />
          )}
          {activeTab === 'PRODUCTS' && <AdminProductsList />}
          {activeTab === 'ORDERS' && <AdminOrdersList />}
          {activeTab === 'INVENTORY' && <AdminInventoryPage />}
          {activeTab === 'SHIPPING' && <AdminShippingPage />}
          {activeTab === 'PARCEL_JOURNEY' && <AdminParcelJourneyPage />}
          {activeTab === 'INVOICES' && <AdminInvoicesPage />}
          {activeTab === 'CUSTOMERS' && <AdminCustomersPage />}
          {activeTab === 'ADMINS' && <AdminManagementPage currentAdmin={currentAdmin} />}
          {activeTab === 'SETTINGS' && <AdminSettingsPage />}
        </main>
      </div>

      {/* Global Add Product Modal */}
      <AdminAddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
      />

      {/* Global Order Details Modal */}
      <AdminOrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={refreshStats}
      />
    </div>
  );
};

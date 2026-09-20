import React, { useState, useEffect } from 'react';
import { Order, Product } from '../../../types';
import { apiClient } from '../../../api/client';
import {
  IndianRupee,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Printer,
  Eye,
  FileText
} from 'lucide-react';
import { PrintLabelModal } from '../../../shipping-label/print/PrintLabelModal';
import { PrintInvoiceModal } from '../../../invoice/print/PrintInvoiceModal';

interface AdminDashboardProps {
  onNavigateTab: (tab: any) => void;
  onSelectOrder: (order: Order) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateTab,
  onSelectOrder
}) => {
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          apiClient.admin.getStats().catch(() => ({ stats: null })),
          apiClient.orders.list({ limit: 5 }).catch(() => ({ orders: [] })),
          apiClient.products.list({ limit: 50 }).catch(() => ({ products: [] }))
        ]);

        if (statsRes && (statsRes as any).stats) {
          setStats((statsRes as any).stats);
        }
        if (ordersRes && (ordersRes as any).orders) {
          setRecentOrders((ordersRes as any).orders.slice(0, 5));
        }
        if (productsRes && (productsRes as any).products) {
          setProducts((productsRes as any).products);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const lowStockItems = products.filter((p) => p.stock < 5);

  const [labelOrder, setLabelOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  return (
    <div className="p-6 space-y-6">
      {/* 6 Key Performance Metric Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono font-black text-xl text-neutral-900">
            ₹{stats.totalSales.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
            ↑ Lifetime Store Volume
          </span>
        </div>

        {/* Today's Sales */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Today's Sales</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono font-black text-xl text-neutral-900">
            ₹{stats.todaySales.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
            Current session
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono font-black text-xl text-neutral-900">
            {stats.totalOrders}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
            All customer bookings
          </span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Orders</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono font-black text-xl text-amber-900">
            {stats.pendingOrders}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
            Action needed
          </span>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Delivered</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono font-black text-xl text-neutral-900">
            {stats.deliveredOrders}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
            Completed fulfillment
          </span>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Low Stock SKUs</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono font-black text-xl text-rose-700">
            {stats.lowStockCount}
          </div>
          <span className="text-[10px] text-rose-600 font-semibold mt-1 block">
            Stock &lt; 5 units
          </span>
        </div>
      </div>

      {/* Main Grid: Recent Orders Table & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-neutral-900">Recent Customer Orders</h2>
              <p className="text-[11px] text-neutral-500">Live order processing and status pipeline</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('ORDERS')}
              className="text-xs font-bold text-neutral-700 hover:text-black flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Total</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-black">{order.id}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-neutral-900">{order.customer.fullName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">+91 {order.customer.mobileNumber}</div>
                    </td>
                    <td className="p-3.5 text-neutral-600">
                      {order.items.reduce((sum, i) => sum + i.quantity, 0)} pcs
                    </td>
                    <td className="p-3.5 font-mono font-bold text-black">
                      ₹{(order.totalAmount ?? order.pricing?.grandTotal ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                          order.paymentMethod === 'COD'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Shipped' || order.status === 'Out for Delivery'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectOrder(order)}
                          className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-700"
                          title="View order details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLabelOrder(order)}
                          className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-700"
                          title="Print Shipping Label (4x6 / A4)"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvoiceOrder(order)}
                          className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-700"
                          title="Print GST Tax Invoice"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Box */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm text-neutral-900">Low Stock Reorder List</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('INVENTORY')}
                className="text-xs font-bold text-neutral-600 hover:text-black"
              >
                Manage
              </button>
            </div>

            <div className="divide-y divide-neutral-100">
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-neutral-500 py-6 text-center">
                  All garments are well stocked!
                </p>
              ) : (
                lowStockItems.map((prod) => (
                  <div key={prod.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-9 h-12 object-cover rounded bg-neutral-100 shrink-0 border border-neutral-200"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900 truncate">{prod.name}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">SKU: {prod.sku}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[11px] shrink-0 ml-2">
                      {prod.stock} left
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => onNavigateTab('INVENTORY')}
              className="w-full py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs rounded-xl transition-colors"
            >
              Open Inventory Manager →
            </button>
          </div>
        </div>
      </div>

      {/* Label Modal */}
      {labelOrder && (
        <PrintLabelModal
          isOpen={!!labelOrder}
          onClose={() => setLabelOrder(null)}
          order={labelOrder}
        />
      )}

      {/* Invoice Modal */}
      {invoiceOrder && (
        <PrintInvoiceModal
          isOpen={!!invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
          order={invoiceOrder}
        />
      )}
    </div>
  );
};

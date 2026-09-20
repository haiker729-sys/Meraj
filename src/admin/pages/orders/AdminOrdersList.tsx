import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../../types';
import { apiClient } from '../../../api/client';
import { Search, Printer, FileText, Eye, Filter, Ban, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { AdminOrderDetailsModal } from './AdminOrderDetailsModal';
import { PrintLabelModal } from '../../../shipping-label/print/PrintLabelModal';
import { PrintInvoiceModal } from '../../../invoice/print/PrintInvoiceModal';

export const AdminOrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [labelOrder, setLabelOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Customer requested cancellation');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.orders.list({ limit: 100 });
      if (res?.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  const isCancelledOrder = (o: Order) => {
    return (
      o.status === 'Cancelled' ||
      o.status === 'CANCELLED' ||
      o.orderStatus === 'CANCELLED' ||
      o.status?.toLowerCase() === 'cancelled'
    );
  };

  const isDeliveredOrder = (o: Order) => {
    return (
      o.status === 'Delivered' ||
      o.status === 'DELIVERED' ||
      o.orderStatus === 'DELIVERED'
    );
  };

  const statusOptions = [
    'ALL',
    'Order Placed',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'Cancelled') {
        if (!isCancelledOrder(o)) return false;
      } else if (statusFilter === 'Delivered') {
        if (!isDeliveredOrder(o)) return false;
      } else if (o.status !== statusFilter) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.mobileNumber.includes(q) ||
        o.shippingAddress.pinCode.includes(q) ||
        o.shippingAddress.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const confirmCancelOrder = async () => {
    if (!cancellingOrder) return;
    const orderId = cancellingOrder.id;
    try {
      await apiClient.orders.updateStatus(orderId, {
        status: 'CANCELLED',
        note: cancelReason
      });
      fetchOrders();
      showToast(`Order #${orderId} has been successfully cancelled!`, 'success');
    } catch (err) {
      showToast(`Failed to cancel order #${orderId}`, 'error');
    }
    setCancellingOrder(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, name, mobile, PIN..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
            />
          </div>

          <div className="text-xs text-neutral-500 font-medium">
            Showing <strong className="text-black font-mono">{filteredOrders.length}</strong> orders
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {statusOptions.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                statusFilter === st
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st}
              {st !== 'ALL' && (
                <span className="ml-1.5 opacity-70 font-mono text-[10px]">
                  {orders.filter((o) => o.status === st).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Order ID & Date</th>
                <th className="p-3.5">Customer Details</th>
                <th className="p-3.5">Destination</th>
                <th className="p-3.5">Articles</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Carrier / AWB</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-neutral-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-neutral-900 block">{order.id}</span>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-neutral-900 block">{order.customer.fullName}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        +91 {order.customer.mobileNumber}
                      </span>
                    </td>
                    <td className="p-3.5 text-neutral-700">
                      <span>{order.shippingAddress.city}</span>
                      <span className="text-[10px] text-neutral-400 font-mono block">
                        PIN {order.shippingAddress.pinCode}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-neutral-900">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} pcs
                      </span>
                      <span className="text-[10px] text-neutral-500 block font-mono">
                        ₹{(order.totalAmount ?? order.pricing?.grandTotal ?? 0).toLocaleString('en-IN')}
                      </span>
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
                      <span className="text-neutral-800 block text-[11px]">{order.courierName || 'Delhivery Express'}</span>
                      <span className="font-mono text-[10px] text-neutral-400 block">{order.trackingNumber || order.awbNumber || '-'}</span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isDeliveredOrder(order)
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCancelledOrder(order)
                            ? 'bg-rose-100 text-rose-800'
                            : order.status === 'Shipped' || order.status === 'Out for Delivery'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isCancelledOrder(order) ? 'Cancelled' : order.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-700"
                          title="Manage Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLabelOrder(order)}
                          className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600"
                          title="Print Shipping Label"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setInvoiceOrder(order)}
                          className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600"
                          title="Print Tax Invoice"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        {!isCancelledOrder(order) && !isDeliveredOrder(order) && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancellingOrder(order);
                              setCancelReason('Customer requested cancellation');
                            }}
                            className="p-1.5 hover:bg-rose-100 rounded-lg text-rose-600 transition-colors"
                            title="Cancel this Order"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
              <Ban className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Cancel Order #{cancellingOrder.id}?</h3>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Are you sure you want to cancel this order placed by <strong className="text-neutral-900">{cancellingOrder.customer.fullName}</strong>?
            </p>

            <div className="mt-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-neutral-500">Customer Mobile:</span>
                <span className="font-mono font-medium text-neutral-800">+91 {cancellingOrder.customer.mobileNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Items Ordered:</span>
                <span className="font-semibold text-neutral-800">{cancellingOrder.items.length} garments</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Order Amount:</span>
                <span className="font-bold font-mono text-neutral-900">
                  ₹{(cancellingOrder.totalAmount ?? cancellingOrder.pricing?.grandTotal ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment Method:</span>
                <span className="font-mono font-bold text-neutral-800">{cancellingOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-neutral-700 mb-1">Select Cancellation Reason:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl text-xs bg-white focus:border-black focus:outline-hidden"
              >
                <option value="Customer requested cancellation">Customer requested cancellation</option>
                <option value="Item out of stock / size unavailable">Item out of stock / size unavailable</option>
                <option value="Customer unreachable for confirmation">Customer unreachable for confirmation</option>
                <option value="Delivery address unserviceable">Delivery address unserviceable</option>
                <option value="Suspected fake / duplicate order">Suspected fake / duplicate order</option>
              </select>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-black rounded-xl hover:bg-neutral-100 transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={confirmCancelOrder}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirm Cancellation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-neutral-900 text-white rounded-2xl shadow-xl border border-neutral-800 text-xs font-medium animate-in slide-in-from-bottom-5">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Modals */}
      <AdminOrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={handleRefresh}
      />
      <PrintLabelModal
        isOpen={!!labelOrder}
        onClose={() => setLabelOrder(null)}
        order={labelOrder}
      />
      <PrintInvoiceModal
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        order={invoiceOrder}
      />
    </div>
  );
};

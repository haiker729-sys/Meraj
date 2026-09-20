import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { PrintInvoiceModal } from '../../../invoice/print/PrintInvoiceModal';
import { Order } from '../../../types';
import { User, Package, MapPin, Heart, Phone, Mail, Printer, ExternalLink, Loader2 } from 'lucide-react';

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'PROFILE' | 'ADDRESSES'>('ORDERS');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setIsLoading(true);
        // Try myOrders first if customer is logged in, else list
        const res = await apiClient.orders.myOrders().catch(() => apiClient.orders.list({ limit: 50 }));
        if (res?.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Failed to load customer orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserOrders();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50/60 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-bold text-base">
              FP
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-serif text-neutral-900">
                My Customer Account
              </h1>
              <p className="text-xs text-neutral-500">
                Manage your orders, shipment tracking, and saved preferences
              </p>
            </div>
          </div>

          <div className="flex gap-2 bg-neutral-200/80 p-1 rounded-xl text-xs font-bold self-start">
            <button
              type="button"
              onClick={() => setActiveTab('ORDERS')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'ORDERS' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Order History ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('PROFILE')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'PROFILE' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Profile & Contact
            </button>
          </div>
        </div>

        {activeTab === 'ORDERS' && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-400 mb-3" />
                <p className="text-sm text-neutral-600 font-medium">Loading orders from server...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto">
                <Package className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <h3 className="font-bold text-sm text-neutral-900">No orders placed yet</h3>
                <p className="text-xs text-neutral-500 mt-1">Discover trending collections and place your first order!</p>
                <button
                  onClick={() => onNavigate('/products')}
                  className="mt-5 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl"
                >
                  Browse Store
                </button>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-neutral-900">{order.id}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            order.status === 'Delivered' || order.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'Cancelled' || order.status === 'CANCELLED' || order.orderStatus === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {order.status === 'Cancelled' || order.status === 'CANCELLED' || order.orderStatus === 'CANCELLED' ? 'Cancelled' : order.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate(`/order-tracking?orderId=${order.id}&mobile=${order.customer.mobileNumber}`)
                        }
                        className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-xs font-bold text-neutral-800 transition-colors"
                      >
                        Track Status
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="px-3 py-1.5 border border-neutral-300 hover:border-black rounded-lg text-xs font-bold text-neutral-800 flex items-center gap-1 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-neutral-100">
                    {order.items.map((item, idx) => {
                      const imageSrc = item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80';
                      const title = item.name || item.product?.name || 'Fashion Item';
                      const sizeVal = item.size || item.selectedSize || 'M';
                      const colorName = item.colorName || item.selectedColor?.name || 'Standard';
                      const unitPrice = item.price || item.product?.price || 0;

                      return (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={imageSrc}
                              alt={title}
                              className="w-10 h-14 object-cover rounded-md border border-neutral-200"
                            />
                            <div>
                              <h4 className="font-semibold text-neutral-900">{title}</h4>
                              <p className="text-[11px] text-neutral-500">
                                Size: {sizeVal} • {colorName} • Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-neutral-900">
                            ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer details */}
                  <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs text-neutral-600 gap-2">
                    <div>
                      <span>Shipment via: <strong>{order.courierName || 'Delhivery Express'}</strong> (AWB: <span className="font-mono">{order.trackingNumber || order.awbNumber || 'AWB-PENDING'}</span>)</span>
                    </div>
                    <div>
                      <span>Total Paid / Payable: <strong className="text-black font-mono font-bold text-sm">₹{(order.totalAmount ?? order.pricing?.grandTotal ?? 0).toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'PROFILE' && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 max-w-xl shadow-2xs space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-neutral-900 pb-3 border-b border-neutral-100">
              Customer Details
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-500 block">Default Contact</span>
                <span className="font-bold text-neutral-900 text-sm">Ramesh Chandra Sharma</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Phone Number</span>
                <span className="font-mono font-bold text-neutral-900">+91 98765 43210</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Email ID</span>
                <span className="font-medium text-neutral-900">ramesh.sharma@example.com</span>
              </div>
              <div className="pt-4 border-t border-neutral-100">
                <span className="text-neutral-500 block">Primary Shipping Address</span>
                <p className="text-neutral-800 mt-1 leading-relaxed">
                  Shop No. 12, Main Cloth Market, Station Road, Indore, Madhya Pradesh - 452001
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedInvoiceOrder && (
          <PrintInvoiceModal
            isOpen={!!selectedInvoiceOrder}
            onClose={() => setSelectedInvoiceOrder(null)}
            order={selectedInvoiceOrder}
          />
        )}
      </div>
    </div>
  );
};

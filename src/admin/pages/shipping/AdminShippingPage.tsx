import React, { useState, useEffect } from 'react';
import { Order } from '../../../types';
import { apiClient } from '../../../api/client';
import { PrintLabelModal } from '../../../shipping-label/print/PrintLabelModal';
import { AdminTrackingScannerModal } from './AdminTrackingScannerModal';
import { Truck, Printer, Search, Package, MapPin, CheckCircle2, QrCode } from 'lucide-react';

export const AdminShippingPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForLabel, setSelectedOrderForLabel] = useState<Order | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const fetchShippingOrders = async () => {
    try {
      const res = await apiClient.orders.list({ limit: 100 });
      if (res?.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to load shipping orders:', err);
    }
  };

  useEffect(() => {
    fetchShippingOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.trackingNumber || o.awbNumber || '').toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.shippingAddress.pinCode.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner explaining printing capability & QR scanner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white p-6 rounded-3xl border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase mb-1">
            <Printer className="w-4 h-4" />
            <span>Thermal & Laser Print Engine</span>
          </div>
          <h2 className="text-xl font-bold font-serif">4x6" Thermal Shipping Label Generator</h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Compliant with standard Indian e-commerce thermal printers (TVS, TSC, Zebra) and standard A4 laser printers. Includes auto-rendered Code 128 barcode, QR Code, return address, and COD cash collection indicators.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          className="px-5 py-3 bg-white text-black hover:bg-neutral-100 font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4 text-black" />
          <span>Dispatch & QR Scanner</span>
        </button>
      </div>

      {/* Orders ready for label generation */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shipment by AWB, order ID, buyer..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR / Barcode</span>
            </button>
            <span className="text-xs text-neutral-500">
              <strong className="font-mono text-black">{filteredOrders.length}</strong> active consignments
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Recipient Buyer</th>
                <th className="p-3.5">Destination PIN & City</th>
                <th className="p-3.5">Courier & AWB</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Label Generation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-neutral-950">
                    {order.id}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-neutral-900 block">{order.customer.fullName}</span>
                    <span className="font-mono text-[11px] text-neutral-500">+91 {order.customer.mobileNumber}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-neutral-900 block font-semibold">{order.shippingAddress.city}, {order.shippingAddress.state}</span>
                    <span className="font-mono text-[11px] text-neutral-500">PIN: {order.shippingAddress.pinCode}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-neutral-900 font-semibold block">{order.courierName}</span>
                    <span className="font-mono text-[10px] text-neutral-500">{order.trackingNumber}</span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        order.paymentMethod === 'COD'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {order.paymentMethod === 'COD' ? `COD: ₹${order.totalAmount}` : 'PREPAID'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="text-[10px] uppercase font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForLabel(order)}
                      className="px-3.5 py-1.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-300" />
                      <span>Print Label</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Label Modal */}
      <PrintLabelModal
        isOpen={!!selectedOrderForLabel}
        onClose={() => setSelectedOrderForLabel(null)}
        order={selectedOrderForLabel}
      />

      {/* Admin QR Scanner Modal */}
      <AdminTrackingScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onOrderUpdated={fetchShippingOrders}
      />
    </div>
  );
};

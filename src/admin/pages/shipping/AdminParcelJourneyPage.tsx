import React, { useState, useEffect } from 'react';
import { Order, OrderTrackingEvent, JourneyStage } from '../../../types';
import { apiClient } from '../../../api/client';
import { AdminTrackingScannerModal } from './AdminTrackingScannerModal';
import { PrintLabelModal } from '../../../shipping-label/print/PrintLabelModal';
import {
  QrCode,
  Search,
  Truck,
  PackageCheck,
  Building2,
  CheckCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertCircle,
  MapPin,
  ChevronRight,
  Printer,
  Sparkles,
  Barcode
} from 'lucide-react';

export const AdminParcelJourneyPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [activeScanOrderId, setActiveScanOrderId] = useState<string | undefined>(undefined);
  const [labelOrder, setLabelOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.orders.list({ limit: 100 });
      if (res?.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to load orders for parcel journey:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getOrderStatus = (o: Order) => (o.orderStatus || o.status || 'ORDER_PLACED').toUpperCase();

  const counts = {
    all: orders.length,
    placed: orders.filter((o) => ['ORDER_PLACED', 'NEW', 'PAYMENT_PENDING'].includes(getOrderStatus(o))).length,
    confirmed: orders.filter((o) => getOrderStatus(o) === 'CONFIRMED').length,
    packed: orders.filter((o) => getOrderStatus(o) === 'PACKED').length,
    dispatched: orders.filter((o) => ['DISPATCHED', 'IN_TRANSIT'].includes(getOrderStatus(o))).length,
    outForDelivery: orders.filter((o) => getOrderStatus(o) === 'OUT_FOR_DELIVERY').length,
    delivered: orders.filter((o) => getOrderStatus(o) === 'DELIVERED').length
  };

  const filteredOrders = orders.filter((o) => {
    const status = getOrderStatus(o);
    if (selectedFilter === 'PLACED' && !['ORDER_PLACED', 'NEW', 'PAYMENT_PENDING'].includes(status)) return false;
    if (selectedFilter === 'CONFIRMED' && status !== 'CONFIRMED') return false;
    if (selectedFilter === 'PACKED' && status !== 'PACKED') return false;
    if (selectedFilter === 'TRANSIT' && !['DISPATCHED', 'IN_TRANSIT'].includes(status)) return false;
    if (selectedFilter === 'OUT_FOR_DELIVERY' && status !== 'OUT_FOR_DELIVERY') return false;
    if (selectedFilter === 'DELIVERED' && status !== 'DELIVERED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.trackingNumber || o.awbNumber || '').toLowerCase().includes(q) ||
        (o.trackingToken || '').toLowerCase().includes(q) ||
        o.customer?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.city?.toLowerCase().includes(q) ||
        o.shippingAddress?.pinCode?.includes(q)
      );
    }
    return true;
  });

  const getRecommendedStageText = (status: string) => {
    switch (status) {
      case 'ORDER_PLACED':
      case 'NEW':
      case 'PAYMENT_PENDING':
        return { stage: 'Admin Verification Scan', role: 'Admin', color: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'CONFIRMED':
        return { stage: 'Warehouse Packaging Scan', role: 'Warehouse Staff', color: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'PACKED':
        return { stage: 'Warehouse Dispatch Scan', role: 'Warehouse Staff', color: 'bg-indigo-100 text-indigo-900 border-indigo-200' };
      case 'DISPATCHED':
      case 'IN_TRANSIT':
        return { stage: 'Hub Arrival / Next Hub', role: 'Hub Operator', color: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'OUT_FOR_DELIVERY':
        return { stage: 'Doorstep Delivery Confirmation', role: 'Delivery Staff', color: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      case 'DELIVERED':
        return { stage: 'Delivered (Complete)', role: 'Completed', color: 'bg-neutral-100 text-neutral-800 border-neutral-200' };
      default:
        return { stage: 'Checkpoint Scan', role: 'Staff', color: 'bg-neutral-100 text-neutral-800 border-neutral-200' };
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner explaining the Single QR Journey System */}
      <div className="bg-neutral-900 text-white p-6 rounded-3xl border border-neutral-800 relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase mb-1.5">
              <QrCode className="w-4 h-4" />
              <span>SINGLE QR & BARCODE PARCEL JOURNEY SYSTEM</span>
            </div>
            <h2 className="text-2xl font-black font-serif tracking-tight">
              One Permanent Tracking ID • Scanned Across Every Checkpoint
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Each order is assigned one permanent secure Tracking ID and matching QR code printed on the shipping label. The exact same QR/barcode is scanned by Admin (auto-confirm), Warehouse (pack/dispatch), Logistics Hubs (append arrival/departure history), and Delivery Boys (doorstep confirmation). Tracking history is strictly immutable and append-only.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveScanOrderId(undefined);
              setIsScannerModalOpen(true);
            }}
            className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-black font-black rounded-2xl text-xs flex items-center gap-2.5 shadow-lg transition-all active:scale-95 shrink-0"
          >
            <QrCode className="w-5 h-5 text-black" />
            <span>Open Journey Scanner</span>
          </button>
        </div>

        {/* Journey Step Flow Pills */}
        <div className="mt-6 pt-5 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
          <div className="p-2.5 bg-neutral-950/80 rounded-xl border border-neutral-800">
            <span className="font-mono text-amber-400 text-[10px] block">1. ADMIN SCAN</span>
            <strong className="text-white text-xs block mt-0.5">Auto-Confirm</strong>
            <span className="text-[9px] text-neutral-400">ORDER_PLACED → CONFIRMED</span>
          </div>

          <div className="p-2.5 bg-neutral-950/80 rounded-xl border border-neutral-800">
            <span className="font-mono text-amber-400 text-[10px] block">2. WAREHOUSE</span>
            <strong className="text-white text-xs block mt-0.5">Pack & Dispatch</strong>
            <span className="text-[9px] text-neutral-400">PACKED / DISPATCHED</span>
          </div>

          <div className="p-2.5 bg-neutral-950/80 rounded-xl border border-neutral-800">
            <span className="font-mono text-amber-400 text-[10px] block">3. LOGISTICS HUB</span>
            <strong className="text-white text-xs block mt-0.5">Arrive & Depart</strong>
            <span className="text-[9px] text-neutral-400">Record hub name & staff</span>
          </div>

          <div className="p-2.5 bg-neutral-950/80 rounded-xl border border-neutral-800">
            <span className="font-mono text-amber-400 text-[10px] block">4. NEXT HUB</span>
            <strong className="text-white text-xs block mt-0.5">Append History</strong>
            <span className="text-[9px] text-neutral-400">Never overwrite previous</span>
          </div>

          <div className="p-2.5 bg-neutral-950/80 rounded-xl border border-neutral-800">
            <span className="font-mono text-amber-400 text-[10px] block">5. OUT FOR DELIVERY</span>
            <strong className="text-white text-xs block mt-0.5">Delivery Boy</strong>
            <span className="text-[9px] text-neutral-400">Status → OUT_FOR_DELIVERY</span>
          </div>

          <div className="p-2.5 bg-neutral-950/80 rounded-xl border border-neutral-800">
            <span className="font-mono text-amber-400 text-[10px] block">6. DELIVERED</span>
            <strong className="text-white text-xs block mt-0.5">Confirmation</strong>
            <span className="text-[9px] text-neutral-400">Recipient Name & COD Paid</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Real-time Counts */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setSelectedFilter('ALL')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
            selectedFilter === 'ALL'
              ? 'bg-black text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          All Parcels ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('PLACED')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
            selectedFilter === 'PLACED'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Awaiting Admin Scan ({counts.placed})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('CONFIRMED')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
            selectedFilter === 'CONFIRMED'
              ? 'bg-amber-500 text-black shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Awaiting Packaging ({counts.confirmed})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('PACKED')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
            selectedFilter === 'PACKED'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Packed / Ready for Dispatch ({counts.packed})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('TRANSIT')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
            selectedFilter === 'TRANSIT'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          In Transit / Hubs ({counts.dispatched})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('OUT_FOR_DELIVERY')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
            selectedFilter === 'OUT_FOR_DELIVERY'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Out For Delivery ({counts.outForDelivery})
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter('DELIVERED')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
            selectedFilter === 'DELIVERED'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200'
          }`}
        >
          Delivered ({counts.delivered})
        </button>
      </div>

      {/* Main Parcels Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, permanent AWB, recipient..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchOrders}
              className="px-3 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-lg flex items-center gap-1 border border-neutral-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <span className="text-xs text-neutral-500">
              Showing <strong className="font-mono text-black">{filteredOrders.length}</strong> parcels
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Parcel & AWB ID</th>
                <th className="p-3.5">Customer / Destination</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5">Next Recommended Journey Action</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-400">
                    No parcels found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const status = getOrderStatus(order);
                  const nextRec = getRecommendedStageText(status);

                  return (
                    <tr key={order.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-black text-neutral-900">{order.id}</div>
                        <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                          AWB: {order.trackingNumber || order.awbNumber || `DEL-${order.id}`}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-neutral-900 truncate max-w-[180px]">
                          {order.customer?.fullName || order.shippingName}
                        </div>
                        <div className="text-[10px] text-neutral-500 truncate max-w-[180px]">
                          {order.shippingAddress?.district || order.shippingAddress?.city}, {order.shippingAddress?.state} ({order.shippingAddress?.pinCode || order.shippingPincode})
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full border ${
                          status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : status === 'CONFIRMED'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : status === 'OUT_FOR_DELIVERY'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-neutral-100 text-neutral-800 border-neutral-200'
                        }`}>
                          {status}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${nextRec.color}`}>
                          <span>{nextRec.stage}</span>
                          <span className="text-[9px] font-mono opacity-80">({nextRec.role})</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          order.paymentMethod === 'COD'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {order.paymentMethod === 'COD' ? `COD: ₹${order.totalAmount}` : 'PREPAID'}
                        </span>
                        {order.paymentStatus && (
                          <span className="block text-[9px] text-neutral-500 font-mono mt-0.5">
                            Status: {order.paymentStatus}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveScanOrderId(order.id);
                              setIsScannerModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-amber-300 font-bold rounded-lg text-xs inline-flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Scan Checkpoint</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setLabelOrder(order)}
                            className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold rounded-lg text-xs inline-flex items-center gap-1 border border-neutral-300 transition-all active:scale-95"
                            title="Print Single QR/Barcode Thermal Shipping Label"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Label</span>
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

      {/* Scanner Modal */}
      <AdminTrackingScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => {
          setIsScannerModalOpen(false);
          setActiveScanOrderId(undefined);
        }}
        initialOrderId={activeScanOrderId}
        onOrderUpdated={fetchOrders}
      />

      {/* Label Modal */}
      <PrintLabelModal
        isOpen={!!labelOrder}
        onClose={() => setLabelOrder(null)}
        order={labelOrder}
      />
    </div>
  );
};

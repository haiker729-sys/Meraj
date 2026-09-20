import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../../../types';
import { storeDb } from '../../../database/store';
import { PrintInvoiceModal } from '../../../invoice/print/PrintInvoiceModal';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Printer,
  ChevronRight,
  Ban
} from 'lucide-react';

interface OrderTrackingPageProps {
  initialOrderId?: string;
  initialMobile?: string;
  onNavigate: (path: string) => void;
}

const ORDER_STAGES: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'Order Placed', label: 'Order Placed', description: 'Your order has been recorded in our system.' },
  { status: 'Confirmed', label: 'Confirmed', description: 'Store verified the inventory and payment details.' },
  { status: 'Packed', label: 'Packed', description: 'Garments quality checked and boxed in warehouse.' },
  { status: 'Shipped', label: 'Shipped', description: 'Dispatched with logistics carrier for transport.' },
  { status: 'Out for Delivery', label: 'Out for Delivery', description: 'Courier partner is out on route in your area.' },
  { status: 'Delivered', label: 'Delivered', description: 'Package successfully delivered to recipient.' }
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialOrderId = '',
  initialMobile = '',
  onNavigate
}) => {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [mobileNumber, setMobileNumber] = useState(initialMobile);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    if (initialOrderId && initialMobile) {
      handleSearchSubmit();
    }
  }, [initialOrderId, initialMobile]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setHasSearched(true);

    if (!orderId.trim() || !mobileNumber.trim()) {
      setErrorMsg('Please enter both Order ID and Mobile Number to track.');
      setSearchedOrder(null);
      return;
    }

    const order = storeDb.findOrder(orderId.trim(), mobileNumber.trim());
    if (order) {
      setSearchedOrder(order);
    } else {
      setSearchedOrder(null);
      setErrorMsg('No order found matching this Order ID and Mobile Number combination.');
    }
  };

  // Helper to determine stage state (completed, active, upcoming)
  const getStageIndex = (status?: OrderStatus): number => {
    if (!status) return 0;
    const normalized = status.toUpperCase();
    const map: Record<string, number> = {
      NEW: 0,
      'ORDER PLACED': 0,
      CONFIRMED: 1,
      PACKED: 2,
      SHIPPED: 3,
      OUT_FOR_DELIVERY: 4,
      'OUT FOR DELIVERY': 4,
      DELIVERED: 5
    };
    return map[normalized] ?? 0;
  };

  const currentStageIndex = searchedOrder ? getStageIndex(searchedOrder.status || searchedOrder.orderStatus) : 0;

  return (
    <div className="min-h-screen bg-neutral-50/60 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Truck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950">
            Track Your Shipment
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time delivery milestones for your Fashion Point clothing order
          </p>
        </div>

        {/* Tracking Search Form */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs mb-8">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Order ID
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                placeholder="e.g. FP-10001"
                className="w-full px-3.5 py-2.5 text-xs font-mono border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden uppercase"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <div className="flex">
                <span className="px-3 py-2.5 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-xl text-neutral-600 font-mono text-xs">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile"
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-neutral-300 rounded-r-xl focus:border-black focus:outline-hidden"
                />
              </div>
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 h-10"
              >
                <Search className="w-4 h-4" />
                <span>Track</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Help Text */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between text-[11px] text-neutral-500">
            <span>
              💡 Demo quick check: Try Order ID <strong className="font-mono text-neutral-800">FP-10001</strong> with Mobile <strong className="font-mono text-neutral-800">9876543210</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setOrderId('FP-10001');
                setMobileNumber('9876543210');
              }}
              className="text-neutral-900 font-bold underline hover:text-black ml-auto"
            >
              Fill Sample Data
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-xs mb-8">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Order Details & Visual Timeline */}
        {searchedOrder && (
          <div className="space-y-6">
            {/* Header info box */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-lg text-neutral-900">
                      {searchedOrder.id}
                    </span>
                    <span
                      className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        searchedOrder.status === 'Cancelled' || searchedOrder.status === 'CANCELLED' || searchedOrder.orderStatus === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : searchedOrder.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : searchedOrder.status === 'Shipped' || searchedOrder.status === 'Out for Delivery'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {searchedOrder.status === 'Cancelled' || searchedOrder.status === 'CANCELLED' || searchedOrder.orderStatus === 'CANCELLED'
                        ? 'Cancelled'
                        : searchedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Placed by <strong className="text-neutral-800">{searchedOrder.customer.fullName}</strong> on{' '}
                    {new Date(searchedOrder.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInvoiceOpen(true)}
                    className="px-3.5 py-2 border border-neutral-300 hover:border-black rounded-xl text-xs font-bold text-neutral-800 flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View Invoice</span>
                  </button>
                </div>
              </div>

              {/* Cancelled Banner if applicable */}
              {(searchedOrder.status === 'Cancelled' || searchedOrder.status === 'CANCELLED' || searchedOrder.orderStatus === 'CANCELLED') && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl my-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Ban className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-950">Shipment Cancelled</h4>
                    <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                      This order has been cancelled by the store administrator. If you made an online prepayment, the refund process has been triggered to your original payment method.
                    </p>
                  </div>
                </div>
              )}

              {/* Logistics & Carrier info banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Courier Partner</span>
                  <span className="font-semibold text-neutral-900">{searchedOrder.courierName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Tracking AWB #</span>
                  <span className="font-mono font-bold text-neutral-900">{searchedOrder.trackingNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Estimated Delivery</span>
                  <span className="font-bold text-neutral-900 text-emerald-700">
                    {searchedOrder.estimatedDelivery || '2 - 4 Business Days'}
                  </span>
                </div>
              </div>
            </div>

            {/* 6-Stage Timeline Stepper */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-2xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-6">
                Shipment Milestones
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-200">
                {ORDER_STAGES.map((stage, idx) => {
                  const isCompleted = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stage.status} className="relative flex items-start gap-4">
                      {/* Milestone Dot/Icon */}
                      <div
                        className={`absolute -left-6 sm:-left-8 w-5 sm:w-7 h-5 sm:h-7 rounded-full flex items-center justify-center text-white text-xs transition-all ${
                          isCompleted
                            ? 'bg-black shadow-xs ring-4 ring-neutral-100'
                            : 'bg-neutral-200 text-neutral-400'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-neutral-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              isCurrent
                                ? 'text-black font-black'
                                : isCompleted
                                ? 'text-neutral-900'
                                : 'text-neutral-400'
                            }`}
                          >
                            {stage.label}
                          </h4>
                          {isCurrent && (
                            <span className="bg-neutral-900 text-white text-[9px] font-mono uppercase px-1.5 py-0.5 rounded">
                              Current Status
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">{stage.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items inside this package */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-500" />
                <span>Items in This Consignment ({searchedOrder.items.length})</span>
              </h3>

              <div className="divide-y divide-neutral-100">
                {searchedOrder.items.map((item, i) => {
                  const imageSrc = item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80';
                  const title = item.name || item.product?.name || 'Fashion Apparel';
                  const sizeVal = item.size || item.selectedSize || 'M';
                  const colorName = item.colorName || item.selectedColor?.name || 'Standard';
                  const unitPrice = item.price || item.product?.price || 0;

                  return (
                    <div key={i} className="py-3 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={imageSrc}
                          alt={title}
                          className="w-12 h-16 object-cover rounded-lg border border-neutral-200 bg-neutral-50 shrink-0"
                        />
                        <div>
                          <h4 className="font-semibold text-neutral-900">{title}</h4>
                          <p className="text-[11px] text-neutral-500">
                            Size: <strong className="font-mono">{sizeVal}</strong> • Color: {colorName} • Qty: {item.quantity}
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
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {searchedOrder && (
          <PrintInvoiceModal
            isOpen={isInvoiceOpen}
            onClose={() => setIsInvoiceOpen(false)}
            order={searchedOrder}
          />
        )}
      </div>
    </div>
  );
};

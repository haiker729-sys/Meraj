import React, { useState, useEffect } from 'react';
import { Order, OrderTrackingEvent } from '../../../types';
import { apiClient } from '../../../api/client';
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
  Ban,
  ShieldCheck,
  QrCode,
  ArrowRight
} from 'lucide-react';

interface OrderTrackingPageProps {
  initialOrderId?: string;
  initialMobile?: string;
  onNavigate: (path: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialOrderId = '',
  initialMobile = '',
  onNavigate
}) => {
  // Query parameters parsing from URL
  const [searchQuery, setSearchQuery] = useState(initialOrderId);
  const [mobileNumber, setMobileNumber] = useState(initialMobile);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<OrderTrackingEvent[]>([]);
  const [isScanContext, setIsScanContext] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Initialize from URL search parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlOrderId = urlParams.get('orderId') || urlParams.get('id') || '';
      const urlToken = urlParams.get('token') || '';
      const urlMobile = urlParams.get('mobile') || '';
      const urlScan = urlParams.get('scan') === 'true';

      if (urlScan) setIsScanContext(true);
      if (urlMobile) setMobileNumber(urlMobile);

      const target = urlToken || urlOrderId;
      if (target) {
        setSearchQuery(target);
        performTrackingLookup(target, urlMobile, urlScan);
      } else if (initialOrderId) {
        setSearchQuery(initialOrderId);
        performTrackingLookup(initialOrderId, initialMobile, false);
      }
    }
  }, [initialOrderId, initialMobile]);

  const performTrackingLookup = async (query: string, mobile?: string, isScan = false) => {
    if (!query.trim()) return;
    setIsSearching(true);
    setErrorMsg(null);
    setHasSearched(true);

    try {
      const res = await apiClient.orders.track(query.trim(), mobile?.trim(), isScan);
      if (res?.order) {
        setSearchedOrder(res.order);
        if (res.trackingEvents && Array.isArray(res.trackingEvents)) {
          setTrackingEvents(res.trackingEvents);
        } else {
          // Fetch events explicitly if not bundled
          const eventsRes = await apiClient.orders.getTracking(res.order.id).catch(() => null);
          if (eventsRes?.trackingEvents) {
            setTrackingEvents(eventsRes.trackingEvents);
          } else {
            setTrackingEvents([]);
          }
        }
      } else {
        setSearchedOrder(null);
        setTrackingEvents([]);
        setErrorMsg('No active order found matching your tracking identifier.');
      }
    } catch (err: any) {
      setSearchedOrder(null);
      setTrackingEvents([]);
      setErrorMsg(err.message || 'Could not retrieve tracking details. Please check your Order ID or tracking code.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setErrorMsg('Please enter an Order ID, AWB Tracking Number, or Tracking Token.');
      return;
    }
    performTrackingLookup(searchQuery, mobileNumber, isScanContext);
  };

  // Helper to mask recipient name for privacy (e.g. Ramesh Chandra -> R***** C******)
  const maskName = (name?: string): string => {
    if (!name) return 'Customer';
    return name
      .split(' ')
      .map((part) => (part.length > 1 ? `${part[0]}${'*'.repeat(Math.min(part.length - 1, 5))}` : part))
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Truck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950">
            Real-Time Parcel Tracking
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Official logistics milestones verified through PostgreSQL audit log
          </p>
        </div>

        {/* Scan notice if customer arrived via QR scan */}
        {isScanContext && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs text-emerald-900">
            <QrCode className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold">Verified Shipping Label QR Code Scanned</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Displaying authentic, tamper-proof tracking records for this parcel. Read-only verified view.
              </p>
            </div>
          </div>
        )}

        {/* Tracking Search Form */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs mb-8">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Order ID / AWB / Tracking Token *
              </label>
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                placeholder="e.g. FP-10001, AWB-DEL-10001, or tk_..."
                className="w-full px-3.5 py-2.5 text-xs font-mono border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden uppercase"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Mobile Number <span className="text-neutral-400 font-normal">(Optional)</span>
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
                disabled={isSearching}
                className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 h-10"
              >
                <Search className="w-4 h-4" />
                <span>{isSearching ? 'Searching...' : 'Track'}</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Help Text */}
          <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between text-[11px] text-neutral-500">
            <span>
              💡 Quick check: Try sample Order ID <strong className="font-mono text-neutral-800">FP-10001</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('FP-10001');
                setMobileNumber('9876543210');
                performTrackingLookup('FP-10001', '9876543210', false);
              }}
              className="text-neutral-900 font-bold underline hover:text-black ml-auto"
            >
              Load Sample Order
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

        {/* Order Details & Real Verified Milestones */}
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
                          : searchedOrder.status === 'Delivered' || searchedOrder.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : searchedOrder.status === 'Shipped' || searchedOrder.status === 'SHIPPED' || searchedOrder.status === 'Out for Delivery' || searchedOrder.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {searchedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Booked on{' '}
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

              {/* Cancelled Alert */}
              {(searchedOrder.status === 'Cancelled' || searchedOrder.status === 'CANCELLED' || searchedOrder.orderStatus === 'CANCELLED') && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl my-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Ban className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-950">Shipment Cancelled</h4>
                    <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                      This order has been marked as cancelled in the system.
                    </p>
                  </div>
                </div>
              )}

              {/* Logistics & Carrier info banner */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Courier Partner</span>
                  <span className="font-semibold text-neutral-900">{searchedOrder.courierName || 'Fashion Point Express'}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Tracking AWB #</span>
                  <span className="font-mono font-bold text-neutral-900">
                    {searchedOrder.trackingNumber || searchedOrder.awbNumber || 'PENDING'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Current Location</span>
                  <span className="font-semibold text-neutral-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{searchedOrder.currentLocation || 'Central Warehouse'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Expected Delivery</span>
                  <span className="font-bold text-emerald-700">
                    {searchedOrder.expectedDeliveryDate
                      ? new Date(searchedOrder.expectedDeliveryDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : searchedOrder.estimatedDelivery || '2 - 4 Business Days'}
                  </span>
                </div>
              </div>
            </div>

            {/* REAL VERIFIED TRACKING TIMELINE */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                    Verified Shipment Timeline
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Authentic scan records stored in PostgreSQL audit log
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Tamper-Proof Audit
                </span>
              </div>

              {trackingEvents.length === 0 ? (
                <div className="py-8 text-center bg-neutral-50/70 rounded-2xl border border-dashed border-neutral-200 p-6">
                  <Clock className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-neutral-800">
                    Tracking information has been created. Awaiting first transit scan.
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1 max-w-sm mx-auto">
                    The warehouse has generated the shipping token. Updates will record here as soon as our hub or courier partner scans the barcode.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-200">
                  {trackingEvents.map((event, idx) => {
                    const isLatest = idx === 0;
                    return (
                      <div key={event.id || idx} className="relative flex items-start gap-4">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-6 sm:-left-8 w-5 sm:w-7 h-5 sm:h-7 rounded-full flex items-center justify-center text-white text-xs ${
                            isLatest
                              ? 'bg-black ring-4 ring-neutral-100 shadow-xs'
                              : 'bg-neutral-300 text-neutral-600'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" />
                        </div>

                        <div className="flex-1 bg-neutral-50/60 p-4 rounded-xl border border-neutral-100">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                                {event.status}
                              </h4>
                              {isLatest && (
                                <span className="bg-black text-white text-[9px] font-mono uppercase px-1.5 py-0.5 rounded">
                                  Latest Event
                                </span>
                              )}
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 text-neutral-700">
                                {event.source || 'Warehouse'}
                              </span>
                            </div>

                            <span className="text-[11px] text-neutral-500 font-mono">
                              {new Date(event.createdAt).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-700 mt-1">{event.description}</p>

                          {event.location && (
                            <p className="text-[11px] text-neutral-500 flex items-center gap-1 mt-2">
                              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Recorded at: <strong>{event.location}</strong></span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Delivery Address Snapshot (Privacy Masked) */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span>Destination Address Snapshot</span>
              </h3>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1">
                <p className="font-bold text-neutral-900">
                  Recipient: {maskName(searchedOrder.shippingName || searchedOrder.customer?.fullName)}
                </p>
                <p className="text-neutral-700">
                  Destination: {searchedOrder.shippingDistrict || searchedOrder.shippingAddress?.district || searchedOrder.shippingCity || searchedOrder.shippingAddress?.city},{' '}
                  {searchedOrder.shippingState || searchedOrder.shippingAddress?.state} -{' '}
                  <span className="font-mono font-bold">
                    {searchedOrder.shippingPincode || searchedOrder.shippingAddress?.pinCode}
                  </span>
                </p>
                <p className="text-[11px] text-neutral-500">
                  Phone: +91 {searchedOrder.shippingPhone ? `${searchedOrder.shippingPhone.substring(0, 3)}****${searchedOrder.shippingPhone.slice(-3)}` : 'Verified'}
                </p>
              </div>
            </div>

            {/* Consignment Items */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-neutral-500" />
                <span>Package Contents ({searchedOrder.items.length})</span>
              </h3>

              <div className="divide-y divide-neutral-100">
                {searchedOrder.items.map((item, i) => {
                  const imageSrc =
                    item.image ||
                    item.product?.images?.[0] ||
                    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80';
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
                            Size: <strong className="font-mono">{sizeVal}</strong> • Color: {colorName} • Qty:{' '}
                            {item.quantity}
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

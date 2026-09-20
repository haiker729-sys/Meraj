import React, { useState, useEffect } from 'react';
import { Order } from '../../../types';
import { apiClient } from '../../../api/client';
import { 
  CheckCircle2, 
  Printer, 
  Package, 
  MapPin, 
  Truck, 
  Calendar, 
  Loader2, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  Check, 
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { PrintInvoiceModal } from '../../../invoice/print/PrintInvoiceModal';

interface OrderSuccessPageProps {
  order?: Order | null;
  orderId?: string;
  onNavigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ order: propOrder, orderId, onNavigate }) => {
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(propOrder || null);
  const [loading, setLoading] = useState<boolean>(!propOrder && !!orderId);

  useEffect(() => {
    if (propOrder) {
      setOrder(propOrder);
      return;
    }
    if (orderId) {
      setLoading(true);
      apiClient.orders.getById(orderId)
        .then((res) => {
          if (res?.order) setOrder(res.order);
        })
        .catch(() => {
          // If getById requires admin auth, try track endpoint
          return apiClient.orders.track(orderId).then((res) => {
            if (res?.order) setOrder(res.order);
          });
        })
        .catch((err) => {
          console.error('Failed to load order:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [propOrder, orderId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#09090b] text-white flex items-center justify-center p-4">
        <div className="relative p-8 rounded-3xl bg-neutral-900/60 backdrop-blur-2xl border border-white/20 text-center max-w-md shadow-2xl">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-3" />
          <p className="text-sm font-semibold text-neutral-200">Confirming your luxury order details...</p>
          <p className="text-xs text-neutral-400 mt-1">Directly syncing with warehouse dispatch systems</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#09090b] text-white flex items-center justify-center p-4">
        <div className="relative p-8 rounded-3xl bg-neutral-900/60 backdrop-blur-2xl border border-white/20 text-center max-w-md shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/20 text-neutral-400 flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-serif font-bold text-white">No Order Record Found</h2>
          <p className="text-xs text-neutral-400 mt-1 mb-6">
            We couldn't retrieve this order. Please verify your order ID or search via the Live Tracking page.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={() => onNavigate('/order-tracking')}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Search Order Tracking
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/home')}
              className="px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-semibold rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              Return to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Delivery date formatting
  const deliveryDateFormatted = order.estimatedDelivery
    ? isNaN(Date.parse(order.estimatedDelivery))
      ? order.estimatedDelivery
      : new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
    : '3 - 5 Business Days';

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#09090b] text-white flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 overflow-hidden selection:bg-amber-400 selection:text-black">
      {/* AMBIENT GLOW SPHERES (Matching LoginPage luxury refractions) */}
      <div className="absolute top-1/6 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-amber-500/15 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-emerald-600/15 blur-[140px] pointer-events-none" />
      <div className="absolute -top-10 right-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* TOP BRAND NAVIGATION BAR */}
      <div className="relative z-10 w-full max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={() => onNavigate('/home')}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white px-3.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 backdrop-blur-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-300 text-neutral-950 font-black flex items-center justify-center font-serif text-sm shadow-md shadow-amber-400/20">
              FP
            </div>
            <div>
              <span className="font-serif font-black tracking-tight text-sm text-white block">
                FASHION POINT
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300 block -mt-0.5">
                Privé Order Confirmed
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsInvoiceOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 backdrop-blur-md transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Tax Invoice</span>
          </button>
        </div>
      </div>

      {/* MAIN LUXURY GLASS CARD */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className="relative p-6 sm:p-10 rounded-3xl bg-neutral-900/60 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/80">
          {/* Glass Card Specular Highlight Edge */}
          <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Top Celebratory Header */}
          <div className="text-center max-w-xl mx-auto">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute -inset-2 rounded-full bg-emerald-500/20 blur-lg animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-emerald-400/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold tracking-widest uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Order Placed Successfully • पुष्टि हो गई
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight">
              Thank You, {order.customer.fullName}!
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
              Your garments order is locked in our boutique fulfillment system. We have sent verification receipts to WhatsApp & SMS on{' '}
              <strong className="font-mono text-amber-300 font-bold">+91 {order.customer.mobileNumber}</strong>.
            </p>
          </div>

          {/* WHATSAPP & SMS CONFIRMATION NOTIFICATION BANNER */}
          <div className="mt-6 p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs text-emerald-200 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-emerald-300 text-xs">Instant WhatsApp Tracking Link Sent</p>
                <p className="text-[11px] text-emerald-400/80">
                  Live GPS courier updates and dispatch alerts will arrive directly on your registered mobile.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 hidden sm:inline-block">
              SMS Sent
            </span>
          </div>

          {/* KEY DETAILS GLASS TILES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                Order ID
              </span>
              <span className="font-mono font-bold text-xs sm:text-sm text-white block truncate" title={order.id}>
                {order.id}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                Payment Mode
              </span>
              <span className="font-bold text-xs sm:text-sm text-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Prepaid Online'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                Estimated Delivery
              </span>
              <span className="font-bold text-xs sm:text-sm text-white flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {deliveryDateFormatted}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                Grand Total
              </span>
              <span className="font-mono font-black text-xs sm:text-sm text-emerald-400">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* DISPATCH STAGES STEPPER */}
          <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300 mb-3">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Clock className="w-3.5 h-3.5" />
                Dispatch & Delivery Timeline
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Stage 1 of 4: Confirmed</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-neutral-950 font-black flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="font-bold text-emerald-400">Confirmed</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-white/[0.1] border border-white/20 text-neutral-400 flex items-center justify-center">
                  2
                </div>
                <span className="text-neutral-400">Packed</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-white/[0.1] border border-white/20 text-neutral-400 flex items-center justify-center">
                  3
                </div>
                <span className="text-neutral-400">In Transit</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-white/[0.1] border border-white/20 text-neutral-400 flex items-center justify-center">
                  4
                </div>
                <span className="text-neutral-400">Delivered</span>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS (DIRECT NAVIGATION TO ORDER STATUS) */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={() => onNavigate(`/order-tracking?orderId=${order.id}&mobile=${order.customer.mobileNumber}`)}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-400/20 flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Truck className="w-4 h-4" />
              <span>Track Order Live / आर्डर स्टेटस देखें</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInvoiceOpen(true)}
              className="px-5 py-3 bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/20 font-bold text-xs uppercase tracking-wider rounded-xl backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Download Tax Invoice</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/home')}
              className="px-5 py-3 text-neutral-400 hover:text-white font-semibold text-xs tracking-wider transition-colors cursor-pointer"
            >
              Continue Shopping →
            </button>
          </div>

          {/* SUMMARY OF ORDERED GARMENTS */}
          <div className="mt-10 pt-8 border-t border-white/10 text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <span>Ordered Garments ({order.items.length})</span>
              </h3>
              <span className="text-[11px] text-neutral-400">
                Verified Quality Inspected
              </span>
            </div>

            <div className="divide-y divide-white/5 bg-white/[0.02] rounded-2xl border border-white/10 p-3 sm:p-4">
              {order.items.map((item, idx) => {
                const imageSrc = item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80';
                const title = item.name || item.product?.name || 'Fashion Apparel';
                const sizeVal = item.size || item.selectedSize || 'M';
                const colorName = item.colorName || item.selectedColor?.name || 'Standard';
                const unitPrice = item.price || item.product?.price || 0;

                return (
                  <div key={idx} className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={imageSrc}
                        alt={title}
                        className="w-12 h-16 object-cover rounded-xl border border-white/15 bg-neutral-800 shrink-0"
                      />
                      <div>
                        <h4 className="font-semibold text-xs text-white leading-snug">{title}</h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Size: <strong className="font-mono text-amber-300">{sizeVal}</strong> • Color: {colorName} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-emerald-400">
                      ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* SHIPPING DESTINATION CARD */}
            <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs">
              <div className="flex items-center gap-2 font-bold text-neutral-200 mb-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Shipping Address & Dispatch Location</span>
              </div>
              <p className="text-neutral-300 leading-relaxed text-xs">
                {order.shippingAddress.houseShopNo}, {order.shippingAddress.street},{' '}
                {order.shippingAddress.villageArea}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.district ? `${order.shippingAddress.district}, ` : ''}
                {order.shippingAddress.state} - <strong className="font-mono text-amber-300">{order.shippingAddress.pinCode}</strong>
                {order.shippingAddress.postOffice && (
                  <span className="block text-[11px] text-neutral-400 mt-1">
                    Designated Post Office / डाकघर: <span className="text-neutral-200 font-semibold">{order.shippingAddress.postOffice}</span>
                  </span>
                )}
                {order.shippingAddress.landmark && (
                  <span className="block text-[11px] text-neutral-400">
                    Landmark: {order.shippingAddress.landmark}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* INVOICE MODAL FOR CUSTOMER DOWNLOAD / PRINT */}
      <PrintInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={order}
      />
    </div>
  );
};

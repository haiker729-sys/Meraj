import React, { useState } from 'react';
import { Order } from '../../../types';
import { storeDb } from '../../../database/store';
import { CheckCircle2, ArrowRight, Printer, Package, MapPin, Truck, Calendar } from 'lucide-react';
import { PrintInvoiceModal } from '../../../invoice/print/PrintInvoiceModal';

interface OrderSuccessPageProps {
  order?: Order | null;
  orderId?: string;
  onNavigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ order: propOrder, orderId, onNavigate }) => {
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const order = propOrder || (orderId ? storeDb.getOrderById(orderId) : null) || storeDb.getOrders()[0] || null;

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center max-w-md">
          <h2 className="text-lg font-bold text-neutral-900">No recent order found</h2>
          <p className="text-xs text-neutral-500 mt-1 mb-6">
            Please browse our collections or check your past order status.
          </p>
          <button
            onClick={() => onNavigate('/home')}
            className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl"
          >
            Go to Store Home
          </button>
        </div>
      </div>
    );
  }

  // Delivery date formatting
  const deliveryDateFormatted = order.estimatedDelivery
    ? isNaN(Date.parse(order.estimatedDelivery))
      ? order.estimatedDelivery
      : new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
    : '2 - 4 Business Days';

  return (
    <div className="min-h-screen bg-neutral-50/60 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Main Success Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Order Confirmed & Placed
          </span>

          <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950 mt-3">
            Thank You, {order.customer.fullName}!
          </h1>

          <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-lg mx-auto">
            Your order has been successfully placed. We have sent confirmation details via WhatsApp & SMS to{' '}
            <strong className="font-mono text-neutral-900">+91 {order.customer.mobileNumber}</strong>.
          </p>

          {/* Key Order Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 text-left bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Order ID</span>
              <span className="font-mono font-black text-xs sm:text-sm text-neutral-900">{order.id}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Payment Mode</span>
              <span className="font-mono font-bold text-xs sm:text-sm text-neutral-900">
                {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Paid'}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Estimated Delivery</span>
              <span className="font-bold text-xs sm:text-sm text-neutral-900 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                {deliveryDateFormatted}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={() => onNavigate(`/order-tracking?orderId=${order.id}&mobile=${order.customer.mobileNumber}`)}
              className="px-6 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>Track Order Live</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInvoiceOpen(true)}
              className="px-5 py-3 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-neutral-600" />
              <span>Download Tax Invoice</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/home')}
              className="px-5 py-3 text-neutral-600 hover:text-black font-semibold text-xs tracking-wider transition-colors"
            >
              Continue Shopping →
            </button>
          </div>

          {/* Summary of Ordered Items */}
          <div className="mt-10 pt-8 border-t border-neutral-100 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-neutral-600" />
              <span>Ordered Garments ({order.items.length})</span>
            </h3>

            <div className="divide-y divide-neutral-100">
              {order.items.map((item, idx) => {
                const imageSrc = item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80';
                const title = item.name || item.product?.name || 'Fashion Apparel';
                const sizeVal = item.size || item.selectedSize || 'M';
                const colorName = item.colorName || item.selectedColor?.name || 'Standard';
                const unitPrice = item.price || item.product?.price || 0;

                return (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={imageSrc}
                        alt={title}
                        className="w-12 h-16 object-cover rounded-lg border border-neutral-200 bg-neutral-50 shrink-0"
                      />
                      <div>
                        <h4 className="font-semibold text-xs text-neutral-900">{title}</h4>
                        <p className="text-[11px] text-neutral-500">
                          Size: <strong className="font-mono">{sizeVal}</strong> • {colorName} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-neutral-900">
                      ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Delivery address details */}
            <div className="mt-6 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
              <div className="flex items-center gap-2 font-bold text-neutral-900 mb-1">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span>Shipping Address</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                {order.shippingAddress.houseShopNo}, {order.shippingAddress.street},{' '}
                {order.shippingAddress.villageArea}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.district ? `${order.shippingAddress.district}, ` : ''}
                {order.shippingAddress.state} - {order.shippingAddress.pinCode}
                {order.shippingAddress.landmark && ` (Landmark: ${order.shippingAddress.landmark})`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Modal for Customer Download / Print */}
      <PrintInvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={order}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Order, OrderStatus } from '../../../types';
import { storeDb } from '../../../database/store';
import { notificationService } from '../../../backend/services/notificationService';
import { PrintLabelModal } from '../../../shipping-label/print/PrintLabelModal';
import { PrintInvoiceModal } from '../../../invoice/print/PrintInvoiceModal';
import {
  X,
  Package,
  Truck,
  Printer,
  FileText,
  User,
  MapPin,
  Clock,
  Ban,
  Send,
  CheckCircle2
} from 'lucide-react';

interface AdminOrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: () => void;
}

const COURIER_PARTNERS = [
  'Delhivery Express',
  'BlueDart Express',
  'XpressBees',
  'Shadowfax',
  'DTDC Courier',
  'India Post Speed Post'
];

export const AdminOrderDetailsModal: React.FC<AdminOrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated
}) => {
  if (!isOpen || !order) return null;

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [courierName, setCourierName] = useState(order.courierName || 'Delhivery Express');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('Cancelled by admin upon store review');

  const isOrderCancelled =
    order.status === 'Cancelled' ||
    order.status === 'CANCELLED' ||
    order.orderStatus === 'CANCELLED' ||
    order.status?.toLowerCase() === 'cancelled';

  const isOrderDelivered =
    order.status === 'Delivered' ||
    order.status === 'DELIVERED' ||
    order.orderStatus === 'DELIVERED';

  const handleUpdateOrder = async () => {
    storeDb.updateOrderStatus(order.id, currentStatus, courierName, trackingNumber);

    if (notifyCustomer) {
      const updatedOrder = storeDb.getOrderById(order.id);
      if (updatedOrder) {
        await notificationService.sendOrderNotification(updatedOrder);
      }
    }

    onOrderUpdated();
    onClose();
  };

  const executeCancelOrder = async () => {
    storeDb.cancelOrder(order.id, cancelReason);
    if (notifyCustomer) {
      const updatedOrder = storeDb.getOrderById(order.id);
      if (updatedOrder) {
        await notificationService.sendOrderNotification(updatedOrder);
      }
    }
    onOrderUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-neutral-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900">Order #{order.id}</h2>
              <span
                className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                  isOrderDelivered
                    ? 'bg-emerald-100 text-emerald-800'
                    : isOrderCancelled
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                {isOrderCancelled ? 'Cancelled' : order.status}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')} • Mode: {order.paymentMethod}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLabelModalOpen(true)}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Label (4x6)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="px-3 py-1.5 border border-neutral-300 hover:border-black text-neutral-800 text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-neutral-600" />
              <span>GST Invoice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6 text-xs">
          {/* Status & Logistics Dispatch Controller */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px]">
              Fulfillment Pipeline & Logistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Update Status</label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white font-bold text-neutral-800"
                >
                  <option value="Order Placed">Order Placed</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Packed">Packed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Carrier Partner</label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white"
                >
                  {COURIER_PARTNERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Airway Bill (AWB) #</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. DEL-7729104"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg font-mono uppercase bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyCustomer}
                  onChange={(e) => setNotifyCustomer(e.target.checked)}
                  className="w-4 h-4 accent-black rounded"
                />
                <span className="text-neutral-700 font-medium">
                  Dispatch automatic WhatsApp & SMS notification to buyer
                </span>
              </label>

              <button
                type="button"
                onClick={handleUpdateOrder}
                className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold rounded-lg shadow-sm"
              >
                Apply Update
              </button>
            </div>
          </div>

          {/* Customer & Address Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <User className="w-4 h-4 text-neutral-500" />
                <span>Customer Information</span>
              </div>
              <p className="font-semibold text-neutral-900">{order.customer.fullName}</p>
              <p className="font-mono text-neutral-600">Mobile: +91 {order.customer.mobileNumber}</p>
              {order.customer.alternateNumber && (
                <p className="font-mono text-neutral-600">Alt: +91 {order.customer.alternateNumber}</p>
              )}
              {order.customer.email && (
                <p className="text-neutral-600">Email: {order.customer.email}</p>
              )}
            </div>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                <MapPin className="w-4 h-4 text-neutral-500" />
                <span>Delivery Address</span>
              </div>
              <p className="text-neutral-700 leading-relaxed">
                {order.shippingAddress.houseShopNo}, {order.shippingAddress.street},{' '}
                {order.shippingAddress.villageArea}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.district ? `${order.shippingAddress.district}, ` : ''}
                {order.shippingAddress.state} -{' '}
                <strong className="font-mono">{order.shippingAddress.pinCode}</strong>
              </p>
              {order.shippingAddress.landmark && (
                <p className="text-neutral-500 italic">Landmark: {order.shippingAddress.landmark}</p>
              )}
            </div>
          </div>

          {/* Ordered Line Items */}
          <div>
            <h3 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] mb-2">
              Ordered Articles ({order.items.length})
            </h3>
            <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-10 h-14 object-cover rounded-md border border-neutral-200 bg-neutral-50"
                    />
                    <div>
                      <span className="font-semibold text-neutral-900 block">{item.product.name}</span>
                      <span className="text-[11px] text-neutral-500">
                        SKU: <strong className="font-mono">{item.product.sku}</strong> • Size:{' '}
                        <strong className="font-mono">{item.selectedSize}</strong> • Color:{' '}
                        {item.selectedColor.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-500 font-mono text-[11px]">
                      {item.quantity} × ₹{item.product.price}
                    </span>
                    <div className="font-mono font-bold text-neutral-900">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial summary */}
          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-neutral-500">Payment: </span>
              <strong className="font-mono text-neutral-900">
                {order.paymentMethod === 'COD' ? 'Cash On Delivery (Collect from recipient)' : 'Prepaid Online'}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-neutral-500">Invoice Total: </span>
              <span className="font-mono font-black text-sm text-neutral-900">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Cancellation Option */}
          {!isOrderCancelled && !isOrderDelivered && (
            <div className="pt-2">
              {isConfirmingCancel ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                      <Ban className="w-4 h-4 text-rose-600" />
                      Are you sure you want to cancel this order?
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingCancel(false)}
                      className="text-neutral-500 hover:text-black text-xs font-semibold px-2 py-0.5"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Reason for cancellation..."
                      className="flex-1 px-2.5 py-1.5 bg-white border border-rose-300 rounded-lg text-xs focus:outline-hidden focus:border-rose-600"
                    />
                    <button
                      type="button"
                      onClick={executeCancelOrder}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap shadow-xs flex items-center justify-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Confirm Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">Order issues or customer request?</span>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingCancel(true)}
                    className="text-rose-600 hover:text-rose-800 font-bold text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel this Order</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Embedded Printable Modals */}
      <PrintLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        order={order}
      />
      <PrintInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={order}
      />
    </div>
  );
};

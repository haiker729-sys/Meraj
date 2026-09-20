import React from 'react';
import { Order } from '../../types';
import { BarcodeGenerator } from '../barcode/BarcodeGenerator';
import { QRCodeGenerator } from '../qr/QRCodeGenerator';

interface LabelProps {
  order: Order;
  format?: '4x6' | 'a4';
}

export const ThermalShippingLabel: React.FC<LabelProps> = ({ order, format = '4x6' }) => {
  const tokenParam = order.trackingToken ? `&token=${encodeURIComponent(order.trackingToken)}` : '';
  const trackingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/order-tracking?orderId=${encodeURIComponent(order.id)}${tokenParam}&scan=true`
    : `https://fashionpoint.store/order-tracking?orderId=${encodeURIComponent(order.id)}${tokenParam}&scan=true`;

  const isCOD = order.paymentMethod === 'COD';
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className={`bg-white text-black font-sans leading-tight print:p-0 select-text ${
        format === '4x6'
          ? 'w-[384px] min-h-[576px] p-3 border-2 border-black mx-auto'
          : 'w-[420px] p-4 border-2 border-dashed border-neutral-400 mx-auto'
      }`}
      style={{
        boxSizing: 'border-box',
        color: '#000000',
        backgroundColor: '#ffffff'
      }}
    >
      {/* Top Header: Store Brand & Carrier Badge */}
      <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="bg-black text-white font-black text-xs px-1.5 py-0.5 tracking-wider rounded-none">
              FP
            </span>
            <span className="font-black text-base tracking-tight uppercase">FASHION POINT</span>
          </div>
          <p className="text-[9px] text-neutral-700 font-medium">Clothing & Lifestyle Store • Express Dispatch</p>
        </div>
        <div className="text-right">
          <span className="inline-block border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
            {order.courierName ? order.courierName.split(' ')[0] : 'EXPRESS'}
          </span>
          <p className="text-[9px] font-mono mt-0.5">PIN: <strong className="text-xs font-black">{order.shippingAddress.pinCode}</strong></p>
        </div>
      </div>

      {/* Primary Barcode for Courier Scanning */}
      <div className="border-b-2 border-black pb-2 mb-2 text-center">
        <p className="text-[9px] uppercase font-bold tracking-widest text-neutral-600 mb-0.5">Shipment AWB / Order Reference</p>
        <BarcodeGenerator value={order.id} height={42} showText={true} />
      </div>

      {/* Routing & Payment Classification Banner */}
      <div className="grid grid-cols-2 border-b-2 border-black pb-2 mb-2 gap-2 text-left">
        <div className="border-r border-black pr-2">
          <p className="text-[9px] font-bold uppercase text-neutral-600">Payment Type</p>
          <div className={`mt-0.5 px-2 py-1 text-center font-black rounded-none border ${
            isCOD ? 'bg-black text-white border-black text-sm' : 'border-black text-xs uppercase'
          }`}>
            {isCOD ? 'CASH ON DELIVERY' : 'PREPAID / ONLINE'}
          </div>
          <div className="mt-1 flex justify-between items-baseline">
            <span className="text-[10px] font-medium">Collectable:</span>
            <span className="text-sm font-black">₹{isCOD ? order.pricing.grandTotal.toLocaleString('en-IN') : 0}</span>
          </div>
        </div>

        <div className="pl-1">
          <p className="text-[9px] font-bold uppercase text-neutral-600">Destination Hub</p>
          <p className="text-xs font-black uppercase truncate">{order.shippingAddress.district || order.shippingAddress.city}</p>
          <p className="text-[10px] text-neutral-700 font-mono">ST: {order.shippingAddress.state.toUpperCase()}</p>
          <p className="text-[9px] text-neutral-500 mt-1">Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
        </div>
      </div>

      {/* Deliver To Address Box (Critical Clear Section) */}
      <div className="border-b-2 border-black pb-2 mb-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-1">DELIVER TO:</span>
          <span className="text-[10px] font-mono font-bold">Mob: {order.customer.mobileNumber}</span>
        </div>

        <div className="mt-1">
          <p className="text-xs font-black uppercase text-black">{order.customer.fullName}</p>
          <p className="text-[11px] leading-snug mt-0.5 font-medium">
            {order.shippingAddress.houseShopNo}, {order.shippingAddress.street}
          </p>
          <p className="text-[11px] leading-snug font-medium">
            {order.shippingAddress.villageArea}
          </p>
          {order.shippingAddress.landmark && (
            <p className="text-[10px] italic text-neutral-800">
              Landmark: {order.shippingAddress.landmark}
            </p>
          )}
          <p className="text-xs font-black mt-1">
            {order.shippingAddress.city}, {order.shippingAddress.district} - {order.shippingAddress.pinCode}
          </p>
          <p className="text-[10px] font-bold uppercase">{order.shippingAddress.state}, INDIA</p>
          {order.customer.alternateNumber && (
            <p className="text-[10px] text-neutral-800 font-mono mt-0.5">Alt: {order.customer.alternateNumber}</p>
          )}
        </div>
      </div>

      {/* Package Contents Table */}
      <div className="border-b-2 border-black pb-2 mb-2">
        <div className="flex justify-between items-center mb-1 text-[9px] font-black uppercase tracking-wide border-b border-neutral-300 pb-0.5">
          <span>Items ({totalQuantity})</span>
          <span>Size / Color</span>
          <span>Qty</span>
        </div>
        <div className="space-y-1 max-h-24 overflow-hidden">
          {order.items.slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-[10px] leading-tight">
              <span className="font-medium truncate max-w-[180px]">
                {idx + 1}. {item.name}
              </span>
              <span className="font-mono text-[9px] text-neutral-800">
                {item.size} / {item.colorName.slice(0, 5)}
              </span>
              <span className="font-black font-mono">x{item.quantity}</span>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-[9px] italic text-neutral-500">
              + {order.items.length - 3} more item(s) in package
            </p>
          )}
        </div>
      </div>

      {/* Bottom Section: QR Code & Return Hub */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex-1 pr-2">
          <p className="text-[8px] font-black uppercase text-neutral-500">Return If Undelivered To:</p>
          <p className="text-[9px] font-bold">FASHION POINT CENTRAL HUB</p>
          <p className="text-[8px] leading-tight text-neutral-700">
            Shop 14-16, New Cloth Market, MG Road,
            Indore, Madhya Pradesh - 452001
          </p>
          <p className="text-[8px] text-neutral-700 font-mono">Helpline: +91 98765 43210</p>
        </div>

        <div className="flex flex-col items-center">
          <QRCodeGenerator value={trackingUrl} size={64} caption="SCAN TO TRACK" />
        </div>
      </div>
    </div>
  );
};

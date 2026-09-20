import React from 'react';
import { Order } from '../../types';
import { BarcodeGenerator } from '../../shipping-label/barcode/BarcodeGenerator';
import { QRCodeGenerator } from '../../shipping-label/qr/QRCodeGenerator';

interface TaxInvoiceProps {
  order: Order;
}

export const TaxInvoiceTemplate: React.FC<TaxInvoiceProps> = ({ order }) => {
  const invoiceNumber = `INV-FP-2026-${order.id.replace(/\D/g, '') || '10001'}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Calculate taxes (clothing GST standard: 5% total -> 2.5% CGST + 2.5% SGST)
  const taxableAmount = Math.round((order.pricing.grandTotal * 100) / 105);
  const totalGst = order.pricing.grandTotal - taxableAmount;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  return (
    <div
      id="printable-tax-invoice"
      className="bg-white text-black font-sans p-8 max-w-3xl mx-auto border border-neutral-300 shadow-sm print:p-0 print:border-0 print:shadow-none text-xs leading-relaxed"
      style={{ color: '#000000', backgroundColor: '#ffffff' }}
    >
      {/* Top Header: Brand & Tax Invoice Title */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-black text-white font-black text-sm px-2 py-1 tracking-wider">
              FP
            </span>
            <h1 className="text-xl font-black tracking-tight uppercase">FASHION POINT</h1>
          </div>
          <p className="font-semibold text-neutral-800 mt-1">Premium Clothing & Retail Store</p>
          <p className="text-neutral-600 text-[11px]">
            Shop 14-16, New Cloth Market, MG Road, Indore (M.P.) - 452001
          </p>
          <p className="text-neutral-600 text-[11px]">
            GSTIN: <strong className="font-mono text-black">23AAAAF8899A1Z2</strong> | State: Madhya Pradesh (23)
          </p>
          <p className="text-neutral-600 text-[11px]">
            Phone: +91 98765 43210 | Email: billing@fashionpoint.store
          </p>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="inline-block bg-neutral-900 text-white font-black px-3 py-1 text-xs uppercase tracking-widest">
            TAX INVOICE
          </span>
          <p className="font-mono text-xs font-bold mt-2">
            Invoice No: <span className="text-black">{invoiceNumber}</span>
          </p>
          <p className="text-[11px] text-neutral-600 font-mono">
            Date: <strong className="text-black">{invoiceDate}</strong>
          </p>
          <p className="text-[11px] text-neutral-600 font-mono">
            Order Ref: <strong className="text-black">{order.id}</strong>
          </p>
          <div className="mt-2 scale-90 origin-right">
            <BarcodeGenerator value={order.id} height={30} showText={false} />
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="grid grid-cols-2 gap-4 py-4 border-b border-neutral-300">
        <div>
          <p className="font-black text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
            BILLED TO:
          </p>
          <p className="font-bold text-sm text-black">{order.customer.fullName}</p>
          <p className="text-neutral-700">{order.shippingAddress.houseShopNo}, {order.shippingAddress.street}</p>
          <p className="text-neutral-700">{order.shippingAddress.villageArea}</p>
          <p className="text-neutral-900 font-semibold">
            {order.shippingAddress.city}, {order.shippingAddress.district} - {order.shippingAddress.pinCode}
          </p>
          <p className="text-neutral-700 font-medium">{order.shippingAddress.state}, INDIA</p>
          <p className="text-neutral-800 font-mono mt-0.5">Mobile: {order.customer.mobileNumber}</p>
          {order.customer.email && <p className="text-neutral-600 font-mono text-[10px]">{order.customer.email}</p>}
        </div>

        <div>
          <p className="font-black text-[11px] uppercase tracking-wider text-neutral-500 mb-1">
            SHIPPED TO:
          </p>
          <p className="font-bold text-sm text-black">{order.customer.fullName}</p>
          <p className="text-neutral-700">{order.shippingAddress.houseShopNo}, {order.shippingAddress.street}</p>
          <p className="text-neutral-700">{order.shippingAddress.villageArea}</p>
          {order.shippingAddress.landmark && (
            <p className="text-[10px] italic text-neutral-600">Landmark: {order.shippingAddress.landmark}</p>
          )}
          <p className="text-neutral-900 font-semibold">
            {order.shippingAddress.city}, {order.shippingAddress.district} - {order.shippingAddress.pinCode}
          </p>
          <p className="text-neutral-700 font-medium">{order.shippingAddress.state}</p>
          <p className="text-neutral-800 font-mono mt-0.5">Dispatch Via: {order.courierName || 'Surface Express'}</p>
        </div>
      </div>

      {/* Itemized Products Table */}
      <div className="py-4">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-black bg-neutral-100 text-[10px] uppercase font-bold text-neutral-700">
              <th className="py-2 px-2">#</th>
              <th className="py-2 px-2">Item Description</th>
              <th className="py-2 px-2">HSN</th>
              <th className="py-2 px-2 text-center">Size</th>
              <th className="py-2 px-2 text-center">Color</th>
              <th className="py-2 px-2 text-right">Qty</th>
              <th className="py-2 px-2 text-right">Rate</th>
              <th className="py-2 px-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 text-[11px]">
            {order.items.map((item, index) => {
              const itemTotal = item.price * item.quantity;
              return (
                <tr key={index}>
                  <td className="py-2.5 px-2 text-neutral-500">{index + 1}</td>
                  <td className="py-2.5 px-2">
                    <p className="font-bold text-black">{item.name}</p>
                    <p className="text-[10px] font-mono text-neutral-500">SKU: {item.sku}</p>
                  </td>
                  <td className="py-2.5 px-2 font-mono text-[10px] text-neutral-600">61091000</td>
                  <td className="py-2.5 px-2 text-center font-bold">{item.size}</td>
                  <td className="py-2.5 px-2 text-center">{item.colorName}</td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold">{item.quantity}</td>
                  <td className="py-2.5 px-2 text-right font-mono">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold text-black">
                    ₹{itemTotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Calculation & Tax Summary */}
      <div className="grid grid-cols-2 gap-4 border-t-2 border-black pt-4">
        <div>
          <div className="bg-neutral-50 p-3 border border-neutral-200">
            <p className="font-bold text-[11px] uppercase tracking-wide text-neutral-700">Payment Summary</p>
            <div className="mt-1 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Method:</span>
                <strong className="font-mono uppercase">
                  {order.paymentMethod === 'COD' ? 'Cash On Delivery' : 'Prepaid Online (UPI/Card)'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className={`font-bold font-mono ${order.paymentStatus === 'PAID' ? 'text-green-700' : 'text-amber-700'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax Breakdown:</span>
                <span className="font-mono text-neutral-600">CGST (2.5%) + SGST (2.5%)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 pt-2 border-t border-dashed border-neutral-200">
            <QRCodeGenerator
              value={`https://fashionpoint.store/order-tracking?id=${order.id}&mobile=${order.customer.mobileNumber}`}
              size={54}
              caption="SCAN TO VERIFY"
            />
            <div className="text-[9px] text-neutral-500">
              <p className="font-bold text-neutral-800 uppercase">E-Invoice QR Code</p>
              <p>Scan to verify GST tax invoice validity and live order delivery status.</p>
            </div>
          </div>

          <div className="mt-3 text-[10px] text-neutral-500 space-y-0.5">
            <p className="font-bold text-neutral-700">Terms & Conditions:</p>
            <p>1. Goods once sold can be exchanged or returned within 7 days of delivery.</p>
            <p>2. Keep original product tags and invoice intact for returns/exchanges.</p>
            <p>3. Subject to Indore jurisdiction only.</p>
          </div>
        </div>

        <div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between text-neutral-600">
              <span>Items Subtotal:</span>
              <span className="font-mono font-medium">₹{order.pricing.subtotal.toLocaleString('en-IN')}</span>
            </div>
            {order.pricing.discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Coupon Discount ({order.pricing.couponCode || 'PROMO'}):</span>
                <span className="font-mono font-bold">-₹{order.pricing.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-600">
              <span>Shipping & Handling:</span>
              <span className="font-mono">
                {order.pricing.deliveryCharge === 0 ? (
                  <strong className="text-green-600 uppercase">FREE</strong>
                ) : (
                  `₹${order.pricing.deliveryCharge}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-neutral-500 text-[10px] pt-1 border-t border-dashed border-neutral-300">
              <span>Taxable Value:</span>
              <span className="font-mono">₹{taxableAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-neutral-500 text-[10px]">
              <span>CGST @ 2.5%:</span>
              <span className="font-mono">₹{cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-neutral-500 text-[10px]">
              <span>SGST @ 2.5%:</span>
              <span className="font-mono">₹{sgst.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-base font-black text-black pt-2 border-t-2 border-black">
              <span>Total Amount:</span>
              <span className="font-mono">₹{order.pricing.grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="mt-6 text-right">
            <div className="inline-block text-center border-t border-neutral-400 pt-1 px-4">
              <p className="font-black text-[11px]">For FASHION POINT</p>
              <p className="text-[9px] text-neutral-500 italic mt-4">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Thank You */}
      <div className="mt-6 pt-3 border-t border-neutral-200 text-center text-neutral-500 text-[10px]">
        Thank you for shopping with <strong>Fashion Point</strong>! For queries contact us at support@fashionpoint.store or +91 98765 43210.
      </div>
    </div>
  );
};

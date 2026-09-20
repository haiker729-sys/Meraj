import React, { useState } from 'react';
import { CartItem } from '../../../types';
import { cartManager } from '../../../utils/cartManager';
import { apiClient } from '../../../api/client';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Tag, 
  Check, 
  Truck, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw, 
  BadgePercent,
  Lock
} from 'lucide-react';

interface CartPageProps {
  cartItems: CartItem[];
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ cartItems, onNavigate }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalMrp = cartItems.reduce(
    (sum, item) => sum + (item.product.mrp || item.product.price) * item.quantity,
    0
  );

  const mrpSavings = Math.max(0, totalMrp - subtotal);

  const freeDeliveryThreshold = 999;
  const deliveryCharge = subtotal === 0 || subtotal >= freeDeliveryThreshold ? 0 : 49;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal + deliveryCharge - discountAmount);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim();
    if (!code) return;
    try {
      const res = await apiClient.coupons.validate(code, subtotal);
      if (res.valid) {
        setAppliedCoupon({ code: code.toUpperCase(), discount: res.discount });
        setCouponMessage({ text: res.message, isError: false });
        setCouponCode(code.toUpperCase());
      } else {
        setCouponMessage({ text: res.message, isError: true });
      }
    } catch (err: any) {
      setCouponMessage({ text: err.message || 'Invalid coupon code.', isError: true });
    }
  };

  const handleQuickCoupon = (code: string) => {
    setCouponCode(code);
    handleApplyCoupon(code);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* TOP BAR / BREADCRUMB */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase tracking-wider mb-2">
              <ShoppingBag className="w-3 h-3 text-neutral-800" />
              <span>Full Bag Overview • सुरक्षित शॉपिंग बैग</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif text-neutral-950 tracking-tight">
              Your Shopping Bag
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Showing <strong className="font-mono text-neutral-900 font-bold">{totalItemsCount}</strong> {totalItemsCount === 1 ? 'garment' : 'garments'} ready for fulfillment
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/products')}
              className="px-4 py-2 text-xs font-bold text-neutral-800 hover:text-black bg-white hover:bg-neutral-100 border border-neutral-200/90 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* EMPTY CART LUXURY CARD */
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 sm:p-14 text-center max-w-lg mx-auto my-8 shadow-xs">
            <div className="w-20 h-20 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ShoppingBag className="w-10 h-10 text-neutral-400 stroke-1" />
            </div>
            <h2 className="text-xl font-serif font-black text-neutral-900">
              Your Shopping Bag is Empty
            </h2>
            <p className="text-xs text-neutral-500 mt-2 leading-relaxed max-w-sm mx-auto">
              You haven't added any garments to your bag yet. Explore our latest handpicked pure-cotton shirts, ethnic wear, dresses, and denim.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/products')}
                className="w-full sm:w-auto px-7 py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                Explore All Garments
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/categories')}
                className="w-full sm:w-auto px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Browse Categories
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: ITEMS LIST */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* FREE SHIPPING GOAL PROGRESS BAR */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-2xs">
                {subtotal < freeDeliveryThreshold ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-neutral-800">
                        <Truck className="w-4 h-4 text-amber-500 shrink-0" />
                        <span className="font-medium">
                          Add <strong className="font-mono text-neutral-950 font-black">₹{freeDeliveryThreshold - subtotal}</strong> more to unlock <span className="text-emerald-700 font-bold">FREE Express Delivery</span>
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-neutral-500">
                        {Math.round((subtotal / freeDeliveryThreshold) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden border border-neutral-200/60">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5 text-xs text-emerald-800 font-semibold bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-xl">
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Awesome! Your bag qualifies for <strong>FREE Express Doorstep Delivery</strong> across India!</span>
                  </div>
                )}
              </div>

              {/* LIST OF BAG ITEMS */}
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-4 sm:p-6 shadow-2xs divide-y divide-neutral-100">
                {cartItems.map((item, index) => {
                  const imageSrc = item.product.images?.[0] || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80';
                  const itemTotal = item.product.price * item.quantity;
                  const itemMrpTotal = (item.product.mrp || item.product.price) * item.quantity;
                  const itemSaving = itemMrpTotal - itemTotal;

                  return (
                    <div key={index} className="py-5 first:pt-2 last:pb-2 flex flex-col sm:flex-row gap-4 sm:gap-5">
                      
                      {/* Garment Image */}
                      <div 
                        onClick={() => onNavigate(`/product-details?id=${item.productId}`)}
                        className="w-24 h-32 sm:w-28 sm:h-36 rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-200/80 shrink-0 cursor-pointer group relative"
                      >
                        <img
                          src={imageSrc}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Details & Stepper */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                {item.product.category}
                              </span>
                              <h3 
                                onClick={() => onNavigate(`/product-details?id=${item.productId}`)}
                                className="font-bold text-sm sm:text-base text-neutral-900 hover:text-neutral-700 cursor-pointer leading-snug"
                              >
                                {item.product.name}
                              </h3>
                            </div>

                            {/* Remove Item Button */}
                            <button
                              type="button"
                              onClick={() => cartManager.removeFromCart(index)}
                              className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove from bag"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Selected Attributes Pills */}
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                            <span className="font-mono bg-neutral-100 border border-neutral-200/80 px-2.5 py-0.5 rounded-lg text-neutral-700 font-semibold">
                              Size: {item.selectedSize}
                            </span>
                            <span className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-200/80 px-2.5 py-0.5 rounded-lg text-neutral-700">
                              <span
                                className="w-3 h-3 rounded-full border border-neutral-300"
                                style={{ backgroundColor: item.selectedColor.hex }}
                              />
                              <span className="font-medium">{item.selectedColor.name}</span>
                            </span>
                            {itemSaving > 0 && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                                Save ₹{itemSaving.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-neutral-200/90 rounded-xl bg-neutral-50/80 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => cartManager.updateQuantity(index, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-neutral-200/70 text-neutral-700 rounded-l-xl transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-9 text-center text-xs font-mono font-bold text-neutral-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => cartManager.updateQuantity(index, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-neutral-200/70 text-neutral-700 rounded-r-xl transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right">
                            <span className="text-base font-mono font-black text-neutral-950 block">
                              ₹{itemTotal.toLocaleString('en-IN')}
                            </span>
                            {itemMrpTotal > itemTotal && (
                              <span className="text-[11px] text-neutral-400 line-through font-mono">
                                ₹{itemMrpTotal.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* STORE ASSURANCE HIGHLIGHTS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/70 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">100% Cotton Authenticity</h4>
                    <p className="text-[10px] text-neutral-500">Inspected bio-washed fabrics</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/70 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">7 Days Easy Exchange</h4>
                    <p className="text-[10px] text-neutral-500">Doorstep reverse pickup</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/70 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">Cash on Delivery</h4>
                    <p className="text-[10px] text-neutral-500">Pay when package arrives</p>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: STICKY ORDER SUMMARY */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-5">
                
                <h3 className="font-serif font-black text-base text-neutral-950 pb-3 border-b border-neutral-100 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-normal text-neutral-500">
                    {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
                  </span>
                </h3>

                {/* COUPON CODE APPLICATION */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                    Apply Promo or Discount Code
                  </label>
                  {!appliedCoupon ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleApplyCoupon();
                      }} 
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. FIRST10"
                        className="flex-1 px-3 py-2 text-xs uppercase border border-neutral-300 rounded-xl focus:outline-hidden focus:border-black font-mono tracking-wider"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5">
                        <BadgePercent className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-emerald-800">
                          {appliedCoupon.code} applied (-₹{appliedCoupon.discount})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponMessage(null);
                        }}
                        className="text-rose-600 font-bold hover:underline text-xs cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {couponMessage && (
                    <p className={`text-[11px] mt-1.5 font-medium ${couponMessage.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {couponMessage.text}
                    </p>
                  )}

                  {/* QUICK 1-CLICK PROMO CHIPS */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] text-neutral-400 self-center mr-1">Available:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickCoupon('FIRST10')}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 transition-colors cursor-pointer"
                    >
                      FIRST10 (10% Off)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickCoupon('FASHION50')}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-200 transition-colors cursor-pointer"
                    >
                      FASHION50 (₹50 Off)
                    </button>
                  </div>
                </div>

                {/* PRICE BREAKDOWN */}
                <div className="space-y-2.5 text-xs text-neutral-600 pt-3 border-t border-neutral-100">
                  <div className="flex justify-between">
                    <span>Total MRP</span>
                    <span className="font-mono text-neutral-800">₹{totalMrp.toLocaleString('en-IN')}</span>
                  </div>

                  {mrpSavings > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Store Discount</span>
                      <span className="font-mono">-₹{mrpSavings.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Bag Subtotal</span>
                    <span className="font-mono text-neutral-900 font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Delivery Charges</span>
                    <span className="font-mono">
                      {deliveryCharge === 0 ? (
                        <span className="text-emerald-700 font-bold px-1.5 py-0.5 bg-emerald-50 rounded">FREE</span>
                      ) : (
                        `₹${deliveryCharge}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline text-lg font-black text-neutral-950 pt-3 border-t border-neutral-200">
                    <div>
                      <span>Grand Total</span>
                      <span className="block text-[10px] font-normal text-neutral-400">Inclusive of all GST taxes</span>
                    </div>
                    <span className="font-mono text-xl text-neutral-950">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* PROCEED TO CHECKOUT ACTION */}
                <button
                  type="button"
                  onClick={() => onNavigate('/checkout')}
                  className="w-full py-4 bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.99] cursor-pointer"
                >
                  <span>Proceed to Secure Checkout / आगे बढ़ें</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-center text-neutral-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Bank-grade 256-bit encrypted checkout
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

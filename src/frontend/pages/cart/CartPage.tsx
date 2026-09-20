import React, { useState } from 'react';
import { CartItem } from '../../../types';
import { storeDb } from '../../../database/store';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, Truck, ArrowLeft } from 'lucide-react';

interface CartPageProps {
  cartItems: CartItem[];
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ cartItems, onNavigate }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const freeDeliveryThreshold = 999;
  const deliveryCharge = subtotal === 0 || subtotal >= freeDeliveryThreshold ? 0 : 49;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal + deliveryCharge - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = storeDb.applyCoupon(couponCode, subtotal);
    if (res.valid) {
      setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discount: res.discount });
      setCouponMessage({ text: res.message, isError: false });
    } else {
      setCouponMessage({ text: res.message, isError: true });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-6 border-b border-neutral-200 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-neutral-950">
              Shopping Bag
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              You have <strong className="font-mono text-black">{cartItems.length}</strong> unique styles in your cart
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/products')}
            className="text-xs font-bold text-neutral-800 hover:text-black flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-neutral-400" />
            </div>
            <h2 className="text-base font-bold text-neutral-900">Your shopping bag is empty</h2>
            <p className="text-xs text-neutral-500 mt-1.5 max-w-xs mx-auto">
              Explore our curated collections of pure cotton shirts, dresses, jeans, and kids wear.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/products')}
              className="mt-6 px-6 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Browse Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items List */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs divide-y divide-neutral-100">
              {cartItems.map((item, index) => (
                <div key={index} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-28 object-cover rounded-xl border border-neutral-200 bg-neutral-50 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-sm text-neutral-900">{item.product.name}</h3>
                        <button
                          type="button"
                          onClick={() => storeDb.removeFromCart(index)}
                          className="p-1 text-neutral-400 hover:text-rose-600 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-neutral-600">
                        <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded font-medium">
                          Size: {item.selectedSize}
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className="w-3 h-3 rounded-full border border-neutral-300"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          {item.selectedColor.name}
                        </span>
                        <span className="font-mono text-neutral-400">SKU: {item.product.sku}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-neutral-300 rounded-lg">
                        <button
                          type="button"
                          onClick={() => storeDb.updateCartQuantity(index, item.quantity - 1)}
                          className="p-1.5 hover:bg-neutral-100 text-neutral-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-mono font-bold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => storeDb.updateCartQuantity(index, item.quantity + 1)}
                          className="p-1.5 hover:bg-neutral-100 text-neutral-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-mono font-black text-neutral-950">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        {item.product.mrp > item.product.price && (
                          <span className="block text-[10px] text-neutral-400 line-through font-mono">
                            ₹{(item.product.mrp * item.quantity).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Box */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-4">
                <h3 className="font-bold text-sm text-neutral-900 pb-3 border-b border-neutral-100">
                  Cart Order Summary
                </h3>

                {/* Free Shipping Alert */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                  {subtotal < freeDeliveryThreshold ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-neutral-700">
                        <Truck className="w-4 h-4 text-black" />
                        <span>
                          Add <strong className="font-mono text-black">₹{freeDeliveryThreshold - subtotal}</strong> more for free delivery
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-black h-full rounded-full"
                          style={{ width: `${(subtotal / freeDeliveryThreshold) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <Check className="w-4 h-4" />
                      <span>Congratulations! You qualify for Free Express Shipping!</span>
                    </div>
                  )}
                </div>

                {/* Promo Code Form */}
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon (e.g. FIRST10)"
                      className="flex-1 px-3 py-2 text-xs uppercase border border-neutral-300 rounded-xl focus:border-black font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs rounded-xl"
                    >
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <span className="font-bold text-emerald-800">
                      Code {appliedCoupon.code} applied (-₹{appliedCoupon.discount})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponMessage(null);
                      }}
                      className="text-rose-600 font-semibold underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {couponMessage && (
                  <p className={`text-[11px] ${couponMessage.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {couponMessage.text}
                  </p>
                )}

                {/* Breakdown */}
                <div className="space-y-2 text-xs text-neutral-600 pt-3 border-t border-neutral-100">
                  <div className="flex justify-between">
                    <span>Bag Total</span>
                    <span className="font-mono text-neutral-900 font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount</span>
                      <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-mono">
                      {deliveryCharge === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-neutral-950 pt-3 border-t border-neutral-200">
                    <span>Grand Total</span>
                    <span className="font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('/checkout')}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

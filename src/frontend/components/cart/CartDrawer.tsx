import React, { useState } from 'react';
import { CartItem } from '../../../types';
import { cartManager } from '../../../utils/cartManager';
import { apiClient } from '../../../api/client';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, Check, Truck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onNavigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onNavigate
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const freeDeliveryThreshold = 999;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const deliveryCharge = subtotal === 0 || subtotal >= freeDeliveryThreshold ? 0 : 49;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, subtotal + deliveryCharge - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      const result = await apiClient.coupons.validate(couponCode.trim(), subtotal);
      if (result.valid) {
        setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discount: result.discount });
        setCouponMessage({ text: result.message, isError: false });
      } else {
        setCouponMessage({ text: result.message, isError: true });
      }
    } catch (err: any) {
      setCouponMessage({ text: err.message || 'Invalid coupon.', isError: true });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMessage(null);
  };

  const handleProceedCheckout = () => {
    onClose();
    onNavigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-neutral-900" />
              <h2 className="text-base font-bold text-neutral-900">Your Bag</h2>
              <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-neutral-100 px-5 py-3 border-b border-neutral-200 text-xs">
            {amountNeededForFreeDelivery > 0 ? (
              <div>
                <div className="flex items-center gap-1.5 text-neutral-700 font-medium mb-1.5">
                  <Truck className="w-4 h-4 text-neutral-900" />
                  <span>
                    Add <strong className="font-mono text-black">₹{amountNeededForFreeDelivery}</strong> more for{' '}
                    <strong className="text-emerald-700 uppercase">FREE DELIVERY</strong>
                  </span>
                </div>
                <div className="w-full bg-neutral-300 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-black h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-700 font-bold">
                <Check className="w-4 h-4" />
                <span>You unlocked FREE Express Delivery on this order!</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-neutral-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="font-bold text-neutral-800 text-base">Your shopping bag is empty</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Discover trending styles for Men, Women, and Kids and fill your cart!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('/products');
                  }}
                  className="mt-5 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cartItems.map((item, index) => (
                <div key={`${item.productId}-${item.selectedSize}-${item.selectedColor.name}`} className="py-4 flex gap-3">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-18 h-24 object-cover rounded-lg border border-neutral-200 bg-neutral-50 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-xs text-neutral-900 line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => cartManager.removeFromCart(index)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Attributes */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-600">
                        <span className="bg-neutral-100 px-2 py-0.5 rounded font-mono font-medium">
                          Size: {item.selectedSize}
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          {item.selectedColor.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-neutral-300 rounded-md">
                        <button
                          type="button"
                          onClick={() => cartManager.updateQuantity(index, item.quantity - 1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-mono font-bold text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => cartManager.updateQuantity(index, item.quantity + 1)}
                          className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-neutral-900">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-neutral-50 space-y-3">
              {/* Coupon Form */}
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter Promo Code (e.g. FIRST10)"
                      className="w-full pl-8 pr-3 py-1.5 text-xs uppercase border border-neutral-300 rounded-lg bg-white focus:outline-hidden focus:border-black font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Coupon {appliedCoupon.code} applied (-₹{appliedCoupon.discount})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-emerald-700 hover:text-rose-600 text-xs font-semibold underline ml-2"
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

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-neutral-600 border-t border-neutral-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium text-neutral-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-mono font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="font-mono">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase">FREE</span>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Grand Total</span>
                  <span className="font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={handleProceedCheckout}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-center text-xs text-neutral-500 hover:text-black py-1 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

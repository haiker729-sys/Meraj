import React, { useState } from 'react';
import { CartItem, CustomerDetails, ShippingAddress, Order } from '../../../types';
import { storeDb } from '../../../database/store';
import { apiClient } from '../../../api/client';
import { paymentService } from '../../../backend/services/paymentService';
import { notificationService } from '../../../backend/services/notificationService';
import { ShieldCheck, Truck, CreditCard, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';

interface CheckoutPageProps {
  cartItems: CartItem[];
  onNavigate: (path: string) => void;
  onOrderSuccess?: (order: Order) => void;
  onOrderPlaced?: (orderId: string, order?: Order) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cartItems,
  onNavigate,
  onOrderSuccess,
  onOrderPlaced
}) => {
  // Customer details state
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: '',
    mobileNumber: '',
    alternateNumber: '',
    email: ''
  });

  // Shipping address state
  const [address, setAddress] = useState<ShippingAddress>({
    houseShopNo: '',
    street: '',
    villageArea: '',
    city: '',
    district: '',
    state: 'Madhya Pradesh',
    pinCode: '',
    landmark: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCouponDiscount, setAppliedCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryCharge = subtotal >= 999 ? 0 : 49;
  const grandTotal = Math.max(0, subtotal + deliveryCharge - appliedCouponDiscount);

  // Validate required inputs
  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!customer.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!customer.mobileNumber.trim() || customer.mobileNumber.length < 10) {
      errs.mobileNumber = 'Enter a valid 10-digit mobile number';
    }
    if (!address.houseShopNo.trim()) errs.houseShopNo = 'House / Shop No. is required';
    if (!address.street.trim()) errs.street = 'Street or road name is required';
    if (!address.villageArea.trim()) errs.villageArea = 'Village / Area / Locality is required';
    if (!address.city.trim()) errs.city = 'City / Town is required';
    if (!address.pinCode.trim() || address.pinCode.length !== 6) {
      errs.pinCode = 'Valid 6-digit PIN code required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = storeDb.applyCoupon(couponCode, subtotal);
    if (res.valid) {
      setAppliedCouponDiscount(res.discount);
      setCouponMessage(`Applied ${couponCode.toUpperCase()}! Saved ₹${res.discount}`);
    } else {
      setCouponMessage(res.message);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      onNavigate('/products');
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: 'smooth' });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Transactional Order Creation via Backend
      let newOrder: Order;
      try {
        const orderPayload = {
          customer,
          shippingAddress: address,
          items: cartItems.map((ci) => ({
            productId: ci.productId,
            quantity: ci.quantity,
            selectedSize: ci.selectedSize,
            selectedColor: ci.selectedColor
          })),
          paymentMethod,
          couponCode: appliedCouponDiscount > 0 ? couponCode.toUpperCase() : undefined
        };

        const res = await apiClient.orders.create(orderPayload);
        newOrder = res.order;
        storeDb.clearCart();
      } catch (backendErr: any) {
        console.warn('Using storeDb fallback for order:', backendErr.message);
        newOrder = storeDb.createOrder({
          customer,
          shippingAddress: address,
          items: cartItems,
          paymentMethod,
          couponCode: appliedCouponDiscount > 0 ? couponCode.toUpperCase() : undefined,
          discount: appliedCouponDiscount
        });
      }

      // 2. Handle Payment Verification if ONLINE
      if (paymentMethod === 'ONLINE') {
        const paymentResult = await paymentService.processPayment({
          orderId: newOrder.id,
          amount: newOrder.pricing?.grandTotal || newOrder.totalAmount,
          customerName: customer.fullName,
          customerMobile: customer.mobileNumber,
          paymentMethod: 'ONLINE'
        });

        if (!paymentResult.success) {
          if (paymentResult.unconfigured) {
            const switchToCod = window.confirm(
              `${paymentResult.message}\n\nWould you like to place your order with Cash on Delivery (COD) instead?`
            );
            if (switchToCod) {
              setPaymentMethod('COD');
              newOrder.paymentMethod = 'COD';
              newOrder.paymentStatus = 'PENDING';
              storeDb.updateOrderStatus(newOrder.id, 'NEW', undefined, undefined, 'Switched to Cash on Delivery (COD)');
            } else {
              setIsProcessing(false);
              return;
            }
          } else {
            alert(paymentResult.message || 'Payment could not be verified.');
            setIsProcessing(false);
            return;
          }
        }
      }

      // 3. Trigger notification dispatcher
      await notificationService.sendOrderNotification(newOrder);

      // 4. Navigate to success page
      if (onOrderSuccess) {
        onOrderSuccess(newOrder);
      }
      if (onOrderPlaced) {
        onOrderPlaced(newOrder.id, newOrder);
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      alert(err.message || 'An error occurred while creating your order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 text-center max-w-sm">
          <h2 className="text-lg font-bold text-neutral-900">Your bag is empty</h2>
          <p className="text-xs text-neutral-500 mt-1 mb-6">Add clothes to your cart before proceeding to checkout.</p>
          <button
            onClick={() => onNavigate('/products')}
            className="w-full py-3 bg-black text-white text-xs font-bold rounded-xl"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/70 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <button onClick={() => onNavigate('/cart')} className="flex items-center gap-1 hover:text-black">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Bag</span>
          </button>
          <span>/</span>
          <span className="font-bold text-black">Fast Secure Checkout</span>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Customer & Delivery Address Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Customer Contact */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                      1
                    </span>
                    Customer Information
                  </h2>
                  <span className="text-[11px] text-neutral-400">Step 1 of 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Full Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={customer.fullName}
                      onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                      placeholder="e.g. Ramesh Chandra Sharma"
                      className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden focus:border-black bg-neutral-50/50 ${
                        errors.fullName ? 'border-rose-500' : 'border-neutral-300'
                      }`}
                    />
                    {errors.fullName && <p className="text-[10px] text-rose-600 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Mobile Number (for delivery SMS) <span className="text-rose-600">*</span>
                    </label>
                    <div className="flex">
                      <span className="px-3 py-2 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-xl text-neutral-600 font-mono text-xs">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={customer.mobileNumber}
                        onChange={(e) =>
                          setCustomer({ ...customer, mobileNumber: e.target.value.replace(/\D/g, '') })
                        }
                        placeholder="10-digit number"
                        className={`w-full px-3 py-2 border rounded-r-xl focus:outline-hidden focus:border-black font-mono ${
                          errors.mobileNumber ? 'border-rose-500' : 'border-neutral-300'
                        }`}
                      />
                    </div>
                    {errors.mobileNumber && (
                      <p className="text-[10px] text-rose-600 mt-1">{errors.mobileNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Alternate Mobile (Optional)
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={customer.alternateNumber}
                      onChange={(e) =>
                        setCustomer({ ...customer, alternateNumber: e.target.value.replace(/\D/g, '') })
                      }
                      placeholder="Secondary contact"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:border-black font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Email Address (for invoice copy)
                    </label>
                    <input
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      placeholder="e.g. name@gmail.com"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Detailed Shipping Address */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                      2
                    </span>
                    Delivery Address
                  </h2>
                  <span className="text-[11px] text-neutral-400">Step 2 of 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      House / Flat / Shop No. <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.houseShopNo}
                      onChange={(e) => setAddress({ ...address, houseShopNo: e.target.value })}
                      placeholder="e.g. Shop No. 12 or Flat 402"
                      className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden focus:border-black ${
                        errors.houseShopNo ? 'border-rose-500' : 'border-neutral-300'
                      }`}
                    />
                    {errors.houseShopNo && (
                      <p className="text-[10px] text-rose-600 mt-1">{errors.houseShopNo}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Street / Road Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="e.g. Station Road, 5th Cross"
                      className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden focus:border-black ${
                        errors.street ? 'border-rose-500' : 'border-neutral-300'
                      }`}
                    />
                    {errors.street && <p className="text-[10px] text-rose-600 mt-1">{errors.street}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Village / Area / Colony <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.villageArea}
                      onChange={(e) => setAddress({ ...address, villageArea: e.target.value })}
                      placeholder="e.g. Civil Lines or Rampur Village"
                      className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden focus:border-black ${
                        errors.villageArea ? 'border-rose-500' : 'border-neutral-300'
                      }`}
                    />
                    {errors.villageArea && (
                      <p className="text-[10px] text-rose-600 mt-1">{errors.villageArea}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      City / Town <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="e.g. Indore"
                      className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden focus:border-black ${
                        errors.city ? 'border-rose-500' : 'border-neutral-300'
                      }`}
                    />
                    {errors.city && <p className="text-[10px] text-rose-600 mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      District
                    </label>
                    <input
                      type="text"
                      value={address.district}
                      onChange={(e) => setAddress({ ...address, district: e.target.value })}
                      placeholder="e.g. Indore"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      State <span className="text-rose-600">*</span>
                    </label>
                    <select
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:border-black bg-white"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">
                      PIN Code <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={address.pinCode}
                      onChange={(e) =>
                        setAddress({ ...address, pinCode: e.target.value.replace(/\D/g, '') })
                      }
                      placeholder="6-digit PIN"
                      className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden focus:border-black font-mono ${
                        errors.pinCode ? 'border-rose-500' : 'border-neutral-300'
                      }`}
                    />
                    {errors.pinCode && <p className="text-[10px] text-rose-600 mt-1">{errors.pinCode}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-neutral-700 mb-1">
                      Nearby Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={address.landmark}
                      onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                      placeholder="e.g. Behind Hanuman Temple, Near Govt Hospital"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Payment Method Choice */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                      3
                    </span>
                    Payment Method
                  </h2>
                  <span className="text-[11px] text-neutral-400">Step 3 of 3</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-black bg-neutral-50/80 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="mt-0.5 accent-black"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900">
                        <Truck className="w-4 h-4" />
                        <span>Cash On Delivery (COD)</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Pay cash or scan delivery agent's UPI QR code at your doorstep.
                      </p>
                    </div>
                  </label>

                  {/* Online Payment */}
                  <label
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === 'ONLINE'
                        ? 'border-black bg-neutral-50/80 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="mt-0.5 accent-black"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900">
                        <CreditCard className="w-4 h-4" />
                        <span>Online UPI & Cards</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Instant payment via Google Pay, PhonePe, Paytm, Cards or NetBanking.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Place Order */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs sticky top-24">
                <h3 className="text-base font-bold text-neutral-900 mb-4 pb-3 border-b border-neutral-100 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs text-neutral-500 font-normal">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </span>
                </h3>

                {/* Items preview list */}
                <div className="max-h-56 overflow-y-auto divide-y divide-neutral-100 pr-1">
                  {cartItems.map((item, index) => (
                    <div key={index} className="py-2.5 flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-16 object-cover rounded-lg bg-neutral-100 shrink-0 border border-neutral-200"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-semibold text-neutral-900 truncate">{item.product.name}</p>
                        <p className="text-[11px] text-neutral-500">
                          Size: <strong className="font-mono">{item.selectedSize}</strong> • {item.selectedColor.name}
                        </p>
                        <p className="text-[11px] text-neutral-500 font-mono">
                          Qty: {item.quantity} × ₹{item.product.price}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-xs text-neutral-900">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input in Summary */}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Promo code (e.g. FIRST10)"
                      className="flex-1 px-3 py-1.5 text-xs uppercase border border-neutral-300 rounded-lg focus:outline-hidden focus:border-black font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-lg"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage && (
                    <p className="text-[11px] text-emerald-700 font-medium mt-1">
                      {couponMessage}
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2 text-xs text-neutral-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-neutral-900 font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {appliedCouponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount</span>
                      <span className="font-mono">-₹{appliedCouponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="font-mono">
                      {deliveryCharge === 0 ? (
                        <span className="text-emerald-700 font-bold uppercase">FREE</span>
                      ) : (
                        `₹${deliveryCharge}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-neutral-950 pt-3 border-t border-neutral-200">
                    <span>Grand Total</span>
                    <span className="font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Primary Place Order Action */}
                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isProcessing ? 'Processing Order...' : 'PLACE ORDER'}</span>
                  </button>
                  <p className="text-center text-[10px] text-neutral-400 mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Safe & encrypted checkout • Fashion Point Guarantee</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

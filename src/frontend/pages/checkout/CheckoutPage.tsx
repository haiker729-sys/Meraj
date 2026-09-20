import React, { useState, useEffect } from 'react';
import { CartItem, CustomerDetails, ShippingAddress, Order, CustomerAddress } from '../../../types';
import { cartManager } from '../../../utils/cartManager';
import { apiClient, getCustomerToken } from '../../../api/client';
import { paymentService } from '../../../backend/services/paymentService';
import { notificationService } from '../../../backend/services/notificationService';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Lock,
  MapPin,
  Plus,
  AlertCircle,
  Loader2,
  Edit2,
  Check,
  Sparkles,
  RotateCcw
} from 'lucide-react';

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

  const [postOffice, setPostOffice] = useState('');
  const [postOfficesList, setPostOfficesList] = useState<string[]>([]);
  const [isCustomPostOffice, setIsCustomPostOffice] = useState(false);
  const [pinLookupLoading, setPinLookupLoading] = useState(false);
  const [pinLookupMessage, setPinLookupMessage] = useState<{ type: 'success' | 'warn'; text: string } | null>(null);

  // Saved addresses & persistence
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'NEW'>('NEW');
  const [hasSavedAddress, setHasSavedAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  const [isCustomerLoggedIn, setIsCustomerLoggedIn] = useState(false);

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

  // Load Customer Profile & Saved Addresses on Mount
  useEffect(() => {
    let isCancelled = false;

    // 1. Check local storage first (for returning customers / guest orders)
    try {
      const localSavedAddr = localStorage.getItem('fashionpoint_saved_address');
      const localSavedCust = localStorage.getItem('fashionpoint_saved_customer');
      if (localSavedCust) {
        const parsedCust = JSON.parse(localSavedCust);
        if (parsedCust?.fullName || parsedCust?.mobileNumber) {
          setCustomer((prev) => ({
            ...prev,
            fullName: prev.fullName || parsedCust.fullName || '',
            mobileNumber: prev.mobileNumber || parsedCust.mobileNumber || '',
            alternateNumber: prev.alternateNumber || parsedCust.alternateNumber || '',
            email: prev.email || parsedCust.email || ''
          }));
        }
      }
      if (localSavedAddr) {
        const parsed = JSON.parse(localSavedAddr);
        if (parsed?.address?.pinCode && parsed?.address?.houseShopNo) {
          setAddress(parsed.address);
          if (parsed.postOffice) {
            setPostOffice(parsed.postOffice);
          }
          setHasSavedAddress(true);
          setIsEditingAddress(false);
        }
      }
    } catch (e) {
      console.warn('Could not read local saved address:', e);
    }

    const token = getCustomerToken();
    if (!token) return;

    apiClient.customer
      .getProfile()
      .then((res) => {
        if (!isCancelled && res?.profile) {
          setIsCustomerLoggedIn(true);
          setCustomer((prev) => ({
            ...prev,
            fullName: prev.fullName || res.profile.fullName || '',
            mobileNumber: prev.mobileNumber || res.profile.mobile || '',
            email: prev.email || res.profile.email || ''
          }));
        }
      })
      .catch(() => {});

    apiClient.customer
      .getAddresses()
      .then((res) => {
        if (!isCancelled && res?.addresses && res.addresses.length > 0) {
          setSavedAddresses(res.addresses);
          const defaultAddr = res.addresses.find((a) => a.isDefault) || res.addresses[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            applySavedAddress(defaultAddr);
            setHasSavedAddress(true);
            setIsEditingAddress(false);
          }
        }
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, []);

  const applySavedAddress = (addr: CustomerAddress) => {
    setAddress({
      houseShopNo: addr.houseBuilding,
      street: addr.streetArea,
      villageArea: addr.villageTownCity,
      city: addr.villageTownCity,
      district: addr.district,
      state: addr.state,
      pinCode: addr.pinCode,
      landmark: addr.landmark || ''
    });
    setPostOffice(addr.postOffice || '');
    if (addr.fullName) {
      setCustomer((prev) => ({
        ...prev,
        fullName: prev.fullName || addr.fullName,
        mobileNumber: prev.mobileNumber || addr.mobileNumber
      }));
    }
    setHasSavedAddress(true);
    setIsEditingAddress(false);
  };

  // PIN Code lookup logic
  const handlePincodeChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 6);
    setAddress((prev) => ({ ...prev, pinCode: cleaned }));

    if (cleaned.length === 6) {
      setPinLookupLoading(true);
      setPinLookupMessage(null);
      try {
        const res = await apiClient.postal.lookupPincode(cleaned);
        if (res.found) {
          const poList = res.postOffices || [];
          setPostOfficesList(poList);
          setIsCustomPostOffice(false);
          const resolvedCity = res.city || res.district || '';
          setAddress((prev) => ({
            ...prev,
            district: res.district || prev.district,
            state: res.state || prev.state,
            city: resolvedCity || prev.city,
            villageArea: prev.villageArea || resolvedCity
          }));
          if (poList.length > 0) {
            setPostOffice((prev) => (prev && poList.includes(prev) ? prev : poList[0]));
          }
          setErrors((prev) => {
            const next = { ...prev };
            delete next.pinCode;
            delete next.city;
            delete next.villageArea;
            return next;
          });
          setPinLookupMessage({
            type: 'success',
            text: `Verified PIN code: ${res.district || resolvedCity}, ${res.state}${poList.length > 0 ? ` (${poList.length} Post Offices available)` : ''}`
          });
        } else {
          setPostOfficesList([]);
          setPinLookupMessage({
            type: 'warn',
            text: 'PIN code not found. Please enter address manually.'
          });
        }
      } catch {
        setPinLookupMessage({
          type: 'warn',
          text: 'PIN code lookup unavailable. Please enter address details manually.'
        });
      } finally {
        setPinLookupLoading(false);
      }
    } else {
      setPostOfficesList([]);
      setPinLookupMessage(null);
    }
  };

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

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const res = await apiClient.coupons.validate(couponCode, subtotal);
      if (res.valid) {
        setAppliedCouponDiscount(res.discount);
        setCouponMessage(res.message || `Applied ${couponCode.toUpperCase()}! Saved ₹${res.discount}`);
      } else {
        setCouponMessage(res.message || 'Invalid coupon code');
      }
    } catch (err: any) {
      setCouponMessage(err.message || 'Could not validate coupon.');
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
      // Build full snapshot address string
      const fullAddressLine = `${address.houseShopNo}, ${address.street}, ${address.villageArea}${
        postOffice ? ', PO: ' + postOffice : ''
      }${address.landmark ? ', Landmark: ' + address.landmark : ''}`;

      // 1. Transactional Order Creation via Backend in PostgreSQL
      const orderPayload = {
        customer,
        shippingAddress: {
          ...address,
          postOffice
        },
        shippingName: customer.fullName,
        shippingPhone: customer.mobileNumber,
        shippingAddressLine: fullAddressLine,
        shippingCity: address.city,
        shippingDistrict: address.district,
        shippingState: address.state,
        shippingPincode: address.pinCode,
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
      const newOrder: Order = res.order;
      cartManager.clearCart();

      // Persist delivery address and customer info so repeat orders never ask again
      try {
        localStorage.setItem('fashionpoint_saved_address', JSON.stringify({ address, postOffice }));
        localStorage.setItem('fashionpoint_saved_customer', JSON.stringify(customer));
      } catch (e) {
        console.warn('Could not save to localStorage:', e);
      }

      // Optionally save address to customer account
      if (saveAddressToAccount && selectedAddressId === 'NEW' && isCustomerLoggedIn) {
        apiClient.customer
          .createAddress({
            fullName: customer.fullName,
            mobileNumber: customer.mobileNumber,
            houseBuilding: address.houseShopNo,
            streetArea: address.street,
            villageTownCity: address.villageArea || address.city,
            postOffice: postOffice,
            district: address.district,
            state: address.state,
            pinCode: address.pinCode,
            landmark: address.landmark,
            addressType: 'HOME',
            isDefault: savedAddresses.length === 0
          })
          .catch(() => {});
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
              await apiClient.orders
                .updateStatus(newOrder.id, {
                  status: 'NEW',
                  note: 'Switched to Cash on Delivery (COD)'
                })
                .catch(() => {});
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

  const handleSaveAndConfirmAddress = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (validateForm()) {
      try {
        localStorage.setItem('fashionpoint_saved_address', JSON.stringify({ address, postOffice }));
        localStorage.setItem('fashionpoint_saved_customer', JSON.stringify(customer));
      } catch (err) {}
      setHasSavedAddress(true);
      setIsEditingAddress(false);
    } else {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-neutral-200 text-center max-w-sm shadow-xs">
          <Truck className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-neutral-900">Your shopping bag is empty</h2>
          <p className="text-xs text-neutral-500 mt-1">Explore our collections and add items to checkout.</p>
          <button
            onClick={() => onNavigate('/products')}
            className="mt-5 w-full py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800"
          >
            Shop Apparel
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
              {hasSavedAddress && !isEditingAddress ? (
                <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                        ✓
                      </span>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                        1 & 2. Delivery Destination Confirmed
                      </h2>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                      ✓ Auto-Saved • इसी पते पर भेजा जाएगा
                    </span>
                  </div>

                  <div className="bg-neutral-50 rounded-2xl p-4 sm:p-5 border border-neutral-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-base text-neutral-950">
                            {customer.fullName || 'Customer'}
                          </span>
                          <span className="text-[10px] font-mono font-bold bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-md">
                            SAVED ADDRESS
                          </span>
                          {customer.email && (
                            <span className="text-xs text-neutral-500">
                              ({customer.email})
                            </span>
                          )}
                        </div>

                        <p className="font-mono text-xs text-neutral-800 font-semibold flex items-center gap-2">
                          <span>📞 +91 {customer.mobileNumber}</span>
                          {customer.alternateNumber && (
                            <span className="text-neutral-500 font-normal">
                              (Alt: +91 {customer.alternateNumber})
                            </span>
                          )}
                        </p>

                        <p className="text-xs text-neutral-700 leading-relaxed pt-1">
                          <strong className="text-neutral-900 font-bold">{address.houseShopNo}</strong>, {address.street}, {address.villageArea}
                          {postOffice ? `, PO: ${postOffice}` : ''}
                        </p>

                        <p className="text-xs font-semibold text-neutral-900 font-mono">
                          {address.city}{address.district && address.district !== address.city ? `, ${address.district}` : ''}, {address.state} - <strong className="text-neutral-950 font-black">{address.pinCode}</strong>
                        </p>

                        {address.landmark && (
                          <p className="text-[11px] text-neutral-500 italic">
                            Landmark: {address.landmark}
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(true)}
                          className="px-4 py-2 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Change / बदलें</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-neutral-600">
                      <span>
                        ✨ बार-बार पता डालने की ज़रूरत नहीं है। यदि इसी पते पर मंगाना है तो नीचे Payment चुनकर Confirm करें।
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAddressId('NEW');
                          setIsEditingAddress(true);
                        }}
                        className="font-bold text-neutral-900 hover:underline cursor-pointer self-start sm:self-auto shrink-0"
                      >
                        + Use different address
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {hasSavedAddress && (
                    <div className="p-3.5 bg-neutral-100 border border-neutral-200 rounded-2xl flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-800">
                        Editing Delivery Address / पता संशोधित कर रहे हैं
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="font-bold text-neutral-900 underline hover:text-black cursor-pointer"
                      >
                        Keep Previous Address / पहले वाला पता रखें
                      </button>
                    </div>
                  )}

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

                {/* Multiple Saved Address Selector */}
                {savedAddresses.length > 0 && (
                  <div className="mb-5 pb-5 border-b border-neutral-100">
                    <p className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                      Choose Saved Address
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((sa) => (
                        <div
                          key={sa.id}
                          onClick={() => {
                            setSelectedAddressId(sa.id);
                            applySavedAddress(sa);
                          }}
                          className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            selectedAddressId === sa.id
                              ? 'border-black bg-neutral-50/80 ring-2 ring-black/10'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-neutral-900">{sa.fullName}</span>
                            <div className="flex gap-1">
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700">
                                {sa.addressType || 'HOME'}
                              </span>
                              {sa.isDefault && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black text-white">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-neutral-600 text-[11px] leading-snug">
                            {sa.houseBuilding}, {sa.streetArea}, {sa.villageTownCity}
                          </p>
                          <p className="text-neutral-900 font-semibold text-[11px] mt-1 font-mono">
                            {sa.district}, {sa.state} - {sa.pinCode}
                          </p>
                        </div>
                      ))}

                      {/* Option to enter a new address */}
                      <div
                        onClick={() => {
                          setSelectedAddressId('NEW');
                          setAddress({
                            houseShopNo: '',
                            street: '',
                            villageArea: '',
                            city: '',
                            district: '',
                            state: 'Madhya Pradesh',
                            pinCode: '',
                            landmark: ''
                          });
                          setPostOffice('');
                        }}
                        className={`p-3.5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          selectedAddressId === 'NEW'
                            ? 'border-black bg-neutral-50 text-black'
                            : 'border-neutral-300 text-neutral-600 hover:border-neutral-400'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        <span className="text-xs font-bold">+ Enter Different Address</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Input Form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* PIN code input with instant local lookup */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-neutral-700">
                        PIN Code <span className="text-rose-600">*</span>
                      </label>
                      {pinLookupLoading && (
                        <span className="text-[11px] text-neutral-500 flex items-center gap-1 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" /> Verifying postal dataset...
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={address.pinCode}
                      onChange={(e) => handlePincodeChange(e.target.value)}
                      placeholder="6-digit PIN (e.g. 452001, 110001, 400001)"
                      className={`w-full px-3 py-2 border rounded-xl focus:outline-hidden focus:border-black font-mono ${
                        errors.pinCode ? 'border-rose-500' : 'border-neutral-300'
                      }`}
                    />
                    {errors.pinCode && <p className="text-[10px] text-rose-600 mt-1">{errors.pinCode}</p>}

                    {pinLookupMessage && (
                      <div
                        className={`mt-1.5 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] font-medium ${
                          pinLookupMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {pinLookupMessage.type === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                        <span>{pinLookupMessage.text}</span>
                      </div>
                    )}
                  </div>

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

                  <div>
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-neutral-700 text-xs">
                        Post Office / डाकघर <span className="text-neutral-400 font-normal">(Select Branch)</span>
                      </label>
                      {postOfficesList.length > 0 && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded-md">
                          {postOfficesList.length} Found
                        </span>
                      )}
                    </div>

                    {!isCustomPostOffice && postOfficesList.length > 0 ? (
                      <div className="space-y-1">
                        <select
                          value={postOffice}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '__CUSTOM__') {
                              setIsCustomPostOffice(true);
                              setPostOffice('');
                            } else {
                              setPostOffice(val);
                              if (val && (!address.villageArea || address.villageArea === address.city)) {
                                setAddress(prev => ({ ...prev, villageArea: val }));
                              }
                            }
                          }}
                          className="w-full px-3 py-2 border-2 border-neutral-300 focus:border-black rounded-xl focus:outline-hidden bg-white text-xs font-semibold text-neutral-900 cursor-pointer"
                        >
                          <option value="">-- Choose your nearest Post Office ({postOfficesList.length}) --</option>
                          {postOfficesList.map((po) => (
                            <option key={po} value={po}>
                              {po} Post Office
                            </option>
                          ))}
                          <option value="__CUSTOM__">✍️ Other Post Office (Enter Manually)</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={postOffice}
                          onChange={(e) => setPostOffice(e.target.value)}
                          placeholder="e.g. Sub Post Office or Branch Name"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:border-black bg-white text-xs"
                        />
                        {postOfficesList.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsCustomPostOffice(false)}
                            className="px-2.5 py-2 text-[10px] font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-xl shrink-0 cursor-pointer"
                            title="Switch back to list"
                          >
                            List ({postOfficesList.length})
                          </button>
                        )}
                      </div>
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
                      Nearby Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={address.landmark}
                      onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                      placeholder="e.g. Near Govt Hospital"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:outline-hidden focus:border-black"
                    />
                  </div>

                  {/* Save address checkbox */}
                  <div className="sm:col-span-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAddressToAccount}
                        onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                        className="w-4 h-4 rounded-md border-neutral-300 text-black focus:ring-black"
                      />
                      <span className="font-semibold text-neutral-800 text-xs">
                        Save this delivery address for all future orders (अगली बार दोबारा पता नहीं डालना पड़ेगा)
                      </span>
                    </label>
                  </div>

                  {/* Action buttons to Save and Confirm Address */}
                  <div className="sm:col-span-2 pt-3 border-t border-neutral-100 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={handleSaveAndConfirmAddress}
                      className="px-5 py-2.5 bg-neutral-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Use This Address / इसी पते को सुरक्षित करें</span>
                    </button>

                    {hasSavedAddress && (
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(false)}
                        className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

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

                {/* Coupon Code input */}
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon (e.g. FASHION10)"
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-xl text-xs uppercase font-mono focus:border-black focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-black rounded-xl text-xs font-bold transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage && (
                    <p
                      className={`text-[11px] mt-1.5 font-medium ${
                        appliedCouponDiscount > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {couponMessage}
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Items Subtotal</span>
                    <span className="font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-neutral-600">
                    <span>Delivery Charges</span>
                    <span className="font-mono font-semibold">
                      {deliveryCharge === 0 ? (
                        <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span>
                      ) : (
                        `₹${deliveryCharge}`
                      )}
                    </span>
                  </div>

                  {appliedCouponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Promotional Discount</span>
                      <span className="font-mono font-bold">-₹{appliedCouponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-neutral-100 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-neutral-900">Grand Total</span>
                    <span className="font-mono text-xl font-black text-neutral-900">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Place Order CTA Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="mt-6 w-full py-3.5 bg-black hover:bg-neutral-800 active:scale-98 text-white rounded-xl text-xs uppercase font-bold tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>
                    {isProcessing
                      ? 'Creating Order in Database...'
                      : paymentMethod === 'COD'
                      ? `Place Order (Pay ₹${grandTotal} on Delivery)`
                      : `Proceed to Pay ₹${grandTotal}`}
                  </span>
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-neutral-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified 256-Bit SSL Secured Transaction</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

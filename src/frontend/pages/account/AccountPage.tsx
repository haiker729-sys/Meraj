import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { PrintInvoiceModal } from '../../../invoice/print/PrintInvoiceModal';
import { AddressModal } from './AddressModal';
import { Order, CustomerProfile, CustomerAddress, Product } from '../../../types';
import { cartManager } from '../../../utils/cartManager';
import {
  User,
  Package,
  MapPin,
  Heart,
  Phone,
  Mail,
  Printer,
  ExternalLink,
  Loader2,
  Calendar,
  Edit2,
  Check,
  X,
  Plus,
  Trash2,
  Search,
  Truck,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  LogOut
} from 'lucide-react';

interface AccountPageProps {
  onNavigate: (path: string) => void;
}

type TabType = 'PROFILE' | 'ADDRESSES' | 'ORDERS' | 'WISHLIST' | 'TRACK';

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('PROFILE');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // Profile state
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    dateOfBirth: '',
    gender: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Addresses state
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Wishlist state
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Direct Track Order state
  const [trackQuery, setTrackQuery] = useState('');
  const [trackMobile, setTrackMobile] = useState('');

  const [isLoadingMain, setIsLoadingMain] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Fetch initial profile & customer info
  const fetchCustomerData = async () => {
    try {
      setIsLoadingMain(true);
      const profileRes = await apiClient.customer.getProfile().catch(() => null);

      if (profileRes?.profile) {
        setProfile(profileRes.profile);
        setProfileFormData({
          fullName: profileRes.profile.fullName || '',
          mobile: profileRes.profile.mobile || '',
          email: profileRes.profile.email || '',
          dateOfBirth: profileRes.profile.dateOfBirth ? profileRes.profile.dateOfBirth.substring(0, 10) : '',
          gender: profileRes.profile.gender || ''
        });
        setIsAuthenticated(true);
      } else {
        // Not authenticated
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoadingMain(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const res = await apiClient.customer.getAddresses();
      if (res?.addresses) {
        setAddresses(res.addresses);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setAddressLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await apiClient.customer.getOrders().catch(() =>
        apiClient.orders.myOrders().catch(() => apiClient.orders.list({ limit: 50 }))
      );
      if (res?.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchWishlistItems = async () => {
    try {
      setWishlistLoading(true);
      const wishlistIds = cartManager.getWishlist();
      if (wishlistIds.length === 0) {
        setWishlistProducts([]);
        return;
      }
      const res = await apiClient.products.list({ limit: 100 });
      if (res?.products) {
        setWishlistProducts(res.products.filter((p) => wishlistIds.includes(p.id)));
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
    fetchOrders();
    fetchAddresses();
    fetchWishlistItems();
  }, []);

  // Handle Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    if (!profileFormData.fullName.trim() || !profileFormData.mobile.trim()) {
      setProfileMessage({ type: 'error', text: 'Full Name and Mobile Number are required.' });
      return;
    }

    setProfileSaving(true);
    try {
      const res = await apiClient.customer.updateProfile(profileFormData);
      if (res?.profile) {
        setProfile(res.profile);
        setIsEditingProfile(false);
        setProfileMessage({ type: 'success', text: 'Profile details saved successfully.' });
        setTimeout(() => setProfileMessage(null), 4000);
      }
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Address actions
  const handleDeleteAddress = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this delivery address?')) return;
    try {
      await apiClient.customer.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete address.');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await apiClient.customer.setDefaultAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id
        }))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to set default address.');
    }
  };

  const handleAddressSaved = (saved: CustomerAddress) => {
    setAddresses((prev) => {
      const exists = prev.some((a) => a.id === saved.id);
      if (exists) {
        return prev.map((a) => (a.id === saved.id ? saved : saved.isDefault ? { ...a, isDefault: false } : a));
      }
      if (saved.isDefault) {
        return [saved, ...prev.map((a) => ({ ...a, isDefault: false }))];
      }
      return [...prev, saved];
    });
  };

  const handleLogout = () => {
    apiClient.auth.logout();
    setIsAuthenticated(false);
    setProfile(null);
    onNavigate('/login');
  };

  const handleDirectTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    const params = new URLSearchParams();
    params.append('orderId', trackQuery.trim());
    if (trackMobile.trim()) params.append('mobile', trackMobile.trim());
    onNavigate(`/order-tracking?${params.toString()}`);
  };

  if (isLoadingMain) {
    return (
      <div className="min-h-screen bg-neutral-50/60 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-sm shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-400 mb-3" />
          <p className="text-sm text-neutral-600 font-medium">Loading customer account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50/60 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-lg font-serif shadow-sm">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'FP'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-serif text-neutral-900">
                {profile?.fullName || 'Customer Account'}
              </h1>
              <p className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                <span>{profile?.mobile ? `+91 ${profile.mobile}` : 'Fashion Point Member'}</span>
                {profile?.email && (
                  <>
                    <span>•</span>
                    <span>{profile.email}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Customer Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-neutral-200/80 p-1 rounded-2xl text-xs font-bold self-start">
            <button
              type="button"
              onClick={() => setActiveTab('PROFILE')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'PROFILE' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ADDRESSES')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'ADDRESSES' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Addresses ({addresses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ORDERS')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'ORDERS' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('WISHLIST');
                fetchWishlistItems();
              }}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'WISHLIST' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Wishlist ({cartManager.getWishlist().length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('TRACK')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'TRACK' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Order</span>
            </button>

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="px-2.5 py-2 rounded-xl text-neutral-500 hover:text-rose-600 hover:bg-white/60 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: PROFILE VIEW & EDIT                           */}
        {/* ==================================================== */}
        {activeTab === 'PROFILE' && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 max-w-2xl shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="font-bold text-base font-serif text-neutral-900">
                  Personal Information
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Manage your personal contact info and profile preferences
                </p>
              </div>

              {!isEditingProfile && isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {profileMessage && (
              <div
                className={`mt-4 p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
                  profileMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            {!isAuthenticated ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-neutral-600 font-medium">
                  Please log in to your account to view and update your profile and saved addresses.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800"
                >
                  Sign In / Register
                </button>
              </div>
            ) : isEditingProfile ? (
              /* Profile Edit Form */
              <form onSubmit={handleSaveProfile} className="mt-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileFormData.fullName}
                    onChange={(e) => setProfileFormData({ ...profileFormData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Mobile Number *
                    </label>
                    <div className="flex">
                      <span className="px-3 py-2.5 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-xl text-neutral-600 font-mono">
                        +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={profileFormData.mobile}
                        onChange={(e) =>
                          setProfileFormData({ ...profileFormData, mobile: e.target.value.replace(/\D/g, '') })
                        }
                        placeholder="10-digit mobile"
                        className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-r-xl focus:border-black focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileFormData.email}
                      onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Date of Birth (Optional)
                    </label>
                    <input
                      type="date"
                      value={profileFormData.dateOfBirth}
                      onChange={(e) => setProfileFormData({ ...profileFormData, dateOfBirth: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Gender (Optional)
                    </label>
                    <select
                      value={profileFormData.gender}
                      onChange={(e) => setProfileFormData({ ...profileFormData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={profileSaving}
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileFormData({
                        fullName: profile?.fullName || '',
                        mobile: profile?.mobile || '',
                        email: profile?.email || '',
                        dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.substring(0, 10) : '',
                        gender: profile?.gender || ''
                      });
                    }}
                    className="px-4 py-2 border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:text-black"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-5 py-2 bg-black hover:bg-neutral-800 text-white font-bold rounded-xl flex items-center gap-1.5"
                  >
                    {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Profile Read-Only View */
              <div className="mt-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-100">
                    <span className="text-neutral-500 block text-[11px] font-medium">Full Name</span>
                    <span className="font-bold text-neutral-900 text-sm mt-0.5 block">
                      {profile?.fullName || 'Not specified'}
                    </span>
                  </div>

                  <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-100">
                    <span className="text-neutral-500 block text-[11px] font-medium">Mobile Number</span>
                    <span className="font-mono font-bold text-neutral-900 text-sm mt-0.5 block">
                      {profile?.mobile ? `+91 ${profile.mobile}` : 'Not provided'}
                    </span>
                  </div>

                  <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-100">
                    <span className="text-neutral-500 block text-[11px] font-medium">Email Address</span>
                    <span className="font-medium text-neutral-900 text-sm mt-0.5 block">
                      {profile?.email || 'None added'}
                    </span>
                  </div>

                  <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-100">
                    <span className="text-neutral-500 block text-[11px] font-medium">Date of Birth</span>
                    <span className="font-medium text-neutral-900 text-sm mt-0.5 block">
                      {profile?.dateOfBirth
                        ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'Not specified'}
                    </span>
                  </div>

                  <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-100">
                    <span className="text-neutral-500 block text-[11px] font-medium">Gender</span>
                    <span className="font-medium text-neutral-900 text-sm mt-0.5 block">
                      {profile?.gender || 'Not specified'}
                    </span>
                  </div>

                  <div className="p-4 bg-neutral-50/80 rounded-2xl border border-neutral-100">
                    <span className="text-neutral-500 block text-[11px] font-medium">Account Security</span>
                    <span className="font-semibold text-emerald-700 text-xs flex items-center gap-1 mt-1">
                      <ShieldCheck className="w-4 h-4" /> Verified PostgreSQL Session
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: ADDRESS MANAGEMENT                            */}
        {/* ==================================================== */}
        {activeTab === 'ADDRESSES' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-base font-serif text-neutral-900">
                  Saved Delivery Addresses
                </h3>
                <p className="text-xs text-neutral-500">
                  Manage multiple shipping addresses for fast, 1-click checkout
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setIsAddressModalOpen(true);
                }}
                className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {addressLoading ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-400 mb-3" />
                <p className="text-sm text-neutral-600 font-medium">Loading saved addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto shadow-2xs">
                <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <h4 className="font-bold text-sm text-neutral-900">No saved addresses yet</h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Add your home or office address to save time during your future checkouts.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(null);
                    setIsAddressModalOpen(true);
                  }}
                  className="mt-5 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800"
                >
                  Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col justify-between transition-all ${
                      addr.isDefault ? 'border-neutral-950 ring-2 ring-neutral-950/10' : 'border-neutral-200'
                    }`}
                  >
                    <div>
                      {/* Badge bar */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 font-mono">
                            {addr.addressType || 'HOME'}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black text-white">
                              Default
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAddress(addr);
                              setIsAddressModalOpen(true);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Edit Address"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Recipient Details */}
                      <h4 className="font-bold text-sm text-neutral-900">{addr.fullName}</h4>
                      <p className="text-xs text-neutral-600 font-mono mt-0.5">Mob: +91 {addr.mobileNumber}</p>

                      {/* Address Lines */}
                      <div className="mt-3 text-xs text-neutral-700 leading-relaxed space-y-0.5">
                        <p>{addr.houseBuilding}, {addr.streetArea}</p>
                        <p>{addr.villageTownCity}{addr.postOffice ? `, PO: ${addr.postOffice}` : ''}</p>
                        {addr.landmark && <p className="text-neutral-500 italic">Landmark: {addr.landmark}</p>}
                        <p className="font-semibold text-neutral-900">
                          {addr.district}, {addr.state} - <span className="font-mono">{addr.pinCode}</span>
                        </p>
                      </div>
                    </div>

                    {/* Footer Default Action */}
                    {!addr.isDefault && (
                      <div className="mt-4 pt-3 border-t border-neutral-100">
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-xs font-bold text-neutral-700 hover:text-black underline"
                        >
                          Set as Default Address
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: ORDER HISTORY                                 */}
        {/* ==================================================== */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-6">
            {ordersLoading ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-400 mb-3" />
                <p className="text-sm text-neutral-600 font-medium">Loading orders from server...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto shadow-2xs">
                <Package className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <h3 className="font-bold text-sm text-neutral-900">No orders placed yet</h3>
                <p className="text-xs text-neutral-500 mt-1">Discover trending collections and place your first order!</p>
                <button
                  onClick={() => onNavigate('/products')}
                  className="mt-5 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800"
                >
                  Browse Store
                </button>
              </div>
            ) : (
              orders.map((order) => {
                const isDelivered = order.status === 'Delivered' || order.status === 'DELIVERED';
                const isCancelled = order.status === 'Cancelled' || order.status === 'CANCELLED' || order.orderStatus === 'CANCELLED';
                const totalAmt = order.totalAmount ?? order.pricing?.grandTotal ?? 0;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-neutral-900">{order.id}</span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                              isDelivered
                                ? 'bg-emerald-100 text-emerald-800'
                                : isCancelled
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {isCancelled ? 'Cancelled' : order.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const params = new URLSearchParams();
                            params.append('orderId', order.id);
                            if (order.trackingToken) params.append('token', order.trackingToken);
                            if (order.customer?.mobileNumber) params.append('mobile', order.customer.mobileNumber);
                            onNavigate(`/order-tracking?${params.toString()}`);
                          }}
                          className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs font-bold text-neutral-800 transition-colors flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Status</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-3.5 py-2 border border-neutral-300 hover:border-black rounded-xl text-xs font-bold text-neutral-800 flex items-center gap-1.5 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="divide-y divide-neutral-100">
                      {order.items.map((item, idx) => {
                        const imageSrc = item.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80';
                        const title = item.name || item.product?.name || 'Fashion Item';
                        const sizeVal = item.size || item.selectedSize || 'M';
                        const colorName = item.colorName || item.selectedColor?.name || 'Standard';
                        const unitPrice = item.price || item.product?.price || 0;

                        return (
                          <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={imageSrc}
                                alt={title}
                                className="w-10 h-14 object-cover rounded-md border border-neutral-200"
                              />
                              <div>
                                <h4 className="font-semibold text-neutral-900">{title}</h4>
                                <p className="text-[11px] text-neutral-500">
                                  Size: {sizeVal} • {colorName} • Qty: {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-neutral-900">
                              ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Details */}
                    <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between text-xs text-neutral-600 gap-2">
                      <div>
                        <span>
                          Shipment via: <strong>{order.courierName || 'Fashion Point Logistics'}</strong> (AWB:{' '}
                          <span className="font-mono">{order.trackingNumber || order.awbNumber || 'PENDING'}</span>)
                        </span>
                      </div>
                      <div>
                        <span>
                          Total: <strong className="text-black font-mono font-bold text-sm">₹{totalAmt.toLocaleString('en-IN')}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: WISHLIST                                      */}
        {/* ==================================================== */}
        {activeTab === 'WISHLIST' && (
          <div>
            {wishlistLoading ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-400 mb-3" />
                <p className="text-sm text-neutral-600 font-medium">Loading wishlist items...</p>
              </div>
            ) : wishlistProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center max-w-md mx-auto shadow-2xs">
                <Heart className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <h3 className="font-bold text-sm text-neutral-900">Your wishlist is empty</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Explore trending clothing and bookmark items you love.
                </p>
                <button
                  onClick={() => onNavigate('/products')}
                  className="mt-5 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-neutral-800"
                >
                  Discover Collections
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {wishlistProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs group flex flex-col justify-between"
                  >
                    <div
                      className="cursor-pointer relative aspect-3/4 bg-neutral-100 overflow-hidden"
                      onClick={() => onNavigate(`/product/${prod.id}`)}
                    >
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-3.5 flex flex-col justify-between flex-1">
                      <div>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{prod.category}</p>
                        <h4
                          onClick={() => onNavigate(`/product/${prod.id}`)}
                          className="font-bold text-xs text-neutral-900 truncate hover:underline cursor-pointer mt-0.5"
                        >
                          {prod.name}
                        </h4>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-bold text-xs font-mono text-neutral-900">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </span>
                          {prod.mrp > prod.price && (
                            <span className="text-[10px] line-through text-neutral-400 font-mono">
                              ₹{prod.mrp.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            cartManager.addToCart({
                              productId: prod.id,
                              product: prod,
                              quantity: 1,
                              selectedSize: prod.sizes?.[0] || 'M',
                              selectedColor: prod.colors?.[0] || { name: 'Standard', hex: '#000000' }
                            });
                            alert(`Added ${prod.name} to your shopping bag!`);
                          }}
                          className="flex-1 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add to Bag</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            cartManager.toggleWishlist(prod.id);
                            fetchWishlistItems();
                          }}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-neutral-100"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: DIRECT ORDER TRACKING INPUT                   */}
        {/* ==================================================== */}
        {activeTab === 'TRACK' && (
          <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 max-w-xl mx-auto shadow-2xs">
            <div className="text-center max-w-md mx-auto mb-6">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black font-serif text-neutral-900">
                Track Any Shipment
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Enter your Order ID, Tracking Number, or QR token for live status
              </p>
            </div>

            <form onSubmit={handleDirectTrackSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Order ID / Tracking Number / Token *
                </label>
                <input
                  type="text"
                  required
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value.toUpperCase())}
                  placeholder="e.g. FP-10001 or tk_8f93bc..."
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Mobile Number (Optional if token provided)
                </label>
                <div className="flex">
                  <span className="px-3 py-2.5 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-xl text-neutral-600 font-mono">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={trackMobile}
                    onChange={(e) => setTrackMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-r-xl focus:border-black focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Tracking Milestone</span>
              </button>
            </form>
          </div>
        )}

        {/* Address Modal */}
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSaved={handleAddressSaved}
          initialAddress={editingAddress}
        />

        {/* Invoice Modal */}
        {selectedInvoiceOrder && (
          <PrintInvoiceModal
            isOpen={!!selectedInvoiceOrder}
            onClose={() => setSelectedInvoiceOrder(null)}
            order={selectedInvoiceOrder}
          />
        )}
      </div>
    </div>
  );
};

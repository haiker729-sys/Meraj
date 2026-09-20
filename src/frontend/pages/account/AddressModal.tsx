import React, { useState, useEffect } from 'react';
import { CustomerAddress } from '../../../types';
import { apiClient } from '../../../api/client';
import { X, MapPin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (address: CustomerAddress) => void;
  initialAddress?: CustomerAddress | null;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal'
];

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialAddress
}) => {
  const [formData, setFormData] = useState<{
    fullName: string;
    mobileNumber: string;
    houseBuilding: string;
    streetArea: string;
    villageTownCity: string;
    postOffice: string;
    district: string;
    state: string;
    pinCode: string;
    landmark: string;
    addressType: string;
    isDefault: boolean;
  }>({
    fullName: '',
    mobileNumber: '',
    houseBuilding: '',
    streetArea: '',
    villageTownCity: '',
    postOffice: '',
    district: '',
    state: 'Madhya Pradesh',
    pinCode: '',
    landmark: '',
    addressType: 'HOME',
    isDefault: false
  });

  const [postOfficesList, setPostOfficesList] = useState<string[]>([]);
  const [pinLookupLoading, setPinLookupLoading] = useState(false);
  const [pinLookupMessage, setPinLookupMessage] = useState<{ type: 'success' | 'warn' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialAddress) {
      setFormData({
        fullName: initialAddress.fullName || '',
        mobileNumber: initialAddress.mobileNumber || '',
        houseBuilding: initialAddress.houseBuilding || '',
        streetArea: initialAddress.streetArea || '',
        villageTownCity: initialAddress.villageTownCity || '',
        postOffice: initialAddress.postOffice || '',
        district: initialAddress.district || '',
        state: initialAddress.state || 'Madhya Pradesh',
        pinCode: initialAddress.pinCode || '',
        landmark: initialAddress.landmark || '',
        addressType: initialAddress.addressType || 'HOME',
        isDefault: Boolean(initialAddress.isDefault)
      });
      if (initialAddress.pinCode && initialAddress.pinCode.length === 6) {
        checkPinCode(initialAddress.pinCode, false);
      }
    } else {
      setFormData({
        fullName: '',
        mobileNumber: '',
        houseBuilding: '',
        streetArea: '',
        villageTownCity: '',
        postOffice: '',
        district: '',
        state: 'Madhya Pradesh',
        pinCode: '',
        landmark: '',
        addressType: 'HOME',
        isDefault: false
      });
      setPostOfficesList([]);
      setPinLookupMessage(null);
    }
    setErrors({});
  }, [initialAddress, isOpen]);

  const checkPinCode = async (pincode: string, shouldAutofill = true) => {
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return;
    }
    setPinLookupLoading(true);
    setPinLookupMessage(null);

    try {
      const res = await apiClient.postal.lookupPincode(pincode);
      if (res.found) {
        setPostOfficesList(res.postOffices || []);
        if (shouldAutofill) {
          setFormData((prev) => ({
            ...prev,
            district: res.district || prev.district,
            state: res.state || prev.state,
            villageTownCity: res.city || prev.villageTownCity,
            postOffice: res.postOffices && res.postOffices.length > 0 ? res.postOffices[0] : prev.postOffice
          }));
        }
        setPinLookupMessage({
          type: 'success',
          text: `Verified PIN code: ${res.district}, ${res.state}`
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
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({ ...prev, pinCode: val }));

    if (val.length === 6) {
      checkPinCode(val, true);
    } else {
      setPostOfficesList([]);
      setPinLookupMessage(null);
    }
  };

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!formData.fullName.trim()) err.fullName = 'Full Name is required';
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      err.mobileNumber = 'Valid 10-digit mobile number required';
    }
    if (!formData.houseBuilding.trim()) err.houseBuilding = 'House / Flat / Building No. is required';
    if (!formData.streetArea.trim()) err.streetArea = 'Street / Road / Area is required';
    if (!formData.villageTownCity.trim()) err.villageTownCity = 'Village / Town / City is required';
    if (!formData.district.trim()) err.district = 'District is required';
    if (!formData.state.trim()) err.state = 'State is required';
    if (!formData.pinCode.trim() || formData.pinCode.length !== 6) {
      err.pinCode = 'Valid 6-digit PIN code is required';
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (initialAddress?.id) {
        const res = await apiClient.customer.updateAddress(initialAddress.id, formData);
        onSaved(res.address);
      } else {
        const res = await apiClient.customer.createAddress(formData);
        onSaved(res.address);
      }
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to save address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl border border-neutral-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-neutral-900 font-serif">
              {initialAddress ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Contact Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Recipient name"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
              />
              {errors.fullName && <p className="text-rose-600 text-[11px] mt-0.5">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                10-Digit Mobile Number *
              </label>
              <div className="flex">
                <span className="px-2.5 py-2 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-xl text-neutral-600 font-mono">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-r-xl focus:border-black focus:outline-hidden font-mono"
                />
              </div>
              {errors.mobileNumber && <p className="text-rose-600 text-[11px] mt-0.5">{errors.mobileNumber}</p>}
            </div>
          </div>

          {/* PIN Code Lookup with Auto-Suggestion */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-neutral-700 uppercase tracking-wider">
                6-Digit PIN Code *
              </label>
              {pinLookupLoading && (
                <span className="text-[11px] text-neutral-500 flex items-center gap-1 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" /> Verifying PIN...
                </span>
              )}
            </div>
            <input
              type="text"
              maxLength={6}
              value={formData.pinCode}
              onChange={handlePincodeChange}
              placeholder="e.g. 452001, 110001, 400001"
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden font-mono"
            />
            {errors.pinCode && <p className="text-rose-600 text-[11px] mt-0.5">{errors.pinCode}</p>}

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

          {/* House / Flat & Street */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                House / Flat / Building No. *
              </label>
              <input
                type="text"
                value={formData.houseBuilding}
                onChange={(e) => setFormData({ ...formData, houseBuilding: e.target.value })}
                placeholder="e.g. Flat 302, Green Enclave"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
              />
              {errors.houseBuilding && <p className="text-rose-600 text-[11px] mt-0.5">{errors.houseBuilding}</p>}
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Street / Road / Area *
              </label>
              <input
                type="text"
                value={formData.streetArea}
                onChange={(e) => setFormData({ ...formData, streetArea: e.target.value })}
                placeholder="e.g. MG Road, Near City Mall"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
              />
              {errors.streetArea && <p className="text-rose-600 text-[11px] mt-0.5">{errors.streetArea}</p>}
            </div>
          </div>

          {/* Village / Town / City & Post Office */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Village / Town / City *
              </label>
              <input
                type="text"
                value={formData.villageTownCity}
                onChange={(e) => setFormData({ ...formData, villageTownCity: e.target.value })}
                placeholder="e.g. Indore"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
              />
              {errors.villageTownCity && <p className="text-rose-600 text-[11px] mt-0.5">{errors.villageTownCity}</p>}
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Post Office (Optional)
              </label>
              {postOfficesList.length > 0 ? (
                <select
                  value={formData.postOffice}
                  onChange={(e) => setFormData({ ...formData, postOffice: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden bg-white"
                >
                  <option value="">Select Post Office</option>
                  {postOfficesList.map((po) => (
                    <option key={po} value={po}>
                      {po}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.postOffice}
                  onChange={(e) => setFormData({ ...formData, postOffice: e.target.value })}
                  placeholder="e.g. Main Post Office"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                />
              )}
            </div>
          </div>

          {/* District & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                District *
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                placeholder="e.g. Indore"
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
              />
              {errors.district && <p className="text-rose-600 text-[11px] mt-0.5">{errors.district}</p>}
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                State *
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden bg-white"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.state && <p className="text-rose-600 text-[11px] mt-0.5">{errors.state}</p>}
            </div>
          </div>

          {/* Landmark */}
          <div>
            <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              placeholder="e.g. Opposite City Hospital"
              className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
            />
          </div>

          {/* Address Type & Default Checkbox */}
          <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Address Type
              </span>
              <div className="flex gap-2">
                {['HOME', 'WORK', 'OTHER'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, addressType: type })}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      formData.addressType === type
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2 sm:pt-4">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4 rounded-md border-neutral-300 text-black focus:ring-black"
              />
              <span className="font-semibold text-neutral-800">Set as default delivery address</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-neutral-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black border border-neutral-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-black hover:bg-neutral-800 rounded-xl flex items-center gap-1.5"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{initialAddress ? 'Update Address' : 'Save Address'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

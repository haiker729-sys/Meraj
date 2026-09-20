import React, { useState, useEffect, useRef } from 'react';
import { Order } from '../../../types';
import { apiClient } from '../../../api/client';
import {
  X,
  QrCode,
  Search,
  Truck,
  CheckCircle2,
  AlertCircle,
  Camera,
  MapPin,
  ShieldCheck,
  Loader2,
  ArrowRight,
  PackageCheck,
  RefreshCw
} from 'lucide-react';

interface AdminTrackingScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
}

export const AdminTrackingScannerModal: React.FC<AdminTrackingScannerModalProps> = ({
  isOpen,
  onClose,
  onOrderUpdated
}) => {
  const [scanInput, setScanInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Event submission state
  const [newEventStatus, setNewEventStatus] = useState<string>('Dispatched');
  const [newEventLocation, setNewEventLocation] = useState('Central Warehouse Hub');
  const [newEventNote, setNewEventNote] = useState('Package sorted and processed for line-haul dispatch');
  const [updateOrderStatus, setUpdateOrderStatus] = useState(true);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScanInput('');
      setMatchedOrder(null);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setErrorMessage('Camera access is not supported in this browser environment. Please use manual input.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera failed:', err);
      setErrorMessage('Could not open camera stream. Please use barcode / QR text manual input.');
      setIsCameraActive(false);
    }
  };

  const handleLookup = async (inputStr: string) => {
    if (!inputStr.trim()) return;
    setIsSearching(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Check if user scanned full URL or raw token
      let cleaned = inputStr.trim();
      if (cleaned.includes('orderId=') || cleaned.includes('token=')) {
        try {
          const url = new URL(cleaned.startsWith('http') ? cleaned : `http://localhost${cleaned.startsWith('/') ? '' : '/'}${cleaned}`);
          cleaned = url.searchParams.get('token') || url.searchParams.get('orderId') || cleaned;
        } catch {
          // fallback string match
          const match = cleaned.match(/token=([a-zA-Z0-9_-]+)/) || cleaned.match(/orderId=([a-zA-Z0-9_-]+)/);
          if (match && match[1]) cleaned = match[1];
        }
      }

      const res = await apiClient.admin.lookupScanToken(cleaned);
      if (res?.order) {
        setMatchedOrder(res.order);
        setNewEventLocation(res.order.currentLocation || 'Dispatch Hub');
      } else {
        setMatchedOrder(null);
        setErrorMessage('Invalid QR Code / Tracking Token. No matching order found in database.');
      }
    } catch (err: any) {
      setMatchedOrder(null);
      setErrorMessage(err.message || 'Invalid QR Code / Tracking Token');
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(scanInput);
  };

  const handleRecordDispatchScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedOrder) return;

    setIsSubmittingEvent(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await apiClient.admin.submitScan({
        token: matchedOrder.trackingToken || matchedOrder.id,
        status: newEventStatus,
        location: newEventLocation,
        description: newEventNote,
        courierName: matchedOrder.courierName,
        awbNumber: matchedOrder.trackingNumber || matchedOrder.awbNumber
      });

      setSuccessMessage(`Dispatch milestone recorded: ${newEventStatus} at ${newEventLocation}`);
      if (res?.order) {
        setMatchedOrder(res.order);
      }
      if (onOrderUpdated) {
        onOrderUpdated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record tracking milestone.');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl border border-neutral-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 font-serif">
                Dispatch & Barcode QR Scanner
              </h3>
              <p className="text-xs text-neutral-500">
                Authorized staff portal for scanning parcel shipping labels & posting verified transit events
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanner Input Controls */}
        <div className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleManualSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Scan barcode or enter Order ID / AWB / QR Token..."
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-mono border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !scanInput.trim()}
                className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Find Order</span>
              </button>
            </form>

            <button
              type="button"
              onClick={isCameraActive ? stopCamera : startCamera}
              className={`px-4 py-2.5 border rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                isCameraActive
                  ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{isCameraActive ? 'Stop Camera' : 'Camera Scanner'}</span>
            </button>
          </div>

          {/* Camera Viewport (if active) */}
          {isCameraActive && (
            <div className="relative bg-black rounded-2xl overflow-hidden aspect-16/9 flex items-center justify-center border-2 border-dashed border-neutral-600">
              <video ref={videoRef} className="w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative shadow-lg">
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold bg-black/80 text-emerald-400 px-2 py-0.5 rounded">
                    Aim at Shipping QR / Barcode
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Scanned Order Details & Actions */}
        {matchedOrder ? (
          <div className="mt-6 border-t border-neutral-100 pt-5 space-y-5">
            {/* Scanned Order Details Grid */}
            <div className="bg-neutral-50/80 rounded-2xl p-5 border border-neutral-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-200 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-neutral-900">{matchedOrder.id}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black text-white">
                    {matchedOrder.status}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 text-neutral-700">
                    AWB: {matchedOrder.trackingNumber || matchedOrder.awbNumber || 'PENDING'}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 font-mono">
                  Token: {matchedOrder.trackingToken || 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Customer Name</span>
                  <span className="font-bold text-neutral-900 block mt-0.5">
                    {matchedOrder.customer?.fullName || matchedOrder.shippingName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Customer Mobile</span>
                  <span className="font-mono font-bold text-neutral-900 block mt-0.5">
                    +91 {matchedOrder.customer?.mobileNumber || matchedOrder.shippingPhone}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Payment Mode</span>
                  <span className="font-bold text-neutral-900 block mt-0.5">
                    {matchedOrder.paymentMethod === 'COD' ? 'Cash On Delivery (COD)' : 'Prepaid Online'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    {matchedOrder.paymentMethod === 'COD' ? 'Collectible COD Amount' : 'Paid Amount'}
                  </span>
                  <span className="font-mono font-black text-neutral-950 text-sm block mt-0.5">
                    ₹{(matchedOrder.totalAmount ?? matchedOrder.pricing?.grandTotal ?? 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Delivery Address</span>
                  <span className="text-neutral-800 text-[11px] block mt-0.5">
                    {matchedOrder.shippingAddress?.houseShopNo || ''} {matchedOrder.shippingAddress?.street || ''},{' '}
                    {matchedOrder.shippingAddress?.villageArea || matchedOrder.shippingDistrict},{' '}
                    {matchedOrder.shippingAddress?.district || ''}, {matchedOrder.shippingAddress?.state || ''} -{' '}
                    <strong className="font-mono">{matchedOrder.shippingAddress?.pinCode || matchedOrder.shippingPincode}</strong>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Weight</span>
                  <span className="font-bold text-neutral-900 block mt-0.5">
                    {(matchedOrder as any).weightKg || '0.50'} KG
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Items Count</span>
                  <span className="font-bold text-neutral-900 block mt-0.5">
                    {matchedOrder.items?.length || 0} Apparel Items
                  </span>
                </div>
              </div>
            </div>

            {/* Form to Add Verified Tracking Milestone & Update Status */}
            <form onSubmit={handleRecordDispatchScan} className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-neutral-700" />
                  <span>Post Verified Transit Milestone</span>
                </h4>
                <span className="text-[11px] text-neutral-500 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Authorized Admin Audit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Event Milestone Status *
                  </label>
                  <select
                    value={newEventStatus}
                    onChange={(e) => setNewEventStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden bg-white"
                  >
                    <option value="Order Confirmed">Order Confirmed</option>
                    <option value="Packed">Packed</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Reached Destination Hub">Reached Destination Hub</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Failed Attempt">Failed Attempt</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Checkpoint Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    placeholder="e.g. Central Warehouse, Indore Hub, etc."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Description / Milestone Note *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEventNote}
                    onChange={(e) => setNewEventNote(e.target.value)}
                    placeholder="e.g. Consignment processed and dispatched via courier"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={updateOrderStatus}
                    onChange={(e) => setUpdateOrderStatus(e.target.checked)}
                    className="w-4 h-4 rounded-md border-neutral-300 text-black focus:ring-black"
                  />
                  <span className="font-semibold text-neutral-800">
                    Synchronize parent Order status to "{newEventStatus}"
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  {isSubmittingEvent && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Milestone & Audit Log</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mt-8 text-center py-8 border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50">
            <QrCode className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-neutral-700">Awaiting Barcode or QR Code</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Enter an Order ID (e.g. FP-10001) or scan thermal shipping label QR code to retrieve parcel details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

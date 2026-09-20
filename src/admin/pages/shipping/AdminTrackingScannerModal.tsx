import React, { useState, useEffect, useRef } from 'react';
import { Order, OrderTrackingEvent, JourneyStage } from '../../../types';
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
  RefreshCw,
  Building2,
  UserCheck,
  Sparkles,
  Barcode,
  Clock,
  CheckCircle,
  FileCheck2,
  Info
} from 'lucide-react';

interface AdminTrackingScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: () => void;
  initialOrderId?: string;
}

export const AdminTrackingScannerModal: React.FC<AdminTrackingScannerModalProps> = ({
  isOpen,
  onClose,
  onOrderUpdated,
  initialOrderId
}) => {
  const [scanInput, setScanInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<OrderTrackingEvent[]>([]);
  const [recommendedStage, setRecommendedStage] = useState<JourneyStage>('ADMIN_SCAN');
  const [allowedStages, setAllowedStages] = useState<JourneyStage[]>([]);

  // Selected stage for scanning action
  const [selectedStage, setSelectedStage] = useState<JourneyStage>('ADMIN_SCAN');
  const [checkpointLocation, setCheckpointLocation] = useState('Fashion Point Central Fulfilment Hub, Indore');
  const [hubName, setHubName] = useState('Bhopal Regional Logistics Hub');
  const [warehouseAction, setWarehouseAction] = useState<'PACKED' | 'DISPATCHED' | 'IN_TRANSIT'>('PACKED');
  const [hubAction, setHubAction] = useState<'ARRIVED_AT_HUB' | 'DEPARTED_FROM_HUB'>('ARRIVED_AT_HUB');
  const [recipientName, setRecipientName] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Available sample orders for quick testing
  const [sampleOrders, setSampleOrders] = useState<Order[]>([]);

  // Camera scanner state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Load sample orders when opened
  useEffect(() => {
    if (isOpen) {
      loadSampleOrders();
      if (initialOrderId) {
        setScanInput(initialOrderId);
        handleLookup(initialOrderId);
      }
    } else {
      stopCamera();
      setScanInput('');
      setMatchedOrder(null);
      setTrackingEvents([]);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialOrderId]);

  const loadSampleOrders = async () => {
    try {
      const res = await apiClient.orders.list({ limit: 8 });
      if (res?.orders) {
        setSampleOrders(res.orders);
      }
    } catch {
      // Ignore sample load errors
    }
  };

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
        setErrorMessage('Camera access is not supported in this browser environment. Please use barcode scanner or manual input.');
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
      setErrorMessage('Could not open camera stream. Please use barcode scanner or text manual input.');
      setIsCameraActive(false);
    }
  };

  const handleLookup = async (inputStr: string) => {
    if (!inputStr.trim()) return;
    setIsSearching(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await apiClient.admin.lookupScanToken(inputStr.trim());
      if (res?.order) {
        setMatchedOrder(res.order);
        setTrackingEvents(res.trackingEvents || []);

        const currentStatus = (res.order.orderStatus || res.order.status || 'ORDER_PLACED').toUpperCase();

        // Calculate recommended stage and default inputs
        let recStage: JourneyStage = 'ADMIN_SCAN';
        let defaultLoc = res.order.currentLocation || 'Fashion Point Central Hub, Indore';

        if (['ORDER_PLACED', 'NEW', 'PAYMENT_PENDING', 'PAYMENT_CONFIRMED'].includes(currentStatus)) {
          recStage = 'ADMIN_SCAN';
          defaultLoc = 'Fashion Point Central Fulfilment Hub, Indore';
        } else if (currentStatus === 'CONFIRMED') {
          recStage = 'WAREHOUSE_SCAN';
          setWarehouseAction('PACKED');
          defaultLoc = 'Fashion Point Central Warehouse & Dispatch Facility, Indore';
        } else if (currentStatus === 'PACKED') {
          recStage = 'WAREHOUSE_SCAN';
          setWarehouseAction('DISPATCHED');
          defaultLoc = 'Fashion Point Central Warehouse & Dispatch Facility, Indore';
        } else if (['DISPATCHED', 'IN_TRANSIT', 'ARRIVED_AT_HUB', 'DEPARTED_FROM_HUB'].includes(currentStatus)) {
          // If already at a hub, suggest NEXT_HUB_SCAN or OUT_FOR_DELIVERY
          const hasHubEvent = (res.trackingEvents || []).some((e: any) => e.stage === 'HUB_SCAN' || e.hubName);
          recStage = hasHubEvent ? 'NEXT_HUB_SCAN' : 'HUB_SCAN';
          setHubAction('ARRIVED_AT_HUB');
          defaultLoc = res.order.shippingAddress?.district
            ? `${res.order.shippingAddress.district} Regional Logistics Hub`
            : 'Intermediate Sorting Hub';
        } else if (currentStatus === 'OUT_FOR_DELIVERY') {
          recStage = 'DELIVERY';
          defaultLoc = [res.order.shippingAddress?.villageArea, res.order.shippingAddress?.city].filter(Boolean).join(', ') || 'Customer Doorstep';
          setRecipientName(res.order.customer?.fullName || res.order.shippingName || '');
        }

        setRecommendedStage(recStage);
        setSelectedStage(recStage);
        setAllowedStages((res.allowedStages as JourneyStage[]) || [recStage]);
        setCheckpointLocation(defaultLoc);
      } else {
        setMatchedOrder(null);
        setTrackingEvents([]);
        setErrorMessage(`Invalid QR Code / Barcode. No order found matching "${inputStr.trim()}".`);
      }
    } catch (err: any) {
      setMatchedOrder(null);
      setTrackingEvents([]);
      setErrorMessage(err.message || 'Failed to resolve QR code / barcode.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(scanInput);
  };

  const handleProcessJourneyScan = async (stageToExecute: JourneyStage) => {
    if (!matchedOrder) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let targetStatus: string | undefined = undefined;
      let stageLocation = checkpointLocation.trim();
      let stageHub = hubName.trim();
      let stageNotes = notes.trim();

      if (stageToExecute === 'WAREHOUSE_SCAN') {
        targetStatus = warehouseAction;
        if (!stageNotes) {
          stageNotes = warehouseAction === 'PACKED'
            ? 'Garments quality inspected, packed, and sealed in tamper-evident security bag'
            : 'Parcel dispatched and transferred to transit carrier line-haul';
        }
      } else if (stageToExecute === 'HUB_SCAN' || stageToExecute === 'NEXT_HUB_SCAN') {
        targetStatus = hubAction === 'DEPARTED_FROM_HUB' ? 'DEPARTED_FROM_HUB' : 'IN_TRANSIT';
        if (!stageNotes) {
          stageNotes = hubAction === 'DEPARTED_FROM_HUB'
            ? `Parcel departed from hub [${stageHub}] on route to destination`
            : `Parcel arrived at hub [${stageHub}] and sorted for onward transit`;
        }
      } else if (stageToExecute === 'DELIVERY') {
        if (!recipientName.trim()) {
          setErrorMessage('Delivery confirmation requires recipient name (e.g. Customer Name or Family Member).');
          setIsSubmitting(false);
          return;
        }
      }

      const res = await apiClient.admin.processJourneyScan({
        scanInput: matchedOrder.trackingNumber || matchedOrder.trackingToken || matchedOrder.id,
        stage: stageToExecute,
        location: stageLocation,
        hubName: (stageToExecute === 'HUB_SCAN' || stageToExecute === 'NEXT_HUB_SCAN') ? stageHub : undefined,
        targetStatus,
        notes: stageNotes || undefined,
        recipientName: stageToExecute === 'DELIVERY' ? recipientName.trim() : undefined,
        confirmationCode: stageToExecute === 'DELIVERY' ? confirmationCode.trim() : undefined
      });

      setSuccessMessage(res.message || 'Milestone recorded successfully.');
      if (res?.order) {
        setMatchedOrder(res.order);
      }
      if (res?.trackingEvents) {
        setTrackingEvents(res.trackingEvents);
      }

      // Re-evaluate next stage
      const newStatus = (res.order?.orderStatus || res.order?.status || '').toUpperCase();
      if (newStatus === 'CONFIRMED') {
        setRecommendedStage('WAREHOUSE_SCAN');
        setSelectedStage('WAREHOUSE_SCAN');
        setWarehouseAction('PACKED');
      } else if (newStatus === 'PACKED') {
        setRecommendedStage('WAREHOUSE_SCAN');
        setSelectedStage('WAREHOUSE_SCAN');
        setWarehouseAction('DISPATCHED');
      } else if (['DISPATCHED', 'IN_TRANSIT', 'ARRIVED_AT_HUB', 'DEPARTED_FROM_HUB'].includes(newStatus)) {
        setRecommendedStage('HUB_SCAN');
        setSelectedStage('HUB_SCAN');
      } else if (newStatus === 'OUT_FOR_DELIVERY') {
        setRecommendedStage('DELIVERY');
        setSelectedStage('DELIVERY');
        setRecipientName(res.order?.customer?.fullName || '');
      }

      if (onOrderUpdated) {
        onOrderUpdated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record tracking journey milestone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentOrderStatus = matchedOrder
    ? (matchedOrder.orderStatus || matchedOrder.status || 'ORDER_PLACED').toUpperCase()
    : null;

  const isDelivered = currentOrderStatus === 'DELIVERED';
  const isCancelled = currentOrderStatus === 'CANCELLED';

  const stagesList: {
    id: JourneyStage;
    number: string;
    title: string;
    role: string;
    description: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      id: 'ADMIN_SCAN',
      number: '1',
      title: 'Admin Verification Scan',
      role: 'ADMIN',
      description: 'Verifies single QR. Auto-confirms ORDER_PLACED → CONFIRMED.',
      icon: ShieldCheck
    },
    {
      id: 'WAREHOUSE_SCAN',
      number: '2',
      title: 'Warehouse Packaging / Dispatch',
      role: 'WAREHOUSE STAFF',
      description: 'Marks PACKED, DISPATCHED, or IN_TRANSIT with staff ID.',
      icon: PackageCheck
    },
    {
      id: 'HUB_SCAN',
      number: '3',
      title: 'Logistics Hub Scan',
      role: 'HUB OPERATOR',
      description: 'Same QR/barcode. Records arrival/departure at transit hub.',
      icon: Building2
    },
    {
      id: 'NEXT_HUB_SCAN',
      number: '4',
      title: 'Next Transit Hub Scan',
      role: 'HUB OPERATOR',
      description: 'Scan same QR. Appends milestone without overwriting history.',
      icon: RefreshCw
    },
    {
      id: 'OUT_FOR_DELIVERY',
      number: '5',
      title: 'Out For Delivery Scan',
      role: 'DELIVERY BOY / STAFF',
      description: 'Scans same QR when departing for doorstep delivery.',
      icon: Truck
    },
    {
      id: 'DELIVERY',
      number: '6',
      title: 'Doorstep Delivery Confirmation',
      role: 'AUTHORIZED DELIVERY',
      description: 'Requires recipient name & note. Status → DELIVERED. COD → PAID.',
      icon: CheckCircle
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl p-5 sm:p-7 shadow-2xl border border-neutral-200 my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-amber-400 flex items-center justify-center shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-neutral-900 font-serif">
                  Single QR & Barcode Parcel Journey Scanner
                </h3>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  ONE SECURE ID
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                The exact same QR and barcode is scanned throughout the entire delivery lifecycle across all transit checkpoints.
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

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto space-y-5 pt-4 pr-1">
          {/* Quick Scan Input Form */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <form onSubmit={handleManualSubmit} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Scan Barcode / QR URL or enter Order ID (e.g. FP-2026-10001 / DEL-10001)..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !scanInput.trim()}
                  className="px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Lookup Parcel</span>
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
                <span>{isCameraActive ? 'Close Camera' : 'Scan via Camera'}</span>
              </button>
            </div>

            {/* Camera Viewport (when active) */}
            {isCameraActive && (
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-16/9 flex items-center justify-center border-2 border-dashed border-neutral-600">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-amber-400 rounded-2xl relative shadow-2xl animate-pulse">
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold bg-black/90 text-amber-400 px-2.5 py-0.5 rounded-full">
                      Point camera at Parcel QR / Barcode
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sample Orders for 1-Click Testing */}
            {!matchedOrder && sampleOrders.length > 0 && (
              <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Quick Test Existing Orders in Database:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleOrders.slice(0, 6).map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => {
                        setScanInput(order.id);
                        handleLookup(order.id);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 hover:border-black rounded-lg text-[11px] font-mono font-semibold text-neutral-800 transition-all flex items-center gap-1.5"
                    >
                      <span>{order.id}</span>
                      <span className="text-[9px] px-1 py-0.2 bg-neutral-200 text-neutral-700 rounded uppercase">
                        {order.status}
                      </span>
                    </button>
                  ))}
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

          {/* Scanned Order Details & Journey Dashboard */}
          {matchedOrder && (
            <div className="space-y-5">
              {/* Parcel Overview Card */}
              <div className="bg-neutral-900 text-white rounded-2xl p-4 sm:p-5 border border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-800 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-base text-amber-400">{matchedOrder.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">
                      AWB / Tracking: <strong>{matchedOrder.trackingNumber || matchedOrder.awbNumber || `DEL-${matchedOrder.id}`}</strong>
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      currentOrderStatus === 'DELIVERED'
                        ? 'bg-emerald-500 text-black'
                        : currentOrderStatus === 'CANCELLED'
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-400 text-black'
                    }`}>
                      Current Status: {currentOrderStatus}
                    </span>
                  </div>

                  <span className="text-[11px] text-neutral-400 font-mono truncate max-w-xs">
                    Token: {matchedOrder.trackingToken || 'Permanent Secure Token'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Recipient</span>
                    <span className="font-bold text-white block mt-0.5 truncate">
                      {matchedOrder.customer?.fullName || matchedOrder.shippingName}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      +91 {matchedOrder.customer?.mobileNumber || matchedOrder.shippingPhone}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Destination</span>
                    <span className="font-bold text-white block mt-0.5 truncate">
                      {matchedOrder.shippingAddress?.district || matchedOrder.shippingAddress?.city}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      PIN: {matchedOrder.shippingAddress?.pinCode || matchedOrder.shippingPincode}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Payment Mode</span>
                    <span className="font-bold text-white block mt-0.5">
                      {matchedOrder.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid Online'}
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono">
                      Status: {matchedOrder.paymentStatus || 'PENDING'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Order Total</span>
                    <span className="font-mono font-black text-amber-400 text-sm block mt-0.5">
                      ₹{(matchedOrder.totalAmount ?? matchedOrder.pricing?.grandTotal ?? 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {matchedOrder.items?.length || 0} Garment(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkpoint / Journey Stage Selector & Action Panel */}
              <div className="bg-white rounded-2xl border-2 border-neutral-200 p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-neutral-800" />
                      <span>Execute Delivery Journey Checkpoint Scan</span>
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Select checkpoint stage or use recommended next transition
                    </p>
                  </div>

                  {recommendedStage && !isDelivered && !isCancelled && (
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-xl">
                      <span className="text-[10px] font-bold text-amber-900 uppercase">Recommended Next:</span>
                      <span className="text-[10px] font-black text-black uppercase font-mono">
                        {recommendedStage.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Journey Stages Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {stagesList.map((stage) => {
                    const Icon = stage.icon;
                    const isSelected = selectedStage === stage.id;
                    const isRecommended = recommendedStage === stage.id && !isDelivered && !isCancelled;

                    return (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => setSelectedStage(stage.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm'
                            : isRecommended
                            ? 'bg-amber-50/60 border-amber-400 text-neutral-900 hover:border-amber-500'
                            : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border-neutral-200'
                        }`}
                      >
                        {isRecommended && (
                          <span className="absolute -top-2 right-2 bg-amber-400 text-black text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full shadow-xs">
                            NEXT STEP
                          </span>
                        )}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-amber-400 text-black' : 'bg-neutral-200 text-neutral-700'
                            }`}>
                              {stage.number}
                            </span>
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-neutral-500'}`} />
                          </div>
                          <p className="font-bold text-xs leading-snug">{stage.title}</p>
                          <p className={`text-[10px] mt-0.5 line-clamp-2 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                            {stage.description}
                          </p>
                        </div>
                        <span className={`text-[9px] font-mono mt-2 uppercase font-bold block ${
                          isSelected ? 'text-amber-300' : 'text-neutral-400'
                        }`}>
                          Role: {stage.role}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Stage Execution Parameters */}
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>Configuring: {selectedStage.replace(/_/g, ' ')}</span>
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">
                      Parcel #{matchedOrder.id}
                    </span>
                  </div>

                  {/* ADMIN SCAN CONFIG */}
                  {selectedStage === 'ADMIN_SCAN' && (
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Admin Order Verification:</strong>
                          Scans parcel QR code on fulfillment table. Verifies garment contents and automatically transitions order status from <strong>ORDER_PLACED → CONFIRMED</strong>. Logs Admin ID and timestamp.
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                          Admin Fulfilment Hub Location
                        </label>
                        <input
                          type="text"
                          value={checkpointLocation}
                          onChange={(e) => setCheckpointLocation(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  {/* WAREHOUSE SCAN CONFIG */}
                  {selectedStage === 'WAREHOUSE_SCAN' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Warehouse Staff Scan:</strong>
                          Authenticates warehouse personnel. Transitions status to <strong>PACKED</strong> (sealed with security tape) or <strong>DISPATCHED</strong> (handed over to courier).
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                            Warehouse Action Status *
                          </label>
                          <select
                            value={warehouseAction}
                            onChange={(e) => setWarehouseAction(e.target.value as any)}
                            className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                          >
                            <option value="PACKED">PACKED (Parcel inspected & sealed in warehouse)</option>
                            <option value="DISPATCHED">DISPATCHED (Handed to transit carrier)</option>
                            <option value="IN_TRANSIT">IN_TRANSIT (Line-haul carrier dispatch)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                            Warehouse Location
                          </label>
                          <input
                            type="text"
                            value={checkpointLocation}
                            onChange={(e) => setCheckpointLocation(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HUB & NEXT HUB SCAN CONFIG */}
                  {(selectedStage === 'HUB_SCAN' || selectedStage === 'NEXT_HUB_SCAN') && (
                    <div className="space-y-3 text-xs">
                      <div className="p-2.5 bg-purple-50 border border-purple-200 text-purple-900 rounded-lg flex items-start gap-2">
                        <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Transit Hub Scan (Same QR/Barcode):</strong>
                          Records Arrival or Departure at any sorting hub. Automatically appends new hub location, status, staff ID, and timestamp without ever overwriting previous history!
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                            Hub Action Type
                          </label>
                          <select
                            value={hubAction}
                            onChange={(e) => setHubAction(e.target.value as any)}
                            className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                          >
                            <option value="ARRIVED_AT_HUB">ARRIVED AT HUB (Sorting Checkpoint)</option>
                            <option value="DEPARTED_FROM_HUB">DEPARTED FROM HUB (Forwarding onward)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                            Logistics Hub Name / City *
                          </label>
                          <input
                            type="text"
                            value={hubName}
                            onChange={(e) => setHubName(e.target.value)}
                            placeholder="e.g. Bhopal Sorting Hub, Gwalior Regional Hub..."
                            className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OUT FOR DELIVERY SCAN CONFIG */}
                  {selectedStage === 'OUT_FOR_DELIVERY' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Out for Delivery Scan:</strong>
                          Delivery boy / agent scans same QR code before departing for customer doorstep. Changes status to <strong>OUT_FOR_DELIVERY</strong>.
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                          Local Delivery Center / Destination Hub
                        </label>
                        <input
                          type="text"
                          value={checkpointLocation}
                          onChange={(e) => setCheckpointLocation(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  {/* DELIVERY CONFIRMATION CONFIG */}
                  {selectedStage === 'DELIVERY' && (
                    <div className="space-y-3 text-xs">
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Doorstep Delivery Confirmation:</strong>
                          Delivery staff scans same QR. <strong>Requires recipient confirmation</strong>. Changes status to <strong>DELIVERED</strong>. If order is COD, updates payment status to <strong>PAID</strong>.
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                            Recipient Name (Who received the package?) *
                          </label>
                          <input
                            type="text"
                            required
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="e.g. Meraj Alam (Self) / Brother / Security Guard"
                            className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                            Verification OTP / Signature Code (Optional)
                          </label>
                          <input
                            type="text"
                            value={confirmationCode}
                            onChange={(e) => setConfirmationCode(e.target.value)}
                            placeholder="e.g. OTP 492015 or Verified ID"
                            className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                          Actual Delivery Location (Doorstep Address)
                        </label>
                        <input
                          type="text"
                          value={checkpointLocation}
                          onChange={(e) => setCheckpointLocation(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  {/* Optional Custom Notes */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-neutral-600 mb-1">
                      Audit Notes / Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Optional custom audit notes..."
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-xl focus:border-black focus:outline-hidden"
                    />
                  </div>

                  {/* Action Execution Button */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Permanent append-only record in PostgreSQL database</span>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting || isDelivered || isCancelled}
                      onClick={() => handleProcessJourneyScan(selectedStage)}
                      className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileCheck2 className="w-4 h-4 text-amber-400" />
                      )}
                      <span>
                        Confirm & Record {selectedStage.replace(/_/g, ' ')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Immutable Tracking Journey Timeline Visualizer */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neutral-700" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 font-serif">
                      Single QR Journey History ({trackingEvents.length} Verified Checkpoints)
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full border border-neutral-200">
                    🔒 Append-Only History (Never Overwritten)
                  </span>
                </div>

                {trackingEvents.length === 0 ? (
                  <div className="py-6 text-center text-xs text-neutral-400">
                    No journey milestones recorded yet. Perform the Admin Verification Scan to activate.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                    {trackingEvents.map((evt, idx) => (
                      <div key={evt.id || idx} className="relative group">
                        <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white ${
                          evt.status === 'DELIVERED'
                            ? 'border-emerald-500 text-emerald-600'
                            : evt.status === 'CONFIRMED'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-black text-black'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            evt.status === 'DELIVERED'
                              ? 'bg-emerald-500'
                              : evt.status === 'CONFIRMED'
                              ? 'bg-blue-500'
                              : 'bg-black'
                          }`} />
                        </div>

                        <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-900">{evt.status}</span>
                              {evt.stage && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-neutral-200 text-neutral-700">
                                  {evt.stage}
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-neutral-500">
                                by {evt.scannedBy || 'STAFF'}
                              </span>
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {evt.createdAt ? new Date(evt.createdAt).toLocaleString('en-IN') : 'Just now'}
                            </span>
                          </div>

                          <p className="text-neutral-700 text-[11px] mt-1">{evt.description}</p>

                          <div className="flex items-center gap-4 mt-1.5 text-[10px] text-neutral-500 flex-wrap font-mono">
                            {evt.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-neutral-400" />
                                {evt.location}
                              </span>
                            )}
                            {evt.hubName && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3 text-neutral-400" />
                                Hub: {evt.hubName}
                              </span>
                            )}
                            {evt.recipientName && (
                              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                Recipient: {evt.recipientName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty Awaiting State */}
          {!matchedOrder && (
            <div className="text-center py-10 border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50 space-y-2">
              <QrCode className="w-12 h-12 text-neutral-300 mx-auto" />
              <h4 className="text-sm font-bold text-neutral-700">Scan or Enter Parcel Tracking ID</h4>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Scan the single QR code or barcode printed on the thermal shipping label, or pick a sample order above to test the entire journey flow.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

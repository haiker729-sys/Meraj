import { db } from '../db';

export type JourneyStage =
  | 'ADMIN_SCAN'
  | 'WAREHOUSE_SCAN'
  | 'HUB_SCAN'
  | 'NEXT_HUB_SCAN'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERY';

export interface JourneyScanUser {
  id: string;
  username?: string;
  fullName: string;
  role: string;
}

export interface ParcelJourneyScanPayload {
  scanInput: string;
  stage: JourneyStage;
  user: JourneyScanUser;
  location?: string;
  hubName?: string;
  targetStatus?: string;
  notes?: string;
  recipientName?: string;
  confirmationCode?: string;
}

export class ParcelJourneyService {
  /**
   * Parse single QR code URL or barcode string to resolve identifier
   */
  public parseScanInput(rawInput: string): string {
    if (!rawInput) return '';
    let cleaned = rawInput.trim();

    // If a full URL is scanned from the QR code (e.g. https://.../order-tracking?orderId=FP-10001&token=tk_...&scan=true)
    if (cleaned.includes('orderId=') || cleaned.includes('token=')) {
      try {
        const url = new URL(cleaned.startsWith('http') ? cleaned : `http://localhost${cleaned.startsWith('/') ? '' : '/'}${cleaned}`);
        const token = url.searchParams.get('token');
        const orderId = url.searchParams.get('orderId') || url.searchParams.get('id');
        if (token) return token.trim();
        if (orderId) return orderId.trim();
      } catch {
        const matchToken = cleaned.match(/[?&]token=([^&#]+)/);
        if (matchToken && matchToken[1]) return decodeURIComponent(matchToken[1]).trim();
        const matchId = cleaned.match(/[?&]orderId=([^&#]+)/);
        if (matchId && matchId[1]) return decodeURIComponent(matchId[1]).trim();
      }
    }

    return cleaned;
  }

  /**
   * Find order by Order ID, Token, or Tracking AWB
   */
  public async findOrder(scanInput: string) {
    const identifier = this.parseScanInput(scanInput);
    if (!identifier) return null;

    // First try tracking token / tracking number / order ID lookup
    let order = await db.getOrderByTrackingToken(identifier);
    if (!order) {
      order = await db.getOrderById(identifier);
    }
    return order;
  }

  /**
   * Execute verified parcel journey stage scan with state transition enforcement
   */
  public async processJourneyScan(payload: ParcelJourneyScanPayload) {
    const { scanInput, stage, user, location, hubName, targetStatus, notes, recipientName, confirmationCode } = payload;

    if (!scanInput || !scanInput.trim()) {
      throw new Error('Barcode or QR Code scan payload is required.');
    }

    const order = await this.findOrder(scanInput);
    if (!order) {
      throw new Error(`Invalid QR code / Barcode. No matching parcel found for "${scanInput.trim()}".`);
    }

    const currentStatus = (order.orderStatus || order.status || 'ORDER_PLACED').toUpperCase();

    // 1. Guard against terminal states
    if (currentStatus === 'DELIVERED') {
      throw new Error(`Invalid transition: Parcel #${order.id} is already DELIVERED. The delivery journey is complete and cannot be altered.`);
    }

    if (currentStatus === 'CANCELLED') {
      throw new Error(`Invalid transition: Order #${order.id} has been CANCELLED. No further logistics milestones can be recorded.`);
    }

    let nextStatus = currentStatus;
    let description = '';
    let eventLocation = location?.trim() || '';
    let source: 'ADMIN' | 'COURIER' | 'WAREHOUSE' | 'HUB' | 'DELIVERY' | 'SYSTEM' = 'STAFF' as any;

    const staffSignature = user.fullName
      ? `${user.fullName} (${user.username || user.id})`
      : user.username || user.id || 'AUTHORIZED_STAFF';

    // 2. Validate and execute transitions based on Journey Stage
    switch (stage) {
      case 'ADMIN_SCAN': {
        // ADMIN SCAN:
        // -> Verify order and QR
        // -> Automatically change ORDER_PLACED to CONFIRMED
        // -> Save tracking event with admin ID, location, date and time.
        if (!['ORDER_PLACED', 'NEW', 'PAYMENT_PENDING', 'PAYMENT_CONFIRMED'].includes(currentStatus)) {
          throw new Error(
            `Order #${order.id} has already been verified & confirmed (Current Status: "${currentStatus}"). Please proceed with Warehouse packaging scan.`
          );
        }

        nextStatus = 'CONFIRMED';
        source = 'ADMIN';
        eventLocation = eventLocation || 'Fashion Point Central Fulfilment Hub, Indore';
        description = notes?.trim() ||
          `Order verified and approved by Admin ${staffSignature}. Single permanent QR/barcode activated for fulfillment.`;
        break;
      }

      case 'WAREHOUSE_SCAN': {
        // WAREHOUSE / DELIVERY BOY SCAN:
        // -> Verify authenticated staff
        // -> Change to PACKED / DISPATCHED / IN_TRANSIT as appropriate
        // -> Save staff ID, location, date and time.
        if (currentStatus === 'ORDER_PLACED' || currentStatus === 'NEW') {
          throw new Error(
            `Invalid Transition: Order #${order.id} must first be verified & confirmed by Admin scan before warehouse packaging.`
          );
        }

        if (['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'ARRIVED_AT_HUB'].includes(currentStatus)) {
          throw new Error(
            `Parcel #${order.id} has already departed warehouse (Current Status: "${currentStatus}"). Use Hub Scan or Out for Delivery.`
          );
        }

        source = 'WAREHOUSE';
        eventLocation = eventLocation || 'Fashion Point Central Warehouse & Dispatch Facility, Indore';

        const requestedTarget = targetStatus?.toUpperCase() || (currentStatus === 'CONFIRMED' ? 'PACKED' : 'DISPATCHED');
        if (!['PACKED', 'DISPATCHED', 'IN_TRANSIT'].includes(requestedTarget)) {
          throw new Error(`Invalid warehouse status target: "${requestedTarget}". Must be PACKED, DISPATCHED, or IN_TRANSIT.`);
        }

        nextStatus = requestedTarget;
        if (nextStatus === 'PACKED') {
          description = notes?.trim() ||
            `Parcel inspected, packed, and sealed in tamper-evident security bag by staff ${staffSignature}. Ready for dispatch.`;
        } else {
          description = notes?.trim() ||
            `Parcel dispatched from warehouse and transferred to line-haul transit partner by staff ${staffSignature}.`;
        }
        break;
      }

      case 'HUB_SCAN':
      case 'NEXT_HUB_SCAN': {
        // HUB SCAN & NEXT HUB:
        // -> Same QR/barcode
        // -> Record arrival/departure
        // -> Automatically add the new hub/location, status, staff ID, date and time to tracking history.
        // -> Never overwrite previous tracking history.
        if (['ORDER_PLACED', 'NEW', 'CONFIRMED'].includes(currentStatus)) {
          throw new Error(
            `Invalid Transition: Parcel #${order.id} has not yet been packed or dispatched from warehouse. Current status: "${currentStatus}".`
          );
        }

        source = 'HUB';
        const specificHub = hubName?.trim() || eventLocation || 'Regional Logistics Hub';
        eventLocation = specificHub;

        // Default or chosen sub-status (e.g. IN_TRANSIT, ARRIVED_AT_HUB, DEPARTED_FROM_HUB)
        const subStatus = targetStatus?.toUpperCase() || 'IN_TRANSIT';
        nextStatus = subStatus;

        if (subStatus === 'DEPARTED_FROM_HUB') {
          description = notes?.trim() ||
            `Parcel departed from transit hub [${specificHub}] toward next destination. Scanned by ${staffSignature}.`;
        } else {
          description = notes?.trim() ||
            `Parcel arrived at logistics hub [${specificHub}]. Scanned and sorted for route transit by ${staffSignature}.`;
        }
        break;
      }

      case 'OUT_FOR_DELIVERY': {
        // OUT FOR DELIVERY:
        // -> Delivery staff scans same QR
        // -> Status becomes OUT_FOR_DELIVERY.
        // -> Save delivery agent ID, location, date and time.
        if (['ORDER_PLACED', 'NEW', 'CONFIRMED'].includes(currentStatus)) {
          throw new Error(
            `Invalid Transition: Parcel #${order.id} cannot be marked Out for Delivery before warehouse dispatch. Current status: "${currentStatus}".`
          );
        }

        source = 'DELIVERY';
        nextStatus = 'OUT_FOR_DELIVERY';
        const destArea = order.shippingAddress?.district || order.shippingAddress?.city || 'Destination';
        eventLocation = eventLocation || `${destArea} Local Delivery Hub`;
        description = notes?.trim() ||
          `Parcel is out for delivery with executive ${staffSignature}. Expect delivery today at doorstep.`;
        break;
      }

      case 'DELIVERY': {
        // DELIVERY:
        // -> Authorized delivery staff scans same QR
        // -> Require delivery confirmation (recipient name / OTP / note)
        // -> Status becomes DELIVERED
        // -> Save delivery location, staff ID, date and time.
        if (currentStatus !== 'OUT_FOR_DELIVERY') {
          throw new Error(
            `Invalid Transition: Parcel #${order.id} must be in "OUT_FOR_DELIVERY" status before final delivery confirmation. Current status: "${currentStatus}".`
          );
        }

        if (!recipientName || !recipientName.trim()) {
          throw new Error(
            'Delivery confirmation requires recipient name (e.g. Customer Name, Self, or Family Member).'
          );
        }

        source = 'DELIVERY';
        nextStatus = 'DELIVERED';
        const doorstep = [order.shippingAddress?.villageArea, order.shippingAddress?.city].filter(Boolean).join(', ');
        eventLocation = eventLocation || doorstep || 'Customer Delivery Address';

        const confirmDetails = [
          `Delivered to ${recipientName.trim()}`,
          notes?.trim() ? `Note: ${notes.trim()}` : null,
          confirmationCode?.trim() ? `Verification/OTP: ${confirmationCode.trim()}` : null
        ].filter(Boolean).join('. ');

        description = `Parcel successfully delivered. ${confirmDetails}. Verified by delivery executive ${staffSignature}.`;
        break;
      }

      default:
        throw new Error(`Unknown journey stage: "${stage}".`);
    }

    // Record verified audit scan event
    await db.recordQrScan({
      orderId: order.id,
      trackingNumber: order.trackingNumber || order.id,
      scannedBy: staffSignature,
      scannerType: user.role === 'DELIVERY_BOY' ? 'COURIER' : user.role === 'WAREHOUSE_STAFF' ? 'STAFF' : 'ADMIN',
      location: eventLocation
    });

    // Record immutable tracking event & update order state
    const result = await db.addOrderTrackingEvent({
      orderId: order.id,
      status: nextStatus,
      stage,
      location: eventLocation,
      hubName: hubName?.trim() || undefined,
      description,
      source,
      scannedBy: staffSignature,
      recipientName: recipientName?.trim() || undefined,
      confirmationNote: confirmationCode?.trim() || notes?.trim() || undefined,
      courierName: order.courierName,
      awbNumber: order.trackingNumber || order.awbNumber
    });

    return {
      success: true,
      message: `Journey milestone recorded: ${nextStatus} (${stage})`,
      order: result?.order,
      event: result?.event
    };
  }
}

export const parcelJourneyService = new ParcelJourneyService();

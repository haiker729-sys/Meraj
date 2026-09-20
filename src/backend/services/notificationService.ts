import { Order, OrderStatus } from '../../types';

export interface NotificationPayload {
  recipientMobile: string;
  recipientEmail?: string;
  customerName: string;
  orderId: string;
  status: OrderStatus;
  orderTotal: number;
  trackingUrl: string;
}

export interface NotificationLog {
  id: string;
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL';
  recipient: string;
  title: string;
  message: string;
  timestamp: string;
  status: 'SENT' | 'FAILED' | 'UNCONFIGURED';
}

class NotificationService {
  private logs: NotificationLog[] = [];

  public async sendOrderNotification(
    order: Order,
    channels: ('WHATSAPP' | 'SMS' | 'EMAIL')[] = ['WHATSAPP', 'SMS']
  ): Promise<NotificationLog[]> {
    const trackingUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/order-tracking?id=${order.id}&mobile=${order.customer.mobileNumber}`
      : `https://fashionpoint.store/order-tracking/${order.id}`;

    const newLogs: NotificationLog[] = [];

    for (const channel of channels) {
      let title = '';
      let message = '';

      switch (order.orderStatus) {
        case 'NEW':
          title = `Fashion Point: Order ${order.id} Placed!`;
          message = `Hi ${order.customer.fullName}, thank you for choosing Fashion Point! Your order ${order.id} for ₹${order.pricing?.grandTotal || order.totalAmount} is confirmed. Track live here: ${trackingUrl}`;
          break;
        case 'CONFIRMED':
          title = `Fashion Point: Order ${order.id} Accepted`;
          message = `Hi ${order.customer.fullName}, your items are verified and packed by our store. Track: ${trackingUrl}`;
          break;
        case 'PACKED':
          title = `Fashion Point: Order ${order.id} Ready to Ship`;
          message = `Hi ${order.customer.fullName}, your parcel is packaged with quality check. Shipping soon!`;
          break;
        case 'SHIPPED':
          title = `Fashion Point: Order ${order.id} Dispatched!`;
          message = `Great news! Your package is shipped via ${order.courierName || 'Courier Partner'}. Track: ${trackingUrl}`;
          break;
        case 'OUT_FOR_DELIVERY':
          title = `Fashion Point: Order ${order.id} Out for Delivery`;
          message = `Hi ${order.customer.fullName}, your delivery executive is out for delivery today. Keep cash ready if COD: ₹${order.pricing?.grandTotal || order.totalAmount}.`;
          break;
        case 'DELIVERED':
          title = `Fashion Point: Order ${order.id} Delivered!`;
          message = `Your parcel has been delivered! We hope you love your new clothes. Thank you for shopping with Fashion Point!`;
          break;
        case 'CANCELLED':
          title = `Fashion Point: Order ${order.id} Cancelled`;
          message = `Your order ${order.id} has been cancelled.`;
          break;
        default:
          title = `Fashion Point: Order Update`;
          message = `Your order status is now: ${order.orderStatus}`;
      }

      // Check if real provider is configured
      // If not configured, we explicitly report 'UNCONFIGURED' with 'Notification provider not configured'
      const logEntry: NotificationLog = {
        id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        channel,
        recipient: channel === 'EMAIL' ? (order.customer.email || 'N/A') : order.customer.mobileNumber,
        title,
        message: 'Notification provider not configured. Set provider API keys in environment variables to enable live delivery.',
        timestamp: new Date().toISOString(),
        status: 'UNCONFIGURED'
      };

      newLogs.push(logEntry);
      this.logs.unshift(logEntry);
    }

    return newLogs;
  }

  public getLogs(): NotificationLog[] {
    return [...this.logs];
  }
}

export const notificationService = new NotificationService();

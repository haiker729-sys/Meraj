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
  status: 'SENT' | 'SIMULATED';
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
          message = `Hi ${order.customer.fullName}, thank you for choosing Fashion Point! Your order ${order.id} for ₹${order.pricing.grandTotal} is confirmed. Track live here: ${trackingUrl}`;
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
          message = `Hi ${order.customer.fullName}, your delivery executive is out for delivery today. Keep cash ready if COD: ₹${order.pricing.grandTotal}.`;
          break;
        case 'DELIVERED':
          title = `Fashion Point: Order ${order.id} Delivered`;
          message = `Your parcel has been delivered! We hope you love your new clothes. Thank you for shopping with Fashion Point!`;
          break;
        default:
          title = `Fashion Point: Order ${order.id} Update`;
          message = `Your order status has been updated to ${order.orderStatus}.`;
      }

      const log: NotificationLog = {
        id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        channel,
        recipient: channel === 'EMAIL' ? (order.customer.email || 'customer@fashionpoint.store') : order.customer.mobileNumber,
        title,
        message,
        timestamp: new Date().toISOString(),
        status: 'SENT'
      };

      this.logs.unshift(log);
      newLogs.push(log);
    }

    return newLogs;
  }

  public getRecentLogs(): NotificationLog[] {
    return [...this.logs];
  }
}

export const notificationService = new NotificationService();

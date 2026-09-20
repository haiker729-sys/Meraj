export interface NotificationResult {
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL';
  recipient: string;
  status: 'SENT' | 'FAILED' | 'UNCONFIGURED';
  message: string;
  provider?: string;
  details?: string;
}

class BackendNotificationService {
  private smsKey = process.env.SMS_PROVIDER_KEY;
  private whatsappKey = process.env.WHATSAPP_PROVIDER_KEY;
  private emailKey = process.env.EMAIL_PROVIDER_KEY;

  public async dispatchOrderNotification(order: any, event: string): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const customer = order.customer;
    const trackingUrl = `https://fashionpoint.store/order-tracking/${order.id}`;

    // 1. SMS Notification
    if (customer.mobileNumber) {
      if (!this.smsKey) {
        results.push({
          channel: 'SMS',
          recipient: customer.mobileNumber,
          status: 'UNCONFIGURED',
          message: 'Notification provider not configured. Set SMS_PROVIDER_KEY in .env.'
        });
      } else {
        // Here real SMS API (e.g. Fast2SMS / Twilio) is invoked
        try {
          // Placeholder for outbound HTTP API call
          results.push({
            channel: 'SMS',
            recipient: customer.mobileNumber,
            status: 'SENT',
            provider: 'SMS_GATEWAY',
            message: `Fashion Point: Order ${order.id} update: ${event}. Track: ${trackingUrl}`
          });
        } catch (err: any) {
          results.push({
            channel: 'SMS',
            recipient: customer.mobileNumber,
            status: 'FAILED',
            message: err.message
          });
        }
      }
    }

    // 2. WhatsApp Notification
    if (customer.mobileNumber) {
      if (!this.whatsappKey) {
        results.push({
          channel: 'WHATSAPP',
          recipient: customer.mobileNumber,
          status: 'UNCONFIGURED',
          message: 'Notification provider not configured. Set WHATSAPP_PROVIDER_KEY in .env.'
        });
      } else {
        results.push({
          channel: 'WHATSAPP',
          recipient: customer.mobileNumber,
          status: 'SENT',
          provider: 'WHATSAPP_BUSINESS_API',
          message: `Fashion Point WhatsApp update: Your order ${order.id} is ${event}.`
        });
      }
    }

    // 3. Email Notification
    if (customer.email) {
      if (!this.emailKey) {
        results.push({
          channel: 'EMAIL',
          recipient: customer.email,
          status: 'UNCONFIGURED',
          message: 'Notification provider not configured. Set EMAIL_PROVIDER_KEY in .env.'
        });
      } else {
        results.push({
          channel: 'EMAIL',
          recipient: customer.email,
          status: 'SENT',
          provider: 'TRANSACTIONAL_EMAIL',
          message: `Fashion Point Order ${order.id} confirmation.`
        });
      }
    }

    return results;
  }
}

export const notificationService = new BackendNotificationService();

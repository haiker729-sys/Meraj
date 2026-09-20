/**
 * Server-Side API Keys and Credentials Manager
 */

export interface ApiKeysConfig {
  database: {
    url: string;
  };
  security: {
    jwtSecret: string;
    settingsEncryptionKey: string;
  };
  razorpay: {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
  };
  sms: {
    provider: string;
    apiKey: string;
    senderId: string;
    templateId: string;
  };
  whatsapp: {
    provider: string;
    accessToken: string;
    phoneNumberId: string;
    businessAccountId: string;
  };
  email: {
    provider: string;
    apiKey: string;
    from: string;
    smtpHost: string;
    smtpPort: string;
    smtpUsername: string;
    smtpPassword: string;
  };
  storage: {
    provider: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region: string;
  };
  maps: {
    googleMapsApiKey: string;
  };
  ai: {
    geminiApiKey: string;
  };
  courier: {
    provider: string;
    apiKey: string;
    username: string;
    password: string;
    clientId: string;
    clientSecret: string;
  };
}

export const API_KEYS: ApiKeysConfig = {
  database: {
    url: process.env.DATABASE_URL || '',
  },
  security: {
    jwtSecret: process.env.JWT_SECRET || 'fp_dev_jwt_secret_fallback',
    settingsEncryptionKey: process.env.SETTINGS_ENCRYPTION_KEY || '',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  sms: {
    provider: process.env.SMS_PROVIDER || '',
    apiKey: process.env.SMS_API_KEY || '',
    senderId: process.env.SMS_SENDER_ID || '',
    templateId: process.env.SMS_TEMPLATE_ID || '',
  },
  whatsapp: {
    provider: process.env.WHATSAPP_PROVIDER || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  },
  email: {
    provider: process.env.EMAIL_PROVIDER || '',
    apiKey: process.env.EMAIL_API_KEY || '',
    from: process.env.EMAIL_FROM || '',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || '',
    smtpUsername: process.env.SMTP_USERNAME || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || '',
    accessKey: process.env.STORAGE_ACCESS_KEY || '',
    secretKey: process.env.STORAGE_SECRET_KEY || '',
    bucket: process.env.STORAGE_BUCKET || '',
    region: process.env.STORAGE_REGION || '',
  },
  maps: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  },
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
  },
  courier: {
    provider: process.env.COURIER_PROVIDER || '',
    apiKey: process.env.COURIER_API_KEY || '',
    username: process.env.COURIER_USERNAME || '',
    password: process.env.COURIER_PASSWORD || '',
    clientId: process.env.COURIER_CLIENT_ID || '',
    clientSecret: process.env.COURIER_CLIENT_SECRET || '',
  },
};

export function getServiceStatusSummary(): Record<string, string> {
  return {
    razorpay: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Not configured',
    sms: process.env.SMS_API_KEY ? 'Configured' : 'Not configured',
    whatsapp: process.env.WHATSAPP_ACCESS_TOKEN ? 'Configured' : 'Not configured',
    email: (process.env.EMAIL_API_KEY || process.env.SMTP_HOST) ? 'Configured' : 'Not configured',
    googleMaps: process.env.GOOGLE_MAPS_API_KEY ? 'Configured' : 'Not configured',
    courier: (process.env.COURIER_API_KEY || process.env.COURIER_USERNAME) ? 'Configured' : 'Not configured',
    gemini: process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured',
    storage: (process.env.STORAGE_ACCESS_KEY || process.env.STORAGE_BUCKET) ? 'Configured' : 'Not configured'
  };
}

export default API_KEYS;

/**
 * Server-Side API Keys and Credentials Template (Example)
 *
 * NOTE: Do NOT put real secrets in this file.
 * Copy this file or configure your actual values via environment variables.
 *
 * This file is for reference and contains only empty placeholders.
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

export const API_KEYS_EXAMPLE: ApiKeysConfig = {
  database: {
    url: '',
  },
  security: {
    jwtSecret: '',
    settingsEncryptionKey: '',
  },
  razorpay: {
    keyId: '',
    keySecret: '',
    webhookSecret: '',
  },
  sms: {
    provider: '',
    apiKey: '',
    senderId: '',
    templateId: '',
  },
  whatsapp: {
    provider: '',
    accessToken: '',
    phoneNumberId: '',
    businessAccountId: '',
  },
  email: {
    provider: '',
    apiKey: '',
    from: '',
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
  },
  storage: {
    provider: '',
    accessKey: '',
    secretKey: '',
    bucket: '',
    region: '',
  },
  maps: {
    googleMapsApiKey: '',
  },
  ai: {
    geminiApiKey: '',
  },
  courier: {
    provider: '',
    apiKey: '',
    username: '',
    password: '',
    clientId: '',
    clientSecret: '',
  },
};

export default API_KEYS_EXAMPLE;

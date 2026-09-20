/**
 * Server-Side API Keys and Credentials Template (Example)
 *
 * NOTE: Do NOT put real secrets in this file.
 * Copy this file or configure your actual values via environment variables.
 *
 * This file is for reference and contains only empty placeholders.
 */

export interface ApiKeysConfig {
  geminiApiKey: string;
  database: {
    url: string;
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  auth: {
    jwtSecret: string;
    adminInitialPassword: string;
  };
  razorpay: {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
  };
}

export const API_KEYS_EXAMPLE: ApiKeysConfig = {
  geminiApiKey: '',
  database: {
    url: '',
    host: '',
    port: 5432,
    user: '',
    password: '',
    database: '',
  },
  auth: {
    jwtSecret: '',
    adminInitialPassword: '',
  },
  razorpay: {
    keyId: '',
    keySecret: '',
    webhookSecret: '',
  },
};

export default API_KEYS_EXAMPLE;

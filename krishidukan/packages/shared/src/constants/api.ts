export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

export const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PHONE_REGEX = /^\+91[6-9]\d{9}$/;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export const LICENSE_SIGNED_URL_EXPIRY_MS = 15 * 60 * 1000;
export const FIREBASE_STORAGE_LICENSES_PATH = 'krishidukan/licenses';

export const ERP_API_KEY_HEADER = 'x-erp-api-key';
export const ERP_API_KEY_BYTES = 32;

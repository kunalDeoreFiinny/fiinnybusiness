/** Validate an Indian phone number: +91XXXXXXXXXX or 10-digit */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 12 && digits.startsWith('91'));
}

/** Validate 6-digit Indian pincode */
export function isValidPincode(pin: string): boolean {
  return /^[1-9]\d{5}$/.test(pin.trim());
}

/** Validate 15-character GST number */
export function isValidGST(gst: string): boolean {
  if (!gst) return true; // optional
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst.trim().toUpperCase());
}

/** Check required string is non-empty */
export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

/** Validate lat/lng range */
export function isValidCoords(lat: string, lng: string): boolean {
  const la = parseFloat(lat);
  const lo = parseFloat(lng);
  return !isNaN(la) && !isNaN(lo) && la >= -90 && la <= 90 && lo >= -180 && lo <= 180;
}

/** Validate email loosely */
export function isValidEmail(email: string): boolean {
  if (!email) return true; // optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Generic field error checker */
export type FieldError = string | null;

export function validateRegistration(form: {
  ownerName: string;
  businessName: string;
  phone: string;
  addressLine: string;
  city: string;
  pincode: string;
  lat: string;
  lng: string;
}): Record<string, FieldError> {
  const errors: Record<string, FieldError> = {};
  if (!isRequired(form.ownerName)) errors.ownerName = 'Owner name is required';
  if (!isRequired(form.businessName)) errors.businessName = 'Shop name is required';
  if (!isValidPhone(form.phone)) errors.phone = 'Enter a valid phone number';
  if (!isRequired(form.addressLine)) errors.addressLine = 'Address is required';
  if (!isRequired(form.city)) errors.city = 'City is required';
  if (!isValidPincode(form.pincode)) errors.pincode = 'Enter a valid pincode';
  if (!isValidCoords(form.lat, form.lng)) errors.coords = 'Enter valid coordinates';
  return errors;
}

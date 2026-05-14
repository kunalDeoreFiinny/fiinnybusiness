import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
} from 'firebase/auth';
import { auth } from './config';

let recaptchaVerifier: RecaptchaVerifier | null = null;

/** Initialize reCAPTCHA on a container. Call once when the login page mounts. */
export function initRecaptcha(containerId: string): RecaptchaVerifier | null {
  if (!auth) return null;

  // If already initialized and container still exists, reuse it
  if (recaptchaVerifier) return recaptchaVerifier;

  const container = document.getElementById(containerId);
  if (!container) return null;

  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
  });

  return recaptchaVerifier;
}

/** Destroy reCAPTCHA verifier. Call when the login page unmounts. */
export function destroyRecaptcha() {
  if (recaptchaVerifier) {
    try { recaptchaVerifier.clear(); } catch { /* ignore */ }
    recaptchaVerifier = null;
  }
}

/** Send OTP to a phone number. */
export async function sendOtp(
  phone: string,
  recaptchaContainerId: string,
): Promise<ConfirmationResult> {
  if (!auth) throw new Error('Firebase Auth not initialized');

  // Normalize phone: remove spaces
  const normalizedPhone = phone.replace(/\s+/g, '');

  // Ensure reCAPTCHA is ready
  if (!recaptchaVerifier) {
    initRecaptcha(recaptchaContainerId);
  }
  if (!recaptchaVerifier) {
    throw new Error('reCAPTCHA failed to initialize');
  }

  try {
    return await signInWithPhoneNumber(auth, normalizedPhone, recaptchaVerifier);
  } catch (error) {
    // If reCAPTCHA expired or errored, reset and rethrow
    destroyRecaptcha();
    const container = document.getElementById(recaptchaContainerId);
    if (container) container.innerHTML = '';
    throw error;
  }
}

/** Verify OTP code against a pending ConfirmationResult. */
export async function verifyOtp(
  confirmationResult: ConfirmationResult,
  otp: string,
) {
  return confirmationResult.confirm(otp);
}

/** Sign out the current user. */
export async function logoutUser() {
  if (!auth) return;
  await signOut(auth);
}

import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  type UserCredential,
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { auth, app } from '../firebase/config';

export async function loginWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser(): Promise<void> {
  return signOut(auth);
}

/**
 * Creates a Firebase Auth account for a new retailer WITHOUT signing out the
 * current admin session.
 *
 * Strategy: a secondary Firebase app instance shares the same project config
 * but has its own isolated Auth state. After account creation we sign out of
 * the secondary instance — the admin's primary session is never touched.
 */
export async function createRetailerAuthAccount(
  email: string,
  password: string,
): Promise<string> {
  const SECONDARY_APP_NAME = 'retailer-creator';

  // Re-use existing secondary app on hot-reloads; create it once otherwise.
  const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME);
  const secondaryApp = existing ?? initializeApp(app.options, SECONDARY_APP_NAME);
  const secondaryAuth = getAuth(secondaryApp);

  const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const uid = credential.user.uid;

  // Sign out of the secondary instance — the admin session is unaffected.
  await signOut(secondaryAuth);

  return uid;
}

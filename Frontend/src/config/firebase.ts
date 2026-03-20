import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type UserCredential,
} from 'firebase/auth';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Messaging (only in browser with service worker support)
let messaging: Messaging | null = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.warn('Firebase Messaging not supported:', error);
  }
}
export { messaging };

// ============================================
// GOOGLE SIGN-IN
// ============================================

export const signInWithGoogle = async (): Promise<UserCredential> => {
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  });
  return signInWithPopup(auth, googleProvider);
};

/**
 * Get Firebase ID token for backend verification
 */
export const getFirebaseIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return null;
};

// ============================================
// PUSH NOTIFICATIONS
// ============================================

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Messaging not available');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      return token;
    }

    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = (
  callback: (payload: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => void
): (() => void) | undefined => {
  if (!messaging) {
    return undefined;
  }

  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};

/**
 * Sign out from Firebase
 */
export const signOutFirebase = async (): Promise<void> => {
  await auth.signOut();
};

export default app;

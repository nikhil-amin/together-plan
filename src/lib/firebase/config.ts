
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// import { getMessaging } from 'firebase/messaging'; // FCM, if used

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Map keys in firebaseConfig to their corresponding environment variable suffixes
const keyToEnvVarSuffix: Record<keyof typeof firebaseConfig, string> = {
  apiKey: 'API_KEY',
  authDomain: 'AUTH_DOMAIN',
  projectId: 'PROJECT_ID',
  storageBucket: 'STORAGE_BUCKET',
  messagingSenderId: 'MESSAGING_SENDER_ID',
  appId: 'APP_ID',
  measurementId: 'MEASUREMENT_ID',
};

// Check if all required Firebase config values are present
const requiredConfigValues: (keyof typeof firebaseConfig)[] = [
  'apiKey', 
  'authDomain', 
  'projectId',
  // storageBucket, messagingSenderId, appId, measurementId are often optional for basic auth/firestore
];

let firebaseAppInitialized = true;
for (const key of requiredConfigValues) {
  if (!firebaseConfig[key]) {
    const envVarSuffix = keyToEnvVarSuffix[key] || key.toUpperCase(); // Fallback to uppercase key if not in map
    const envVarName = `NEXT_PUBLIC_FIREBASE_${envVarSuffix}`;
    console.error(`Firebase config error: ${envVarName} is not defined. Please set it in your .env file.`);
    firebaseAppInitialized = false; 
    // It's better to throw an error or handle this state more gracefully in a real app,
    // but for now, logging will help the user. The app will likely crash or misbehave
    // if Firebase isn't initialized correctly.
  }
}

// Initialize Firebase
// Only initialize if all required vars are present.
const app = firebaseAppInitialized && !getApps().length ? initializeApp(firebaseConfig) : (getApps().length ? getApp() : null);

// Conditionally get services if app was initialized
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;
// const messaging = app ? getMessaging(app) : null; // FCM, if used

export { app, auth, db, storage };

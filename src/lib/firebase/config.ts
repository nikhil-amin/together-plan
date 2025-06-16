
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
];

let firebaseAppInitialized = true;
const missingEnvVars: string[] = [];

for (const key of requiredConfigValues) {
  if (!firebaseConfig[key]) {
    const envVarSuffix = keyToEnvVarSuffix[key as keyof typeof firebaseConfig] || String(key).toUpperCase();
    const envVarName = `NEXT_PUBLIC_FIREBASE_${envVarSuffix}`;
    missingEnvVars.push(envVarName);
  }
}

if (missingEnvVars.length > 0) {
  console.error(
    `Firebase config error: The following environment variables are not defined. Please set them in your .env file:\n` +
    missingEnvVars.map(varName => `- ${varName}`).join('\n') +
    `\n\nAfter updating .env, you may need to restart your Next.js development server for the changes to take effect.`
  );
  firebaseAppInitialized = false;
  // It's better to throw an error or handle this state more gracefully in a real app,
  // but for now, logging will help the user. The app will likely crash or misbehave
  // if Firebase isn't initialized correctly.
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

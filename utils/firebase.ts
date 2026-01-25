import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
    getAuth,
    // @ts-ignore - Module '"firebase/auth"' has no exported member 'getReactNativePersistence' in some IDE views
    getReactNativePersistence,
    initializeAuth
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAk9YnXheSII3q9SpMw3CuqzYJPuKo7aJ0",
    authDomain: "meditrack-c224d.firebaseapp.com",
    projectId: "meditrack-c224d",
    storageBucket: "meditrack-c224d.firebasestorage.app",
    messagingSenderId: "811966391838",
    appId: "1:811966391838:web:70a9af07a4bb365b2e300f",
    measurementId: "G-VNYHDJM0PY"
};

// Initialize Firebase Apps
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
import { getFirestore } from 'firebase/firestore';
export const db = getFirestore(app);

// Initialize Storage
import { getStorage } from 'firebase/storage';
export const storage = getStorage(app);

// Initialize Firebase Auth with persistence for React Native
let authInstance;
try {
    authInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
} catch (e: any) {
    // If auth is already initialized (e.g. during Hot Reload), just get the existing instance
    authInstance = getAuth(app);
}

export const auth = authInstance;
export default app;

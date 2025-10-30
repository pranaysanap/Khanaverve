import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDxtHcUvBCCQqngFbRc1t-K5ULDt4gs4Pk",
  authDomain: "khanavervev2.firebaseapp.com",
  projectId: "khanavervev2",
  storageBucket: "khanavervev2.appspot.com",
  messagingSenderId: "340198156677",
  appId: "1:340198156677:web:4fada9e82a8a9cbb7c77ba"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
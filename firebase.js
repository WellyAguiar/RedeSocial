import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAG9SDHMRbpHqLa-gMO4M5Dt2fasgkL_Oc",
  authDomain: "facewelly.firebaseapp.com",
  projectId: "facewelly",
  storageBucket: "facewelly.appspot.com",
  messagingSenderId: "1067553804230",
  appId: "1:1067553804230:web:9858a6437d8b0a514becc7",
  measurementId: "G-L32CTKHC5S"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
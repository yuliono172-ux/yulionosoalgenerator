import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuration provided by user for project: yuliononurokhimclassjournal
const firebaseConfig = {
  apiKey: "AIzaSyAP_QedIWJRR6zRnT0pQtS9-7-51UxSr04",
  authDomain: "yuliononurokhimclassjournal.firebaseapp.com",
  projectId: "yuliononurokhimclassjournal",
  storageBucket: "yuliononurokhimclassjournal.firebasestorage.app",
  messagingSenderId: "568237814182",
  appId: "1:568237814182:web:156488e89ae736b7fc1f67",
  measurementId: "G-91F2K8PY23"
};

// Initialize Firebase safely (avoid multi-instance warning)
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(firebaseApp);
export default firebaseApp;

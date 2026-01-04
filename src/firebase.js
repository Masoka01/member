// src/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config (punyamu sudah benar)
const firebaseConfig = {
  apiKey: "AIzaSyCIxjtnIJEM-p_0_uCwHjTzYx9Eaoz0yhE",
  authDomain: "absensi-project-0.firebaseapp.com",
  projectId: "absensi-project-0",
  storageBucket: "absensi-project-0.appspot.com",
  messagingSenderId: "1000393480842",
  appId: "1:1000393480842:web:f36db120025c51cf312b73",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export yang dipakai
export const auth = getAuth(app);
export const db = getFirestore(app);

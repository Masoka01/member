import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIxitnJEM-p_0_ucWHIzYx9Eaoz0vhE",
  authDomain: "absensi-project-0.firebaseapp.com",
  projectId: "absensi-project-0",
  storageBucket: "absensi-project-0.appspot.com",
  messagingSenderId: "1000393480842",
  appId: "1:1000393480842:web:f36db120025c51cf312b73",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

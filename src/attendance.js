import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const userEmail = document.getElementById("userEmail");
const statusText = document.getElementById("status");
const checkInBtn = document.getElementById("checkInBtn");
const checkOutBtn = document.getElementById("checkOutBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adminLink = document.getElementById("adminLink");

let attendanceDocId = null;

// ===============================
// AUTH CHECK
// ===============================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  console.log("LOGIN:", user.uid);

  userEmail.innerText = `Login sebagai: ${user.email}`;

  // ===============================
  // ROLE CHECK (ADMIN)
  // ===============================
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists() && userSnap.data().role === "admin") {
    adminLink.style.display = "block";
  }

  // ===============================
  // ATTENDANCE CHECK
  // ===============================
  const today = new Date().toISOString().split("T")[0];

  const q = query(
    collection(db, "attendance"),
    where("userId", "==", user.uid),
    where("date", "==", today)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    attendanceDocId = docSnap.id;

    if (docSnap.data().checkOut) {
      statusText.innerText = "Status: Sudah Check-in & Check-out";
      checkInBtn.disabled = true;
      checkOutBtn.disabled = true;
    } else {
      statusText.innerText = "Status: Sudah Check-in";
      checkInBtn.disabled = true;
      checkOutBtn.disabled = false;
    }
  } else {
    statusText.innerText = "Status: Belum Check-in";
    checkInBtn.disabled = false;
    checkOutBtn.disabled = true;
  }
});

// ===============================
// CHECK IN
// ===============================
checkInBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const today = new Date().toISOString().split("T")[0];

  const docRef = await addDoc(collection(db, "attendance"), {
    userId: user.uid,
    email: user.email,
    date: today,
    checkIn: serverTimestamp(),
    checkOut: null,
  });

  attendanceDocId = docRef.id;
  statusText.innerText = "Status: Sudah Check-in";
  checkInBtn.disabled = true;
  checkOutBtn.disabled = false;
});

// ===============================
// CHECK OUT
// ===============================
checkOutBtn.addEventListener("click", async () => {
  if (!attendanceDocId) return;

  const docRef = doc(db, "attendance", attendanceDocId);

  await updateDoc(docRef, {
    checkOut: serverTimestamp(),
  });

  statusText.innerText = "Status: Sudah Check-in & Check-out";
  checkOutBtn.disabled = true;
});

// ===============================
// LOGOUT
// ===============================
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

// src/attendance.js
import { auth, db } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const userEmail = document.getElementById("userEmail");
const statusText = document.getElementById("status");
const checkInBtn = document.getElementById("checkInBtn");
const checkOutBtn = document.getElementById("checkOutBtn");
const logoutBtn = document.getElementById("logoutBtn");

let attendanceDocId = null;

// ==========================
// 🔥 AUTH CHECK (NO LISTENER)
// ==========================
setTimeout(async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("SESSION LOGIN TIDAK TERDETEKSI.\nSilakan login ulang.");
    window.location.href = "login.html";
    return;
  }

  userEmail.innerText = `Login sebagai: ${user.email}`;

  const today = new Date().toISOString().split("T")[0];

  const q = query(
    collection(db, "attendance"),
    where("userId", "==", user.uid),
    where("date", "==", today)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    attendanceDocId = doc.id;

    if (doc.data().checkOut) {
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
}, 800);

// ==========================
// CHECK IN
// ==========================
checkInBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const now = new Date();
  const dateString = now.toISOString().split("T")[0];

  await addDoc(collection(db, "attendance"), {
    userId: user.uid,
    email: user.email,
    date: dateString,
    checkIn: serverTimestamp(),
    checkOut: null,
  });

  statusText.innerText = "Status: Sudah Check-in";
  checkInBtn.disabled = true;
  checkOutBtn.disabled = false;
});

// ==========================
// CHECK OUT
// ==========================
checkOutBtn.addEventListener("click", async () => {
  if (!attendanceDocId) return;

  const q = query(
    collection(db, "attendance"),
    where("__name__", "==", attendanceDocId)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return;

  await updateDoc(snapshot.docs[0].ref, {
    checkOut: serverTimestamp(),
  });

  statusText.innerText = "Status: Sudah Check-in & Check-out";
  checkOutBtn.disabled = true;
});

// ==========================
// LOGOUT
// ==========================
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

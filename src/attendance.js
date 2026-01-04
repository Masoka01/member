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
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =====================
// HELPER: ISO WEEK
// =====================
function getISOWeek(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function formatDate(d) {
  return `${String(d.getDate()).padStart(2, "0")}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${d.getFullYear()}`;
}

// =====================
// DOM
// =====================
const userEmail = document.getElementById("userEmail");
const statusText = document.getElementById("status");
const checkInBtn = document.getElementById("checkInBtn");
const checkOutBtn = document.getElementById("checkOutBtn");
const logoutBtn = document.getElementById("logoutBtn");

let attendanceDocId = null;
let weekKey = null;

// =====================
// AUTH
// =====================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  userEmail.innerText = `Login sebagai: ${user.email}`;

  const today = new Date();
  weekKey = getISOWeek(today);
  const dateStr = formatDate(today);

  const q = query(
    collection(db, "attendance", weekKey),
    where("userId", "==", user.uid),
    where("date", "==", dateStr)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    const doc = snap.docs[0];
    attendanceDocId = doc.id;

    if (doc.data().checkOut) {
      statusText.innerText = "Sudah Check-in & Check-out";
      checkInBtn.disabled = true;
      checkOutBtn.disabled = true;
    } else {
      statusText.innerText = "Sudah Check-in";
      checkInBtn.disabled = true;
      checkOutBtn.disabled = false;
    }
  } else {
    statusText.innerText = "Belum Check-in";
  }
});

// =====================
// CHECK-IN
// =====================
checkInBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const now = new Date();

  const ref = await addDoc(collection(db, "attendance", weekKey), {
    userId: user.uid,
    email: user.email,
    date: formatDate(now),
    checkIn: serverTimestamp(),
    checkOut: null,
  });

  attendanceDocId = ref.id;
  statusText.innerText = "Sudah Check-in";
  checkInBtn.disabled = true;
  checkOutBtn.disabled = false;
};

// =====================
// CHECK-OUT
// =====================
checkOutBtn.onclick = async () => {
  if (!attendanceDocId) return;

  const q = query(
    collection(db, "attendance", weekKey),
    where("__name__", "==", attendanceDocId)
  );

  const snap = await getDocs(q);
  await updateDoc(snap.docs[0].ref, {
    checkOut: serverTimestamp(),
  });

  statusText.innerText = "Sudah Check-in & Check-out";
  checkOutBtn.disabled = true;
};

// =====================
// LOGOUT
// =====================
logoutBtn.onclick = async () => {
  await signOut(auth);
  location.href = "login.html";
};

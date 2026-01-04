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

// ======================
// UTIL
// ======================
function getWeekKey(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function formatDate(d) {
  return `${String(d.getDate()).padStart(2, "0")}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${d.getFullYear()}`;
}

function formatTime(ts) {
  const d = ts.toDate();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

// ======================
// DOM
// ======================
const emailEl = document.getElementById("userEmail");
const statusEl = document.getElementById("status");
const checkInBtn = document.getElementById("checkInBtn");
const checkOutBtn = document.getElementById("checkOutBtn");
const logoutBtn = document.getElementById("logoutBtn");

let docId = null;
let weekKey = null;

// ======================
// AUTH
// ======================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  emailEl.innerText = `Login sebagai: ${user.email}`;

  const today = new Date();
  weekKey = getWeekKey(today);
  const todayStr = formatDate(today);

  const q = query(
    collection(db, "attendance", weekKey),
    where("userId", "==", user.uid),
    where("date", "==", todayStr)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    const d = snap.docs[0];
    docId = d.id;

    if (d.data().checkOut) {
      statusEl.innerText = `Check In: ${formatTime(
        d.data().checkIn
      )} | Check Out: ${formatTime(d.data().checkOut)}`;
      checkInBtn.disabled = true;
      checkOutBtn.disabled = true;
    } else {
      statusEl.innerText = `Check In: ${formatTime(d.data().checkIn)}`;
      checkInBtn.disabled = true;
      checkOutBtn.disabled = false;
    }
  } else {
    statusEl.innerText = "Belum Check-in hari ini";
  }
});

// ======================
// CHECK IN
// ======================
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

  docId = ref.id;
  statusEl.innerText = "Check-in berhasil";
  checkInBtn.disabled = true;
  checkOutBtn.disabled = false;
};

// ======================
// CHECK OUT
// ======================
checkOutBtn.onclick = async () => {
  if (!docId) return;

  const q = query(
    collection(db, "attendance", weekKey),
    where("__name__", "==", docId)
  );

  const snap = await getDocs(q);
  await updateDoc(snap.docs[0].ref, {
    checkOut: serverTimestamp(),
  });

  statusEl.innerText = "Check-out berhasil";
  checkOutBtn.disabled = true;
};

// ======================
// LOGOUT
// ======================
logoutBtn.onclick = async () => {
  await signOut(auth);
  location.href = "login.html";
};

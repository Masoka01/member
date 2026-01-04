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
// FORMAT DATETIME
// =====================
function formatDateTime(timestamp) {
  if (!timestamp) return "-";

  const d = timestamp.toDate();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

// =====================
// ELEMENT
// =====================
const userEmail = document.getElementById("userEmail");
const statusText = document.getElementById("status");
const checkInBtn = document.getElementById("checkInBtn");
const checkOutBtn = document.getElementById("checkOutBtn");
const logoutBtn = document.getElementById("logoutBtn");

let attendanceDocId = null;

// =====================
// AUTH CHECK
// =====================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
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

  const snap = await getDocs(q);

  if (!snap.empty) {
    const doc = snap.docs[0];
    attendanceDocId = doc.id;

    const data = doc.data();

    if (data.checkOut) {
      statusText.innerText = `Check In: ${formatDateTime(
        data.checkIn
      )} | Check Out: ${formatDateTime(data.checkOut)}`;
      checkInBtn.disabled = true;
      checkOutBtn.disabled = true;
    } else {
      statusText.innerText = `Check In: ${formatDateTime(
        data.checkIn
      )} | Check Out: -`;
      checkInBtn.disabled = true;
      checkOutBtn.disabled = false;
    }
  } else {
    statusText.innerText = "Belum Check In";
  }
});

// =====================
// CHECK IN
// =====================
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

  statusText.innerText = "Check In berhasil";
  checkInBtn.disabled = true;
  checkOutBtn.disabled = false;
});

// =====================
// CHECK OUT
// =====================
checkOutBtn.addEventListener("click", async () => {
  if (!attendanceDocId) return;

  const q = query(
    collection(db, "attendance"),
    where("__name__", "==", attendanceDocId)
  );

  const snap = await getDocs(q);
  const ref = snap.docs[0].ref;

  await updateDoc(ref, {
    checkOut: serverTimestamp(),
  });

  statusText.innerText = "Check Out berhasil";
  checkOutBtn.disabled = true;
});

// =====================
// LOGOUT
// =====================
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

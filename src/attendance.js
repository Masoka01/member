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

// =====================
// ELEMENT
// =====================
const userEmail = document.getElementById("userEmail");
const statusText = document.getElementById("status");
const checkInBtn = document.getElementById("checkInBtn");
const checkOutBtn = document.getElementById("checkOutBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adminLink = document.getElementById("adminLink");

let attendanceDocId = null;

// =====================
// FORMAT
// =====================
function formatDateTime(ts) {
  if (!ts) return "-";
  const d = ts.toDate();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function todayString() {
  const d = new Date();
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

// =====================
// AUTH CHECK
// =====================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  userEmail.innerText = `Login sebagai: ${user.email}`;

  // ===== ROLE CHECK (ADMIN)
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists() && userSnap.data().role === "admin") {
    adminLink.style.display = "inline";
  }

  // ===== ATTENDANCE CHECK
  const q = query(
    collection(db, "attendance"),
    where("userId", "==", user.uid),
    where("date", "==", todayString())
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    const docSnap = snap.docs[0];
    attendanceDocId = docSnap.id;

    const data = docSnap.data();

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
    statusText.innerText = "Belum check-in hari ini";
    checkOutBtn.disabled = true;
  }
});

// =====================
// CHECK IN
// =====================
checkInBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const ref = await addDoc(collection(db, "attendance"), {
    userId: user.uid,
    email: user.email,
    date: todayString(),
    checkIn: serverTimestamp(),
    checkOut: null,
  });

  attendanceDocId = ref.id;
  window.location.reload();
});

// =====================
// CHECK OUT
// =====================
checkOutBtn.addEventListener("click", async () => {
  if (!attendanceDocId) return;

  await updateDoc(doc(db, "attendance", attendanceDocId), {
    checkOut: serverTimestamp(),
  });

  window.location.reload();
});

// =====================
// LOGOUT
// =====================
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

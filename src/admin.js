import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =====================
// FORMATTERS
// =====================
function formatDate(ts) {
  if (!ts) return "-";
  const d = ts.toDate();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function formatTime(ts) {
  if (!ts) return "-";
  const d = ts.toDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${min}`;
}

// =====================
// AUTH + ROLE CHECK
// =====================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    alert("Akses admin ditolak");
    window.location.href = "dashboard.html";
    return;
  }

  loadAttendance();
});

// =====================
// LOAD ATTENDANCE
// =====================
async function loadAttendance() {
  const tbody = document.getElementById("attendanceBody");
  tbody.innerHTML = "";

  const snap = await getDocs(collection(db, "attendance"));

  snap.forEach((docSnap) => {
    const d = docSnap.data();

    // SKIP DATA YANG BELUM CHECK-IN
    if (!d.checkIn) return;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${d.email}</td>
      <td>${formatDate(d.checkIn)}</td>
      <td>${formatTime(d.checkIn)}</td>
      <td>${formatTime(d.checkOut)}</td>
    `;

    tbody.appendChild(tr);
  });
}

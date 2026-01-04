import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
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
    alert("Akses ditolak!");
    window.location.href = "dashboard.html";
    return;
  }

  loadAttendance();
});

// =====================
// LOAD DATA
// =====================
async function loadAttendance() {
  const tbody = document.getElementById("attendanceBody");
  tbody.innerHTML = "";

  const snap = await getDocs(collection(db, "attendance"));

  snap.forEach((doc) => {
    const data = doc.data();

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${data.email}</td>
      <td>${data.date}</td>
      <td>${formatDateTime(data.checkIn)}</td>
      <td>${formatDateTime(data.checkOut)}</td>
    `;
    tbody.appendChild(tr);
  });
}

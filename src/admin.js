import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =====================
// AUTH + ROLE
// =====================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    alert("Akses ditolak");
    location.href = "dashboard.html";
    return;
  }

  loadWeeks();
});

// =====================
// LOAD WEEKS
// =====================
async function loadWeeks() {
  const attendanceRef = collection(db, "attendance");
  const weeksSnap = await getDocs(attendanceRef);

  const select = document.getElementById("weekSelect");
  select.innerHTML = "";

  weeksSnap.forEach((doc) => {
    const opt = document.createElement("option");
    opt.value = doc.id;
    opt.textContent = doc.id;
    select.appendChild(opt);
  });
}

// =====================
// DELETE WEEK
// =====================
document.getElementById("deleteWeekBtn").onclick = async () => {
  const week = document.getElementById("weekSelect").value;
  if (!week) return;

  if (!confirm(`Hapus semua absensi minggu ${week}?`)) return;

  const snap = await getDocs(collection(db, "attendance", week));
  for (const d of snap.docs) {
    await deleteDoc(d.ref);
  }

  alert("Absensi minggu berhasil dihapus");
  loadWeeks();
};

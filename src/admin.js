import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const weekSelect = document.getElementById("weekSelect");
const tableBody = document.getElementById("tableBody");
const deleteBtn = document.getElementById("deleteWeekBtn");

function formatTime(ts) {
  if (!ts) return "-";
  const d = ts.toDate();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

// ======================
// AUTH + ROLE
// ======================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists() || snap.data().role !== "admin") {
    alert("Bukan admin");
    location.href = "dashboard.html";
    return;
  }

  loadWeeks();
});

// ======================
// LOAD WEEKS
// ======================
async function loadWeeks() {
  weekSelect.innerHTML = "";
  tableBody.innerHTML = "";

  const weeksSnap = await getDocs(collection(db, "attendance"));
  weeksSnap.forEach((w) => {
    const opt = document.createElement("option");
    opt.value = w.id;
    opt.textContent = w.id;
    weekSelect.appendChild(opt);
  });

  if (weekSelect.value) loadTable();
}

weekSelect.onchange = loadTable;

// ======================
// LOAD TABLE
// ======================
async function loadTable() {
  tableBody.innerHTML = "";

  const snap = await getDocs(collection(db, "attendance", weekSelect.value));
  snap.forEach((d) => {
    const a = d.data();
    tableBody.innerHTML += `
      <tr>
        <td>${a.email}</td>
        <td>${a.date}</td>
        <td>${formatTime(a.checkIn)}</td>
        <td>${formatTime(a.checkOut)}</td>
      </tr>
    `;
  });
}

// ======================
// DELETE WEEK
// ======================
deleteBtn.onclick = async () => {
  const week = weekSelect.value;
  if (!week) return;

  if (!confirm(`Hapus semua data minggu ${week}?`)) return;

  const snap = await getDocs(collection(db, "attendance", week));
  for (const d of snap.docs) {
    await deleteDoc(d.ref);
  }

  alert("Minggu berhasil dihapus");
  loadWeeks();
};

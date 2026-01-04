import { auth, db } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const table = document.getElementById("attendanceTable");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // 🔐 CEK ROLE ADMIN
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    alert("Akses ditolak!");
    window.location.href = "dashboard.html";
    return;
  }

  // 📥 AMBIL SEMUA DATA ABSENSI
  const q = query(collection(db, "attendance"), orderBy("date", "desc"));

  const snapshot = await getDocs(q);

  table.innerHTML = "";

  if (snapshot.empty) {
    table.innerHTML = "<tr><td colspan='4'>Belum ada data</td></tr>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${data.email}</td>
      <td>${data.date}</td>
      <td>${data.checkIn?.toDate().toLocaleString() ?? "-"}</td>
      <td>${data.checkOut?.toDate().toLocaleString() ?? "-"}</td>
    `;

    table.appendChild(tr);
  });
});

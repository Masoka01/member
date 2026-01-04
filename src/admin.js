import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tableBody = document.getElementById("attendanceTable");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) {
    alert("Data user tidak ditemukan");
    location.href = "dashboard.html";
    return;
  }

  const role = snap.data().role || "user";
  if (role !== "admin") {
    alert("Akses ditolak");
    location.href = "dashboard.html";
    return;
  }

  const data = await getDocs(collection(db, "attendance"));
  tableBody.innerHTML = "";

  data.forEach((docSnap) => {
    const d = docSnap.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.uid}</td>
      <td>${d.type}</td>
      <td>${d.time?.toDate().toLocaleString() || "-"}</td>
    `;
    tableBody.appendChild(tr);
  });
});

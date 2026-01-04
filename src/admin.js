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

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    alert("Akses ditolak");
    location.href = "dashboard.html";
    return;
  }

  const snap = await getDocs(collection(db, "attendance"));
  tableBody.innerHTML = "";

  snap.forEach((doc) => {
    const d = doc.data();
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.uid}</td>
      <td>${d.type}</td>
      <td>${d.time?.toDate().toLocaleString() || "-"}</td>
    `;
    tableBody.appendChild(tr);
  });
});

import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const tbody = document.getElementById("data");

onAuthStateChanged(auth, async (user) => {
  if (!user) return (location.href = "login.html");

  const snap = await getDocs(collection(db, "attendance"));

  snap.forEach((doc) => {
    const d = doc.data();
    tbody.innerHTML += `
      <tr>
        <td>${d.email}</td>
        <td>${d.date}</td>
        <td>${d.checkIn?.toDate().toLocaleTimeString("id-ID") || "-"}</td>
        <td>${d.checkOut?.toDate().toLocaleTimeString("id-ID") || "-"}</td>
      </tr>
    `;
  });
});

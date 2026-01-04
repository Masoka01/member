import { auth, db } from "./firebase.js";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getWeekId } from "./time.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) return (location.href = "login.html");

  const roleSnap = await getDoc(doc(db, "users", user.uid));
  if (!roleSnap.exists() || roleSnap.data().role !== "admin") {
    return (location.href = "dashboard.html");
  }

  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  const weeks = await getDocs(collection(db, "attendance"));
  for (const week of weeks.docs) {
    const records = await getDocs(collection(db, "attendance", week.id));
    records.forEach((r) => {
      const d = r.data();
      tbody.innerHTML += `
        <tr>
          <td>${d.email}</td>
          <td>${d.date}</td>
          <td>${d.checkIn || "-"}</td>
          <td>${d.checkOut || "-"}</td>
        </tr>`;
    });
  }

  document.getElementById("deleteWeekBtn").onclick = async () => {
    if (!confirm("Hapus absensi minggu ini?")) return;

    const weekId = getWeekId(new Date());
    const docs = await getDocs(collection(db, "attendance", weekId));
    for (const d of docs.docs) {
      await deleteDoc(d.ref);
    }

    alert("Absensi minggu ini dihapus");
    location.reload();
  };
});

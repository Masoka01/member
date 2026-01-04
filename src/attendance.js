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

const userEmail = document.getElementById("userEmail");
const status = document.getElementById("status");
const checkInBtn = document.getElementById("checkInBtn");
const checkOutBtn = document.getElementById("checkOutBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adminLink = document.getElementById("adminLink");

let attendanceId = null;

const today = new Date().toLocaleDateString("id-ID");

onAuthStateChanged(auth, async (user) => {
  if (!user) return (location.href = "login.html");

  userEmail.innerText = `Login: ${user.email}`;

  // CEK ROLE
  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (userSnap.exists() && userSnap.data().role === "admin") {
    adminLink.style.display = "inline";
  }

  const q = query(
    collection(db, "attendance"),
    where("userId", "==", user.uid),
    where("date", "==", today)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    const d = snap.docs[0];
    attendanceId = d.id;

    if (d.data().checkOut) {
      status.innerText = "Sudah Check In & Out";
      checkInBtn.disabled = true;
      checkOutBtn.disabled = true;
    } else {
      status.innerText = "Sudah Check In";
      checkInBtn.disabled = true;
      checkOutBtn.disabled = false;
    }
  }
});

checkInBtn.onclick = async () => {
  const user = auth.currentUser;
  await addDoc(collection(db, "attendance"), {
    userId: user.uid,
    email: user.email,
    date: today,
    checkIn: serverTimestamp(),
    checkOut: null,
  });
  location.reload();
};

checkOutBtn.onclick = async () => {
  await updateDoc(doc(db, "attendance", attendanceId), {
    checkOut: serverTimestamp(),
  });
  location.reload();
};

logoutBtn.onclick = async () => {
  await signOut(auth);
  location.href = "login.html";
};

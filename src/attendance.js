import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getWeekId, formatDate, formatTime } from "./time.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) return (location.href = "login.html");

  document.getElementById("userEmail").innerText = user.email;

  const now = new Date();
  const weekId = getWeekId(now);
  const ref = doc(db, "attendance", weekId, user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    document.getElementById("checkInBtn").disabled = false;
  } else {
    document.getElementById("checkInBtn").disabled = true;
    document.getElementById("checkOutBtn").disabled =
      snap.data().checkOut !== null;
  }

  document.getElementById("checkInBtn").onclick = async () => {
    await setDoc(ref, {
      email: user.email,
      date: formatDate(now),
      checkIn: formatTime(now),
      checkOut: null,
      week: weekId,
    });
    location.reload();
  };

  document.getElementById("checkOutBtn").onclick = async () => {
    await setDoc(
      ref,
      {
        checkOut: formatTime(new Date()),
      },
      { merge: true }
    );
    location.reload();
  };

  document.getElementById("logoutBtn").onclick = async () => {
    await signOut(auth);
    location.href = "login.html";
  };
});

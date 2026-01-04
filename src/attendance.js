import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const checkInBtn = document.getElementById("checkInBtn");
const checkOutBtn = document.getElementById("checkOutBtn");
const logoutBtn = document.getElementById("logoutBtn");
const adminLink = document.getElementById("adminLink");
const userEmail = document.getElementById("userEmail");

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  currentUser = user;
  if (userEmail) userEmail.textContent = user.email;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists() && snap.data().role === "admin") {
    adminLink.style.display = "inline";
  }
});

checkInBtn?.addEventListener("click", async () => {
  if (!currentUser) return;

  await addDoc(collection(db, "attendance"), {
    uid: currentUser.uid,
    type: "checkin",
    time: serverTimestamp(),
  });

  alert("Check-in berhasil");
  checkInBtn.disabled = true;
  checkOutBtn.disabled = false;
});

checkOutBtn?.addEventListener("click", async () => {
  if (!currentUser) return;

  await addDoc(collection(db, "attendance"), {
    uid: currentUser.uid,
    type: "checkout",
    time: serverTimestamp(),
  });

  alert("Check-out berhasil");
  checkOutBtn.disabled = true;
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  location.href = "login.html";
});

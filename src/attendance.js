import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.getElementById("absenBtn")?.addEventListener("click", async () => {
  if (!auth.currentUser) return alert("Belum login");

  try {
    await addDoc(collection(db, "attendance"), {
      uid: auth.currentUser.uid,
      time: serverTimestamp(),
    });

    alert("Absen berhasil");
  } catch (e) {
    alert("Gagal absen");
  }
});

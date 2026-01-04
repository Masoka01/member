// src/auth.js
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const form = document.getElementById("loginForm");
const errorText = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    // 🔥 PAKSA SIMPAN SESSION
    await setPersistence(auth, browserLocalPersistence);

    await signInWithEmailAndPassword(auth, email, password);

    // ⏳ kasih jeda biar session kebaca
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 300);
  } catch (error) {
    errorText.innerText = error.message;
  }
});

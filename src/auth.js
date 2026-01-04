import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const form = document.getElementById("loginForm");
const errorText = document.getElementById("errorText");

onAuthStateChanged(auth, (user) => {
  if (user) {
    location.href = "dashboard.html";
  }
});

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    await signInWithEmailAndPassword(
      auth,
      form.email.value,
      form.password.value
    );
  } catch (err) {
    errorText.textContent = err.message;
  }
});

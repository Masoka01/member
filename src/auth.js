import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const form = document.getElementById("loginForm");
const error = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    window.location.href = "dashboard.html";
  } catch {
    error.innerText = "Login gagal";
  }
});

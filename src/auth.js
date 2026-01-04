import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const form = document.getElementById("loginForm");
const errorText = document.getElementById("errorText");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorText.textContent = "";

  const email = form.email.value;
  const password = form.password.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.href = "dashboard.html";
  } catch (err) {
    console.error(err);
    errorText.textContent = "Email atau password salah";
  }
});

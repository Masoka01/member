/*********************************
 * GLOBAL PROMISE ERROR HANDLER
 *********************************/
window.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled promise:", event.reason);

  const el = document.getElementById("status");
  if (el) {
    el.innerText = "❌ Nama tidak terdaftar / akses ditolak";
    el.style.color = "#c62828";
  }

  event.preventDefault(); // ⛔ hentikan error ke console
});

/*********************************
 * FIREBASE CONFIG
 *********************************/
const firebaseConfig = {
  apiKey: "AIzaSyCIxjtnIJEM-p_0_uCwHjTzYx9Eaoz0yhE",
  authDomain: "absensi-project-0.firebaseapp.com",
  projectId: "absensi-project-0",
  storageBucket: "absensi-project-0.firebasestorage.app",
  messagingSenderId: "1000393480842",
  appId: "1:1000393480842:web:f36db120025c51cf312b73",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/*********************************
 * HELPER
 *********************************/
function getTanggal() {
  return new Date().toISOString().split("T")[0];
}

function getJam() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function setStatus(text, type = "info") {
  const el = document.getElementById("status");
  el.innerText = text;

  if (type === "success") el.style.color = "#2e7d32";
  else if (type === "error") el.style.color = "#c62828";
  else if (type === "warning") el.style.color = "#ed6c02";
  else el.style.color = "#333";
}

/*********************************
 * CHECK IN
 *********************************/
async function checkIn() {
  const nama = document.getElementById("nama").value.trim();
  if (!nama) {
    setStatus("❗ Nama wajib diisi", "warning");
    return;
  }

  const tanggal = getTanggal();
  const docId = `${nama}_${tanggal}`;

  try {
    await db.collection("attendance").doc(docId).set({
      nama,
      tanggal,
      checkin: getJam(),
      checkout: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    setStatus("✅ Berhasil check-in", "success");
  } catch (err) {
    if (err.code === "permission-denied") {
      setStatus("❌ Nama tidak terdaftar / ID tidak ada", "error");
      return;
    }
    throw err; // biar ditangkap global handler
  }
}

/*********************************
 * CHECK OUT
 *********************************/
async function checkOut() {
  const nama = document.getElementById("nama").value.trim();
  if (!nama) {
    setStatus("❗ Nama wajib diisi", "warning");
    return;
  }

  const tanggal = getTanggal();
  const docId = `${nama}_${tanggal}`;
  const ref = db.collection("attendance").doc(docId);

  try {
    const doc = await ref.get();

    if (!doc.exists) {
      setStatus("❌ Belum check-in", "error");
      return;
    }

    if (doc.data().checkout) {
      setStatus("⚠️ Sudah check-out", "warning");
      return;
    }

    await ref.update({ checkout: getJam() });
    setStatus("✅ Berhasil check-out", "success");
  } catch (err) {
    if (err.code === "permission-denied") {
      setStatus("❌ Nama tidak terdaftar / ID tidak ada", "error");
      return;
    }
    throw err;
  }
}

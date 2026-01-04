/*********************************
 * GLOBAL PROMISE SAFETY
 *********************************/
window.addEventListener("unhandledrejection", (e) => {
  e.preventDefault();
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
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function getJam() {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function tampilNama(nama) {
  return nama.replace(/\b\w/g, (c) => c.toUpperCase());
}

function setStatus(text, type = "info") {
  const el = document.getElementById("status");
  el.innerText = text;

  el.style.color =
    type === "success"
      ? "#2e7d32"
      : type === "error"
      ? "#c62828"
      : type === "warning"
      ? "#ed6c02"
      : "#333";
}

function setButtonState({ checkIn, checkOut }) {
  const btnIn = document.querySelector(".btn-in");
  const btnOut = document.querySelector(".btn-out");

  btnIn.disabled = !checkIn;
  btnOut.disabled = !checkOut;

  btnIn.style.opacity = checkIn ? "1" : "0.5";
  btnOut.style.opacity = checkOut ? "1" : "0.5";
}

/*********************************
 * CEK STATUS HARI INI
 *********************************/
async function cekStatusHariIni(nama) {
  const tanggal = getTanggal();
  const docId = `${nama}_${tanggal}`;
  const ref = db.collection("attendance").doc(docId);

  try {
    const doc = await ref.get();

    if (!doc.exists) {
      setStatus("ℹ️ Belum check-in hari ini");
      setButtonState({ checkIn: true, checkOut: false });
      return;
    }

    const data = doc.data();

    if (data.checkin && !data.checkout) {
      setStatus("✅ Sudah check-in, silakan check-out", "success");
      setButtonState({ checkIn: false, checkOut: true });
      return;
    }

    if (data.checkin && data.checkout) {
      setStatus("✔️ Absensi hari ini sudah lengkap", "success");
      setButtonState({ checkIn: false, checkOut: false });
      return;
    }
  } catch (err) {
    if (err.code === "permission-denied") {
      setStatus("❌ Nama tidak terdaftar / ID tidak ada", "error");
      setButtonState({ checkIn: false, checkOut: false });
    }
  }
}

/*********************************
 * CHECK IN (1× PER HARI)
 *********************************/
async function checkIn() {
  const input = document.getElementById("nama");
  const nama = input.value.trim().toLowerCase(); // 🔑 LOWERCASE

  if (!nama) {
    setStatus("❗ Nama wajib diisi", "warning");
    return;
  }

  const tanggal = getTanggal();
  const docId = `${nama}_${tanggal}`;

  try {
    await db.collection("attendance").doc(docId).create({
      nama, // disimpan lowercase
      tanggal,
      checkin: getJam(),
      checkout: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    setStatus(`✅ ${tampilNama(nama)} berhasil check-in`, "success");
    setButtonState({ checkIn: false, checkOut: true });
  } catch (err) {
    if (err.code === "already-exists") {
      setStatus("⚠️ Kamu sudah check-in hari ini", "warning");
      setButtonState({ checkIn: false, checkOut: true });
      return;
    }

    if (err.code === "permission-denied") {
      setStatus("❌ Nama tidak terdaftar / ID tidak ada", "error");
      setButtonState({ checkIn: false, checkOut: false });
      return;
    }

    setStatus("❌ Gagal check-in", "error");
  }
}

/*********************************
 * CHECK OUT (1× PER HARI)
 *********************************/
async function checkOut() {
  const input = document.getElementById("nama");
  const nama = input.value.trim().toLowerCase(); // 🔑 LOWERCASE

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
      setStatus("⚠️ Kamu sudah check-out hari ini", "warning");
      setButtonState({ checkIn: false, checkOut: false });
      return;
    }

    await ref.update({
      checkout: getJam(),
    });

    setStatus(`✅ ${tampilNama(nama)} berhasil check-out`, "success");
    setButtonState({ checkIn: false, checkOut: false });
  } catch (err) {
    if (err.code === "permission-denied") {
      setStatus("❌ Nama tidak terdaftar / ID tidak ada", "error");
      setButtonState({ checkIn: false, checkOut: false });
      return;
    }

    setStatus("❌ Gagal check-out", "error");
  }
}

/*********************************
 * AUTO CEK SAAT NAMA SELESAI DIKETIK
 *********************************/
document.getElementById("nama").addEventListener("blur", () => {
  const nama = document.getElementById("nama").value.trim().toLowerCase();
  if (nama) cekStatusHariIni(nama);
});

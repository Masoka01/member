/*********************************
 * FIREBASE CONFIG
 *********************************/
const firebaseConfig = {
  apiKey: "AIzaSyCIxjtnIJEM-p_0_uCwHjTzYx9Eaoz0yhE",
  authDomain: "absensi-project-0.firebaseapp.com",
  projectId: "absensi-project-0",
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
  el.style.color =
    type === "success"
      ? "green"
      : type === "error"
      ? "red"
      : type === "warning"
      ? "orange"
      : "#333";
}

function setBtn(inOn, outOn) {
  document.querySelector(".btn-in").disabled = !inOn;
  document.querySelector(".btn-out").disabled = !outOn;
}

/*********************************
 * CHECK STATUS
 *********************************/
async function cekStatus(nama) {
  const id = `${nama}_${getTanggal()}`;
  const ref = db.collection("attendance").doc(id);

  try {
    const doc = await ref.get();

    if (!doc.exists) {
      setStatus("ℹ️ Belum check-in");
      setBtn(true, false);
      return;
    }

    if (doc.data().checkout) {
      setStatus("✔️ Absensi hari ini lengkap", "success");
      setBtn(false, false);
    } else {
      setStatus("✅ Sudah check-in", "success");
      setBtn(false, true);
    }
  } catch (e) {
    setStatus("❌ Nama tidak terdaftar", "error");
    setBtn(false, false);
  }
}

/*********************************
 * CHECK IN
 *********************************/
async function checkIn() {
  const nama = document.getElementById("nama").value.trim().toLowerCase();
  if (!nama) return setStatus("❗ Nama wajib diisi", "warning");

  const id = `${nama}_${getTanggal()}`;
  const ref = db.collection("attendance").doc(id);

  try {
    const doc = await ref.get();
    if (doc.exists) {
      setStatus("⚠️ Sudah check-in hari ini", "warning");
      setBtn(false, true);
      return;
    }

    await ref.set({
      nama,
      tanggal: getTanggal(),
      checkin: getJam(),
      checkout: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    setStatus("✅ Check-in berhasil", "success");
    setBtn(false, true);
  } catch (e) {
    setStatus("❌ Nama tidak terdaftar / ID tidak ada", "error");
    setBtn(false, false);
  }
}

/*********************************
 * CHECK OUT
 *********************************/
async function checkOut() {
  const nama = document.getElementById("nama").value.trim().toLowerCase();
  if (!nama) return;

  const id = `${nama}_${getTanggal()}`;
  const ref = db.collection("attendance").doc(id);

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
    setStatus("✅ Check-out berhasil", "success");
    setBtn(false, false);
  } catch (e) {
    setStatus("❌ Akses ditolak", "error");
  }
}

/*********************************
 * AUTO CHECK
 *********************************/
document.getElementById("nama").addEventListener("blur", () => {
  const nama = document.getElementById("nama").value.trim().toLowerCase();
  if (nama) cekStatus(nama);
});

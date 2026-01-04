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

// INIT
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

function setStatus(text, success = false) {
  const el = document.getElementById("status");
  el.innerText = text;
  el.style.color = success ? "green" : "#b00020";
}

/*********************************
 * CHECK IN
 *********************************/
function checkIn() {
  const namaInput = document.getElementById("nama");
  const nama = namaInput.value.trim();

  if (!nama) {
    alert("Nama wajib diisi");
    return;
  }

  const tanggal = getTanggal();
  const docId = `${nama}_${tanggal}`; // 🔑 KUNCI UTAMA

  db.collection("attendance")
    .doc(docId)
    .set({
      nama: nama,
      tanggal: tanggal,
      checkin: getJam(),
      checkout: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      setStatus("✅ Check-in berhasil", true);
    })
    .catch((err) => {
      console.error(err);

      if (err.code === "permission-denied") {
        setStatus("❌ Nama tidak terdaftar");
      } else {
        setStatus("❌ Gagal check-in");
      }
    });
}

/*********************************
 * CHECK OUT
 *********************************/
function checkOut() {
  const namaInput = document.getElementById("nama");
  const nama = namaInput.value.trim();

  if (!nama) {
    alert("Nama wajib diisi");
    return;
  }

  const tanggal = getTanggal();
  const docId = `${nama}_${tanggal}`;

  const docRef = db.collection("attendance").doc(docId);

  docRef
    .get()
    .then((doc) => {
      if (!doc.exists) {
        setStatus("❌ Belum check-in");
        return;
      }

      const data = doc.data();

      if (data.checkout) {
        setStatus("⚠️ Sudah check-out");
        return;
      }

      docRef
        .update({
          checkout: getJam(),
        })
        .then(() => {
          setStatus("✅ Check-out berhasil", true);
        })
        .catch((err) => {
          console.error(err);

          if (err.code === "permission-denied") {
            setStatus("❌ Nama tidak terdaftar");
          } else {
            setStatus("❌ Gagal check-out");
          }
        });
    })
    .catch((err) => {
      console.error(err);
      setStatus("❌ Gagal mengambil data");
    });
}
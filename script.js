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
  return new Date().toLocaleTimeString("id-ID");
}

/*********************************
 * CEK NAMA TERDAFTAR
 *********************************/
function isNamaDiizinkan(nama) {
  return db
    .collection("allowed_users")
    .where("nama", "==", nama)
    .get()
    .then((snapshot) => !snapshot.empty);
}

/*********************************
 * CHECK IN
 *********************************/
function checkIn() {
  const nama = document.getElementById("nama").value.trim();
  if (!nama) {
    alert("Nama wajib diisi");
    return;
  }

  isNamaDiizinkan(nama).then((isAllowed) => {
    if (!isAllowed) {
      document.getElementById("status").innerText = "❌ Nama tidak terdaftar";
      return;
    }

    const tanggal = getTanggal();

    db.collection("attendance")
      .where("nama", "==", nama)
      .where("tanggal", "==", tanggal)
      .get()
      .then((snapshot) => {
        if (!snapshot.empty) {
          document.getElementById("status").innerText =
            "⚠️ Sudah check-in hari ini";
          return;
        }

        db.collection("attendance")
          .add({
            nama,
            tanggal,
            checkin: getJam(),
            checkout: null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then(() => {
            document.getElementById("status").innerText =
              "✅ Check-in berhasil";
          });
      });
  });
}

/*********************************
 * CHECK OUT
 *********************************/
function checkOut() {
  const nama = document.getElementById("nama").value.trim();
  if (!nama) {
    alert("Nama wajib diisi");
    return;
  }

  isNamaDiizinkan(nama).then((isAllowed) => {
    if (!isAllowed) {
      document.getElementById("status").innerText = "❌ Nama tidak terdaftar";
      return;
    }

    const tanggal = getTanggal();

    db.collection("attendance")
      .where("nama", "==", nama)
      .where("tanggal", "==", tanggal)
      .limit(1)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          document.getElementById("status").innerText = "❌ Belum check-in";
          return;
        }

        const doc = snapshot.docs[0];

        if (doc.data().checkout) {
          document.getElementById("status").innerText = "⚠️ Sudah check-out";
          return;
        }

        doc.ref
          .update({
            checkout: getJam(),
          })
          .then(() => {
            document.getElementById("status").innerText =
              "✅ Check-out berhasil";
          });
      });
  });
}

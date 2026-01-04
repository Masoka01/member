const snapshot = await getDocs(collection(db, "attendance"));

snapshot.forEach((doc) => {
  const d = doc.data();

  const row = `
    <tr>
      <td>${d.email}</td>
      <td>${d.date || d.checkIn?.toDate().toLocaleDateString()}</td>
      <td>${d.checkIn?.toDate().toLocaleTimeString()}</td>
      <td>${d.checkOut ? d.checkOut.toDate().toLocaleTimeString() : "-"}</td>
    </tr>
  `;
  table.innerHTML += row;
});

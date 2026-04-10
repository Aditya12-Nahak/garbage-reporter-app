import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEMdeSA7DTCfdx-rIsAVf6W8iSBrbl4Ho",
  authDomain: "garbage-reporter-3c7f9.firebaseapp.com",
  projectId: "garbage-reporter-3c7f9",
  storageBucket: "garbage-reporter-3c7f9.firebasestorage.app",
  messagingSenderId: "56547158656",
  appId: "1:56547158656:web:eedd00f3bf58ca2f245465"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.submitReport = async function(lat, lng) {
  const severity = document.getElementById("severity").value;

  await addDoc(collection(db, "reports"), {
    lat: lat,
    lng: lng,
    severity: severity,
    status: "reported",
    imageUrl: "https://via.placeholder.com/150"
  });

  alert("Saved to Firebase!");
};

window.loadReports = async function(map) {
  const snapshot = await getDocs(collection(db, "reports"));

  snapshot.forEach((docItem) => {
    const data = docItem.data();

    let color = "green";
    if (data.severity === "Medium") color = "orange";
    if (data.severity === "High") color = "red";

    L.circleMarker([data.lat, data.lng], {
      color: color,
      radius: 8
    }).addTo(map).bindPopup(`
      <b>Garbage Report</b><br>
      Severity: ${data.severity}<br>
      Status: ${data.status}<br>
      <img src="${data.imageUrl}" width="100" />
    `);
  });
};
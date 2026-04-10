import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEMdeSA7DTCfdx-rIsAVf6W8iSBrbl4Ho",
  authDomain: "garbage-reporter-3c7f9.firebaseapp.com",
  projectId: "garbage-reporter-3c7f9",
  storageBucket: "garbage-reporter-3c7f9.appspot.com",
  messagingSenderId: "56547158656",
  appId: "1:56547158656:web:eedd00f3bf58ca2f245465"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let markers = [];

window.submitReport = async function(lat, lng) {
  try {
    const severity = document.getElementById("severity").value;

    await addDoc(collection(db, "reports"), {
      lat,
      lng,
      severity,
      status: "reported",
      volunteer: "",
      imageUrl: "https://via.placeholder.com/300x180"
    });

    alert("Report added!");
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
};

window.claimSpot = async function(id) {
  const name = prompt("Enter your name to volunteer:");
  if (!name) return;

  await updateDoc(doc(db, "reports", id), {
    status: "in_progress",
    volunteer: name
  });
};

window.markCleaned = async function(id) {
  await updateDoc(doc(db, "reports", id), {
    status: "cleaned"
  });
};

window.listenReports = function(map) {
  onSnapshot(collection(db, "reports"), (snapshot) => {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    let total = 0, progress = 0, cleaned = 0;

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      total++;

      if (data.status === "in_progress") progress++;
      if (data.status === "cleaned") cleaned++;

      let color = "green";
      if (data.severity === "Medium") color = "orange";
      if (data.severity === "High") color = "red";

      let actionHTML = "";
      let statusClass = "status-reported";

      if (data.status === "reported") {
        statusClass = "status-reported";
        actionHTML = `
          <button class="popup-btn claim-btn" onclick="claimSpot('${docSnap.id}')">
            I Want to Volunteer
          </button>
        `;
      } else if (data.status === "in_progress") {
        statusClass = "status-progress";
        actionHTML = `
          <button class="popup-btn clean-btn" onclick="markCleaned('${docSnap.id}')">
            Mark as Cleaned
          </button>
        `;
      } else {
        statusClass = "status-cleaned";
        actionHTML = `<div class="status-badge status-cleaned">Cleaned</div>`;
      }

      const marker = L.circleMarker([data.lat, data.lng], {
        color,
        radius: 9,
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindPopup(`
        <div class="popup-title">Garbage Report</div>
        <div class="status-badge ${statusClass}">
          ${data.status === "in_progress" ? "In Progress" : data.status.charAt(0).toUpperCase() + data.status.slice(1)}
        </div>
        <p><strong>Severity:</strong> ${data.severity}</p>
        <p><strong>Volunteer:</strong> ${data.volunteer || "Not assigned"}</p>
        <img src="${data.imageUrl}" class="report-img" />
        ${actionHTML}
      `);

      markers.push(marker);
    });

    document.getElementById("totalCount").innerText = total;
    document.getElementById("inProgressCount").innerText = progress;
    document.getElementById("cleanedCount").innerText = cleaned;
  });
};
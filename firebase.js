import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MSG_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

let reportMarkers = [];

window.submitReport = async function(lat, lng) {
  try {
    const severity = document.getElementById("severity").value;
    const imageInput = document.getElementById("imageFile");
    const file = imageInput?.files?.[0];

    let imageUrl = "https://via.placeholder.com/150";

    if (file) {
      const storageRef = ref(storage, `garbage-images/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "reports"), {
      lat,
      lng,
      severity,
      status: "reported",
      imageUrl
    });

    alert("Report submitted!");
  } catch (err) {
    console.error(err);
    alert("Error submitting report");
  }
};

window.updateStatus = async function(id, newStatus) {
  try {
    await updateDoc(doc(db, "reports", id), {
      status: newStatus
    });
  } catch (err) {
    console.error(err);
    alert("Error updating status");
  }
};

window.listenReports = function(map) {
  const reportsRef = collection(db, "reports");

  onSnapshot(reportsRef, (snapshot) => {
    reportMarkers.forEach(marker => map.removeLayer(marker));
    reportMarkers = [];

    let total = 0;
    let inProgress = 0;
    let cleaned = 0;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      total++;

      if (data.status === "in_progress") inProgress++;
      if (data.status === "cleaned") cleaned++;

      let color = "green";
      if (data.severity === "Medium") color = "orange";
      if (data.severity === "High") color = "red";

      let actionBtn = "";
      if (data.status === "reported") {
        actionBtn = `<button onclick="updateStatus('${docSnap.id}', 'in_progress')">Claim Cleanup</button>`;
      } else if (data.status === "in_progress") {
        actionBtn = `<button onclick="updateStatus('${docSnap.id}', 'cleaned')">Mark Cleaned</button>`;
      } else {
        actionBtn = `<span>✅ Completed</span>`;
      }

      const marker = L.circleMarker([data.lat, data.lng], {
        color,
        radius: 8
      }).addTo(map);

      marker.bindPopup(`
        <b>Garbage Report</b><br>
        Severity: ${data.severity}<br>
        Status: ${data.status}<br><br>
        <img src="${data.imageUrl}" width="120" /><br><br>
        ${actionBtn}
      `);

      reportMarkers.push(marker);
    });

    document.getElementById("totalCount").innerText = total;
    document.getElementById("inProgressCount").innerText = inProgress;
    document.getElementById("cleanedCount").innerText = cleaned;
  });
};
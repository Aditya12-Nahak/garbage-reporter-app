import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
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

let reportMarkers = [];

const DUMMY_BEFORE = "https://via.placeholder.com/300x180?text=Before+Image";
const DUMMY_AFTER = "https://via.placeholder.com/300x180?text=After+Image";

function getPoints(severity) {
  if (severity === "Low") return 10;
  if (severity === "Medium") return 25;
  if (severity === "High") return 50;
  return 0;
}

function getStatusClass(status) {
  if (status === "reported") return "status-reported";
  if (status === "in_progress") return "status-progress";
  if (status === "cleaned") return "status-cleaned";
  return "status-reported";
}

function getStatusText(status) {
  if (status === "reported") return "Reported";
  if (status === "in_progress") return "In Progress";
  if (status === "cleaned") return "Cleaned";
  return status;
}

window.submitReport = async function (lat, lng) {
  try {
    const severity = document.getElementById("severity").value;

    await addDoc(collection(db, "reports"), {
      lat,
      lng,
      severity,
      status: "reported",
      volunteer: "",
      beforeImageUrl: DUMMY_BEFORE,
      afterImageUrl: "",
      pointsAwarded: 0,
      createdAt: serverTimestamp(),
      cleanedAt: null
    });

    alert("Report submitted successfully");
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
};

window.claimSpot = async function (reportId) {
  try {
    const volunteerName = prompt("Enter your name to volunteer:");
    if (!volunteerName) return;

    await updateDoc(doc(db, "reports", reportId), {
      status: "in_progress",
      volunteer: volunteerName
    });
  } catch (err) {
    console.error(err);
    alert("Error claiming spot");
  }
};

window.finishCleanup = async function (reportId, severity, volunteer) {
  try {
    if (!volunteer) {
      alert("No volunteer assigned");
      return;
    }

    const points = getPoints(severity);

    await updateDoc(doc(db, "reports", reportId), {
      status: "cleaned",
      afterImageUrl: DUMMY_AFTER,
      pointsAwarded: points,
      cleanedAt: serverTimestamp()
    });

    const volunteerRef = doc(db, "volunteers", volunteer);
    const volunteerSnap = await getDoc(volunteerRef);

    if (volunteerSnap.exists()) {
      const oldData = volunteerSnap.data();
      await updateDoc(volunteerRef, {
        totalScore: (oldData.totalScore || 0) + points,
        cleanupCount: (oldData.cleanupCount || 0) + 1
      });
    } else {
      await setDoc(volunteerRef, {
        name: volunteer,
        totalScore: points,
        cleanupCount: 1
      });
    }

    alert("Marked as cleaned");
  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }
};

window.listenReports = function (map) {
  onSnapshot(collection(db, "reports"), (snapshot) => {
    reportMarkers.forEach(marker => {
      if (map.hasLayer(marker)) {
        map.removeLayer(marker);
      }
    });
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

      let actionHTML = "";

      if (data.status === "reported") {
        actionHTML = `
          <button class="popup-btn claim-btn" onclick="claimSpot('${docSnap.id}')">
            I Want to Volunteer
          </button>
        `;
      } else if (data.status === "in_progress") {
        actionHTML = `
          <label class="popup-label">Upload Cleanup Image</label>
          <input
            type="file"
            class="popup-input"
            accept="image/*"
            capture="environment"
          />
          <button class="popup-btn clean-btn" onclick="finishCleanup('${docSnap.id}', '${data.severity}', '${data.volunteer}')">
            Mark Cleaned
          </button>
        `;
      } else {
        actionHTML = `
          <p><strong>Volunteer:</strong> ${data.volunteer || "Not assigned"}</p>
          <p><strong>Points:</strong> ${data.pointsAwarded || 0}</p>
        `;
      }

      const marker = L.circleMarker([data.lat, data.lng], {
        color,
        radius: 9,
        fillOpacity: 0.9
      }).addTo(map);

      marker.bindPopup(`
        <div class="popup-title">Garbage Report</div>
        <div class="status-badge ${getStatusClass(data.status)}">
          ${getStatusText(data.status)}
        </div>

        <p><strong>Severity:</strong> ${data.severity}</p>
        <p><strong>Volunteer:</strong> ${data.volunteer || "Not assigned"}</p>

        <div class="before-after">
          <div>
            <p><strong>Before</strong></p>
            <img src="${data.beforeImageUrl || DUMMY_BEFORE}" class="report-img" />
          </div>
          <div>
            <p><strong>After</strong></p>
            <img src="${data.afterImageUrl || 'https://via.placeholder.com/150?text=Pending'}" class="report-img" />
          </div>
        </div>

        ${actionHTML}
      `);

      reportMarkers.push(marker);
    });

    document.getElementById("totalCount").innerText = total;
    document.getElementById("inProgressCount").innerText = inProgress;
    document.getElementById("cleanedCount").innerText = cleaned;
  });
};

window.listenLeaderboard = function () {
  const leaderboardRef = query(
    collection(db, "volunteers"),
    orderBy("totalScore", "desc"),
    limit(10)
  );

  onSnapshot(leaderboardRef, (snapshot) => {
    const container = document.getElementById("leaderboardList");
    if (!container) return;

    let html = "";

    if (snapshot.empty) {
      html = `<p class="small-note">No volunteers yet</p>`;
    } else {
      snapshot.forEach((docSnap, index) => {
        const data = docSnap.data();
        html += `
          <div class="leaderboard-item">
            <div>
              <strong>#${index + 1} ${data.name}</strong><br>
              <span>${data.cleanupCount || 0} cleanups</span>
            </div>
            <div>
              <strong>${data.totalScore || 0} pts</strong>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = html;
  });
};
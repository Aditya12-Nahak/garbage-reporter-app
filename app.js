var map = L.map('map').setView([20.5937, 78.9629], 5);
var tempMarker = null;

const translations = {
  en: {
    title: "Garbage Reporter",
    subtitle: "Report waste, volunteer for cleanup, and track progress live.",
    total: "Total Reports",
    progress: "In Progress",
    cleaned: "Cleaned",
    leaderboard: "Volunteer Leaderboard",
    selectedSpot: "Selected Spot",
    selectedNote: "Click any point on the map to open the report form.",
    reportGarbage: "Report Garbage",
    severity: "Severity",
    beforeImage: "Capture / Select Image",
    submitReport: "Submit Report"
  },
  hi: {
    title: "कचरा रिपोर्टर",
    subtitle: "कचरे की रिपोर्ट करें, सफाई के लिए स्वयंसेवा करें और प्रगति को लाइव देखें।",
    total: "कुल रिपोर्ट",
    progress: "प्रगति पर",
    cleaned: "साफ़ किया गया",
    leaderboard: "स्वयंसेवक लीडरबोर्ड",
    selectedSpot: "चयनित स्थान",
    selectedNote: "रिपोर्ट फ़ॉर्म खोलने के लिए मानचित्र पर किसी स्थान पर क्लिक करें।",
    reportGarbage: "कचरा रिपोर्ट करें",
    severity: "गंभीरता",
    beforeImage: "तस्वीर जोड़ें / कैमरा खोलें",
    submitReport: "रिपोर्ट जमा करें"
  }
};

window.t = function (key) {
  const lang = localStorage.getItem("lang") || "en";
  return translations[lang][key] || key;
};

function applyLanguage(lang) {
  const titleText = document.getElementById("titleText");
  const subtitleText = document.getElementById("subtitleText");
  const totalLabel = document.getElementById("totalLabel");
  const progressLabel = document.getElementById("progressLabel");
  const cleanedLabel = document.getElementById("cleanedLabel");
  const leaderboardTitle = document.getElementById("leaderboardTitle");
  const selectedSpotTitle = document.getElementById("selectedSpotTitle");
  const selectedNote = document.getElementById("selectedNote");

  if (titleText) titleText.innerText = translations[lang].title;
  if (subtitleText) subtitleText.innerText = translations[lang].subtitle;
  if (totalLabel) totalLabel.innerText = translations[lang].total;
  if (progressLabel) progressLabel.innerText = translations[lang].progress;
  if (cleanedLabel) cleanedLabel.innerText = translations[lang].cleaned;
  if (leaderboardTitle) leaderboardTitle.innerText = translations[lang].leaderboard;
  if (selectedSpotTitle) selectedSpotTitle.innerText = translations[lang].selectedSpot;
  if (selectedNote) selectedNote.innerText = translations[lang].selectedNote;
}

function initLanguage() {
  const select = document.getElementById("languageSelect");
  const savedLang = localStorage.getItem("lang") || "en";

  if (select) {
    select.value = savedLang;
    select.addEventListener("change", () => {
      localStorage.setItem("lang", select.value);
      applyLanguage(select.value);
    });
  }

  applyLanguage(savedLang);
}

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

window.addEventListener("load", () => {
  initLanguage();

  if (window.listenReports) window.listenReports(map);
  if (window.listenLeaderboard) window.listenLeaderboard();
});

map.on('click', function (e) {
  if (tempMarker) {
    map.removeLayer(tempMarker);
  }

  const selectedLat = document.getElementById("selectedLat");
  const selectedLng = document.getElementById("selectedLng");

  if (selectedLat) selectedLat.innerText = e.latlng.lat.toFixed(6);
  if (selectedLng) selectedLng.innerText = e.latlng.lng.toFixed(6);

  tempMarker = L.marker(e.latlng).addTo(map);

  tempMarker.bindPopup(`
    <div class="popup-title">${window.t("reportGarbage")}</div>

    <label class="popup-label">${window.t("severity")}</label>
    <select id="severity" class="popup-select">
      <option>Low</option>
      <option>Medium</option>
      <option>High</option>
    </select>

    <label class="popup-label">${window.t("beforeImage")}</label>
    <input
      type="file"
      id="beforeImageFile"
      class="popup-input"
      accept="image/*"
      capture="environment"
      onchange="previewSelectedImage(event, 'previewImage')"
    />

    <img id="previewImage" class="preview-img" style="display:none;" />

    <button class="popup-btn submit-btn" onclick="submitReport(${e.latlng.lat}, ${e.latlng.lng})">
      ${window.t("submitReport")}
    </button>
  `).openPopup();
});

window.previewSelectedImage = function (event, previewId) {
  const file = event.target.files[0];
  const preview = document.getElementById(previewId);

  if (!file || !preview) return;

  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
};
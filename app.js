var map = L.map('map').setView([20.5937, 78.9629], 5);
var tempMarker = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

window.addEventListener("load", () => {
  if (window.listenReports) window.listenReports(map);
  if (window.listenLeaderboard) window.listenLeaderboard();
});

map.on('click', function (e) {
  if (tempMarker) {
    map.removeLayer(tempMarker);
  }

  document.getElementById("selectedLat").innerText = e.latlng.lat.toFixed(6);
  document.getElementById("selectedLng").innerText = e.latlng.lng.toFixed(6);

  tempMarker = L.marker(e.latlng).addTo(map);

  tempMarker.bindPopup(`
    <div class="popup-title">Report Garbage</div>

    <label class="popup-label">Severity</label>
    <select id="severity" class="popup-select">
      <option>Low</option>
      <option>Medium</option>
      <option>High</option>
    </select>

    <label class="popup-label">Capture / Select Image</label>
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
      Submit Report
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
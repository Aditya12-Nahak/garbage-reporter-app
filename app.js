var map = L.map('map').setView([20.5937, 78.9629], 5);
var marker;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

window.addEventListener("load", () => {
  if (window.listenReports) {
    window.listenReports(map);
  }
});

map.on('click', function(e) {
  if (marker) {
    map.removeLayer(marker);
  }

  document.getElementById("selectedLat").innerText = e.latlng.lat.toFixed(6);
  document.getElementById("selectedLng").innerText = e.latlng.lng.toFixed(6);

  marker = L.marker(e.latlng).addTo(map);

  marker.bindPopup(`
    <div class="popup-title">Report Garbage</div>

    <label class="popup-label">Severity</label>
    <select id="severity" class="popup-select">
      <option>Low</option>
      <option>Medium</option>
      <option>High</option>
    </select>

    <label class="popup-label">Add Image</label>
    <input
      type="file"
      id="imageFile"
      class="popup-input"
      accept="image/*"
      capture="environment"
      onchange="previewSelectedImage(event)"
    />

    <img id="previewImage" class="preview-img" style="display:none;" />

    <button class="popup-btn submit-btn" onclick="submitReport(${e.latlng.lat}, ${e.latlng.lng})">
      Submit Report
    </button>
  `).openPopup();
});

window.previewSelectedImage = function(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("previewImage");

  if (!file || !preview) return;

  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
};
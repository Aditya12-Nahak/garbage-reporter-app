var map = L.map('map').setView([20.5937, 78.9629], 5);
var marker;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

setTimeout(() => {
  if (window.listenReports) {
    window.listenReports(map);
  }
}, 1000);

map.on('click', function(e) {
  if (marker) {
    map.removeLayer(marker);
  }

  marker = L.marker(e.latlng).addTo(map);

  marker.bindPopup(`
    <b>Report Garbage</b><br>
    Lat: ${e.latlng.lat}<br>
    Lng: ${e.latlng.lng}<br><br>

    <label>Severity:</label>
    <select id="severity">
      <option>Low</option>
      <option>Medium</option>
      <option>High</option>
    </select><br><br>

    <label>Add Image:</label>
    <input type="file" id="imageFile" accept="image/*" capture="environment" /><br><br>

    <button onclick="submitReport(${e.latlng.lat}, ${e.latlng.lng})">
      Submit
    </button>
  `).openPopup();
});
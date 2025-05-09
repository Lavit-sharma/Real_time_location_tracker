const socket = io();

const map = L.map("map").setView([0, 0], 25);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

const markers = {};

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Center your own location
      map.setView([lat, lon], 13);

      // Add your own marker
      if (!markers['me']) {
        markers['me'] = L.marker([lat, lon]).addTo(map).openPopup();
      } else {
        markers['me'].setLatLng([lat, lon]);
      }

      // Emit your location to the server
      socket.emit('location', { lat, lon });
    },
    function (error) {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 2000
    }
  );
}

socket.on('location', function (data) {
  const { lat, lon, id } = data;

  if (!id) return; // Avoid invalid data

  if (markers[id]) {
    markers[id].setLatLng([lat, lon]);
  } else {
    markers[id] = L.marker([lat, lon]).addTo(map).bindPopup(`User: ${id}`);
  }
});
socket.on('disconnect', function () {
  // Remove the marker when the user disconnects
  if (markers[socket.id]) {
    map.removeLayer(markers[socket.id]);
    delete markers[socket.id];
  }
});
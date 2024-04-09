/* eslint-disable */
export const displayMap = locations => {
  // Create Leaflet map on map element.
  const map = L.map('map', {
    zoomControl: false,
    scrollWheelZoom: false
  });

  // Add OSM tile layer to the Leaflet map.
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`
  }).addTo(map);

  const drawnItems = new L.featureGroup().addTo(map);

  // actual function to get the bounds of all markers

  locations.forEach(loc => {
    const icon = L.divIcon({ className: 'marker' });

    const popup = L.popup({
      maxWidth: 250,
      autoClose: false,
      closeOnClick: false
    });

    const marker = L.marker(loc.coordinates.reverse(), { icon: icon })
      .bindPopup(popup)
      .setPopupContent(`${loc.day}: ${loc.description}`)
      .on('add', function() {
        marker.openPopup();
      });

    drawnItems.addLayer(marker);
  });

  const bounds = new L.LatLngBounds();

  Object.values(drawnItems._layers).forEach(marker => {
    bounds.extend(marker.getLatLng());
  });

  map.fitBounds(bounds, { padding: [100, 100] });
};

import L from "leaflet";
import "leaflet/dist/leaflet.css";

const createMarker = (emoji, markerClass) =>
  L.divIcon({
    html: `
      <div class="custom-map-marker ${markerClass}">
        ${emoji}
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -40],
  });

/* =========================
   REPORT MARKERS
========================= */

export const redIcon = createMarker(
  "⚠️",
  "incident-high-marker"
);

export const orangeIcon = createMarker(
  "⚠️",
  "incident-medium-marker"
);

export const greenIcon = createMarker(
  "⚠️",
  "incident-low-marker"
);

export const blueIcon = createMarker(
  "📍",
  "default-marker"
);

/* =========================
   LOCATION MARKERS
========================= */

export const currentLocationIcon = createMarker(
  "📍",
  "current-location-marker"
);

export const selectedLocationIcon = createMarker(
  "📌",
  "selected-location-marker"
);

export const destinationIcon = createMarker(
  "🏁",
  "destination-marker"
);

/* =========================
   EMERGENCY SERVICE MARKERS
========================= */

export const policeIcon = createMarker(
  "🚓",
  "police-marker"
);

export const hospitalIcon = createMarker(
  "🏥",
  "hospital-marker"
);
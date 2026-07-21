import L from "leaflet";
import "leaflet/dist/leaflet.css";

const shadow =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

export const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const orangeIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const blueIcon = new L.Icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
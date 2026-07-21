import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";

const API_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

function PoliceStations({ center, onPoliceFound }) {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    if (!center) return;

    async function loadPolice() {
      try {
        const url =
          `https://api.geoapify.com/v2/places?categories=service.police&filter=circle:${center.lng},${center.lat},5000&limit=20&apiKey=${API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        const places = data.features || [];

        setStations(places);

        onPoliceFound?.(places.length);
      } catch (err) {
        console.log(err);
      }
    }

    loadPolice();
  }, [center]);

  return (
    <>
      {stations.map((station) => (
        <Marker
          key={station.properties.place_id}
          position={[
            station.geometry.coordinates[1],
            station.geometry.coordinates[0],
          ]}
        >
          <Popup>
            🚓 {station.properties.name || "Police Station"}
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default PoliceStations;
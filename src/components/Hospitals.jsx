import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";

const API_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

function Hospitals({ center, onHospitalFound }) {
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    if (!center) return;

    async function loadHospitals() {
      try {
        const url =
          `https://api.geoapify.com/v2/places?categories=healthcare.hospital&filter=circle:${center.lng},${center.lat},5000&limit=20&apiKey=${API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        const places = data.features || [];

        setHospitals(places);

        onHospitalFound?.(places.length);
      } catch (err) {
        console.log(err);
      }
    }

    loadHospitals();
  }, [center]);

  return (
    <>
      {hospitals.map((hospital) => (
        <Marker
          key={hospital.properties.place_id}
          position={[
            hospital.geometry.coordinates[1],
            hospital.geometry.coordinates[0],
          ]}
        >
          <Popup>
            🏥 {hospital.properties.name || "Hospital"}
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default Hospitals;
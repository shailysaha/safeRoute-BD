import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";

function Hospitals({ center, onHospitalFound }) {
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    // Reset state and count immediately when coordinates change
    setHospitals([]);
    onHospitalFound?.(0);

    const lat = Number(center?.lat);
    const lng = Number(center?.lng);

    // Validate coordinates
    if (!center || Number.isNaN(lat) || Number.isNaN(lng)) {
      return;
    }

    const controller = new AbortController();

    const fetchHospitals = async () => {
      try {
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="hospital"](around:3000,${lat},${lng});
            way["amenity"="hospital"](around:3000,${lat},${lng});
            relation["amenity"="hospital"](around:3000,${lat},${lng});

            node["amenity"="clinic"](around:3000,${lat},${lng});
            way["amenity"="clinic"](around:3000,${lat},${lng});
            relation["amenity"="clinic"](around:3000,${lat},${lng});
          );
          out center;
        `;

        const response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Hospital API failed: ${response.status}`);
        }

        const data = await response.json();

        const validHospitals = (data.elements || [])
          .map((hospital) => {
            const stLat = hospital.lat ?? hospital.center?.lat;
            const stLng = hospital.lon ?? hospital.center?.lon;

            return {
              id: hospital.id,
              lat: Number(stLat),
              lng: Number(stLng),
              name:
                hospital.tags?.name ||
                hospital.tags?.["name:en"] ||
                "Hospital",
            };
          })
          .filter(
            (hospital) =>
              !Number.isNaN(hospital.lat) &&
              !Number.isNaN(hospital.lng)
          );

        console.log("NEW HOSPITAL SEARCH:", {
          center: { lat, lng },
          count: validHospitals.length,
        });

        setHospitals(validHospitals);
        onHospitalFound?.(validHospitals.length);
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Hospital error:", error);
        setHospitals([]);
        onHospitalFound?.(0);
      }
    };

    fetchHospitals();

    return () => {
      controller.abort();
    };
  }, [center?.lat, center?.lng, onHospitalFound]);

  return (
    <>
      {hospitals.map((hospital) => (
        <Marker
          key={`hospital-${hospital.id}`}
          position={[hospital.lat, hospital.lng]}
        >
          <Popup>
            🏥 <strong>{hospital.name}</strong>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

export default Hospitals;
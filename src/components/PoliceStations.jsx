import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import { policeIcon } from "../utils/markerIcons";
function PoliceStations({ center, onPoliceFound }) {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    // Reset state and count immediately when coordinates change
    setStations([]);
    onPoliceFound?.(0);

    const lat = Number(center?.lat);
    const lng = Number(center?.lng);

    // Validate coordinates
    if (!center || Number.isNaN(lat) || Number.isNaN(lng)) {
      return;
    }

    const controller = new AbortController();

    const fetchPoliceStations = async () => {
      try {
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="police"](around:3000,${lat},${lng});
            way["amenity"="police"](around:3000,${lat},${lng});
            relation["amenity"="police"](around:3000,${lat},${lng});
          );
          out center;
        `;

        const response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Police API failed: ${response.status}`);
        }

        const data = await response.json();

        const validStations = (data.elements || [])
          .map((station) => {
            const stLat = station.lat ?? station.center?.lat;
            const stLng = station.lon ?? station.center?.lon;

            return {
              id: station.id,
              lat: Number(stLat),
              lng: Number(stLng),
              name:
                station.tags?.name ||
                station.tags?.["name:en"] ||
                "Police Station",
            };
          })
          .filter(
            (station) =>
              !Number.isNaN(station.lat) &&
              !Number.isNaN(station.lng)
          );

        console.log("NEW POLICE SEARCH:", {
          center: { lat, lng },
          count: validStations.length,
        });

        setStations(validStations);
        onPoliceFound?.(validStations.length);
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Police station error:", error);
        setStations([]);
        onPoliceFound?.(0);
      }
    };

    fetchPoliceStations();

    return () => {
      controller.abort();
    };
  }, [center?.lat, center?.lng, onPoliceFound]);

  return (
    <>
      {stations.map((station) => (
        <Marker
  position={[
    Number(station.lat),
    Number(station.lng),
  ]}
  icon={policeIcon}
>
  <Popup>
    <strong>🚓 Police Station</strong>
    <br />
    {station.name || "Police Station"}
     </Popup>
     </Marker>
      ))}
    </>
  );
}

export default PoliceStations;
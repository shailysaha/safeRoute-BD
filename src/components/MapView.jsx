import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import RouteMachine from "./RouteMachine";
import PoliceStations from "./PoliceStations";
import Hospitals from "./Hospitals";

function MapUpdater({
  currentLocation,
  selectedLocation,
  destination,
}) {
  const map = useMap();

  const targetLocation =
    destination || selectedLocation || currentLocation;

  const lat = Number(targetLocation?.lat);
  const lng = Number(targetLocation?.lng);

  useEffect(() => {
    if (
      targetLocation &&
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {
      map.flyTo([lat, lng], 15, {
        duration: 1.5,
      });
    }
  }, [lat, lng, map, targetLocation]);

  return null;
}

function MapView({
  currentLocation,
  destination,
  selectedLocation,
  setDistance,
  setDuration,
  onPoliceFound,
  onHospitalFound,
  onRouteCalculated,
}) {
  const defaultCenter = [23.8103, 90.4125];

  const nearbyCenter =
    destination || selectedLocation || currentLocation;

  const isValidCoord = (location) => {
    if (!location) {
      return false;
    }

    const lat = Number(location.lat);
    const lng = Number(location.lng);

    return Number.isFinite(lat) && Number.isFinite(lng);
  };

  const nearbyLat = Number(nearbyCenter?.lat);
  const nearbyLng = Number(nearbyCenter?.lng);

  // A new key is generated whenever the search coordinates change.
  // React will remount the nearby components and run fresh API calls.
  const nearbyKey = isValidCoord(nearbyCenter)
    ? `${nearbyLat.toFixed(6)}-${nearbyLng.toFixed(6)}`
    : "no-center";

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater
        currentLocation={currentLocation}
        selectedLocation={selectedLocation}
        destination={destination}
      />

      {isValidCoord(currentLocation) && (
        <Marker
          position={[
            Number(currentLocation.lat),
            Number(currentLocation.lng),
          ]}
        >
          <Popup>📍 Your Current Location</Popup>
        </Marker>
      )}

      {isValidCoord(selectedLocation) && !destination && (
        <Marker
          position={[
            Number(selectedLocation.lat),
            Number(selectedLocation.lng),
          ]}
        >
          <Popup>
            🎯{" "}
            {selectedLocation.name ||
              "Selected Location"}
          </Popup>
        </Marker>
      )}

      {isValidCoord(destination) && (
        <Marker
          position={[
            Number(destination.lat),
            Number(destination.lng),
          ]}
        >
          <Popup>
            🏁 {destination.name || "Destination"}
          </Popup>
        </Marker>
      )}

      {isValidCoord(currentLocation) &&
        isValidCoord(destination) && (
          <RouteMachine
            currentLocation={currentLocation}
            destination={destination}
            setDistance={setDistance}
            setDuration={setDuration}
            onRouteCalculated={onRouteCalculated}
          />
        )}

      {isValidCoord(nearbyCenter) && (
        <>
          <PoliceStations
            key={`police-${nearbyKey}`}
            center={{
              lat: nearbyLat,
              lng: nearbyLng,
            }}
            onPoliceFound={onPoliceFound}
          />

          <Hospitals
            key={`hospital-${nearbyKey}`}
            center={{
              lat: nearbyLat,
              lng: nearbyLng,
            }}
            onHospitalFound={onHospitalFound}
          />
        </>
      )}
    </MapContainer>
  );
}

export default MapView;
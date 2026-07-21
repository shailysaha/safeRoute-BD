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
}) {
  const map = useMap();

  // Safer version preventing flyTo crashes on invalid coordinates
  useEffect(() => {
    if (
      selectedLocation &&
      !isNaN(Number(selectedLocation.lat)) &&
      !isNaN(Number(selectedLocation.lng))
    ) {
      map.flyTo(
        [
          Number(selectedLocation.lat),
          Number(selectedLocation.lng),
        ],
        16,
        {
          duration: 1.5,
        }
      );
      return;
    }

    if (
      currentLocation &&
      !isNaN(Number(currentLocation.lat)) &&
      !isNaN(Number(currentLocation.lng))
    ) {
      map.flyTo(
        [
          Number(currentLocation.lat),
          Number(currentLocation.lng),
        ],
        16,
        {
          duration: 1.5,
        }
      );
    }
  }, [selectedLocation, currentLocation, map]);

  return null;
}

function MapView({
  currentLocation,
  destination,
  selectedLocation,
  onRouteFound,
  onPoliceFound,
  onHospitalFound,
}) {
  return (
    <MapContainer
      center={[23.8103, 90.4125]}
      zoom={7}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <MapUpdater
        currentLocation={currentLocation}
        selectedLocation={selectedLocation}
      />


      <PoliceStations
        center={currentLocation}
        onPoliceFound={onPoliceFound}
      />

      <Hospitals
        center={currentLocation}
        onHospitalFound={onHospitalFound}
      />

      {currentLocation && 
      !isNaN(Number(currentLocation.lat)) &&
      !isNaN(Number(currentLocation.lng)) &&(
        <Marker
          position={[
            Number(currentLocation.lat),
            Number(currentLocation.lng),
          ]}
        >
          <Popup>
            📍 Your Current Location
          </Popup>
        </Marker>
      )}

      {selectedLocation && 
       !isNaN(Number(selectedLocation.lat)) &&
       !isNaN(Number(selectedLocation.lng)) &&(
        <Marker
          position={[
            Number(selectedLocation.lat),
            Number(selectedLocation.lng),
          ]}
        >
          <Popup>
            📍 {selectedLocation.name}
          </Popup>
        </Marker>
      )}

      {currentLocation && destination && (
        <RouteMachine
          start={currentLocation}
          end={destination}
          onRouteFound={onRouteFound}
        />
      )}
    </MapContainer>
  );
}

export default MapView;
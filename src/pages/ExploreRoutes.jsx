import { useState } from "react";
import "./ExploreRoutes.css";

import RoutePlanner from "../components/RoutePlanner";
import MapView from "../components/MapView";
import SearchLocation from "../components/SearchLocation";

function ExploreRoutes() {
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [safetyScore, setSafetyScore] = useState(100);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // State trackers for infrastructure counts
  const [policeCount, setPoliceCount] = useState(0);
  const [hospitalCount, setHospitalCount] = useState(0);

  // Geocodes manual target text input strings via Nominatim
  const handleFindRoute = async (destinationText, mode) => {
    if (!destinationText.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          destinationText
        )}`
      );
      const data = await response.json();

      if (!data.length) {
        alert("Destination not found.");
        return;
      }

      // FIX 1: Changed data[0].lng to data[0].lon to match Nominatim API payload
      const targetPlace = {
        lat: Number(data[0].lat),
        lng: Number(data[0].lon), 
        name: data[0].display_name,
      };

      // Added debug tracker as requested
      console.log("Destination", targetPlace);

      setDestination(targetPlace);
      setSelectedLocation(targetPlace);
    } catch (error) {
      console.error(error);
      alert("Unable to find destination.");
    }
  };

  const handleRouteFound = (calculatedDistance, calculatedTime) => {
    setDistance(calculatedDistance);
    setDuration(calculatedTime);

    const score = Math.floor(Math.random() * 15) + 85;
    setSafetyScore(score);
  };

  return (
    <div className="explore-page">
      {/* Left Panel */}
      <div className="planner-panel">
        
        {/* Updated Search Location Component */}
        {/* FIX 2: Removed rebuilding the object with broken display_name strings */}
        <SearchLocation
          onLocationSelect={(location) => {
            console.log("Selected Place from Search:", location);
            
            // Pass the clean pre-formatted object directly 
            setSelectedLocation(location);
            setDestination(location);
          }}
        />

        <hr style={{ margin: "20px 0" }} />

        <RoutePlanner
          onFindRoute={handleFindRoute}
          onGetLocation={setCurrentLocation}
          distance={distance}
          duration={duration}
          safetyScore={safetyScore}
        />

        <div className="route-info" style={{ marginTop: "20px", padding: "15px", background: "#f3f4f6", borderRadius: "8px" }}>
          <h2>Route Information</h2>
          <p>📏 Distance: {distance || "--"} km</p>
          <p>⏱ Time: {duration || "--"} min</p>
          <p>🛡 Safety Score: {safetyScore}%</p>
          <hr />
          <h3>Nearby</h3>
          <p>🚨 Police : {policeCount}</p>
          <p>🏥 Hospitals : {hospitalCount}</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="map-panel">
        <MapView
          currentLocation={currentLocation}
          destination={destination}
          selectedLocation={selectedLocation}
          onRouteFound={handleRouteFound}
          onPoliceFound={setPoliceCount}
          onHospitalFound={setHospitalCount}
        />
      </div>
    </div>
  );
}

export default ExploreRoutes;
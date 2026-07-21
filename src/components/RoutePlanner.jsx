import { useState } from "react";
import "./RoutePlanner.css";

// Fixed: Added distance, duration, and safetyScore to props so the component can render them
function RoutePlanner({ onFindRoute, onGetLocation, distance, duration, safetyScore }) {
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState("car");

  const handleSubmit = () => {
    if (!destination.trim()) {
      alert("Please enter a destination.");
      return;
    }

    onFindRoute(destination, mode);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        console.log("Current Location:", location);
        if (onGetLocation) {
          onGetLocation(location);
        }
      },
      (error) => {
        console.error(error);
        alert("Unable to get your location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <div className="route-card">
      <h2>🧭 Route Planner</h2>

      <div className="route-group">
        <label>From</label>
        <button
          className="location-btn"
          onClick={getCurrentLocation}
        >
          📍 Use Current Location
        </button>
      </div>

      {/* Fixed: Displays data seamlessly without crashing since they are now passed via props */}
      <div className="route-info">
        <h3>Route Information</h3>
        <p>📏 Distance: {distance || "--"} km</p>
        <p>⏱ Time: {duration || "--"} min</p>
        <p>🛡 Safety Score: {safetyScore !== undefined ? `${safetyScore}%` : "--"}</p>
      </div>

      <div className="route-group">
        <label>Destination</label>
        <input
          type="text"
          placeholder="Example: Dhaka University"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>

      <div className="route-group">
        <label>Travel Mode</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="car">🚗 Car</option>
          <option value="walk">🚶 Walk</option>
          <option value="bike">🚲 Bike</option>
        </select>
      </div>

      <button
        className="route-search-btn"
        onClick={handleSubmit}
      >
        Find Safest Route
      </button>
    </div>
  );
}

export default RoutePlanner;
import { useState } from "react";
import "./RoutePlanner.css";

function RoutePlanner({
  onFindRoute,
  onGetLocation,
  distance,
  duration,
  safetyScore,
  policeCount = 0,
  hospitalCount = 0,
}) {
  const [destination, setDestination] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [error, setError] = useState("");

  const searchLocation = async (text) => {
    setDestination(text);
    setSelectedDestination(null);
    setError("");

    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `format=jsonv2&` +
          `countrycodes=bd&` +
          `addressdetails=1&` +
          `limit=10&` +
          `q=${encodeURIComponent(text)}`
      );

      if (!response.ok) {
        throw new Error("Location search failed");
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (searchError) {
      console.error(searchError);
      setSuggestions([]);
      setError("Unable to search locations right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDestination = (place) => {
    const selectedPlace = {
      lat: Number(place.lat),
      lng: Number(place.lon),
      name: place.display_name,
    };

    if (
      Number.isNaN(selectedPlace.lat) ||
      Number.isNaN(selectedPlace.lng)
    ) {
      setError("Invalid location coordinates.");
      return;
    }

    setDestination(place.display_name);
    setSelectedDestination(selectedPlace);
    setSuggestions([]);
    setError("");

    // Triggers route lookup in parent (which resets old counts to 0)
    onFindRoute(selectedPlace);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        onGetLocation(location);
        setError("");
      },
      (locationError) => {
        console.error(locationError);
        setError("Could not access your current location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleFindRoute = () => {
    if (!selectedDestination) {
      setError("Select a destination from the suggestion list.");
      return;
    }

    onFindRoute(selectedDestination);
  };

  const formattedDistance =
    distance !== "" && distance !== null
      ? Number(distance).toFixed(2)
      : "--";

  const formattedDuration =
    duration !== "" && duration !== null
      ? Math.round(Number(duration))
      : "--";

  const formattedSafety =
    safetyScore !== null && safetyScore !== undefined
      ? Math.round(Number(safetyScore))
      : "--";

  return (
    <aside className="route-sidebar">
      <section className="planner-section">
        <div className="section-heading">
          <span className="section-icon">🧭</span>

          <div>
            <h2>Route Planner</h2>
            <p>Choose your starting point and destination</p>
          </div>
        </div>

        <div className="route-field">
          <label>Starting point</label>

          <button
            type="button"
            className="location-button"
            onClick={handleCurrentLocation}
          >
            <span>📍</span>
            Use Current Location
          </button>
        </div>

        <div className="route-field destination-field">
          <label htmlFor="destination">Destination</label>

          <div className="destination-input-wrapper">
            <span className="input-icon">🔎</span>

            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(event) => searchLocation(event.target.value)}
              placeholder="Search a place in Bangladesh"
              autoComplete="off"
            />
          </div>

          {loading && (
            <div className="search-status">
              Searching locations...
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div className="destination-suggestions">
              {suggestions.map((place) => (
                <button
                  type="button"
                  className="destination-suggestion"
                  key={place.place_id}
                  onClick={() => handleSelectDestination(place)}
                >
                  <span className="suggestion-pin">📍</span>

                  <span className="suggestion-text">
                    <strong>
                      {place.name ||
                        place.display_name.split(",")[0]}
                    </strong>

                    <small>{place.display_name}</small>
                  </span>
                </button>
              ))}
            </div>
          )}

          {error && <p className="route-error">{error}</p>}
        </div>

        <button
          type="button"
          className="find-route-button"
          onClick={handleFindRoute}
          disabled={!selectedDestination}
        >
          Find Safe Route
        </button>
      </section>

      <section className="route-summary-section">
        <div className="summary-heading">
          <div>
            <h3>Route Information</h3>
            <p>Live route details</p>
          </div>

          <span className="live-badge">LIVE</span>
        </div>

        <div className="route-summary-grid">
          <div className="summary-card">
            <span className="summary-icon">🛣️</span>

            <div>
              <small>Distance</small>
              <strong>{formattedDistance} km</strong>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-icon">⏱️</span>

            <div>
              <small>Duration</small>
              <strong>{formattedDuration} min</strong>
            </div>
          </div>
        </div>

        <div className="safety-card">
          <div className="safety-card-top">
            <div>
              <small>Safety score</small>
              <strong>{formattedSafety}%</strong>
            </div>

            <span className="shield-icon">🛡️</span>
          </div>

          <div className="safety-progress">
            <div
              className="safety-progress-fill"
              style={{
                width:
                  formattedSafety === "--"
                    ? "0%"
                    : `${Math.max(
                        0,
                        Math.min(100, formattedSafety)
                      )}%`,
              }}
            />
          </div>

          <p>
            {formattedSafety === "--"
              ? "Select a destination to calculate safety."
              : formattedSafety >= 80
              ? "This route currently appears relatively safe."
              : formattedSafety >= 50
              ? "Use additional caution on this route."
              : "High caution is recommended on this route."}
          </p>
        </div>
      </section>

      <section className="nearby-section">
        <div className="section-title-row">
          <div>
            <h3>Nearby Services</h3>
            <p>Emergency support around the route</p>
          </div>
        </div>

        <div className="nearby-grid">
          <div className="nearby-card">
            <span className="nearby-icon">🚨</span>

            <div>
              <strong>{policeCount}</strong>
              <small>Police stations</small>
            </div>
          </div>

          <div className="nearby-card">
            <span className="nearby-icon">🏥</span>

            <div>
              <strong>{hospitalCount}</strong>
              <small>Hospitals</small>
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}

export default RoutePlanner;
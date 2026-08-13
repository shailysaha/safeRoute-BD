import { useState, useEffect, useRef } from "react";
import RouteAlerts from "./RouteAlerts";
import "./RoutePlanner.css";

function RoutePlanner({
  onFindRoute,
  distance,
  duration,
  safetyScore,
  policeCount = 0,
  hospitalCount = 0,
  routeAlerts = [],
  currentLocation,
  startMode,
}) {
  const [destination, setDestination] = useState("");
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [error, setError] = useState("");

  const dropdownRef = useRef(null);

  // Close suggestions when clicking outside the input area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search with AbortController to handle rapid typing & race conditions
  useEffect(() => {
    const cleanText = searchText.trim();

    if (cleanText.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const url =
          "https://nominatim.openstreetmap.org/search?" +
          `format=jsonv2&` +
          `countrycodes=bd&` +
          `addressdetails=1&` +
          `limit=10&` +
          `q=${encodeURIComponent(cleanText)}`;

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "User-Agent": "SafeRoutePlannerBDApp/1.0",
          },
        });

        if (!response.ok) {
          throw new Error(`Search failed with HTTP status ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          setSuggestions([]);
          setError("No matching location found in Bangladesh.");
        } else {
          setSuggestions(data);
          setError("");
        }
      } catch (searchError) {
        if (searchError.name !== "AbortError") {
          console.error("Location search error:", searchError);
          setSuggestions([]);
          setError("Location service is temporarily unavailable. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchText]);

  const handleSelectDestination = (place) => {
    const selectedPlace = {
      lat: Number(place.lat),
      lng: Number(place.lon),
      name: place.display_name,
    };

    if (
      !Number.isFinite(selectedPlace.lat) ||
      !Number.isFinite(selectedPlace.lng)
    ) {
      setError("Invalid location coordinates.");
      return;
    }

    setDestination(place.display_name);
    setSelectedDestination(selectedPlace);
    setSearchText("");
    setSuggestions([]);
    setError("");
  };

  const handleFindRoute = () => {
    if (!currentLocation) {
      setError(
        startMode === "current"
          ? "Please use your current location first."
          : "Please choose a starting location first."
      );
      return;
    }

    if (!selectedDestination) {
      setError("Please select a destination from the suggestion list.");
      return;
    }

    setError("");
    onFindRoute(selectedDestination);
  };

  const formattedDistance =
    distance !== "" && distance !== null && distance !== undefined
      ? Number(distance).toFixed(2)
      : "--";

  const formattedDuration =
    duration !== "" && duration !== null && duration !== undefined
      ? Math.round(Number(duration))
      : "--";

  const formattedSafety =
    safetyScore !== null && safetyScore !== undefined && safetyScore !== ""
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

        <div className="route-field destination-field" ref={dropdownRef}>
          <label htmlFor="destination">Destination</label>

          <div className="destination-input-wrapper">
            <span className="input-icon">🔎</span>

            <input
              id="destination"
              type="text"
              value={destination}
              onChange={(event) => {
                const val = event.target.value;
                setDestination(val);
                setSearchText(val);
                setSelectedDestination(null);
                setError("");
              }}
              placeholder="Search a place in Bangladesh"
              autoComplete="off"
            />
          </div>

          {loading && (
            <div className="search-status">Searching locations...</div>
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
                      {place.name || place.display_name.split(",")[0]}
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
          disabled={!selectedDestination || !currentLocation}
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
                        Math.min(100, Number(formattedSafety))
                      )}%`,
              }}
            />
          </div>

          <p>
            {formattedSafety === "--"
              ? "Select a destination to calculate safety."
              : Number(formattedSafety) >= 80
              ? "This route currently appears relatively safe."
              : Number(formattedSafety) >= 50
              ? "Use additional caution on this route."
              : "High caution is recommended on this route."}
          </p>
        </div>

        {/* Displays safety warnings and incident alerts along the calculated route */}
        <RouteAlerts alerts={routeAlerts || []} />
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
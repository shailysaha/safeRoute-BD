import { useState, useCallback, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { analyzeRouteSafety } from "../utils/routeSafety";

import "./ExploreRoutes.css";

import RoutePlanner from "../components/RoutePlanner";
import MapView from "../components/MapView";
import SearchLocation from "../components/SearchLocation";

function ExploreRoutes() {
  /* =========================================
     ROUTE INFORMATION
  ========================================= */
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [safetyScore, setSafetyScore] = useState(100);

  /* =========================================
     LOCATION STATES
  ========================================= */
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  /* =========================================
     STARTING LOCATION MODE
     "current" = GPS
     "search"  = manually selected location
  ========================================= */
  const [startMode, setStartMode] = useState("current");
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  /* =========================================
     NEARBY SERVICES
  ========================================= */
  const [policeCount, setPoliceCount] = useState(0);
  const [hospitalCount, setHospitalCount] = useState(0);

  /* =========================================
     COMMUNITY REPORTS
  ========================================= */
  const [communityReports, setCommunityReports] = useState([]);
  const [routeAlerts, setRouteAlerts] = useState([]);

  /* =========================================
     LOAD COMMUNITY REPORTS
  ========================================= */
  useEffect(() => {
    const loadCommunityReports = async () => {
      try {
        const snapshot = await getDocs(collection(db, "reports"));
        const reportData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));
        setCommunityReports(reportData);
      } catch (error) {
        console.error("Report loading failed:", error);
      }
    };

    loadCommunityReports();
  }, []);

  /* =========================================
     SAFETY SCORE
  ========================================= */
  const calculateSafetyScore = useCallback(
    ({ routeCoordinates }) => {
      if (!routeCoordinates || routeCoordinates.length === 0) {
        setSafetyScore(100);
        setRouteAlerts([]);
        return;
      }

      const analysis = analyzeRouteSafety(
        routeCoordinates,
        communityReports
      );

      setSafetyScore(analysis.safetyScore);
      setRouteAlerts(analysis.routeAlerts);
    },
    [communityReports]
  );

  /* =========================================
     RESET PREVIOUS ROUTE INFORMATION
  ========================================= */
  const resetRouteInformation = useCallback(() => {
    setDistance("");
    setDuration("");
    setSafetyScore(100);
    setRouteAlerts([]);
    setPoliceCount(0);
    setHospitalCount(0);
  }, []);

  /* =========================================
     NORMALIZE LOCATION OBJECT
  ========================================= */
  const normalizeLocation = (
    location,
    fallbackName = "Selected location"
  ) => {
    if (!location) return null;

    const lat = Number(location.lat);
    const lng = Number(location.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    return {
      lat,
      lng,
      name:
        location.name ||
        location.display_name ||
        fallbackName,
      area: location.area || "",
      district: location.district || "",
    };
  };

  /* =========================================
     DESTINATION (Called from RoutePlanner)
  ========================================= */
  const handleFindRoute = (selectedPlace) => {
    const destinationData = normalizeLocation(
      selectedPlace,
      "Selected destination"
    );

    if (!destinationData) {
      console.error("Invalid selected destination:", selectedPlace);
      return;
    }

    if (!currentLocation) {
      alert(
        startMode === "current"
          ? "Please select your current location first."
          : "Please choose a starting location first."
      );
      return;
    }

    resetRouteInformation();
    console.log("NEW DESTINATION:", destinationData);

    setDestination(destinationData);
    setSelectedLocation(destinationData);
  };

  /* =========================================
     MANUAL START LOCATION SEARCH
  ========================================= */
  const handleStartLocationSelect = (location) => {
    const locationData = normalizeLocation(
      location,
      "Selected starting location"
    );

    if (!locationData) {
      console.error("Invalid starting location:", location);
      return;
    }

    resetRouteInformation();
    setLocationError("");
    setCurrentLocation(locationData);
    setStartMode("search");

    console.log("MANUAL START LOCATION:", locationData);
  };

  /* =========================================
     GPS LOCATION RESULT
  ========================================= */
  const handleCurrentLocation = (location) => {
    const currentLocationData = normalizeLocation(
      location,
      "Current location"
    );

    if (!currentLocationData) {
      console.error("Invalid current location:", location);
      return;
    }

    resetRouteInformation();
    setLocationError("");
    setCurrentLocation(currentLocationData);
    setStartMode("current");

    console.log("GPS START LOCATION:", currentLocationData);
  };

  /* =========================================
     REQUEST GPS DIRECTLY
  ========================================= */
  const useMyCurrentLocation = () => {
    setStartMode("current");
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: "My Current Location",
        };

        handleCurrentLocation(location);
        setLocationLoading(false);
      },
      (error) => {
        console.error("Location error:", error);
        setLocationLoading(false);
        setLocationError(
          "Unable to access your current location. Please allow location permission."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  /* =========================================
     SWITCH TO MANUAL SEARCH MODE
  ========================================= */
  const useManualStartLocation = () => {
    resetRouteInformation();
    setStartMode("search");
    setCurrentLocation(null);
    setLocationError("");
  };

  /* =========================================
     POLICE COUNT
  ========================================= */
  const handlePoliceFound = useCallback((count) => {
    const numericCount = Number(count);
    setPoliceCount(
      Number.isFinite(numericCount)
        ? Math.max(0, Math.round(numericCount))
        : 0
    );
  }, []);

  /* =========================================
     HOSPITAL COUNT
  ========================================= */
  const handleHospitalFound = useCallback((count) => {
    const numericCount = Number(count);
    setHospitalCount(
      Number.isFinite(numericCount)
        ? Math.max(0, Math.round(numericCount))
        : 0
    );
  }, []);

  return (
    <div className="explore-page">
      {/* =================================
          LEFT PANEL
      ================================= */}
      <aside className="planner-panel">
        {/* STARTING POINT SELECTOR */}
        <section className="start-location-card">
          <div className="start-location-heading">
            <div>
              <span className="start-label">ROUTE START</span>
              <h3>Starting Point</h3>
              <p>
                Use your GPS location or choose anywhere in Bangladesh.
              </p>
            </div>
            <div className="start-location-icon">📍</div>
          </div>

          {/* MODE BUTTONS */}
          <div className="start-mode-tabs">
            <button
              type="button"
              className={`start-mode-button ${
                startMode === "current" ? "start-mode-active" : ""
              }`}
              onClick={useMyCurrentLocation}
            >
              <span>📍</span>
              <div>
                <strong>My Location</strong>
                <small>Use GPS</small>
              </div>
            </button>

            <button
              type="button"
              className={`start-mode-button ${
                startMode === "search" ? "start-mode-active" : ""
              }`}
              onClick={useManualStartLocation}
            >
              <span>🔎</span>
              <div>
                <strong>Choose Location</strong>
                <small>Search Bangladesh</small>
              </div>
            </button>
          </div>

          {/* GPS MODE */}
          {startMode === "current" && (
            <div className="start-mode-content">
              {locationLoading ? (
                <div className="location-loading">
                  <span className="location-spinner" />
                  Detecting your location...
                </div>
              ) : currentLocation ? (
                <div className="selected-start-box">
                  <span className="selected-start-pin">📍</span>
                  <div>
                    <small>Starting from</small>
                    <strong>My Current Location</strong>
                    <span>
                      {Number(currentLocation.lat).toFixed(5)},{" "}
                      {Number(currentLocation.lng).toFixed(5)}
                    </span>
                  </div>
                  <span className="selected-check">✓</span>
                </div>
              ) : (
                <button
                  type="button"
                  className="detect-location-button"
                  onClick={useMyCurrentLocation}
                >
                  📍 Detect My Current Location
                </button>
              )}
            </div>
          )}

          {/* MANUAL MODE */}
          {startMode === "search" && (
            <div className="start-mode-content">
              <div className="manual-search-title">
                <strong>Search starting location</strong>
                <small>Search anywhere in Bangladesh</small>
              </div>

              <SearchLocation
                onLocationSelect={handleStartLocationSelect}
              />

              {currentLocation && (
                <div className="selected-start-box manual-selected">
                  <span className="selected-start-pin">📍</span>
                  <div>
                    <small>Starting from</small>
                    <strong>{currentLocation.name}</strong>
                  </div>
                  <span className="selected-check">✓</span>
                </div>
              )}
            </div>
          )}

          {locationError && (
            <p className="start-location-error">⚠ {locationError}</p>
          )}
        </section>

        {/* ===============================
            DESTINATION + ROUTE INFORMATION
        =============================== */}
        <RoutePlanner
          onFindRoute={handleFindRoute}
          onGetLocation={handleCurrentLocation}
          distance={distance}
          duration={duration}
          safetyScore={safetyScore}
          routeAlerts={routeAlerts}
          policeCount={policeCount}
          hospitalCount={hospitalCount}
          currentLocation={currentLocation}
          startMode={startMode}
        />
      </aside>

      {/* =================================
          MAP
      ================================= */}
      <main className="map-panel">
        <MapView
          currentLocation={currentLocation}
          destination={destination}
          selectedLocation={selectedLocation}
          setDistance={setDistance}
          setDuration={setDuration}
          onPoliceFound={handlePoliceFound}
          onHospitalFound={handleHospitalFound}
          onRouteCalculated={calculateSafetyScore}
        />
      </main>
    </div>
  );
}

export default ExploreRoutes;
import { useState, useCallback } from "react";
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

  const [policeCount, setPoliceCount] = useState(0);
  const [hospitalCount, setHospitalCount] = useState(0);

  // Memoized safety score calculator
  const calculateSafetyScore = useCallback((route) => {
    if (!route?.summary) {
      setSafetyScore(100);
      return;
    }

    const routeDistanceKm = Number(route.summary.totalDistance) / 1000;
    const routeDurationMinutes = Number(route.summary.totalTime) / 60;

    let score = 100;

    if (routeDistanceKm > 10) score -= 5;
    if (routeDistanceKm > 25) score -= 5;
    if (routeDurationMinutes > 45) score -= 5;
    if (routeDurationMinutes > 90) score -= 5;

    setSafetyScore(Math.max(0, Math.min(100, Math.round(score))));
  }, []);

  const resetRouteInformation = () => {
    setDistance("");
    setDuration("");
    setSafetyScore(100);
    setPoliceCount(0);
    setHospitalCount(0);
  };

  const normalizeLocation = (
    location,
    fallbackName = "Selected location"
  ) => {
    if (!location) return null;

    const lat = Number(location.lat);
    const lng = Number(location.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return {
      lat,
      lng,
      name: location.name || location.display_name || fallbackName,
    };
  };

  const handleFindRoute = (selectedPlace) => {
    if (
      !selectedPlace ||
      !Number.isFinite(Number(selectedPlace.lat)) ||
      !Number.isFinite(Number(selectedPlace.lng))
    ) {
      console.error("Invalid selected destination:", selectedPlace);
      return;
    }

    setDistance("");
    setDuration("");
    setSafetyScore(100);

    setPoliceCount(0);
    setHospitalCount(0);

    const destinationData = {
      lat: Number(selectedPlace.lat),
      lng: Number(selectedPlace.lng),
      name:
        selectedPlace.name ||
        selectedPlace.display_name ||
        "Selected destination",
    };

    console.log("NEW DESTINATION:", destinationData);

    setDestination(destinationData);
    setSelectedLocation(destinationData);
  };

  const handleSearchLocationSelect = (location) => {
    const locationData = normalizeLocation(
      location,
      "Selected location"
    );

    if (!locationData) {
      console.error(
        "Invalid location selected from search:",
        location
      );
      return;
    }

    setDistance("");
    setDuration("");
    setSafetyScore(100);

    setPoliceCount(0);
    setHospitalCount(0);

    console.log("Selected place from search:", locationData);

    setSelectedLocation(locationData);
    setDestination(locationData);
  };

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
    setCurrentLocation(currentLocationData);
  };

  // Stabilized callbacks prevent child useEffect dependency loops
  const handlePoliceFound = useCallback((count) => {
    const numericCount = Number(count);
    console.log("Police count received:", numericCount);

    setPoliceCount(
      Number.isFinite(numericCount)
        ? Math.max(0, Math.round(numericCount))
        : 0
    );
  }, []);

  const handleHospitalFound = useCallback((count) => {
    const numericCount = Number(count);
    console.log("Hospital count received:", numericCount);

    setHospitalCount(
      Number.isFinite(numericCount)
        ? Math.max(0, Math.round(numericCount))
        : 0
    );
  }, []);

  return (
    <div className="explore-page">
      <aside className="planner-panel">
        <div className="top-location-search">
          <SearchLocation
            onLocationSelect={handleSearchLocationSelect}
          />
        </div>

        <RoutePlanner
          onFindRoute={handleFindRoute}
          onGetLocation={handleCurrentLocation}
          distance={distance}
          duration={duration}
          safetyScore={safetyScore}
          policeCount={policeCount}
          hospitalCount={hospitalCount}
        />
      </aside>

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
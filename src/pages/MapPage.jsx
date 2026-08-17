import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

import DashboardLayout from "../layout/DashboardLayout";
import SOSButton from "../components/SOSButton";
import PoliceStations from "../components/PoliceStations";
import Hospitals from "../components/Hospitals";
import ReportSidebar from "../components/ReportSidebar";
import MyLocationButton from "../components/MyLocationButton";

import "./MapPage.css";
import "../components/SOSButton.css";

import {
  redIcon,
  orangeIcon,
  greenIcon,
  blueIcon,
} from "../utils/markerIcons";

// 1. Click Handler Component
function ClickHandler({ onMapClick }) {
  useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "SafeRoutePlannerBDApp/1.0",
            },
          }
        );

        const data = await response.json();
        const address = data.address || {};

        onMapClick({
          lat,
          lng,
          area:
            address.suburb ||
            address.neighbourhood ||
            address.quarter ||
            address.road ||
            address.village ||
            address.town ||
            address.hamlet ||
            "",
          district:
            address.city ||
            address.county ||
            address.state_district ||
            address.state ||
            "",
          name: data.display_name || "Clicked Location",
        });
      } catch (error) {
        console.error("Reverse geocoding error:", error);

        onMapClick({
          lat,
          lng,
          area: "",
          district: "",
          name: "Clicked Location",
        });
      }
    },
  });

  return null;
}

// 2. Map Controller Component
function MapController({ setMap }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      setMap(map);
    }
  }, [map, setMap]);
  return null;
}

// 3. FlyToLocation Component (Moves map smoothly on search/selection)
function FlyToLocation({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location || isNaN(location.lat) || isNaN(location.lng)) return;

    map.flyTo([Number(location.lat), Number(location.lng)], 16, {
      duration: 1.5,
    });
  }, [location, map]);

  return null;
}

// 4. Main MapPage Component
function MapPage({ hideSidebar = false }) {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [reports, setReports] = useState([]);
  const [map, setMap] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const snapshot = await getDocs(collection(db, "reports"));

      const firebaseReports = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReports(firebaseReports);
    } catch (error) {
      console.error("Error loading reports:", error);
    }
  };

  const submitReport = async (report) => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("You must login before submitting a report.");

      navigate("/login", {
        state: {
          from: {
            pathname: "/map",
          },
        },
        replace: true,
      });

      return false;
    }

    if (!selectedLocation) {
      alert("Select a location first.");
      return false;
    }

    const newReport = {
      ...report,
      lat: Number(selectedLocation.lat),
      lng: Number(selectedLocation.lng),
      area: selectedLocation.area || report.area || "",
      district: selectedLocation.district || report.district || "",
      userId: currentUser.uid,
      userEmail: currentUser.email || "",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, "reports"), newReport);

      const savedReport = {
        id: docRef.id,
        ...newReport,
      };

      setReports((prev) => [...prev, savedReport]);

      return true;
    } catch (error) {
      console.error("Report save error:", error);

      if (error.code === "permission-denied") {
        alert("You do not have permission to submit this report.");
      } else {
        alert("Failed to save report.");
      }

      return false;
    }
  };

  const getMarkerIcon = (severity) => {
    switch (severity) {
      case "High":
        return redIcon;
      case "Medium":
        return orangeIcon;
      case "Low":
        return greenIcon;
      default:
        return blueIcon;
    }
  };

  const handleMyLocation = (location) => {
    setSelectedLocation(location);

    if (map) {
      map.setView([location.lat, location.lng], 16);
    }
  };

  const handleSOS = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      alert("Please login before sending an SOS alert.");

      navigate("/login", {
        state: {
          from: {
            pathname: "/map",
          },
        },
      });

      return;
    }

    if (!selectedLocation) {
      alert("Select your current location first.");
      return;
    }

    const emergency = {
      lat: Number(selectedLocation.lat),
      lng: Number(selectedLocation.lng),
      area: selectedLocation.area || "",
      district: selectedLocation.district || "",
      userId: currentUser.uid,
      userEmail: currentUser.email || "",
      status: "ACTIVE",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "emergencyAlerts"), emergency);
      alert("🚨 SOS Alert Sent Successfully!");
    } catch (error) {
      console.error("SOS Error:", error);
      alert("Failed to send SOS.");
    }
  };

  return (
    <DashboardLayout>
      <div
        className={`page-layout ${
          hideSidebar ? "map-only-layout" : "report-layout"
        }`}
      >
        {/* MAP SECTION */}
        <div
          className={`map-section ${
            hideSidebar ? "map-full-width" : ""
          }`}
        >
          <MyLocationButton onLocate={handleMyLocation} />

          <SOSButton onSOS={handleSOS} />

          <MapContainer
            center={[23.8103, 90.4125]}
            zoom={7}
            className="main-leaflet-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FlyToLocation location={selectedLocation} />

            <MapController setMap={setMap} />

            <PoliceStations center={selectedLocation} />

            <Hospitals center={selectedLocation} />

            <ClickHandler onMapClick={setSelectedLocation} />

            {/* Existing reports */}
            {reports.map((report) => (
              <Marker
                key={report.id}
                position={[
                  Number(report.lat),
                  Number(report.lng),
                ]}
                icon={getMarkerIcon(report.severity)}
              >
                <Popup>
                  <div className="report-popup">
                    <h3>🚨 Report</h3>

                    <p>
                      <strong>Area:</strong> {report.area}
                    </p>

                    <p>
                      <strong>District:</strong> {report.district}
                    </p>

                    <p>
                      <strong>Danger:</strong> {report.dangerType}
                    </p>

                    <p>
                      <strong>Severity:</strong> {report.severity}
                    </p>

                    <p>
                      <strong>Description:</strong>
                    </p>

                    <p>{report.description}</p>

                    <hr />

                    <small>
                      Latitude: {Number(report.lat).toFixed(5)}
                    </small>

                    <br />

                    <small>
                      Longitude: {Number(report.lng).toFixed(5)}
                    </small>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Selected location */}
            {selectedLocation &&
              Number.isFinite(Number(selectedLocation.lat)) &&
              Number.isFinite(Number(selectedLocation.lng)) && (
                <Marker
                  position={[
                    Number(selectedLocation.lat),
                    Number(selectedLocation.lng),
                  ]}
                >
                  <Popup>
                    {selectedLocation.name || "Selected Location"}
                  </Popup>
                </Marker>
              )}
          </MapContainer>
        </div>

        {/* REPORT FORM */}
        {!hideSidebar && (
          <div className="report-panel">
            <ReportSidebar
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              onSubmit={submitReport}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MapPage;
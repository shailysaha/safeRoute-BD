import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import DashboardLayout from "../layout/DashboardLayout";
import "./MapPage.css";

import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

import SOSButton from "../components/SOSButton";
import "../components/SOSButton.css";
import PoliceStations from "../components/PoliceStations";
import Hospitals from "../components/Hospitals";
import ReportSidebar from "../components/ReportSidebar";
import MyLocationButton from "../components/MyLocationButton";

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
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );

        const data = await response.json();
        const address = data.address || {};

        onMapClick({
          lat,
          lng,
          area:
            address.suburb ||
            address.neighbourhood ||
            address.village ||
            address.town ||
            "",
          district:
            address.city ||
            address.county ||
            address.state_district ||
            "",
          name: data.display_name || "Clicked Location",
        });
      } catch (error) {
        console.error(error);

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

    map.flyTo(
      [Number(location.lat), Number(location.lng)],
      16,
      {
        duration: 1.5,
      }
    );
  }, [location, map]);

  return null;
}

// 4. Main MapPage Component
function MapPage({ hideSidebar = false }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [reports, setReports] = useState([]);

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
      console.error(error);
    }
  };

  const submitReport = async (report) => {
    if (!selectedLocation) {
      alert("Select a location first.");
      return;
    }

    const newReport = {
      ...report,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      area: selectedLocation.area,
      district: selectedLocation.district,
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, "reports"), newReport);

      const savedReport = {
        id: docRef.id,
        ...newReport,
      };

      setReports((prev) => [...prev, savedReport]);

      alert("✅ Report Saved");
    } catch (error) {
      console.error(error);
      alert("Failed to save report");
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
    if (!selectedLocation) {
      alert("Select your current location first.");
      return;
    }

    const emergency = {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      area: selectedLocation.area,
      district: selectedLocation.district,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, "emergencyAlerts"), emergency);
      alert("🚨 SOS Alert Sent Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to send SOS.");
    }
  };

  return (
    <DashboardLayout>
      <div className="page-layout" style={{ display: "flex", width: "100%", height: "100vh" }}>
        
        {/* Map Section */}
        <div
          style={{
            flex: hideSidebar ? "0 0 100%" : "0 0 70%",
            position: "relative",
            height: "100%",
          }}
        >
          <MyLocationButton onLocate={handleMyLocation} />
          <SOSButton onSOS={handleSOS} />

          <MapContainer
            center={[23.8103, 90.4125]}
            zoom={7}
            style={{
              height: "calc(100vh - 40px)",
              width: "100%",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,.25)",
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Smooth flying animation component */}
            <FlyToLocation location={selectedLocation} />

            <MapController setMap={setMap} />
            <PoliceStations center={selectedLocation} />
            <Hospitals center={selectedLocation} />
            <ClickHandler onMapClick={setSelectedLocation} />

            {/* Existing safety reports */}
            {reports.map((report) => (
              <Marker
                key={report.id}
                position={[report.lat, report.lng]}
                icon={getMarkerIcon(report.severity)}
              >
                <Popup>
                  <div style={{ minWidth: "220px" }}>
                    <h3>🚨 Report</h3>
                    <p><strong>Area:</strong> {report.area}</p>
                    <p><strong>District:</strong> {report.district}</p>
                    <p><strong>Danger:</strong> {report.dangerType}</p>
                    <p><strong>Severity:</strong> {report.severity}</p>
                    <p><strong>Description:</strong></p>
                    <p>{report.description}</p>
                    <hr />
                    <small>Latitude: {Number(report.lat).toFixed(5)}</small>
                    <br />
                    <small>Longitude: {Number(report.lng).toFixed(5)}</small>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Highlighted selection marker with validation and popup */}
            {selectedLocation && !isNaN(selectedLocation.lat) && !isNaN(selectedLocation.lng) && (
              <Marker
                position={[
                  Number(selectedLocation.lat),
                  Number(selectedLocation.lng),
                ]}
              >
                <Popup>{selectedLocation.name || "Selected Location"}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
        
        {/* Sidebar Section */}
        {!hideSidebar && (
          <div style={{ flex: "0 0 30%", height: "100%" }}>
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
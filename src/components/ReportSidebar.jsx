import "./ReportSidebar.css";
import { useState, useEffect } from "react";
import SearchLocation from "./SearchLocation";

function ReportSidebar({ selectedLocation, setSelectedLocation, onSubmit }) {
  const [formData, setFormData] = useState({
    area: "",
    district: "",
    lat: "",
    lng: "",
    dangerType: "",
    severity: "",
    description: "",
  });

  // Map incoming selected location object into local form state
  useEffect(() => {
    if (!selectedLocation) return;

    console.log("Selected Location:", selectedLocation);

    setFormData({
      area: selectedLocation.area || "",
      district: selectedLocation.district || "",
      lat: selectedLocation.lat || "",
      lng: selectedLocation.lng || "",
      dangerType: "",
      severity: "",
      description: "",
    });
  }, [selectedLocation]);

  const handleSubmit = async () => {
    if (!formData.lat || !formData.lng) {
      alert(
        "Please select a location on the map or use the search bar first."
      );
      return;
    }

    if (
      !formData.area ||
      !formData.district ||
      !formData.dangerType ||
      !formData.severity
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const success = await onSubmit({
        area: formData.area,
        district: formData.district,
        lat: formData.lat,
        lng: formData.lng,
        dangerType: formData.dangerType,
        severity: formData.severity,
        description: formData.description,
      });

      // Do not show success or reset if login is required or submit failed
      if (!success) {
        return;
      }

      alert("✅ Report Submitted Successfully!");

      // Reset Form and Selection
      setFormData({
        area: "",
        district: "",
        lat: "",
        lng: "",
        dangerType: "",
        severity: "",
        description: "",
      });

      setSelectedLocation(null);
    } catch (error) {
      console.error("Sidebar submission error:", error);
      alert("Failed to submit report.");
    }
  };

  return (
    <div className="sidebar">
      <h2>🚨 Report Dangerous Area</h2>

      <SearchLocation
        onLocationSelect={(location) => {
          console.log(location);
          setSelectedLocation(location);
        }}
      />

      <hr style={{ margin: "15px 0", border: "0.5px solid #ccc" }} />

      {/* Location Details (Auto-filled) */}
      <input placeholder="Area Name" value={formData.area} disabled />
      <input placeholder="District Name" value={formData.district} disabled />

      <select
        value={formData.dangerType}
        onChange={(e) =>
          setFormData({ ...formData, dangerType: e.target.value })
        }
      >
        <option value="">Select Danger</option>
        <option>Robbery</option>
        <option>Harassment</option>
        <option>Road Accident</option>
        <option>Poor Lighting</option>
        <option>Flood</option>
        <option>Fire</option>
        <option>Other</option>
      </select>

      <select
        value={formData.severity}
        onChange={(e) =>
          setFormData({ ...formData, severity: e.target.value })
        }
      >
        <option value="">Select Severity</option>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>

      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />

      {/* Latitude & Longitude Preview */}
      <p>LAT : {formData.lat}</p>
      <p>LNG : {formData.lng}</p>

      <input
        placeholder="Latitude"
        value={formData.lat ? Number(formData.lat).toFixed(6) : ""}
        disabled
      />
      <input
        placeholder="Longitude"
        value={formData.lng ? Number(formData.lng).toFixed(6) : ""}
        disabled
      />

      <button onClick={handleSubmit}>Submit Report</button>
    </div>
  );
}

export default ReportSidebar;
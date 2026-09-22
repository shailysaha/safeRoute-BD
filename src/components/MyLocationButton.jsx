function MyLocationButton({ onLocate }) {
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: Number(position.coords.latitude),
          lng: Number(position.coords.longitude),
          name: "My Current Location",
        };

        console.log("📍 GPS LOCATION:", location);

        if (onLocate) {
          onLocate(location);
        }
      },

      (error) => {
        console.error("Geolocation error:", error);

        if (error.code === 1) {
          alert(
            "Location permission denied. Please allow location access."
          );
        } else if (error.code === 2) {
          alert("Your location is currently unavailable.");
        } else if (error.code === 3) {
          alert("Location request timed out. Please try again.");
        } else {
          alert("Unable to get your location.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <button
      type="button"
      onClick={getLocation}
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
        background: "#2563eb",
        color: "white",
        border: "none",
        padding: "14px 18px",
        borderRadius: "50px",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 5px 15px rgba(0,0,0,.3)",
      }}
    >
      📍 My Location
    </button>
  );
}

export default MyLocationButton;
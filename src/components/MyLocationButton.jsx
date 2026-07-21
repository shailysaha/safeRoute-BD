function MyLocationButton({ onLocate }) {
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocate({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        alert("Unable to get your location.");
      }
    );
  };

  return (
    <button
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
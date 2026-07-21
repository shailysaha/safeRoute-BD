import "./RouteSummary.css";

function RouteSummary({
  distance,
  duration,
  safetyScore,
  policeCount,
  hospitalCount,
  highCount,
  mediumCount,
  lowCount,
}) {

  const getStatus = () => {

    if (safetyScore >= 80)
      return {
        text: "🟢 Safe Route",
        color: "#16a34a",
      };

    if (safetyScore >= 60)
      return {
        text: "🟡 Moderate",
        color: "#f59e0b",
      };

    return {
      text: "🔴 Dangerous",
      color: "#dc2626",
    };

  };

  const status = getStatus();

  return (

    <div className="route-summary">

      <h2>Route Details</h2>

      <div className="summary-item">
        <span>📏 Distance</span>
        <strong>{distance || "--"} km</strong>
      </div>

      <div className="summary-item">
        <span>⏱ Travel Time</span>
        <strong>{duration || "--"} min</strong>
      </div>

      <div className="summary-item">
        <span>🛡 Safety Score</span>
        <strong>{safetyScore}/100</strong>
      </div>

      <div
        className="status-box"
        style={{
          background: status.color,
        }}
      >
        {status.text}
      </div>

      <hr />

      <h3>Nearby Services</h3>

      <div className="summary-item">
        <span>🚓 Police Stations</span>
        <strong>{policeCount}</strong>
      </div>

      <div className="summary-item">
        <span>🏥 Hospitals</span>
        <strong>{hospitalCount}</strong>
      </div>

      <hr />

      <h3>Danger Reports</h3>

      <div className="summary-item">
        <span>🔴 High</span>
        <strong>{highCount}</strong>
      </div>

      <div className="summary-item">
        <span>🟠 Medium</span>
        <strong>{mediumCount}</strong>
      </div>

      <div className="summary-item">
        <span>🟢 Low</span>
        <strong>{lowCount}</strong>
      </div>

    </div>

  );
}

export default RouteSummary;
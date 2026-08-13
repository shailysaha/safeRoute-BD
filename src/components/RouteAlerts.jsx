import "./RouteAlerts.css";
import { evaluateIncident } from "../utils/incidentRules";

function RouteAlerts({ alerts = [] }) {
  const formatTimeAgo = (createdAt) => {
    const date =
      typeof createdAt?.toDate === "function"
        ? createdAt.toDate()
        : new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "Time unavailable";
    }

    const minutes = Math.max(
      0,
      Math.floor((Date.now() - date.getTime()) / (1000 * 60))
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(hours / 24);

    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const evaluatedAlerts = alerts.map((alert) => ({
    ...alert,
    evaluation:
      alert.incidentEvaluation || evaluateIncident(alert),
  }));

  const activeAlerts = evaluatedAlerts.filter(
    (alert) => alert.evaluation.active
  );

  const historicalAlerts = evaluatedAlerts.filter(
    (alert) => !alert.evaluation.active
  );

  const getMainRecommendation = () => {
    if (activeAlerts.length === 0) {
      return {
        icon: "✅",
        title: "No active route warning",
        message:
          historicalAlerts.length > 0
            ? "Nearby reports were found, but they have expired and no longer affect the current safety score."
            : "No recent community incidents were found near this route.",
        suggestion: "",
        className: "recommendation-safe",
      };
    }

    const severityRank = {
      High: 3,
      Medium: 2,
      Low: 1,
    };

    const mostImportantAlert = [...activeAlerts].sort(
      (first, second) => {
        const firstScore =
          (severityRank[first.severity] || 1) * 10 +
          Number(first.penalty || 0);

        const secondScore =
          (severityRank[second.severity] || 1) * 10 +
          Number(second.penalty || 0);

        return secondScore - firstScore;
      }
    )[0];

    return {
      icon: mostImportantAlert.evaluation.icon,
      title: mostImportantAlert.evaluation.title,
      message: mostImportantAlert.evaluation.message,

      suggestion:
        mostImportantAlert.severity === "High"
          ? "Consider searching for another destination route or choosing a different road."
          : mostImportantAlert.severity === "Medium"
          ? "Continue carefully. Choose a different road if traffic or conditions appear unsafe."
          : "Continue carefully and follow current road signs.",

      className:
        mostImportantAlert.severity === "High"
          ? "recommendation-danger"
          : mostImportantAlert.severity === "Medium"
          ? "recommendation-warning"
          : "recommendation-info",
    };
  };

  const recommendation = getMainRecommendation();

  const getLocationName = (alert) => {
    const area = alert.area?.trim();
    const district = alert.district?.trim();

    if (
      area &&
      district &&
      area.toLowerCase() !== district.toLowerCase()
    ) {
      return `${area}, ${district}`;
    }

    return area || district || "Unknown location";
  };

  return (
    <section className="route-alerts">
      <h3>⚠ Incidents near this route</h3>

      {activeAlerts.length > 0 && (
        <div className="incident-group">
          <div className="incident-group-title">
            <span className="status-dot active-dot" />
            Active reports
            <strong>{activeAlerts.length}</strong>
          </div>

          <div className="route-alert-list">
            {activeAlerts.slice(0, 5).map((alert) => (
              <article
                className="route-alert-card active-alert"
                key={alert.id}
              >
                <div className="alert-card-top">
                  <strong>
                    {alert.evaluation.icon}{" "}
                    {alert.dangerType || "Safety incident"}
                  </strong>

                  <div className="alert-badges">
                    <span
                      className={`alert-severity alert-${String(
                        alert.severity
                      ).toLowerCase()}`}
                    >
                      {alert.severity || "Unknown"}
                    </span>

                    <span className="status-badge active-status">
                      Recent
                    </span>
                  </div>
                </div>

                <p>📍 {getLocationName(alert)}</p>

                <p>
                  🕒 Reported {formatTimeAgo(alert.createdAt)}
                </p>

                <p>
                  📏 {alert.distanceFromRoute} m from route
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      {historicalAlerts.length > 0 && (
        <div className="incident-group historical-group">
          <div className="incident-group-title">
            <span className="status-dot historical-dot" />
            Historical reports
            <strong>{historicalAlerts.length}</strong>
          </div>

          <div className="route-alert-list">
            {historicalAlerts.slice(0, 3).map((alert) => (
              <article
                className="route-alert-card historical-alert"
                key={alert.id}
              >
                <div className="alert-card-top">
                  <strong>
                    {alert.evaluation.icon}{" "}
                    {alert.dangerType || "Safety incident"}
                  </strong>

                  <span className="status-badge historical-status">
                    Historical
                  </span>
                </div>

                <p>📍 {getLocationName(alert)}</p>

                <p>
                  🕒 Reported {formatTimeAgo(alert.createdAt)}
                </p>

                <p>
                  📏 {alert.distanceFromRoute} m from route
                </p>

                <div className="historical-note">
                  ℹ {alert.evaluation.message}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {evaluatedAlerts.length === 0 && (
        <div className="route-safe-message">
          ✅ No community incidents were found near this route.
        </div>
      )}

      <div
        className={`route-recommendation ${recommendation.className}`}
      >
        <div className="recommendation-icon">
          {recommendation.icon}
        </div>

        <div className="recommendation-content">
          <small>Recommended action</small>

          <strong>{recommendation.title}</strong>

          <p>{recommendation.message}</p>

          {recommendation.suggestion && (
            <div className="route-suggestion">
              <span>🛣️</span>

              <div>
                <small>Suggestion</small>
                <p>{recommendation.suggestion}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default RouteAlerts;
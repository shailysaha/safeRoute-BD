import { evaluateIncident } from "./incidentRules";

const toRadians = (value) => (value * Math.PI) / 180;

export function calculateDistanceMeters(lat1, lng1, lat2, lng2) {
  const earthRadius = 6371000;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const firstLat = toRadians(lat1);
  const secondLat = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(firstLat) *
      Math.cos(secondLat) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

export function getTimeWeight(createdAt) {
  if (!createdAt) return 0;

  const date =
    typeof createdAt?.toDate === "function"
      ? createdAt.toDate()
      : new Date(createdAt);

  if (Number.isNaN(date.getTime())) return 0;

  const ageHours = (Date.now() - date.getTime()) / (1000 * 60 * 60);

  if (ageHours <= 6) return 1;
  if (ageHours <= 24) return 0.75;
  if (ageHours <= 72) return 0.5;
  if (ageHours <= 168) return 0.25;

  return 0;
}

export function analyzeRouteSafety(routeCoordinates, reports) {
  const severityPenalty = {
    High: 25,
    Medium: 15,
    Low: 7,
  };

  const routeAlerts = [];
  let totalPenalty = 0;

  reports.forEach((report) => {
    const reportLat = Number(report.lat);
    const reportLng = Number(report.lng);

    if (!Number.isFinite(reportLat) || !Number.isFinite(reportLng)) {
      return;
    }

    let nearestDistance = Infinity;

    routeCoordinates.forEach((coordinate) => {
      const distance = calculateDistanceMeters(
        Number(coordinate.lat),
        Number(coordinate.lng),
        reportLat,
        reportLng
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
      }
    });

    // Ignore reports farther than 500 metres.
    if (nearestDistance > 500) {
      return;
    }

    const incidentEvaluation = evaluateIncident(report);

    const alertData = {
      ...report,
      distanceFromRoute: Math.round(nearestDistance),
      incidentStatus: incidentEvaluation.status,
      incidentEvaluation,
      penalty: 0,
    };

    /*
      Historical reports remain visible,
      but do not reduce the safety score.
    */
    if (!incidentEvaluation.active) {
      routeAlerts.push(alertData);
      return;
    }

    const basePenalty = severityPenalty[report.severity] || 5;

    const distanceWeight =
      nearestDistance <= 100
        ? 1
        : nearestDistance <= 250
        ? 0.75
        : 0.5;

    /*
      Recent reports have a stronger effect.
      */
    let freshnessWeight = 1;

    if (incidentEvaluation.activeHours) {
      const usedLifetime =
        incidentEvaluation.ageHours / incidentEvaluation.activeHours;

      if (usedLifetime >= 0.75) {
        freshnessWeight = 0.35;
      } else if (usedLifetime >= 0.5) {
        freshnessWeight = 0.6;
      } else if (usedLifetime >= 0.25) {
        freshnessWeight = 0.8;
      }
    }

    const penalty = basePenalty * distanceWeight * freshnessWeight;

    totalPenalty += penalty;

    routeAlerts.push({
      ...alertData,
      penalty: Math.round(penalty),
    });
  });

  const safetyScore = Math.max(
    0,
    Math.min(100, Math.round(100 - totalPenalty))
  );

  routeAlerts.sort((first, second) => {
    // Active reports first.
    if (first.incidentStatus !== second.incidentStatus) {
      return first.incidentStatus === "active" ? -1 : 1;
    }

    return second.penalty - first.penalty;
  });

  return {
    safetyScore,
    routeAlerts,
    activeAlerts: routeAlerts.filter(
      (alert) => alert.incidentStatus === "active"
    ),
    historicalAlerts: routeAlerts.filter(
      (alert) => alert.incidentStatus === "historical"
    ),
  };
}
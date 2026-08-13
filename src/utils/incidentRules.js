export const INCIDENT_RULES = {
  "Road Accident": {
    activeHours: 6,
    icon: "🚗",
    activeTitle: "Drive carefully",
    activeMessage:
      "A recent road accident was reported. Traffic may still be affected.",
    historicalTitle: "Earlier accident report",
    historicalMessage:
      "This accident report has expired and is now shown only as historical information.",
  },

  Flood: {
    activeHours: 24,
    icon: "🌧️",
    activeTitle: "Check current road conditions",
    activeMessage:
      "Flooding was reported recently. Check weather and road accessibility before continuing.",
    historicalTitle: "Earlier flood report",
    historicalMessage:
      "This flood report is older than 24 hours and is no longer treated as an active warning.",
  },

  Fire: {
    activeHours: 6,
    icon: "🔥",
    activeTitle: "Avoid the affected area",
    activeMessage:
      "A fire was reported recently. Emergency activity or road restrictions may still be present.",
    historicalTitle: "Earlier fire report",
    historicalMessage:
      "This fire report is no longer treated as active, but remains visible for reference.",
  },

  Robbery: {
    activeHours: 30 * 24,
    icon: "🚨",
    activeTitle: "Remain alert",
    activeMessage:
      "A robbery was reported near this route. Avoid isolated roads and keep valuables secure.",
    historicalTitle: "Historical robbery report",
    historicalMessage:
      "This report is older than 30 days and no longer affects the current route score.",
  },

  Harassment: {
    activeHours: 30 * 24,
    icon: "⚠️",
    activeTitle: "Travel with caution",
    activeMessage:
      "Harassment was reported near this route. Prefer busy roads, daylight travel or group travel.",
    historicalTitle: "Historical harassment report",
    historicalMessage:
      "This report is older than 30 days and is now shown only as historical information.",
  },

  "Poor Lighting": {
    activeHours: null,
    icon: "💡",
    activeTitle: "Stay alert after sunset",
    activeMessage:
      "Limited street lighting may reduce visibility. Prefer daylight travel when possible.",
    historicalTitle: "Lighting issue resolved",
    historicalMessage:
      "This lighting report has been marked as resolved.",
  },

  Other: {
    activeHours: 24,
    icon: "⚠️",
    activeTitle: "Proceed carefully",
    activeMessage:
      "A recent community safety issue was reported near this route.",
    historicalTitle: "Earlier community report",
    historicalMessage:
      "This report has expired and is now shown only for reference.",
  },
};

export function convertToDate(createdAt) {
  if (!createdAt) {
    return null;
  }

  if (typeof createdAt?.toDate === "function") {
    return createdAt.toDate();
  }

  const date = new Date(createdAt);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function getReportAgeHours(createdAt) {
  const date = convertToDate(createdAt);

  if (!date) {
    return Infinity;
  }

  return Math.max(
    0,
    (Date.now() - date.getTime()) / (1000 * 60 * 60)
  );
}

export function evaluateIncident(report) {
  const rule =
    INCIDENT_RULES[report.dangerType] ||
    INCIDENT_RULES.Other;

  const ageHours = getReportAgeHours(report.createdAt);

  /*
    Poor Lighting does not automatically expire.
    It stays active until status becomes "resolved".
  */
  if (report.dangerType === "Poor Lighting") {
    const isResolved = report.status === "resolved";

    return {
      active: !isResolved,
      status: isResolved ? "historical" : "active",
      ageHours,
      icon: rule.icon,
      title: isResolved
        ? rule.historicalTitle
        : rule.activeTitle,
      message: isResolved
        ? rule.historicalMessage
        : rule.activeMessage,
      activeHours: null,
    };
  }

  const active = ageHours <= rule.activeHours;

  return {
    active,
    status: active ? "active" : "historical",
    ageHours,
    icon: rule.icon,
    title: active
      ? rule.activeTitle
      : rule.historicalTitle,
    message: active
      ? rule.activeMessage
      : rule.historicalMessage,
    activeHours: rule.activeHours,
  };
}
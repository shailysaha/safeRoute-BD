import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import DashboardLayout from "../layout/DashboardLayout";
import "./Reports.css";

function Reports() {
  const [reports, setReports] = useState([]);
  const [searchDistrict, setSearchDistrict] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, "reports"));

      const data = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      setReports(data);
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Convert Firestore Timestamp or ISO string into a JavaScript Date.
  const getReportDate = (createdAt) => {
    if (!createdAt) {
      return null;
    }

    // Firestore Timestamp
    if (typeof createdAt?.toDate === "function") {
      return createdAt.toDate();
    }

    // ISO date string
    const convertedDate = new Date(createdAt);

    if (Number.isNaN(convertedDate.getTime())) {
      return null;
    }

    return convertedDate;
  };

  const getRelativeTime = (createdAt) => {
    const reportDate = getReportDate(createdAt);

    if (!reportDate) {
      return "Time unavailable";
    }

    const difference =
      Date.now() - reportDate.getTime();

    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    }

    if (hours < 24) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    if (days < 7) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    return reportDate.toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getExactTime = (createdAt) => {
    const reportDate = getReportDate(createdAt);

    if (!reportDate) {
      return "Date unavailable";
    }

    return reportDate.toLocaleString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const filteredReports = useMemo(() => {
    const searchText =
      searchDistrict.trim().toLowerCase();

    return [...reports]
      .filter((report) => {
        if (!searchText) {
          return true;
        }

        const district =
          report.district?.toLowerCase() || "";

        const area =
          report.area?.toLowerCase() || "";

        const danger =
          report.dangerType?.toLowerCase() || "";

        return (
          district.includes(searchText) ||
          area.includes(searchText) ||
          danger.includes(searchText)
        );
      })
      .sort((firstReport, secondReport) => {
        const firstDate =
          getReportDate(firstReport.createdAt)?.getTime() || 0;

        const secondDate =
          getReportDate(secondReport.createdAt)?.getTime() || 0;

        return secondDate - firstDate;
      });
  }, [reports, searchDistrict]);

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "severity-high";

      case "medium":
        return "severity-medium";

      case "low":
        return "severity-low";

      default:
        return "severity-unknown";
    }
  };

  return (
    <DashboardLayout>
      <div className="reports-page">
        <div className="reports-header">
          <div>
            <h1>📋 Community Reports</h1>

            <p>
              Search recent safety reports by district,
              area or danger type.
            </p>
          </div>

          <button
            type="button"
            className="refresh-reports-btn"
            onClick={loadReports}
          >
            🔄 Refresh
          </button>
        </div>

        <div className="report-search-section">
          <span className="report-search-icon">🔍</span>

          <input
            type="text"
            placeholder="Search district, area or danger..."
            value={searchDistrict}
            onChange={(event) =>
              setSearchDistrict(event.target.value)
            }
          />

          {searchDistrict && (
            <button
              type="button"
              className="clear-report-search"
              onClick={() => setSearchDistrict("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="report-result-summary">
          <span>
            Showing <strong>{filteredReports.length}</strong>{" "}
            report{filteredReports.length === 1 ? "" : "s"}
          </span>

          {searchDistrict && (
            <span>
              Search: <strong>{searchDistrict}</strong>
            </span>
          )}
        </div>

        {loading ? (
          <div className="reports-message">
            Loading community reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="reports-message">
            <span>📭</span>

            <h3>No reports found</h3>

            <p>
              Try searching with another district or area name.
            </p>
          </div>
        ) : (
          <div className="reports-grid">
            {filteredReports.map((report) => (
              <article
                className="report-card"
                key={report.id}
              >
                <div className="report-card-top">
                  <div>
                    <h3>
                      📍 {report.area || "Unknown area"}
                    </h3>

                    <p className="report-district">
                      {report.district ||
                        "District unavailable"}
                    </p>
                  </div>

                  <span
                    className={`severity-badge ${getSeverityClass(
                      report.severity
                    )}`}
                  >
                    {report.severity || "Unknown"}
                  </span>
                </div>

                <div className="report-danger-type">
                  <span>⚠️</span>

                  <div>
                    <small>Danger type</small>
                    <strong>
                      {report.dangerType || "Not specified"}
                    </strong>
                  </div>
                </div>

                <p className="report-description">
                  {report.description ||
                    "No description was provided."}
                </p>

                <div className="report-time">
                  <span>🕒</span>

                  <div>
                    <strong>
                      {getRelativeTime(report.createdAt)}
                    </strong>

                    <small>
                      {getExactTime(report.createdAt)}
                    </small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Reports;
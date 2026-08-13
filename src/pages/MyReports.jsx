import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";
import DashboardLayout from "../layout/DashboardLayout";
import "./MyReports.css";

function MyReports() {
  const [reports, setReports] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);

  const [editData, setEditData] = useState({
    dangerType: "",
    severity: "",
    description: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setCurrentUser(user);

        if (!user) {
          setReports([]);
          setLoading(false);
          return;
        }

        await loadMyReports(user.uid);
      }
    );

    return () => unsubscribe();
  }, []);

  const loadMyReports = async (userId) => {
    setLoading(true);

    try {
      const reportsQuery = query(
        collection(db, "reports"),
        where("userId", "==", userId)
      );

      const snapshot = await getDocs(reportsQuery);

      const reportData = snapshot.docs
        .map((document) => ({
          id: document.id,
          ...document.data(),
        }))
        .sort((first, second) => {
          return (
            getDateValue(second.createdAt) -
            getDateValue(first.createdAt)
          );
        });

      setReports(reportData);
    } catch (error) {
      console.error("My reports loading error:", error);
      alert("Unable to load your reports.");
    } finally {
      setLoading(false);
    }
  };

  const getDateValue = (createdAt) => {
    if (!createdAt) return 0;

    const date =
      typeof createdAt?.toDate === "function"
        ? createdAt.toDate()
        : new Date(createdAt);

    return Number.isNaN(date.getTime())
      ? 0
      : date.getTime();
  };

  const formatDate = (createdAt) => {
    if (!createdAt) return "Time unavailable";

    const date =
      typeof createdAt?.toDate === "function"
        ? createdAt.toDate()
        : new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return "Time unavailable";
    }

    return date.toLocaleString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const beginEdit = (report) => {
    setEditingId(report.id);

    setEditData({
      dangerType: report.dangerType || "",
      severity: report.severity || "",
      description: report.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);

    setEditData({
      dangerType: "",
      severity: "",
      description: "",
    });
  };

  const saveEdit = async (reportId) => {
    if (!currentUser) {
      alert("Please log in.");
      return;
    }

    if (!editData.dangerType || !editData.severity) {
      alert("Select danger type and severity.");
      return;
    }

    try {
      await updateDoc(doc(db, "reports", reportId), {
        dangerType: editData.dangerType,
        severity: editData.severity,
        description: editData.description.trim(),
        updatedAt: new Date().toISOString(),
      });

      setReports((previousReports) =>
        previousReports.map((report) =>
          report.id === reportId
            ? {
                ...report,
                ...editData,
                updatedAt: new Date().toISOString(),
              }
            : report
        )
      );

      cancelEdit();
      alert("✅ Report updated successfully.");
    } catch (error) {
      console.error("Report update error:", error);

      if (error.code === "permission-denied") {
        alert("You can edit only your own reports.");
      } else {
        alert("Failed to update report.");
      }
    }
  };

  const deleteReport = async (reportId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "reports", reportId));

      setReports((previousReports) =>
        previousReports.filter(
          (report) => report.id !== reportId
        )
      );

      alert("✅ Report deleted.");
    } catch (error) {
      console.error("Report delete error:", error);

      if (error.code === "permission-denied") {
        alert("You can delete only your own reports.");
      } else {
        alert("Failed to delete report.");
      }
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "my-severity-high";

      case "medium":
        return "my-severity-medium";

      case "low":
        return "my-severity-low";

      default:
        return "";
    }
  };

  return (
    <DashboardLayout>
      <main className="my-reports-page">
        <header className="my-reports-header">
          <div>
            <h1>📄 My Reports</h1>

            <p>
              View, edit or delete reports submitted by your
              account.
            </p>
          </div>

          <button
            type="button"
            className="reload-my-reports"
            onClick={() =>
              currentUser &&
              loadMyReports(currentUser.uid)
            }
          >
            🔄 Refresh
          </button>
        </header>

        <div className="my-reports-count">
          Your reports: <strong>{reports.length}</strong>
        </div>

        {loading ? (
          <div className="my-reports-message">
            Loading your reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="my-reports-message">
            <span>📭</span>
            <h2>No reports yet</h2>
            <p>
              Reports you submit will appear here.
            </p>
          </div>
        ) : (
          <div className="my-reports-grid">
            {reports.map((report) => {
              const editing = editingId === report.id;

              return (
                <article
                  className="my-report-card"
                  key={report.id}
                >
                  <div className="my-report-card-top">
                    <div>
                      <h2>
                        📍 {report.area || "Unknown area"}
                      </h2>

                      <p>
                        {report.district ||
                          "District unavailable"}
                      </p>
                    </div>

                    {!editing && (
                      <span
                        className={`my-severity ${getSeverityClass(
                          report.severity
                        )}`}
                      >
                        {report.severity || "Unknown"}
                      </span>
                    )}
                  </div>

                  {editing ? (
                    <div className="my-report-edit-form">
                      <label>
                        Danger type
                        <select
                          value={editData.dangerType}
                          onChange={(event) =>
                            setEditData({
                              ...editData,
                              dangerType:
                                event.target.value,
                            })
                          }
                        >
                          <option value="">
                            Select danger
                          </option>
                          <option value="Robbery">
                            Robbery
                          </option>
                          <option value="Harassment">
                            Harassment
                          </option>
                          <option value="Road Accident">
                            Road Accident
                          </option>
                          <option value="Poor Lighting">
                            Poor Lighting
                          </option>
                          <option value="Flood">
                            Flood
                          </option>
                          <option value="Other">
                            Other
                          </option>
                        </select>
                      </label>

                      <label>
                        Severity
                        <select
                          value={editData.severity}
                          onChange={(event) =>
                            setEditData({
                              ...editData,
                              severity:
                                event.target.value,
                            })
                          }
                        >
                          <option value="">
                            Select severity
                          </option>
                          <option value="Low">Low</option>
                          <option value="Medium">
                            Medium
                          </option>
                          <option value="High">High</option>
                        </select>
                      </label>

                      <label>
                        Description
                        <textarea
                          value={editData.description}
                          onChange={(event) =>
                            setEditData({
                              ...editData,
                              description:
                                event.target.value,
                            })
                          }
                        />
                      </label>

                      <div className="my-report-edit-actions">
                        <button
                          type="button"
                          className="save-report-button"
                          onClick={() =>
                            saveEdit(report.id)
                          }
                        >
                          Save changes
                        </button>

                        <button
                          type="button"
                          className="cancel-report-button"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="my-report-danger">
                        <small>Danger type</small>
                        <strong>
                          {report.dangerType ||
                            "Not specified"}
                        </strong>
                      </div>

                      <p className="my-report-description">
                        {report.description ||
                          "No description provided."}
                      </p>

                      <div className="my-report-meta">
                        <span>
                          🕒 {formatDate(report.createdAt)}
                        </span>

                        {report.updatedAt && (
                          <span>
                            ✏️ Edited{" "}
                            {formatDate(report.updatedAt)}
                          </span>
                        )}
                      </div>

                      <div className="my-report-actions">
                        <button
                          type="button"
                          className="edit-report-button"
                          onClick={() => beginEdit(report)}
                        >
                          ✏️ Edit
                        </button>

                        <button
                          type="button"
                          className="delete-report-button"
                          onClick={() =>
                            deleteReport(report.id)
                          }
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}

export default MyReports;
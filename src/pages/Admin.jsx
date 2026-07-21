import { useEffect, useState } from "react";
import "./Admin.css";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

function Admin() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  // Load reports from Firebase
  const loadReports = async () => {
    try {
      const snapshot = await getDocs(collection(db, "reports"));

      const reportData = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setReports(reportData);
    } catch (error) {
      console.error(error);
      alert("❌ Failed to load reports.");
    }
  };

  // Delete report
  const deleteReport = async (id) => {
    const confirmDelete = window.confirm(
      "⚠ Are you sure you want to delete this report?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "reports", id));

      alert("✅ Report Deleted");

      loadReports();
    } catch (error) {
      console.error(error);
      alert("❌ Failed to delete report");
    }
  };

  // Statistics
  const high = reports.filter(
    (r) => r.severity === "High"
  ).length;

  const medium = reports.filter(
    (r) => r.severity === "Medium"
  ).length;

  const low = reports.filter(
    (r) => r.severity === "Low"
  ).length;

  // Search
  const filteredReports = reports.filter((report) => {
    const area = report.area || "";
    const district = report.district || "";

    return (
      area.toLowerCase().includes(search.toLowerCase()) ||
      district.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="admin-page">
      <h1 className="admin-title">
        🛡 SafeRoute BD Admin Dashboard
      </h1>

      <div className="stats">
        <div className="stat-card">
          <h2>{reports.length}</h2>
          <p>Total Reports</p>
        </div>

        <div className="stat-card">
          <h2>{high}</h2>
          <p>High Risk</p>
        </div>

        <div className="stat-card">
          <h2>{medium}</h2>
          <p>Medium Risk</p>
        </div>

        <div className="stat-card">
          <h2>{low}</h2>
          <p>Low Risk</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="🔍 Search by Area or District..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={loadReports}>
          🔄 Refresh
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Area</th>
            <th>District</th>
            <th>Danger</th>
            <th>Severity</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <tr key={report.id}>
                <td>{report.area || "-"}</td>

                <td>{report.district || "-"}</td>

                <td>{report.dangerType || "-"}</td>

                <td>{report.severity || "-"}</td>

                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteReport(report.id)}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No reports found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
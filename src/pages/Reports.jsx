import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import DashboardLayout from "../layout/DashboardLayout";
import "./Reports.css";

function Reports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const snapshot = await getDocs(collection(db, "reports"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReports(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DashboardLayout>
      <div className="reports-page">
        <h1>📋 Community Reports</h1>

        <div className="reports-grid">
          {reports.map((report) => (
            <div className="report-card" key={report.id}>
              <h3>{report.area}</h3>

              <p><strong>District:</strong> {report.district}</p>

              <p><strong>Danger:</strong> {report.dangerType}</p>

              <p><strong>Severity:</strong> {report.severity}</p>

              <p>{report.description}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Reports;
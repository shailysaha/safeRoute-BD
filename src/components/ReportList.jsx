import "./ReportList.css";

function ReportList({ reports }) {
  return (
    <div className="report-list">
      <h2>📋 Recent Reports</h2>

      {reports.length === 0 ? (
        <p>No reports yet.</p>
      ) : (
        reports.map((report, index) => (
          <div className="report-card" key={index}>
            <h3>{report.area}</h3>

            <p>
              <strong>District:</strong> {report.district}
            </p>

            <p>
              <strong>Danger:</strong> {report.dangerType}
            </p>

            <p>
              <strong>Severity:</strong> {report.severity}
            </p>

            <p>
              <strong>Description:</strong> {report.description}
            </p>

            <p>
              📍 {Number(report.lat).toFixed(5)},{" "}
              {Number(report.lng).toFixed(5)}
            </p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default ReportList;
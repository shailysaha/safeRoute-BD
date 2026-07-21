import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import "./DashboardLayout.css";

function DashboardLayout({ children }) {
  return (
    <div className="dashboard">

      <Sidebar />

      <div className="dashboard-content">

        <Topbar />

        <main className="dashboard-main">
          {children}
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;
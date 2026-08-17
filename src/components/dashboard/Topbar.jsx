import "./Topbar.css";

function Topbar({ onMenuClick }) {
  return (
    <header className="topbar">

      <div className="topbar-left">

        {/* Only visible on mobile */}
        <button
          type="button"
          className="dashboard-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          ☰
        </button>

        <h2>Dashboard</h2>

      </div>

      <div className="topbar-right">
        <span>🔔</span>
        <span>👤</span>
      </div>

    </header>
  );
}

export default Topbar;
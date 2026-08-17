import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaMapMarkedAlt,
  FaExclamationTriangle,
  FaUserShield,
  FaCog,
  FaShieldAlt,
  FaUser,
  FaFileAlt,
  FaTimes,
} from "react-icons/fa";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase/firebase";

import "./Sidebar.css";

function Sidebar({
  isOpen = false,
  onClose,
}) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          setIsAdmin(false);
          return;
        }

        try {
          const userDocRef = doc(
            db,
            "users",
            currentUser.uid
          );

          const userSnap = await getDoc(
            userDocRef
          );

          setIsAdmin(
            userSnap.exists() &&
              userSnap.data()?.role === "admin"
          );
        } catch (error) {
          console.error(
            "Error checking admin status:",
            error
          );

          setIsAdmin(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const getLinkClass = ({ isActive }) =>
    isActive ? "active" : "";

  return (
    <>
      {/* Mobile dark overlay */}
      <div
        className={`sidebar-overlay ${
          isOpen ? "show" : ""
        }`}
        onClick={onClose}
      />

      <aside
        className={`sidebar ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        {/* Header / Logo */}
        <div className="sidebar-header">
          <div className="logo">
            <FaShieldAlt />
            <span>SafeRoute BD</span>
          </div>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={getLinkClass}
            onClick={onClose}
          >
            <FaHome />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/map"
            className={getLinkClass}
            onClick={onClose}
          >
            <FaMapMarkedAlt />
            <span>Map</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={getLinkClass}
            onClick={onClose}
          >
            <FaExclamationTriangle />
            <span>Reports</span>
          </NavLink>

          <NavLink
            to="/my-reports"
            className={getLinkClass}
            onClick={onClose}
          >
            <FaFileAlt />
            <span>My Reports</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={getLinkClass}
            onClick={onClose}
          >
            <FaUser />
            <span>My Profile</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              className={getLinkClass}
              onClick={onClose}
            >
              <FaUserShield />
              <span>Admin</span>
            </NavLink>
          )}

          <NavLink
            to="/about"
            className={getLinkClass}
            onClick={onClose}
          >
            <FaCog />
            <span>About</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaHome,
  FaMapMarkedAlt,
  FaExclamationTriangle,
  FaUserShield,
  FaCog,
  FaShieldAlt,
  FaUser,
  FaFileAlt,
} from "react-icons/fa";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../../firebase/firebase";

import "./Sidebar.css";

function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists() && userSnap.data()?.role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <aside className="sidebar">
      <div className="logo">
        <FaShieldAlt />
        <span>SafeRoute BD</span>
      </div>

      <NavLink
        to="/"
        className={location.pathname === "/" ? "active" : ""}
      >
        <FaHome />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/map"
        className={location.pathname === "/map" ? "active" : ""}
      >
        <FaMapMarkedAlt />
        <span>Map</span>
      </NavLink>

      <NavLink
        to="/reports"
        className={location.pathname === "/reports" ? "active" : ""}
      >
        <FaExclamationTriangle />
        <span>Reports</span>
      </NavLink>

      <NavLink
        to="/my-reports"
        className={location.pathname === "/my-reports" ? "active" : ""}
      >
        <FaFileAlt />
        <span>My Reports</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={location.pathname === "/profile" ? "active" : ""}
      >
        <FaUser />
        <span>My Profile</span>
      </NavLink>

      {isAdmin && (
        <NavLink
          to="/admin"
          className={location.pathname === "/admin" ? "active" : ""}
        >
          <FaUserShield />
          <span>Admin</span>
        </NavLink>
      )}

      <NavLink
        to="/about"
        className={location.pathname === "/about" ? "active" : ""}
      >
        <FaCog />
        <span>About</span>
      </NavLink>
    </aside>
  );
}

export default Sidebar;
import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  FaShieldAlt,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaUser,
} from "react-icons/fa";

import { auth, db } from "../firebase/firebase";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] =
    useState(undefined);

  const [isAdmin, setIsAdmin] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("safeRouteTheme") === "dark";
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle(
      "dark-mode",
      darkMode
    );
  }, [darkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setCurrentUser(user);
        setIsAdmin(false);

        if (!user) {
          return;
        }

        try {
          const userSnapshot = await getDoc(
            doc(db, "users", user.uid)
          );

          const role = userSnapshot.exists()
            ? userSnapshot.data().role
            : "user";

          setIsAdmin(role === "admin");
        } catch (error) {
          console.error(
            "Unable to check user role:",
            error
          );

          setIsAdmin(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const updatedMode = !darkMode;

    setDarkMode(updatedMode);

    localStorage.setItem(
      "safeRouteTheme",
      updatedMode ? "dark" : "light"
    );
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);

      setIsAdmin(false);
      setMenuOpen(false);

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to log out.");
    }
  };

  const getNavLinkClass = ({ isActive }) =>
    isActive ? "navbar-link active" : "navbar-link";

  return (
    <nav className="navbar">
      <Link
        to="/"
        className="navbar-logo"
        onClick={closeMenu}
      >
        <span className="navbar-logo-icon">
          <FaShieldAlt />
        </span>

        <span className="navbar-logo-text">
          SafeRoute <strong>BD</strong>
        </span>
      </Link>

      <div
        className={`nav-links ${
          menuOpen ? "show" : ""
        }`}
      >
        <NavLink
          to="/"
          end
          className={getNavLinkClass}
          onClick={closeMenu}
        >
          Home
        </NavLink>

        <NavLink
          to="/map"
          className={getNavLinkClass}
          onClick={closeMenu}
        >
          Live Map
        </NavLink>

        <NavLink
          to="/reports"
          className={getNavLinkClass}
          onClick={closeMenu}
        >
          Reports
        </NavLink>

        {currentUser && (
          <NavLink
            to="/my-reports"
            className={getNavLinkClass}
            onClick={closeMenu}
          >
            My Reports
          </NavLink>
        )}

        <NavLink
          to="/about"
          className={getNavLinkClass}
          onClick={closeMenu}
        >
          About
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/admin"
            className={getNavLinkClass}
            onClick={closeMenu}
          >
            Admin
          </NavLink>
        )}
      </div>

      <div className="nav-actions">
        {currentUser && (
          <Link
            to="/profile"
            className="profile-nav-button"
            onClick={closeMenu}
            title="My Profile"
          >
            <FaUser />
          </Link>
        )}

        <button
          type="button"
          className="theme-btn"
          onClick={toggleTheme}
          title={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          aria-label="Toggle theme"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {currentUser === undefined ? (
          <div className="auth-loading-button">
            Loading...
          </div>
        ) : currentUser ? (
          <button
            type="button"
            className="login-btn logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="login-btn"
            onClick={closeMenu}
          >
            Login
          </Link>
        )}

        <button
          type="button"
          className="menu-btn"
          onClick={() =>
            setMenuOpen((previous) => !previous)
          }
          aria-label="Toggle navigation"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;